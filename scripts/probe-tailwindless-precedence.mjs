#!/usr/bin/env node
// probe-tailwindless-precedence — the lane-2 placement-law probe
// (openspec change 2026-09-17-tailwindless-site, Gate-4 fix
// 2026-09-16, blocker 3).
//
// What Codex Gate-4 flagged: the timeline docs page authored its
// REGISTERED semantic composites (.tl-*) in the Svelte <style> block
// — which compiles UNLAYERED + scope-hashed, so the sheet beat any
// consumer utility (unlayered beats layered; (0,2,0) beats (0,1,0)).
// That violates the css-architecture lane-2 contract: consumer
// utilities must be able to override semantic rules.
//
// The fix under test: the rules now live in the site module sheet
// apps/www/src/lib/site/timeline-docs.css as
//   @layer components { :where(.tl-*) { … } }
// — zero specificity, earlier layer. This probe drives a REAL
// browser against the worktree dev server and proves:
//
//   placement   — every .tl-* family is found inside a
//                 CSSLayerBlockRule named 'components', wrapped in
//                 :where() (zero specificity), with the registered
//                 media seams (40rem/64rem shell, 900/1300 matrix,
//                 1100 grid-3) intact INSIDE the layer
//   regression  — ZERO .tl-* rules anywhere OUTSIDE a cascade layer
//                 (a return to the Svelte <style> form goes red)
//   precedence  — a consumer utility injected into @layer utilities
//                 FLIPS the computed value on live .tl-eyebrow
//                 (font-size) and .tl-ctl (background): the lane-2
//                 contract, utilities always win
//   hover law   — the native :hover seam still paints (outline
//                 control → muted ground) from inside the layer
//
// Self-converging: the dev server is spawned DETACHED (own process
// group) and killed by pgid on every exit path; the browser closes;
// pid/port/chrome-leftover evidence lands in the receipt. Exit 0
// only when every row is green.
//
// Receipt chain (Gate-5 hardening, 2026-09-16 — Codex round-5,
// bypass 6): this receipt carries the same provenance as the pilot's
// (meta.commit / meta.dirty / meta.runAt) PLUS a summaryHash over the
// canonical {commit, summary, rows} payload. It is VERIFIED by the
// pilot probe's combined gate — one command checks every receipt:
//   node scripts/probe-tailwindless-pilot.mjs --verify-receipt
// (a stale receipt — bound to an older commit with non-research drift
// since, e.g. this change's own probe-code commits — goes red there).
//
// Run: node scripts/probe-tailwindless-precedence.mjs
// Receipt: openspec/changes/2026-09-17-tailwindless-site/research/precedence-receipt.json

import { chromium } from 'playwright-core';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WWW = join(ROOT, 'apps/www');
const RESEARCH = join(ROOT, 'openspec/changes/2026-09-17-tailwindless-site/research');
const RECEIPT = join(RESEARCH, 'precedence-receipt.json');

// Gate-6 ownership law: the probe must measure ITS OWN server. Three
// defenses — (1) the spawned child's exit/error is watched (a vite
// that dies on 'port in use' goes red immediately, never silently
// riding a stale 200); (2) after readiness, lsof must show the port
// owned by OUR pid; (3) the port is RANDOM-free (the fixed 5198 was a
// pre-emption surface). Plus --ownership-selftest: pre-occupy a port
// and demand startServer fail.
import { createServer as createTcpServer } from 'node:net';
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = createTcpServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
let SERVER_PORT = null;
let FORCE_PORT = null; // --ownership-selftest: pre-empted port
const afterBase = () => `http://localhost:${SERVER_PORT}`;
const PAGE_PATH = '/docs/components/timeline.html';

// The verified wasm from the MAIN repo's content-addressed cache (env
// override path never writes any cache — the Owner's tree stays
// untouched; same pin as probe-tailwindless-pilot.mjs).
const GHOSTTY_WASM =
  '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/.cache/jixoai-ghostty/0fb5949ce28da01bf265143782b2b44487568fefd6ff40528900688565ec6a12.wasm';
const CHROME =
  '/Users/kzf/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// ── receipt-chain primitives (must stay IDENTICAL to the copies in
// probe-tailwindless-pilot.mjs — that probe's --verify-receipt gate
// recomputes this receipt's hash with its own copy; drift here would
// false-red every verify) ──
const canonicalJson = (v) =>
  v === null || typeof v !== 'object'
    ? JSON.stringify(v)
    : Array.isArray(v)
      ? `[${v.map(canonicalJson).join(',')}]`
      // undefined keys must drop EXACTLY like JSON.stringify does at
      // write time — else the generation hash covers keys the file
      // never carries and every recompute mismatches (the Gate-5 bug)
      : `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(',')}}`;
