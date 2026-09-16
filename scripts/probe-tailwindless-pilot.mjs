#!/usr/bin/env node
// probe-tailwindless-pilot — the P0 acceptance matrix probe
// (openspec change 2026-09-17-tailwindless-site, task 4.1).
//
// Parity matrix, NOT a smoke test: every after-side numeric/color
// reading must EQUAL the before-side reading, or the row is RED.
//
//   after  = this worktree's dev server, :5198 (vite dev over apps/www,
//            branch tailwindless-site — the stylex-migrated pilot page)
//   before = the Owner's main server, :5199 — ABSOLUTELY READ-ONLY:
//            HTTP GET + headless browsing only. Never restarted,
//            never written, never killed. Serving main@eb0c9aed
//            (the pre-migration, Tailwind-powered page).
//   page   = /docs/components/timeline.html (identical DOM/text/data
//            attrs on both sides; only the class strategy differs:
//            before = Tailwind utilities, after = stylex atoms + the
//            registered lane-2 semantic sheet).
//
// Matrix (per proposal.md "The P0 acceptance matrix"):
//   viewports [375, 768, 1099, 1100, 1440] × deviceScaleFactor 2 —
//     full-page screenshots + computed-style readings (grid track
//     counts across the 1100px seam, eyebrow voice 11px/0.24em,
//     frame 1px hairline, body 12.5px voice, no "[object Object]")
//   dark-scope parity  — html.dark: body background + eyebrow oklch
//   keyboard focus     — Tab order reaches the first stepper control,
//                        focus-visible outline present (computed)
//   forced-colors      — emulation active: key fg/bg pairs still
//                        distinct (readable), values parity
//   print emulation    — media 'print': spine + progress svg paths
//                        exist with non-zero bounding boxes
//
// Self-converging: the dev server is spawned DETACHED (own process
// group) and killed by pgid on every exit path; the browser closes;
// pid/port evidence lands in the receipt. Exit code 0 only when every
// matrix row is green.
//
// Run: node scripts/probe-tailwindless-pilot.mjs
// Verify a receipt against the working tree (Gate-4 fix, 2026-09-16 —
// receipts are commit-bound; re-run after the fix commit):
//   node scripts/probe-tailwindless-pilot.mjs --verify-receipt
// Receipt: openspec/changes/2026-09-17-tailwindless-site/research/pilot-matrix-receipt.json
// Shots:   openspec/changes/2026-09-17-tailwindless-site/research/matrix/{after|before}-w{375|768|1099|1100|1440}.png
//
// Artifact placement (Gate-4 fix, 2026-09-16): products land IN the
// change's research/ dir (receipt + matrix/); a stale artifact found
// there is overwritten and recorded in meta.overwrote.

import { chromium } from 'playwright-core';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WWW = join(ROOT, 'apps/www');
const RESEARCH = join(ROOT, 'openspec/changes/2026-09-17-tailwindless-site/research');
const MATRIX_DIR = join(RESEARCH, 'matrix');
const RECEIPT = join(RESEARCH, 'pilot-matrix-receipt.json');

const AFTER_BASE = 'http://localhost:5198';
const BEFORE_BASE = 'http://localhost:5199'; // READ-ONLY (Owner's main server)
const PAGE_PATH = '/docs/components/timeline.html';
const VIEWPORTS = [375, 768, 1099, 1100, 1440];
const DSF = 2;

const MAIN_REPO = '/Users/kzf/Dev/GitHub/jixoai-labs/ui'; // read-only neighbor (main@eb0c9aed)
// The verified wasm from the MAIN repo's content-addressed cache — sha256
// matches packages/vite-plugin/ghostty.pin.json (full variant). The env
// override path never writes any cache, so the Owner's tree stays untouched.
const GHOSTTY_WASM =
  '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/.cache/jixoai-ghostty/0fb5949ce28da01bf265143782b2b44487568fefd6ff40528900688565ec6a12.wasm';
const CHROME =
  '/Users/kzf/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// ── selector maps: the SAME semantic anchors, per-side spellings ──
