#!/usr/bin/env node
// Supply-chain gate for the pinned ghostty wasm (ghostty-term change,
// design.md D2 "verify:ghostty-pin 硬化"; Batch C, 2026-08-28).
//
// Verifies packages/vite-plugin/ghostty.pin.json WITHOUT importing
// @jixoai/vite-plugin: the gate must run on a fresh clone with no build
// step and stay an independent second guardrail next to the package's
// own pin.ts validation (which it intentionally mirrors, not shares).
//
// Checks:
//   1. schema — pinnedAt ISO 8601; source {repo, tag, releaseUrl};
//      variants exactly full+small; per variant url (string), sha256
//      (64 lowercase hex), size (positive safe integer within the 4 MiB
//      download cap), buildInfo (non-empty);
//   2. cross-field — releaseUrl agrees with source.tag; every variant
//      url is the canonical GitHub download path for its allowlisted
//      asset name (full -> ghostty-vt.wasm, small -> ghostty-vt-small.wasm);
//   3. network (skipped by --offline) — https only; every redirect hop
//      (max 5) on the host allowlist {github.com,
//      objects.githubusercontent.com, release-assets.githubusercontent.com};
//      final response 200; Content-Length, when present, <= 4 MiB;
//   4. local cache — node_modules/.cache/jixoai-ghostty/<sha256>.wasm,
//      when present, must hash to the pinned sha256;
//   5. no tracked *.wasm anywhere in the repo (git ls-files) — binaries
//      never enter git; the pin manifest is the only supply-chain
//      artifact.
//
// Usage: node scripts/verify-ghostty-pin.mjs [--offline] [--pin <path>]
//        node scripts/verify-ghostty-pin.mjs --self-test
// Exit 0 = pin verified; exit 1 with one named fix per problem.
// --pin verifies an arbitrary manifest path (self-test/tooling only —
// CI always runs against the shipped manifest). --self-test proves the
// tag-traversal guard end to end (see the self-test section below).

import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const SHIPPED_PIN_PATH = join(repoRoot, 'packages', 'vite-plugin', 'ghostty.pin.json');
const CACHE_DIR = join(repoRoot, 'node_modules', '.cache', 'jixoai-ghostty');

const argv = process.argv.slice(2);
const offline = argv.includes('--offline');
const pinFlagAt = argv.indexOf('--pin');
const PIN_PATH = pinFlagAt !== -1 ? argv[pinFlagAt + 1] : SHIPPED_PIN_PATH;
if (pinFlagAt !== -1 && typeof PIN_PATH !== 'string') {
  console.error('[verify-ghostty-pin] --pin needs a manifest path argument');
  process.exit(1);
}

// Frozen supply-chain constants — mirror packages/vite-plugin/src/resolve.ts.
const PINNED_REPO = 'ghostty-org/ghostty';
const ASSET_NAMES = { full: 'ghostty-vt.wasm', small: 'ghostty-vt-small.wasm' };
const HOST_ALLOWLIST = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'release-assets.githubusercontent.com',
]);
const MAX_REDIRECTS = 5;
const MAX_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
// A tag must be a safe single path segment: the character class allows
// dots (v1.2.3-style tags), but the lookahead explicitly rejects the
// bare "." and ".." segments — URL resolution would fold them away into
// a traversal. Mirrors packages/vite-plugin/src/pin.ts (kept in sync
// deliberately: the gate is an independent second guardrail, not shared
// code).
const SAFE_TAG = /^(?!\.{1,2}$)[A-Za-z0-9._-]+$/;
const SHA256 = /^[0-9a-f]{64}$/;

const problems = [];
const notes = [];
const fail = (fix) => problems.push(fix);
const note = (line) => notes.push(line);
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const sha256Hex = (bytes) => createHash('sha256').update(bytes).digest('hex');

// --- self-test: the tag-traversal guard, end to end ----------------------
//
// Constructs temp pins whose ONLY defect is source.tag = "." / ".." and
// re-invokes this script against them, expecting a red exit that names
// the tag fix (temp files removed afterwards — nothing persists).