const chainPayloadOf = (r) => ({ commit: r?.meta?.commit ?? null, summary: r?.summary ?? null, rows: r?.matrix ?? r?.rows ?? null });
const summaryHashOf = (r) => createHash('sha256').update(canonicalJson(chainPayloadOf(r))).digest('hex').slice(0, 16);

const commitSha = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirtyFiles = execFileSync('git', ['-C', ROOT, 'status', '--porcelain'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const receipt = {
  meta: {
    change: '2026-09-17-tailwindless-site',
    task: 'Gate-4 fix (2026-09-16) — lane-2 precedence probe: semantic sheet placement + consumer-utility override',
    runAt: new Date().toISOString(),
    page: PAGE_PATH,
    commit: commitSha,
    commitShort: commitSha.slice(0, 8),
    branch: execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim(),
    dirty: dirtyFiles.length ? { fileCount: dirtyFiles.length, files: dirtyFiles } : false,
    playwright: JSON.parse(readFileSync(join(ROOT, 'node_modules/playwright-core/package.json'), 'utf8')).version,
    chrome: CHROME,
    provenance: null, // materialized at write time — the port is
    // assigned by startServer, which runs AFTER this literal
    _provenanceBuilder: () => ({
      after: `worktree dev server ${afterBase()} — vite dev over apps/www, HEAD ${commitSha} (meta.commit; dirty: ${dirtyFiles.length} files — see meta.dirty)`,
      ghosttyWasm: `JIXOAI_GHOSTTY_WASM_PATH=${GHOSTTY_WASM} (env override; never writes any cache)`,
      sheet: 'apps/www/src/lib/site/timeline-docs.css — @layer components { :where(.tl-*) { … } }',
    }),
  },
  server: { spawn: null, teardown: null },
  rows: [],
  summary: null,
};

const rows = [];
const row = (id, ok, detail) => {
  rows.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` — ${detail}` : ''}`);
};
const expect = (id, ok, detail) => row(id, ok, detail);

// ── dev server lifecycle (detached process group → pgid kill) ──
let server = null;
const startServer = async () => {
  const bin = join(WWW, 'node_modules/.bin/vite');
  SERVER_PORT = FORCE_PORT ?? (await freePort());
  server = spawn(bin, ['dev', '--port', String(SERVER_PORT), '--strictPort'], {
    cwd: WWW,
    env: { ...process.env, JIXOAI_GHOSTTY_WASM_PATH: GHOSTTY_WASM },
    detached: true, // own process group: kill(-pid) reaps vite + esbuild children
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logPath = `/tmp/probe-precedence-dev-${server.pid}.log`;
  let serverDied = null;
  server.on('exit', (code, signal) => { serverDied ??= { code, signal }; });
  server.on('error', (err) => { serverDied ??= { error: String(err) }; });
  let log = '';
  server.stdout.on('data', (d) => (log += d));
  server.stderr.on('data', (d) => (log += d));
  receipt.server.spawn = {
    cmd: `${bin} dev --port ${SERVER_PORT} --strictPort`,
    cwd: WWW,
    pid: server.pid,
    pgid: server.pid, // detached ⇒ child IS the group leader
    envJixoaiGhosttyWasmPath: GHOSTTY_WASM,
    logPath,
  };
  const deadline = Date.now() + 240_000;
  for (;;) {
    if (serverDied) {
      writeFileSync(logPath, log);
      throw new Error(`dev server DIED before readiness (${JSON.stringify(serverDied)}) — a stale listener or a spawn failure; log: ${logPath}`);
    }
    if (Date.now() > deadline) {
      writeFileSync(logPath, log);
      throw new Error(`dev server never answered 200 on ${afterBase()}${PAGE_PATH} (log: ${logPath})`);
    }
    try {
      const res = await fetch(`${afterBase()}${PAGE_PATH}`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  // OWNERSHIP: the answering port must belong to THIS spawn — a stale
  // server's 200 must never satisfy the probe (the Gate-6 catch)
  let owners = [];
  try {
    owners = execFileSync('lsof', [`-ti:${SERVER_PORT}`], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch (e) {
    throw new Error(`ownership check failed to run lsof (${String(e)}) — fail-closed`);
  }
  if (!owners.includes(String(server.pid))) {
    writeFileSync(logPath, log);
    throw new Error(`port ${SERVER_PORT} is owned by [${owners.join(', ')}], not our spawn (pid ${server.pid}) — measuring a foreign server is forbidden`);
  }
  receipt.server.spawn.port = SERVER_PORT;
  return logPath;
};
const stopServer = async () => {
  if (!server || server.killed) return;
  const pid = server.pid;
  const evidence = { pid, psBefore: '', killedBy: '', portAfter: '', logTail: '' };
  try {
    evidence.psBefore = execFileSync('ps', ['-o', 'pid,pgid,command', '-p', String(pid)], { encoding: 'utf8' }).trim();
  } catch {}
  try {
    process.kill(-pid, 'SIGTERM'); // the whole group
    evidence.killedBy = `SIGTERM → process group -${pid}`;
  } catch (e) {
    evidence.killedBy = `group SIGTERM failed: ${e.message}`;
  }
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      break;
    }
  }
  try {
    process.kill(pid, 0);
    process.kill(-pid, 'SIGKILL');
    evidence.killedBy += ' + SIGKILL (group)';
  } catch {}
  try {
    evidence.portAfter = execFileSync('lsof', ['-ti', `:${SERVER_PORT ?? '?'}`], { encoding: 'utf8' }).trim() || '(empty — port free)';
  } catch {
    evidence.portAfter = '(empty — port free)';
  }
  receipt.server.teardown = evidence;
};

// ── in-page cssRules census ──────────────────────────────────────
// Walks every reachable stylesheet, threading the enclosing cascade
// layer name. Returns { layered: [ {layer, media, selector} ],
// unlayered: [ {media, selector} ] } for selectors matching /tl-/.
const censusTlRules = () => {
  const layered = [];
  const unlayered = [];
  const walkRules = (rules, layer, media) => {
    for (const rule of rules) {
      if (rule.cssRules) {
        const isLayer = typeof rule.name === 'string' && rule.constructor?.name === 'CSSLayerBlockRule';
        const isMedia = rule.constructor?.name === 'CSSMediaRule';
        walkRules(
          rule.cssRules,
          isLayer ? (layer ? `${layer}.${rule.name}` : rule.name) : layer,
          isMedia ? rule.conditionText : media,
        );
      }
      if (rule.selectorText && /\.tl-/.test(rule.selectorText)) {
        const entry = { media: media ?? null, selector: rule.selectorText };
        (layer ? layered : unlayered).push(layer ? { layer, ...entry } : entry);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walkRules(sheet.cssRules, null, null);
    } catch {
      /* cross-origin sheet — not ours */
    }
  }
  return { layered, unlayered };
};

// ── main ──
let browser = null;
const OWNERSHIP_SELFTEST = process.argv.includes('--ownership-selftest');
if (!OWNERSHIP_SELFTEST) try {
  if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  if (!existsSync(GHOSTTY_WASM)) throw new Error(`ghostty wasm not found at ${GHOSTTY_WASM}`);
  mkdirSync(RESEARCH, { recursive: true });

  console.log('→ starting worktree dev server on :5198 …');
  await startServer();
  console.log(`   dev server up (pid ${server.pid})`);

  browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${afterBase()}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector('[data-jx-tl-spine] path', { timeout: 45_000, state: 'attached' }); // hydrated spine

  // 1 ── placement: the families live in @layer components, in :where()
  const census = await page.evaluate(censusTlRules);
  receipt.cssCensus = census;
  const comp = census.layered.filter((r) => r.layer === 'components');
  const families = ['tl-shell', 'tl-eyebrow', 'tl-body', 'tl-col', 'tl-frame', 'tl-grid-3', 'tl-grid-matrix', 'tl-ctl'];
  for (const f of families) {
    const hits = comp.filter((r) => r.selector.includes(`.${f}`));
    expect(
      `placement: .${f} found in @layer components`,
      hits.length > 0,
      hits.map((h) => h.selector).join(' | ') || 'NOT FOUND',
    );
    expect(
      `placement: .${f} selectors are :where()-wrapped (zero specificity)`,
      hits.length > 0 && hits.every((h) => h.selector.includes(':where(')),
      hits.map((h) => h.selector).join(' | '),
    );
  }

  // 2 ── media seams intact INSIDE the layer (breakpoint-parity law)
  // cssRules keep declarations on the style rule — census again with
  // declarations read for the seam rows
  const seamCensus = await page.evaluate(() => {
    const found = [];
    const walk = (rules, layer, media) => {
      for (const rule of rules) {
        if (rule.cssRules) {
          const isLayer = typeof rule.name === 'string' && rule.constructor?.name === 'CSSLayerBlockRule';
          const isMedia = rule.constructor?.name === 'CSSMediaRule';
          walk(rule.cssRules, isLayer ? (layer ? `${layer}.${rule.name}` : rule.name) : layer, isMedia ? rule.conditionText : media);
        }
        if (rule.selectorText && /\.tl-/.test(rule.selectorText)) {
          found.push({
            layer,
            media: media ?? null,
            selector: rule.selectorText,
            gridTemplateColumns: rule.style?.gridTemplateColumns ?? null,
            paddingInline: rule.style?.paddingInline ?? null,
          });
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules, null, null);
      } catch {}
    }
    return found;
  });
  const seamHit = (sel, media, prop, valIncludes) =>
    seamCensus.some((r) => r.layer === 'components' && r.selector.includes(sel) && r.media === `(min-width: ${media})` && r[prop] && r[prop].includes(valIncludes));
  expect('seams: matrix min-900px → 2 tracks (inside the layer)', seamHit('.tl-grid-matrix', '900px', 'gridTemplateColumns', 'repeat(2'));
  expect('seams: grid-3 min-1100px → 3 tracks (inside the layer)', seamHit('.tl-grid-3', '1100px', 'gridTemplateColumns', 'repeat(3'));
  expect('seams: matrix min-1300px → 3 tracks (inside the layer)', seamHit('.tl-grid-matrix', '1300px', 'gridTemplateColumns', 'repeat(3'));
  expect('seams: shell 40rem re-pin (inside the layer)', seamHit('.tl-shell', '40rem', 'paddingInline', 'var'));
  expect('seams: shell 64rem re-pin (inside the layer)', seamHit('.tl-shell', '64rem', 'paddingInline', 'var'));

  // 3 ── regression guard: zero .tl-* rules OUTSIDE any cascade layer
  expect(
    'regression: no unlayered .tl-* rules (the Svelte <style> form is gone)',
    census.unlayered.length === 0,
    census.unlayered.length ? JSON.stringify(census.unlayered) : 'none',
  );

  // 4 ── precedence: a CONSUMER utility (later layer) flips the
  //      computed value on the live elements — the lane-2 contract
  const flip = await page.evaluate(() => {
    const out = {};
    const eyebrow = document.querySelector('.tl-eyebrow');
    const ctl = document.querySelector('[data-testid="tl-step-prev"]');
    if (!eyebrow || !ctl) return { error: 'anchors missing', hasEyebrow: !!eyebrow, hasCtl: !!ctl };

    out.eyebrowBefore = getComputedStyle(eyebrow).fontSize;
    out.ctlBefore = getComputedStyle(ctl).backgroundColor;

    // a consumer's utility sheet: later cascade layer, ONE class of
    // plain (0,1,0) specificity — the weakest possible consumer that
    // must still win over :where() in @layer components
    const styleEl = document.createElement('style');
    styleEl.id = 'probe-consumer-utilities';
    styleEl.textContent = `
      @layer utilities {
        .probe-eyebrow-utility { font-size: 41px; }
        .probe-ctl-utility { background: rgb(7, 8, 9); }
      }`;
    document.head.appendChild(styleEl);
    eyebrow.classList.add('probe-eyebrow-utility');
    ctl.classList.add('probe-ctl-utility');

    out.eyebrowAfter = getComputedStyle(eyebrow).fontSize;
    out.ctlAfter = getComputedStyle(ctl).backgroundColor;
    return out;
  });
  receipt.consumerFlip = flip;
  expect(
    'precedence: consumer utility flips .tl-eyebrow font-size (11px → 41px)',
    !flip.error && flip.eyebrowBefore === '11px' && flip.eyebrowAfter === '41px',
    JSON.stringify(flip),
  );
  expect(
    'precedence: consumer utility flips .tl-ctl background (semantic → rgb(7, 8, 9))',
    !flip.error && flip.ctlAfter === 'rgb(7, 8, 9)' && flip.ctlBefore !== flip.ctlAfter,
    JSON.stringify(flip),
  );

  // 5 ── hover law: the native :hover seam still paints from inside
  //      the layer (outline control → the muted ground). The consumer
  //      probe (step 4) is REMOVED first — its utilities-layer override
  //      would otherwise legitimately beat the in-layer :hover rule.
  // the cleanup runs BEFORE the hover (the comment always said so;
  // the code used to remove inside the read — hover landed on the
  // still-overridden button and the read raced the background
  // transition back, the intermittent-white flake)
  await page.evaluate(() => {
    document.getElementById('probe-consumer-utilities')?.remove();
    document.querySelector('[data-testid="tl-step-prev"]')?.classList.remove('probe-ctl-utility');
    document.querySelector('.probe-eyebrow-utility')?.classList.remove('probe-eyebrow-utility');
  });
  await page.waitForTimeout(350); // the override transition settles back
  // hover measurement with arbitration: :hover can be LOST between
  // hover() and the read (smooth-scroll drift moves the element off
  // the static mouse — a measurement artifact, the resting paint is
  // the page's own white). The loop distinguishes artifact from
  // defect: matches(':hover') true but the wrong color IS a defect
  // (hard red); matches false is an artifact — re-hover, up to 3
  let hover = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.hover('[data-testid="tl-step-prev"]');
    await page.waitForTimeout(150);
    hover = await page.evaluate(() => {
      const ctl = document.querySelector('[data-testid="tl-step-prev"]');
      const sentinel = document.createElement('div');
      sentinel.style.background = 'var(--muted)';
      document.body.appendChild(sentinel);
      const muted = getComputedStyle(sentinel).backgroundColor;
      sentinel.remove();
      return { hoveredBg: getComputedStyle(ctl).backgroundColor, mutedGround: muted, hoveredMatch: ctl.matches(':hover') };
    });
    hover.attempt = attempt;
    if (hover.hoveredMatch) break; // a real hover reading — judge below
  }
  receipt.hover = hover;
  expect(
    'hover: .tl-ctl:hover paints the muted ground (native pseudo, in-layer)',
    hover.hoveredMatch
      ? hover.hoveredBg === hover.mutedGround && hover.hoveredBg !== 'rgba(0, 0, 0, 0)'
      : false, // three artifacts in a row — still red, but the detail names it
    hover.hoveredMatch ? JSON.stringify(hover) : JSON.stringify({ ...hover, note: ':hover never matched — mouse/element drift for 3 attempts' }),
  );

  await ctx.close();

  const failed = rows.filter((r) => !r.ok);
  console.log(`\n${rows.length - failed.length}/${rows.length} precedence rows passed`);
  process.exitCode = failed.length ? 1 : 0;
} catch (err) {
  console.error(`ERROR  ${err?.stack ?? err}`);
  rows.push({ id: 'probe-error', ok: false, detail: String(err?.message ?? err) });
  process.exitCode = 1;
} finally {
  try {
    await browser?.close();
  } catch {}
  await stopServer();
  // leftover-Chrome evidence: only the chromium-1243 binary this probe launched
  receipt.server.teardown ??= {};
  try {
    const left = execFileSync('pgrep', ['-f', 'chromium-1243/chrome-mac-arm64'], { encoding: 'utf8' }).trim();
    receipt.server.teardown.chromeLeftovers = left || '(none)';
  } catch {
    receipt.server.teardown.chromeLeftovers = '(none)';
  }
  receipt.rows = rows;
  receipt.summary = { total: rows.length, passed: rows.filter((r) => r.ok).length, failed: rows.filter((r) => !r.ok).length };
  // Gate-5 content binding: hash BEFORE writing, over the exact body
  // being persisted — probe-tailwindless-pilot.mjs --verify-receipt
  // recomputes it alongside the pilot receipt's own
  receipt.summaryHash = summaryHashOf(receipt);
  receipt.meta.provenance = receipt.meta._provenanceBuilder();
  delete receipt.meta._provenanceBuilder;
  writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`receipt → ${RECEIPT}`);
}

// ── --ownership-selftest: a pre-occupied port MUST fail the probe ──
// the occupier answers REAL HTTP 200 (the Gate-6 hole was a stale
// server's 200 satisfying readiness) — the OWNERSHIP guard must red
if (OWNERSHIP_SELFTEST) {
  const { createServer } = await import('node:http');
  const occupier = createServer((req, res) => { res.writeHead(200); res.end('stale'); });
  await new Promise((resolve) => occupier.listen(0, '127.0.0.1', resolve));
  const { port } = occupier.address();
  FORCE_PORT = port;
  console.log(`ownership-selftest: HTTP-200 occupier on :${port} — startServer must die red`);
  try {
    await startServer();
    console.log('✗ FAIL — startServer succeeded against a foreign HTTP server (the stale-server hole is OPEN)');
    process.exitCode = 1;
  } catch (e) {
    const msg = String(e?.message ?? e);
    const right = /owned by|DIED before readiness/.test(msg);
    console.log(`${right ? '✓ PASS' : '✗ FAIL'} — startServer threw: ${msg.slice(0, 140)}`);
    if (!right) process.exitCode = 1;
  } finally {
    try { if (server?.pid) process.kill(-server.pid, 'SIGTERM'); } catch {}
    occupier.close();
  }
}