// after = the lane-2 semantic sheet classes; before = the pre-migration
// Tailwind utility strings (from HEAD's version of the page).
const SEL = {
  after: {
    grid3: '.tl-grid-3', // spine presets grid (first in DOM)
    matrix: '.tl-grid-matrix', // geometry matrix host
    eyebrow: '.tl-eyebrow', // first: spine presets label
    frame: '.tl-frame', // first: horizontal-leading stage frame
    ctl: '[data-testid="tl-step-prev"]',
    body: '.tl-body', // first demo body <p>
  },
  before: {
    grid3: 'div.grid.gap-6.min-\\[1100px\\]\\:grid-cols-3',
    matrix: 'div.grid.gap-6.min-\\[900px\\]\\:grid-cols-2.min-\\[1300px\\]\\:grid-cols-3',
    eyebrow: 'span.font-nav.text-primary.text-\\[11px\\].uppercase.tracking-\\[0\\.24em\\]',
    frame: 'div.overflow-x-auto.border.border-border',
    ctl: '[data-testid="tl-step-prev"]',
    body: 'p.text-\\[12\\.5px\\]',
  },
};

// ── --verify-receipt: bind a receipt to the CURRENT tree (Gate-4 fix,
// 2026-09-16). The receipt's meta.commit must equal the current HEAD
// and every recorded artifact path must exist — the orchestrator runs
// this after the fix commit to re-bind the receipt. Any mismatch (or
// a pre-binding receipt without meta.commit) exits 1.
if (process.argv.includes('--verify-receipt')) {
  const failVerify = (msg) => {
    console.error(`FAIL  --verify-receipt: ${msg}`);
    process.exit(1);
  };
  if (!existsSync(RECEIPT)) failVerify(`no receipt at ${RECEIPT} — run the probe first`);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(RECEIPT, 'utf8'));
  } catch (e) {
    failVerify(`receipt is not valid JSON: ${e.message}`);
  }
  const head = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (!parsed.meta?.commit) {
    failVerify(`receipt predates commit-binding (no meta.commit) — regenerate on HEAD ${head.slice(0, 8)}`);
  }
  if (parsed.meta.commit !== head) {
    // receipts may be committed AFTER the tree they measured (the
    // commit-binding loop: committing receipts rewrites HEAD). The
    // honest semantic: the measured commit must be an ANCESTOR of
    // HEAD, and everything between it and HEAD must be receipt
    // artifacts only (the change's research/ paths) — any CODE drift
    // since the measurement is red
    let isAncestor;
    try {
      execFileSync('git', ['-C', ROOT, 'merge-base', '--is-ancestor', parsed.meta.commit, head], { stdio: 'ignore' });
      isAncestor = true;
    } catch {
      isAncestor = false;
    }
    if (!isAncestor) {
      failVerify(`receipt commit ${parsed.meta.commit.slice(0, 8)} is NOT an ancestor of HEAD ${head.slice(0, 8)} — re-run the probe on this tree`);
    }
    let changed;
    try {
      changed = execFileSync('git', ['-C', ROOT, 'diff', '--name-only', parsed.meta.commit, head], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    } catch {
      changed = [];
    }
    const offTree = changed.filter((f) => !f.startsWith('openspec/changes/2026-09-17-tailwindless-site/research/'));
    if (offTree.length > 0) {
      failVerify(`tree drifted beyond receipts since ${parsed.meta.commit.slice(0, 8)}: ${offTree.slice(0, 3).join(', ')}${offTree.length > 3 ? ' …' : ''}`);
    }
  }
  const artifacts = [];
  const collectArtifacts = (v) => {
    if (typeof v === 'string' && v.endsWith('.png')) artifacts.push(v);
    else if (v && typeof v === 'object') Object.values(v).forEach(collectArtifacts);
  };
  collectArtifacts(parsed);
  if (!artifacts.length) failVerify('receipt records no screenshot artifacts (.png) — nothing to bind');
  const missing = artifacts.filter((p) => !existsSync(p));
  if (missing.length) failVerify(`missing artifacts:\n  ${missing.join('\n  ')}`);
  console.log(`PASS  --verify-receipt: commit ${head.slice(0, 8)} matches; ${artifacts.length}/${artifacts.length} artifacts exist`);
  console.log(`      runAt ${parsed.meta.runAt ?? '(pre-binding)'} · dirty at run: ${parsed.meta.dirty ? `${parsed.meta.dirty.fileCount} files` : 'clean'}`);
  process.exit(0);
}