if (argv.includes('--self-test')) {
  let failed = 0;
  const scriptPath = fileURLToPath(import.meta.url);
  const tempDir = mkdtempSync(join(tmpdir(), 'verify-ghostty-pin-selftest-'));
  try {
    const base = JSON.parse(readFileSync(SHIPPED_PIN_PATH, 'utf8'));
    for (const badTag of ['.', '..']) {
      const badPin = { ...base, source: { ...base.source, tag: badTag } };
      const badPinPath = join(tempDir, `bad-tag-${badTag.length}.json`);
      writeFileSync(badPinPath, `${JSON.stringify(badPin, null, 2)}\n`);
      const run = spawnSync(process.execPath, [scriptPath, '--offline', '--pin', badPinPath], {
        encoding: 'utf8',
      });
      const output = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
      const namedTheTag = output.includes('source.tag must be a safe single path segment');
      const ok = run.status === 1 && namedTheTag;
      console.log(
        `${ok ? 'PASS' : 'FAIL'}  self-test: tag ${JSON.stringify(badTag)} rejected (exit ${run.status}${namedTheTag ? ', named fix present' : ', NAMED FIX MISSING'})`,
      );
      if (!ok) failed += 1;
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
  if (failed > 0) {
    console.error(`[verify-ghostty-pin] SELF-TEST FAILED — ${failed} case(s) did not reject the traversal tag`);
    process.exit(1);
  }
  console.log('[verify-ghostty-pin] SELF-TEST OK — traversal tags "." and ".." are rejected with a named fix');
  process.exit(0);
}

// --- 1 + 2: schema and cross-field -------------------------------------

let pin = null;
try {
  pin = JSON.parse(readFileSync(PIN_PATH, 'utf8'));
} catch (err) {
  fail(`packages/vite-plugin/ghostty.pin.json must be readable valid JSON (${err.message}) — restore it from git history or let the ghostty-wasm-sync workflow propose a fresh pin`);
}

let schemaOk = false;
if (pin !== null && !isObj(pin)) {
  fail('ghostty.pin.json must be a JSON object');
  pin = null;
}

if (pin !== null) {
  const pinnedAt = typeof pin.pinnedAt === 'string' ? pin.pinnedAt : undefined;
  if (pinnedAt === undefined) fail('pinnedAt must be a string (ISO 8601)');
  else if (Number.isNaN(Date.parse(pinnedAt)))
    fail(`pinnedAt must be ISO 8601 (found ${JSON.stringify(pinnedAt)})`);

  const source = isObj(pin.source) ? pin.source : null;
  if (source === null) {
    fail('source must be an object {repo, tag, releaseUrl}');
  } else {
    if (source.repo !== PINNED_REPO)
      fail(`source.repo must be ${JSON.stringify(PINNED_REPO)} (found ${JSON.stringify(source.repo)})`);
    const tag = typeof source.tag === 'string' ? source.tag : undefined;
    if (tag === undefined) fail('source.tag must be a string');
    else if (!SAFE_TAG.test(tag))
      fail(`source.tag must be a safe single path segment ${SAFE_TAG} — traversal/slashes/dot-segments ("." and "..") rejected (found ${JSON.stringify(tag)})`);
  }

  const variants = isObj(pin.variants) ? pin.variants : null;
  if (variants === null) {
    fail('variants must be an object with exactly the keys full and small');
  } else {
    const keys = Object.keys(variants).sort();
    if (keys.join(',') !== 'full,small')
      fail(`variants keys must be exactly full+small (found [${keys.join(', ')}])`);

    const tag = source !== null && typeof source.tag === 'string' && SAFE_TAG.test(source.tag) ? source.tag : null;
    for (const name of ['full', 'small']) {
      const v = isObj(variants[name]) ? variants[name] : null;
      if (v === null) {
        fail(`variants.${name} must be an object {url, sha256, size, buildInfo}`);
        continue;
      }
      if (typeof v.url !== 'string') fail(`variants.${name}.url must be a string`);
      if (typeof v.sha256 !== 'string' || !SHA256.test(v.sha256))
        fail(`variants.${name}.sha256 must be 64 lowercase hex chars (found ${JSON.stringify(v.sha256)})`);
      if (typeof v.size !== 'number' || !Number.isSafeInteger(v.size) || v.size <= 0)
        fail(`variants.${name}.size must be a positive integer (found ${JSON.stringify(v.size)})`);
      else if (v.size > MAX_BYTES)
        fail(`variants.${name}.size must stay within the ${MAX_BYTES} byte download cap (found ${v.size}) — raise the cap via a design change, never by deleting this check`);
      if (typeof v.buildInfo !== 'string' || v.buildInfo.length === 0)
        fail(`variants.${name}.buildInfo must be a non-empty string read from ghostty_build_info`);
    }

    // Cross-field: tag must agree with releaseUrl and both variant URLs.
    if (tag !== null && source.repo === PINNED_REPO) {
      const expectedReleaseUrl = `https://github.com/${PINNED_REPO}/releases/tag/${tag}`;
      if (source.releaseUrl !== expectedReleaseUrl)
        fail(`source.releaseUrl must be ${JSON.stringify(expectedReleaseUrl)} — it must agree with source.tag (found ${JSON.stringify(source.releaseUrl)})`);
      for (const name of ['full', 'small']) {
        const v = isObj(variants[name]) ? variants[name] : null;
        if (v === null || typeof v.url !== 'string') continue;
        const expectedUrl = `https://github.com/${PINNED_REPO}/releases/download/${tag}/${ASSET_NAMES[name]}`;
        if (v.url !== expectedUrl)
          fail(`variants.${name}.url must be ${JSON.stringify(expectedUrl)} — cross-check tag and the allowlisted asset name (found ${JSON.stringify(v.url)})`);
      }
    }
  }

  schemaOk = problems.length === 0;
  if (schemaOk) {
    const f = pin.variants.full;
    const s = pin.variants.small;
    note(`pin ${pin.source.releaseUrl} (pinned ${pin.pinnedAt})`);
    note(`full  sha ${f.sha256.slice(0, 8)}… size ${f.size} buildInfo ${JSON.stringify(f.buildInfo)}`);
    note(`small sha ${s.sha256.slice(0, 8)}… size ${s.size} buildInfo ${JSON.stringify(s.buildInfo)}`);
  }
}

// --- 5: no tracked binaries ---------------------------------------------

try {
  const tracked = execFileSync('git', ['ls-files', '*.wasm'], { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  if (tracked.length > 0) {
    fail(`tracked wasm files defeat the pin-only supply chain — untrack them (git rm --cached ${tracked.join(' ')}) and let the resolver fetch by pin`);
  } else {
    note('no tracked *.wasm files');
  }
} catch (err) {
  fail(`cannot run \`git ls-files\` in ${repoRoot} (${err.message}) — the no-tracked-wasm assertion requires a git checkout`);
}

// --- 4: local cache consistency -----------------------------------------

if (schemaOk) {
  for (const name of ['full', 'small']) {
    const sha = pin.variants[name].sha256;
    const cachePath = join(CACHE_DIR, `${sha}.wasm`);
    if (!existsSync(cachePath)) continue;
    try {
      const actual = sha256Hex(new Uint8Array(readFileSync(cachePath)));
      if (actual !== sha) {
        fail(`cached ${cachePath} hashes to ${actual} but the pin expects ${sha} — delete it (the resolver discards invalid cache entries and re-downloads on next use)`);
      } else {
        note(`cache hit ${name} (${cachePath})`);
      }
    } catch (err) {
      fail(`cached ${cachePath} cannot be read (${err.message}) — delete it; the resolver re-downloads and re-verifies on next use`);
    }
  }
}

// --- 3: network assertions ----------------------------------------------

async function walkRedirects(label, startUrl, method) {
  let current;
  try {
    current = new URL(startUrl);
  } catch {
    return null; // malformed URL already reported by the schema pass
  }
  let hops = 0;
  for (;;) {
    if (current.protocol !== 'https:') {
      fail(`${label}: hop ${current.href} is not https: — only https URLs are accepted`);
      return null;
    }
    if (!HOST_ALLOWLIST.has(current.hostname)) {
      fail(`${label}: hop host ${current.hostname} is not in the allowlist [${[...HOST_ALLOWLIST].join(', ')}] (${current.href}) — pin only canonical github.com/ghostty-org download URLs`);
      return null;
    }
    let res;
    try {
      res = await fetch(current, {
        method,
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      fail(`${label}: request to ${current.href} failed (${err.message}) — check the network, or rerun with --offline to skip network assertions`);
      return null;
    }
    await res.body?.cancel().catch(() => {});
    if (REDIRECT_STATUSES.has(res.status)) {
      hops += 1;
      if (hops > MAX_REDIRECTS) {
        fail(`${label}: more than ${MAX_REDIRECTS} redirect hops from ${startUrl}`);
        return null;
      }
      const location = res.headers.get('location');
      if (location === null) {
        fail(`${label}: status ${res.status} at ${current.href} carries no Location header`);
        return null;
      }
      current = new URL(location, current);
      continue;
    }
    return { res, url: current };
  }
}

async function inspectUrl(label, startUrl) {
  let final = await walkRedirects(label, startUrl, 'HEAD');
  if (final === null) return;
  if (final.res.status === 405 || final.res.status === 501) {
    // Host rejects HEAD: redo the walk with GET, cancelling the body as
    // soon as the headers arrive (size policy rides on Content-Length).
    final = await walkRedirects(label, startUrl, 'GET');
    if (final === null) return;
  }
  if (final.res.status !== 200) {
    fail(`${label}: expected HTTP 200 at ${final.url.href} but got ${final.res.status} — the pinned release asset is gone; check the ghostty-wasm-sync workflow and merge a fresh pin PR`);
    return;
  }
  const contentLength = final.res.headers.get('content-length');
  if (contentLength !== null) {
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes > MAX_BYTES) {
      fail(`${label}: Content-Length ${contentLength} at ${final.url.href} exceeds the ${MAX_BYTES} byte download cap — the upstream asset outgrew the frozen supply chain; raise the cap via a design change, never by deleting this check`);
      return;
    }
  }
  note(`${label}: 200 via ${final.url.hostname}${contentLength !== null ? ` (content-length ${contentLength})` : ''}`);
}

if (!offline && schemaOk) {
  for (const name of ['full', 'small']) {
    await inspectUrl(`network ${name}`, pin.variants[name].url);
  }
}

// --- report --------------------------------------------------------------

for (const line of notes) console.log(`[verify-ghostty-pin]   ${line}`);
if (problems.length > 0) {
  console.error(`[verify-ghostty-pin] MISSING REQUIREMENT — ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`[verify-ghostty-pin] OK — pin verified${offline ? ' (offline: network assertions skipped)' : ''}`);