if (!existsSync(CHROME)) {
  console.error(`FAIL  Chrome not found at ${CHROME}`);
  process.exit(1);
}
if (!existsSync(GHOSTTY_WASM)) {
  console.error(`FAIL  ghostty wasm not found at ${GHOSTTY_WASM}`);
  process.exit(1);
}

mkdirSync(MATRIX_DIR, { recursive: true });

// Gate-4 fix (2026-09-16): provenance is COMMIT-BOUND. The receipt
// records the exact HEAD it was generated on plus the dirty-file list;
// --verify-receipt re-asserts both later (a receipt from another
// commit — or pre-binding, without meta.commit — refuses to verify).
const commitSha = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirtyFiles = execFileSync('git', ['-C', ROOT, 'status', '--porcelain'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
// stale artifacts from earlier runs (e.g. the pre-Gate-4 copies moved
// by hand into the change dir) are overwritten — and said so
const overwrote = [];
if (existsSync(RECEIPT)) overwrote.push(RECEIPT);
if (existsSync(MATRIX_DIR)) overwrote.push(...readdirSync(MATRIX_DIR).map((f) => join(MATRIX_DIR, f)));

const receipt = {
  meta: {
    change: '2026-09-17-tailwindless-site',
    task: '4.1 — the P0 acceptance matrix (pinned probe)',
    runAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    page: PAGE_PATH,
    viewports: VIEWPORTS,
    deviceScaleFactor: DSF,
    playwright: JSON.parse(readFileSync(join(ROOT, 'node_modules/playwright-core/package.json'), 'utf8')).version,
    chrome: CHROME,
    commit: commitSha,
    commitShort: commitSha.slice(0, 8),
    dirty: dirtyFiles.length ? { fileCount: dirtyFiles.length, files: dirtyFiles } : false,
    overwrote: overwrote.length ? overwrote : false,
    provenance: {
      before: `main server ${BEFORE_BASE} — READ-ONLY (HTTP GET + headless browsing only; never restarted/written/killed); serves main@${execFileSync('git', ['-C', MAIN_REPO, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()} (the pre-migration Tailwind page, prerendered build)`,
      after: `worktree dev server ${AFTER_BASE} — vite dev over apps/www, branch ${execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim()}, HEAD ${commitSha} (meta.commit; dirty: ${dirtyFiles.length} files — see meta.dirty)`,
      ghosttyWasm: `JIXOAI_GHOSTTY_WASM_PATH=${GHOSTTY_WASM} (sha256 matches ghostty.pin.json "full"; the env override never writes any cache)`,
    },
  },
  server: { spawn: null, teardown: null },
  sides: { after: {}, before: {} },
  matrix: [],
  summary: null,
};

const rows = [];
const row = (id, ok, detail, after, before) => {
  rows.push({ id, ok, detail, after, before });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` — ${detail}` : ''}`);
};
// parity: after MUST equal before (JSON compare keeps types honest)
const parity = (id, a, b, extra = '') =>
  row(id, JSON.stringify(a) === JSON.stringify(b), extra || `after=${JSON.stringify(a)} before=${JSON.stringify(b)}`, a, b);
const expect = (id, ok, detail) => row(id, ok, detail, null, null);

// ── dev server lifecycle (detached process group → pgid kill) ──
let server = null;
const startServer = async () => {
  const bin = join(WWW, 'node_modules/.bin/vite');
  server = spawn(bin, ['dev', '--port', '5198', '--strictPort'], {
    cwd: WWW,
    env: { ...process.env, JIXOAI_GHOSTTY_WASM_PATH: GHOSTTY_WASM },
    detached: true, // own process group: kill(-pid) reaps vite + esbuild children
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logPath = `/tmp/probe-tailwindless-dev-${server.pid}.log`;
  let log = '';
  server.stdout.on('data', (d) => (log += d));
  server.stderr.on('data', (d) => (log += d));
  receipt.server.spawn = {
    cmd: `${bin} dev --port 5198 --strictPort`,
    cwd: WWW,
    pid: server.pid,
    pgid: server.pid, // detached ⇒ child IS the group leader
    envJixoaiGhosttyWasmPath: GHOSTTY_WASM,
    logPath,
  };
  const deadline = Date.now() + 240_000;
  for (;;) {
    if (Date.now() > deadline) {
      writeFileSync(logPath, log);
      throw new Error(`dev server never answered 200 on ${AFTER_BASE}${PAGE_PATH} (log: ${logPath})`);
    }
    try {
      const res = await fetch(`${AFTER_BASE}${PAGE_PATH}`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  // settle: one throwaway compile + hydration before measurements
  try {
    const res = await fetch(`${AFTER_BASE}${PAGE_PATH}`);
    receipt.server.spawn.warmupStatus = res.status;
  } catch {}
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
    evidence.portAfter = execFileSync('lsof', ['-ti', ':5198'], { encoding: 'utf8' }).trim() || '(empty — port free)';
  } catch {
    evidence.portAfter = '(empty — port free)';
  }
  receipt.server.teardown = evidence;
};

// ── collection helpers ──
const settleReveal = (page) =>
  page.evaluate(async () => {
    // scroll-driven reveals: sweep the page once so both sides see the
    // same reveal states before the full-page shot
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });

const readComputed = (page, sel) =>
  page.evaluate((sel) => {
    const q = (s) => document.querySelector(s);
    const tracks = (el) => {
      if (!el) return null;
      const v = getComputedStyle(el).gridTemplateColumns;
      return v === 'none' ? 1 : v.trim().split(/\s+/).length;
    };
    const pick = (el, props) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, c[p]]));
    };
    const hue = getComputedStyle(document.documentElement).getPropertyValue('--brand-hue').trim();
    return {
      hue,
      grid3Tracks: tracks(q(sel.grid3)),
      grid3Raw: q(sel.grid3) ? getComputedStyle(q(sel.grid3)).gridTemplateColumns : null,
      matrixTracks: tracks(q(sel.matrix)),
      matrixRaw: q(sel.matrix) ? getComputedStyle(q(sel.matrix)).gridTemplateColumns : null,
      eyebrow: pick(q(sel.eyebrow), ['fontFamily', 'fontSize', 'letterSpacing', 'textTransform', 'color']),
      frame: pick(q(sel.frame), ['borderTopWidth', 'borderTopStyle', 'borderTopColor']),
      ctl: pick(q(sel.ctl), ['fontSize', 'letterSpacing', 'textTransform', 'fontFamily']),
      bodyText: pick(q(sel.body), ['fontSize', 'color']),
      objectObject: document.documentElement.outerHTML.includes('[object Object]'),
    };
  }, sel);

// the brand hue rides the wall clock (hue-runtime: a 5s entrance spin,
// then continuous cruising) — a parity measurement must CONTROL it:
// freeze BOTH sides to one fixed hue before any capture, and assert
// the freeze stuck (the runtime writes the same inline channel, so a
// later frame could unstick it — the assertion catches that)
const HUE_FREEZE = '300';
async function freezeHue(page) {
  // the sanctioned channel: the hue popover's slider rides
  // setHueManually — manual interaction AUTO-PAUSES the cycle at the
  // given value (cruising frames no longer overwrite the inline var)
  await page.click('[aria-label="Brand hue & theme"]');
  await page.evaluate((hue) => {
    const input = document.querySelector('[aria-label="Brand hue"]');
    input.value = hue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, HUE_FREEZE);
  await page.waitForTimeout(150);
  const stuck = await page.evaluate(() => document.documentElement.style.getPropertyValue('--brand-hue'));
  if (stuck !== HUE_FREEZE) throw new Error(`hue freeze did not stick (got '${stuck}') — the runtime overwrites it`);
  // close the popover — captures must not carry the overlay
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  // the header-button click + Escape can nudge scroll/observers and
  // re-arm data-reveal entrances near the viewport edge — the settle
  // must run AFTER the freeze, or one side captures mid-reveal
  if (typeof settleReveal === 'function') await settleReveal(page);
}

async function collectViewport(browser, side, base, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  await page.goto(`${base}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  // state 'attached': stroke-only svg paths carry zero AREA (fill:none) —
  // Playwright's visibility gate would never open on them
  await page.waitForSelector('[data-jx-tl-spine] path', { timeout: 45_000, state: 'attached' }); // hydrated spine
  await settleReveal(page);
  await freezeHue(page);
  const shot = join(MATRIX_DIR, `${side}-w${width}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  const computed = await readComputed(page, SEL[side]);
  await ctx.close();
  return { ...computed, screenshot: shot };
}

async function collectDarkScope(browser, side, base) {
  const ctx = await browser.newContext({ viewport: { width: 1099, height: 900 }, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  await page.goto(`${base}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector('[data-jx-tl-spine] path', { timeout: 45_000, state: 'attached' });
  await freezeHue(page); // color-parity section — same wall-clock control
  const read = () =>
    page.evaluate((sel) => {
      const hue = getComputedStyle(document.documentElement).getPropertyValue('--brand-hue').trim();
      return {
        hue,
        dark: document.documentElement.classList.contains('dark'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        eyebrowColor: getComputedStyle(document.querySelector(sel.eyebrow)).color,
      };
    }, SEL[side]);
  const light = await read(); // no class (theme bootstrap defaults to system=light in a fresh context)
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(120);
  const dark = await read();
  await ctx.close();
  return { light, dark };
}

async function collectFocus(browser, side, base) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  await page.goto(`${base}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector(SEL[side].ctl, { timeout: 45_000 });
  await page.evaluate(() => {
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  let tabs = 0;
  let reached = false;
  while (tabs < 800) {
    await page.keyboard.press('Tab');
    tabs++;
    reached = await page.evaluate(
      () => document.activeElement?.matches('[data-testid="tl-step-prev"]') ?? false,
    );
    if (reached) break;
  }
  const outline = reached
    ? await page.evaluate(() => {
        const el = document.activeElement;
        const c = getComputedStyle(el);
        return { testid: el.getAttribute('data-testid'), outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineColor: c.outlineColor };
      })
    : null;
  await ctx.close();
  return { tabs, reached, outline };
}

async function collectForcedColors(browser, side, base) {
  const ctx = await browser.newContext({
    viewport: { width: 1099, height: 900 },
    deviceScaleFactor: DSF,
    forcedColors: 'active',
  });
  const page = await ctx.newPage();
  await page.goto(`${base}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector('[data-jx-tl-spine] path', { timeout: 45_000, state: 'attached' });
  const vals = await page.evaluate((sel) => {
    const doc = getComputedStyle(document.documentElement);
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    return {
      forcedColors: doc.colorScheme !== undefined && window.matchMedia('(forced-colors: active)').matches,
      bodyBg,
      eyebrowColor: getComputedStyle(document.querySelector(sel.eyebrow)).color,
      bodyTextColor: getComputedStyle(document.querySelector(sel.body)).color,
    };
  }, SEL[side]);
  await ctx.close();
  return vals;
}

async function collectPrint(browser, side, base) {
  const ctx = await browser.newContext({ viewport: { width: 1099, height: 900 }, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  await page.goto(`${base}${PAGE_PATH}`, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForSelector('[data-jx-tl-base]', { timeout: 45_000, state: 'attached' });
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);
  const spine = await page.evaluate(() => {
    const bbox = (p) => {
      try {
        const b = p.getBBox();
        return { w: Math.round(b.width * 100) / 100, h: Math.round(b.height * 100) / 100 };
      } catch {
        return null;
      }
    };
    const svgs = [...document.querySelectorAll('[data-jx-tl-spine]')];
    const bases = [...document.querySelectorAll('[data-jx-tl-base]')];
    const progress = [...document.querySelectorAll('[data-jx-tl-progress]')];
    const nonZero = (list) => list.filter((p) => { const b = bbox(p); return b && (b.w > 1 || b.h > 1); }).length;
    return {
      svgCount: svgs.length,
      baseCount: bases.length,
      baseNonZero: nonZero(bases),
      progressCount: progress.length,
      progressNonZero: nonZero(progress),
      baseSample: bases[0] ? { bbox: bbox(bases[0]), dLength: (bases[0].getAttribute('d') ?? '').length } : null,
      progressSample: progress[0] ? { bbox: bbox(progress[0]), dLength: (progress[0].getAttribute('d') ?? '').length } : null,
    };
  });
  await page.emulateMedia({ media: null });
  await ctx.close();
  return spine;
}

const writeReceipt = () => {
  const failed = rows.filter((r) => !r.ok);
  receipt.matrix = rows;
  receipt.summary = { total: rows.length, passed: rows.length - failed.length, failed: failed.length };
  writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + '\n');
};

// ── main ──
let browser = null;
try {
  console.log('→ starting worktree dev server on :5198 …');
  await startServer();
  console.log(`   dev server up (pid ${server.pid})`);

  browser = await chromium.launch({ executablePath: CHROME });
  // INTERLEAVED pairs: the brand hue rides the wall clock (~1° per 4
  // minutes), so each after/before pair is sampled seconds apart — a
  // hue-step boundary between two distant reads would fake a color diff
  console.log('→ collecting viewport matrix, after/before interleaved …');
  for (const w of VIEWPORTS) {
    receipt.sides.after[w] = await collectViewport(browser, 'after', AFTER_BASE, w);
    receipt.sides.before[w] = await collectViewport(browser, 'before', BEFORE_BASE, w);
    console.log(
      `   w${w}: after grid3=${receipt.sides.after[w].grid3Tracks} matrix=${receipt.sides.after[w].matrixTracks} · before grid3=${receipt.sides.before[w].grid3Tracks} matrix=${receipt.sides.before[w].matrixTracks}`,
    );
  }

  console.log('→ dark-scope / focus / forced-colors / print (paired) …');
  receipt.sides.after.dark = await collectDarkScope(browser, 'after', AFTER_BASE);
  receipt.sides.before.dark = await collectDarkScope(browser, 'before', BEFORE_BASE);
  receipt.sides.after.focus = await collectFocus(browser, 'after', AFTER_BASE);
  receipt.sides.before.focus = await collectFocus(browser, 'before', BEFORE_BASE);
  receipt.sides.after.forcedColors = await collectForcedColors(browser, 'after', AFTER_BASE);
  receipt.sides.before.forcedColors = await collectForcedColors(browser, 'before', BEFORE_BASE);
  receipt.sides.after.print = await collectPrint(browser, 'after', AFTER_BASE);
  receipt.sides.before.print = await collectPrint(browser, 'before', BEFORE_BASE);

  // ── the matrix rows ──
  const A = receipt.sides.after;
  const B = receipt.sides.before;

  for (const w of VIEWPORTS) {
    parity(`viewport ${w}: .tl-grid-3 track count`, A[w].grid3Tracks, B[w].grid3Tracks, `after=${A[w].grid3Tracks} (${A[w].grid3Raw}) before=${B[w].grid3Tracks} (${B[w].grid3Raw})`);
    parity(`viewport ${w}: grid-matrix track count`, A[w].matrixTracks, B[w].matrixTracks, `after=${A[w].matrixTracks} (${A[w].matrixRaw}) before=${B[w].matrixTracks} (${B[w].matrixRaw})`);
    parity(`viewport ${w}: eyebrow voice (font/size/tracking/transform)`, A[w].eyebrow, B[w].eyebrow, `after=${JSON.stringify(A[w].eyebrow)} before=${JSON.stringify(B[w].eyebrow)}`);
    parity(`viewport ${w}: frame border (width/style/color)`, A[w].frame, B[w].frame, `after=${JSON.stringify(A[w].frame)} before=${JSON.stringify(B[w].frame)}`);
    parity(`viewport ${w}: stepper control voice`, A[w].ctl, B[w].ctl, `after=${JSON.stringify(A[w].ctl)} before=${JSON.stringify(B[w].ctl)}`);
    parity(`viewport ${w}: body text voice`, A[w].bodyText, B[w].bodyText, `after=${JSON.stringify(A[w].bodyText)} before=${JSON.stringify(B[w].bodyText)}`);
    expect(`viewport ${w}: no "[object Object]" in rendered HTML`, !A[w].objectObject && !B[w].objectObject, `after=${A[w].objectObject} before=${B[w].objectObject}`);
  }

  // the 1100px seam — the flip must land exactly where the utility did, both sides
  for (const [side, S] of [['after', A], ['before', B]]) {
    expect(`${side}: grid-3 flips 1→3 across the 1100px seam`, S[1099].grid3Tracks === 1 && S[1100].grid3Tracks === 3, `w1099=${S[1099].grid3Tracks} w1100=${S[1100].grid3Tracks}`);
    expect(
      `${side}: matrix flips 1→2 (900px) → 3 (1300px)`,
      S[375].matrixTracks === 1 && S[768].matrixTracks === 1 && S[1099].matrixTracks === 2 && S[1100].matrixTracks === 2 && S[1440].matrixTracks === 3,
      `375=${S[375].matrixTracks} 768=${S[768].matrixTracks} 1099=${S[1099].matrixTracks} 1100=${S[1100].matrixTracks} 1440=${S[1440].matrixTracks}`,
    );
    expect(`${side}: eyebrow = 11px / 2.64px tracking`, S[1099].eyebrow?.fontSize === '11px' && S[1099].eyebrow?.letterSpacing === '2.64px', JSON.stringify(S[1099].eyebrow));
    expect(`${side}: frame hairline = 1px solid`, S[1099].frame?.borderTopWidth === '1px' && S[1099].frame?.borderTopStyle === 'solid', JSON.stringify(S[1099].frame));
  }

  // dark-scope parity (hue crossing guard: if hues differ the colors are
  // re-sampled back-to-back once — noted in the detail)
  parity('dark-scope: body background (html.dark)', A.dark.dark.bodyBg, B.dark.dark.bodyBg, `after=${A.dark.dark.bodyBg} (hue ${A.dark.dark.hue}) before=${B.dark.dark.bodyBg} (hue ${B.dark.dark.hue})`);
  parity('dark-scope: eyebrow color (html.dark)', A.dark.dark.eyebrowColor, B.dark.dark.eyebrowColor, `after=${A.dark.dark.eyebrowColor} before=${B.dark.dark.eyebrowColor}`);
  parity('light-scope: body background', A.dark.light.bodyBg, B.dark.light.bodyBg, `after=${A.dark.light.bodyBg} before=${B.dark.light.bodyBg}`);
  parity('light-scope: eyebrow color', A.dark.light.eyebrowColor, B.dark.light.eyebrowColor, `after=${A.dark.light.eyebrowColor} (hue ${A.dark.light.hue}) before=${B.dark.light.eyebrowColor} (hue ${B.dark.light.hue})`);
  expect('dark-scope: the dark class actually applied on both sides', A.dark.dark.dark && B.dark.dark.dark, `after=${A.dark.dark.dark} before=${B.dark.dark.dark}`);

  // keyboard focus
  expect('focus: Tab order reaches the first stepper control (both sides)', A.focus.reached && B.focus.reached, `after tabs=${A.focus.tabs} reached=${A.focus.reached}; before tabs=${B.focus.tabs} reached=${B.focus.reached}`);
  expect('focus: focus-visible outline present after (style ≠ none, width > 0)', A.focus.outline !== null && A.focus.outline.outlineStyle !== 'none' && parseFloat(A.focus.outline.outlineWidth) > 0, JSON.stringify(A.focus.outline));
  expect('focus: focus-visible outline present before', B.focus.outline !== null && B.focus.outline.outlineStyle !== 'none' && parseFloat(B.focus.outline.outlineWidth) > 0, JSON.stringify(B.focus.outline));
  if (A.focus.outline && B.focus.outline) {
    parity('focus: focus-visible outline parity (style/width/color)', [A.focus.outline.outlineStyle, A.focus.outline.outlineWidth, A.focus.outline.outlineColor], [B.focus.outline.outlineStyle, B.focus.outline.outlineWidth, B.focus.outline.outlineColor]);
  }

  // forced-colors
  expect('forced-colors: emulation active on both sides', A.forcedColors.forcedColors && B.forcedColors.forcedColors, `after=${A.forcedColors.forcedColors} before=${B.forcedColors.forcedColors}`);
  expect('forced-colors: eyebrow color ≠ body background (readable, after)', A.forcedColors.eyebrowColor !== A.forcedColors.bodyBg, `eyebrow=${A.forcedColors.eyebrowColor} bg=${A.forcedColors.bodyBg}`);
  expect('forced-colors: body text color ≠ body background (readable, after)', A.forcedColors.bodyTextColor !== A.forcedColors.bodyBg, `text=${A.forcedColors.bodyTextColor} bg=${A.forcedColors.bodyBg}`);
  expect('forced-colors: eyebrow color ≠ body background (readable, before)', B.forcedColors.eyebrowColor !== B.forcedColors.bodyBg, `eyebrow=${B.forcedColors.eyebrowColor} bg=${B.forcedColors.bodyBg}`);
  expect('forced-colors: body text color ≠ body background (readable, before)', B.forcedColors.bodyTextColor !== B.forcedColors.bodyBg, `text=${B.forcedColors.bodyTextColor} bg=${B.forcedColors.bodyBg}`);
  parity('forced-colors: body background parity', A.forcedColors.bodyBg, B.forcedColors.bodyBg);
  parity('forced-colors: eyebrow color parity', A.forcedColors.eyebrowColor, B.forcedColors.eyebrowColor);
  parity('forced-colors: body text color parity', A.forcedColors.bodyTextColor, B.forcedColors.bodyTextColor);

  // print emulation
  expect('print: spine svg + base paths render with non-zero bbox (after)', A.print.svgCount >= 1 && A.print.baseCount >= 1 && A.print.baseNonZero >= 1, JSON.stringify(A.print));
  expect('print: progress stroke renders with non-zero bbox (after)', A.print.progressCount >= 1 && A.print.progressNonZero >= 1, `progress ${A.print.progressNonZero}/${A.print.progressCount} non-zero, sample=${JSON.stringify(A.print.progressSample)}`);
  expect('print: spine svg + base paths render with non-zero bbox (before)', B.print.svgCount >= 1 && B.print.baseCount >= 1 && B.print.baseNonZero >= 1, JSON.stringify(B.print));
  expect('print: progress stroke renders with non-zero bbox (before)', B.print.progressCount >= 1 && B.print.progressNonZero >= 1, `progress ${B.print.progressNonZero}/${B.print.progressCount} non-zero, sample=${JSON.stringify(B.print.progressSample)}`);
  parity('print: spine svg count parity', A.print.svgCount, B.print.svgCount);
  parity('print: base path count parity', A.print.baseCount, B.print.baseCount);
  parity('print: progress path count parity', A.print.progressCount, B.print.progressCount);

  const failed = rows.filter((r) => !r.ok);
  console.log(`\n${rows.length - failed.length}/${rows.length} matrix rows passed`);
  process.exitCode = failed.length ? 1 : 0;
} catch (err) {
  console.error(`ERROR  ${err?.stack ?? err}`);
  rows.push({ id: 'probe-error', ok: false, detail: String(err?.message ?? err), after: null, before: null });
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
  writeReceipt();
  console.log(`receipt → ${RECEIPT}`);
}
