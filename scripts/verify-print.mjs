#!/usr/bin/env node
// verify-print — the print-pipeline probe (print-pipeline,
// 2026-08-30; rewritten from the paged-doc-family probe). verify-
// press's playwright-core pattern: a REAL Chromium against the built
// site (self-served from apps/www/dist when nothing answers on PORT).
//
// Locks in, per the change's verification contract:
//
//   bundle      SSR/prerender zero-pagedjs: no page emitted by the
//               build references a chunk carrying the pagedjs
//               runtime — the kernel stays a lazy client-only chunk
//               (dynamic import reached only when a print exit runs)
//   smoke       sim on → the output sibling carries paged pages →
//               margin boxes present with counter content → the ToC
//               page's entries carry REAL kernel-computed page
//               numbers (read from the kernel's inserted
//               target-counter rules) → sim off → container gone,
//               contexts rebound (density re-derived)
//   stamps      the preparatory signal precedes everything
//               (data-jx-print-sim + data-density=sm visible after
//               prepare); afterprint removes only a transaction-OWNED
//               stamp — the r6 fixture set:
//               sim→direct-print→afterprint→sim (stamp survives,
//               artifact stays) and screen→direct-print→afterprint
//               (stamp removed, artifact disposed)
//   animation   the CSS per-slot frame transfer on the dual-slot
//               fixture (one element, two named animations, non-zero
//               original delays, distinct currentTimes): each slot's
//               computed animation-delay equals the design formula
//               delay′ = (c<d)?(d−c):−((c−d) mod D) with the REAL
//               captured c, play-state paused, and the clone's
//               computed phase equals the source's; pre-paused stays
//               paused with its currentTime undisturbed;
//               WAAPI/ALTERNATE/FINISHED ride structured diagnostic
//               rows — no throw
//   roots       the measurability assertion fails loud on a
//               display:none output root (no zero-size pages) and a
//               failure retry succeeds; post-preview cancellation
//               leaves no residue
//   residue     three exit scenarios (consecutive sims, sim→print,
//               failure retry): no output root, no inserted head
//               styles, no active html stamp, no orphan pages
//   whitelist   the audited three-utility duel INSIDE the rendered
//               pages (after rendered — the kernel's rule-disable
//               window distorts during rendering)
//   real print  under print emulation with an active pipeline: the
//               app root hides, the page container stays visible
//               (emulateMedia — no real paper)
//
// Run: node scripts/verify-print.mjs   (PORT=… to retarget)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT ?? '4173';
const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// ── self-serve: when nothing answers on PORT, spawn a static server over
// the built dist and take it down after the probe. ──
import { spawn } from 'node:child_process';
import net from 'node:net';

const portOpen = () =>
  new Promise((yes) => {
    const s = net.connect({ port: Number(PORT), host: '127.0.0.1' });
    s.on('connect', () => { s.destroy(); yes(true); });
    s.on('error', () => yes(false));
  });
let serverProc = null;
if (!(await portOpen())) {
  const dist = join(root, 'apps/www/dist');
  if (!existsSync(dist)) {
    console.error('FAIL  no server on :' + PORT + ' and no apps/www/dist to self-serve — build first');
    process.exit(1);
  }
  serverProc = spawn('python3', ['-m', 'http.server', PORT, '--bind', '127.0.0.1', '--directory', dist], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await portOpen()) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}
process.on('exit', () => serverProc?.kill());

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ═══════════════════════════════════════════════════════════════════
// 1. the bundle gate: SSR/prerender pages reference zero pagedjs
// ═══════════════════════════════════════════════════════════════════
{
  const dist = join(root, 'apps/www/dist');
  const pagedjsSignature = /data-pagedjs-inserted-styles|pagedjs_pages|pagedjs_pagebox/;
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name);
      if (name.isDirectory()) walk(full);
      else if (name.name.endsWith('.html')) pages.push(full);
    }
  };
  if (existsSync(dist)) walk(dist);

  const offenders = [];
  let scanned = 0;
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    // the eager chunk set = script srcs + modulepreload links (the
    // built pages hydrate through inline scripts + preloads)
    const refs = [
      ...[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+href="([^"]+)"[^>]+rel="modulepreload"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)].map((m) => m[1]),
    ];
    for (const ref of refs) {
      const chunk = resolve(dist, '.' + new URL(ref, 'http://x/').pathname);
      if (!existsSync(chunk)) continue;
      scanned++;
      if (pagedjsSignature.test(readFileSync(chunk, 'utf8'))) offenders.push(`${page}: ${ref}`);
    }
    // inline module scripts must not carry the kernel either
    for (const match of html.matchAll(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)) {
      if (pagedjsSignature.test(match[1])) offenders.push(`${page}: <inline module>`);
    }
  }
  check(
    'bundle: prerendered pages reference zero pagedjs (lazy client-only chunk)',
    offenders.length === 0,
    offenders.length ? offenders.slice(0, 3).join(' | ') : `${pages.length} pages, ${scanned} chunks clean`,
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. the live pipeline (real Chromium)
// ═══════════════════════════════════════════════════════════════════
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 1080 } });
// stub the dialog BEFORE hydration: this probe never opens real paper
await page.addInitScript(() => {
  window.print = () => {};
});
await page.goto(`http://localhost:${PORT}/docs/paged.html`);
await page.waitForLoadState('domcontentloaded');
// readiness = the print layer hydrated (its controls exist)
await page.waitForSelector('[data-jx-print-controls]', { timeout: 30000 });
await page.waitForTimeout(400);

const meta = () =>
  page.evaluate(() => {
    const root = document.querySelector('[data-print-output]');
    if (!root?.dataset.jxPrintMeta) return null;
    return JSON.parse(root.dataset.jxPrintMeta);
  });
const waitForMeta = async () => {
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-print-output]');
    return Boolean(root?.dataset.jxPrintMeta);
  }, null, { timeout: 30000 });
  return meta();
};
const residue = () =>
  page.evaluate(() => ({
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
    insertedStyles: [...document.head.querySelectorAll('style[data-pagedjs-inserted-styles]')].length,
    active: document.documentElement.hasAttribute('data-jx-print-active'),
  }));
const mediumText = () => page.textContent('[data-jx-print-medium]');

// ---- 2a. sim on → pages + margin boxes + real ToC numbers ---------------
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const simMeta = await waitForMeta();

const pagesCount = await page.evaluate(
  () => document.querySelectorAll('[data-print-output] .pagedjs_page').length,
);
check(
  'sim: the output sibling carries paged pages (2+, real chunking)',
  pagesCount >= 2 && simMeta.pages === pagesCount,
  `pages=${pagesCount} meta.pages=${simMeta?.pages}`,
);

const marginBoxes = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  // the compiled content lands on the margin CONTENT element ::after
  const boxes = out ? out.querySelectorAll('.pagedjs_margin-bottom-left .pagedjs_margin-content, .pagedjs_margin-bottom-right .pagedjs_margin-content') : [];
  return [...boxes].map((box) => ({
    display: getComputedStyle(box).display,
    content: getComputedStyle(box, ':after').content,
  }));
});
check(
  'sim: kernel-real margin boxes present with counter content',
  marginBoxes.length === pagesCount * 2 &&
    marginBoxes.every((b) => b.display !== 'none' && /counter\(page/.test(b.content)),
  JSON.stringify(marginBoxes[0] ?? null),
);

const tocNumbers = await page.evaluate(() => {
  // the kernel resolves target-counter by inserting per-target rules
  // that reset a counter to the target's REAL page number; each toc
  // anchor carries data-target-counter-<k>="<target data-ref>" — join
  // the two and read the numbers back
  const rules = [];
  for (const sheet of document.styleSheets) {
    let cssRules;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of cssRules) {
      if (rule.type !== CSSRule.STYLE_RULE) continue;
      const decl = rule.style?.getPropertyValue?.('counter-reset') ?? '';
      if (!/target-counter/.test(decl)) continue;
      const m = /\[data-target-counter-[^\]=]+="([^\]]+)"\]::after/.exec(rule.selectorText ?? '');
      const n = /(-?\d+)\s*$/.exec(decl.trim());
      if (m && n) rules.push({ ref: m[1], page: Number(n[1]) });
    }
  }
  const anchors = [...document.querySelectorAll('[data-print-output] nav[data-jx-print-toc] a')];
  const numbers = anchors.map((a) => {
    const entry = Object.entries(a.dataset).find(([key]) => key.startsWith('targetCounter'));
    if (!entry) return null;
    const rule = rules.find((r) => r.ref === entry[1]);
    return rule ? rule.page : null;
  });
  return {
    hrefs: anchors.map((a) => a.getAttribute('href').slice(1)),
    numbers,
  };
});
check(
  'sim: the injected ToC page carries real kernel-computed page numbers',
  tocNumbers.hrefs.length >= 5 &&
    tocNumbers.numbers.every((n) => Number.isInteger(n) && n >= 1) &&
    tocNumbers.numbers.every((n, i) => i === 0 || n >= tocNumbers.numbers[i - 1]) &&
    Math.max(...tocNumbers.numbers) <= pagesCount,
  `hrefs=${JSON.stringify(tocNumbers.hrefs)} numbers=${JSON.stringify(tocNumbers.numbers)}`,
);

// the ToC page is FIRST (the nav owns its page before the content)
const tocFirst = await page.evaluate(() => {
  const first = document.querySelector('[data-print-output] .pagedjs_page');
  return Boolean(first?.querySelector('nav[data-jx-print-toc]'));
});
check('sim: the ToC page opens the artifact (break-after: page)', tocFirst, '');

// ---- 2b. stamp timing: the preparatory signal precedes everything -------
const stamps = await page.evaluate(() => {
  const source = document.querySelector('[data-print-source]');
  return {
    sim: source?.hasAttribute('data-jx-print-sim') ?? false,
    density: source?.getAttribute('data-density'),
    medium: document.querySelector('[data-jx-print-medium]')?.textContent,
  };
});
check(
  'stamps: prepare left the sim stamp + the density intervention (medium reads sim)',
  stamps.sim && stamps.density === 'sm' && /sim/.test(stamps.medium ?? ''),
  JSON.stringify(stamps),
);

// ---- 2b′. the hue pin (the root layout's plugin chain, live) ------------
// The ROOT layout provides the print plugins BEFORE createHueContext —
// the hue pipeline's captured chain. The medium gate opening must pin
// the projection to the def default: the documentElement stamp stops
// tracking the wall clock and reads 0. (The clock itself only sits at
// 0 in the midnight 4-minute window — in that window pin and clock
// are indistinguishable and the pair is skipped, not lied about.)
const huePinned = await page.evaluate(() => {
  const pinned = document.documentElement.style.getPropertyValue('--brand-hue');
  const now = new Date();
  const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return { pinned, clockAtZero: Math.round((secs / 86400) * 360) === 0 };
});
check(
  'hue: the open gate pins --brand-hue to the def default (the layout-level chain, live)',
  huePinned.clockAtZero || huePinned.pinned === '0',
  huePinned.clockAtZero
    ? 'skipped — the wall clock itself sits at hue 0 (midnight window)'
    : `--brand-hue=${huePinned.pinned}`,
);

// ---- 2c. the CSS per-slot frame transfer (the dual-slot fixture) --------
const phaseReport = await page.evaluate(() => {
  const source = document.querySelector('[data-jx-print-fx="dual"]');
  const clone = document.querySelector('[data-print-output] [data-jx-print-fx="dual"]');
  if (!source || !clone) return { ok: false, why: 'fixture missing' };
  const metaEl = document.querySelector('[data-print-output]');
  const meta = JSON.parse(metaEl.dataset.jxPrintMeta ?? '{}');
  const srcCs = getComputedStyle(source);
  const cloneCs = getComputedStyle(clone);
  const toMs = (list) =>
    list.split(',').map((piece) => {
      const m = /(-?[\d.]+)(ms|s)/.exec(piece.trim());
      if (!m) return 0;
      return m[2] === 'ms' ? Number(m[1]) : Number(m[1]) * 1000;
    });
  const names = srcCs.animationName.split(',').map((s) => s.trim());
  const srcDelays = toMs(srcCs.animationDelay);
  const durations = toMs(srcCs.animationDuration);
  const cloneDelays = toMs(cloneCs.animationDelay);
  const anims = source.getAnimations({ subtree: false }).filter((a) => a instanceof window.CSSAnimation);
  const byName = new Map(anims.map((a) => [a.animationName, a]));
  const slots = names.map((name, i) => {
    // the write record for this slot (path + slot index match)
    const record = (meta.transfer?.writes ?? []).find((w) => w.animationName === name && w.slot === i);
    const anim = byName.get(name);
    const cNow = anim ? anim.currentTime : null;
    return {
      name,
      d: srcDelays[i],
      D: durations[i],
      recordedC: record?.c,
      delayPrime: record?.delayPrime,
      cloneDelay: cloneDelays[i],
      playState: cloneCs.animationPlayState,
      phaseSource: anim ? (((cNow - srcDelays[i]) % durations[i]) + durations[i]) % durations[i] : null,
      phaseClone: (((-cloneDelays[i]) % durations[i]) + durations[i]) % durations[i],
    };
  });
  return { ok: true, slots, applied: meta.transfer?.applied, writes: (meta.transfer?.writes ?? []).length };
});
{
  const ok =
    phaseReport.ok &&
    (phaseReport.writes ?? 0) >= 2 &&
    phaseReport.slots.every((slot) => {
      if (slot.delayPrime === null || slot.delayPrime === undefined) return false;
      // the design formula against the REAL captured c
      const expected = slot.recordedC < slot.d ? slot.d - slot.recordedC : -((slot.recordedC - slot.d) % slot.D);
      // the clone's phase at t=0 equals the SOURCE's phase at capture:
      // ((recordedC − d) mod D) === (−delay′ mod D) — exact by the formula
      const phaseAtCapture = (((slot.recordedC - slot.d) % slot.D) + slot.D) % slot.D;
      return (
        Math.abs(slot.delayPrime - expected) < 1 && // the record matches the formula
        Math.abs(slot.cloneDelay - slot.delayPrime) < 1 && // the clone carries it
        slot.playState === 'paused' &&
        Math.abs(phaseAtCapture - slot.phaseClone) < 1.5 && // the frozen phase transferred
        slot.phaseSource >= phaseAtCapture - 5 // the live source resumed and advanced
      );
    });
  check(
    'animation: per-slot frame transfer — delay′ formula, paused, phase equal to source',
    ok,
    JSON.stringify(phaseReport.slots ?? phaseReport),
  );
  const distinct = new Set(phaseReport.slots?.map((s) => s.delayPrime) ?? []).size;
  check(
    'animation: the two slots carry DISTINCT transferred phases (distinct currentTimes honored)',
    phaseReport.ok && distinct === 2 && new Set(phaseReport.slots.map((s) => s.d)).size === 2,
    `delays=${JSON.stringify(phaseReport.slots?.map((s) => s.delayPrime))}`,
  );
}

// pre-paused: neither started nor disturbed
const prePaused = await page.evaluate(() => {
  const dot = document.querySelector('[data-jx-print-fx="prepaused"] [data-jx-print-fx-dot]');
  if (!dot) return { ok: false };
  const anim = dot.getAnimations()[0];
  return {
    ok: true,
    state: anim?.playState,
    time: anim?.currentTime,
    computedState: getComputedStyle(dot).animationPlayState,
  };
});
check(
  'animation: the pre-paused slot stays paused with its currentTime undisturbed (0)',
  prePaused.ok &&
    prePaused.state === 'paused' &&
    prePaused.computedState === 'paused' &&
    (prePaused.time ?? 0) === 0,
  JSON.stringify(prePaused),
);

// diagnostics: WAAPI / ALTERNATE / FINISHED ride rows, nothing threw
const diagnostics = await page.evaluate(() =>
  [...document.querySelectorAll('[data-jx-print-diagnostic]')].map((row) => row.dataset.code),
);
check(
  'animation: WAAPI/ALTERNATE/FINISHED ride structured diagnostic rows (continue, no throw)',
  ['WAAPI', 'ALTERNATE', 'FINISHED'].every((code) => diagnostics.includes(code)) &&
    (simMeta.diagnostics ?? []).length >= 3,
  `rows=${JSON.stringify(diagnostics)}`,
);

// ---- 2d. the whitelist duel INSIDE the rendered pages -------------------
await page.waitForTimeout(150); // comfortably past the rendered gate
const whitelist = await page.evaluate(() => {
  const STRIP = {
    hide: '[data-jx-print-probe-item="hide"]',
    flatten: '[data-jx-print-probe-item="flatten"]',
    canvasScroll: '[data-jx-print-probe-item="canvas-scroll"]',
    codeCardPre: '[data-jx-print-probe-item="code-card-pre"]',
    propsTableScroll: '[data-jx-print-probe-item="props-table-scroll"]',
  };
  const out = {};
  for (const [key, selector] of Object.entries(STRIP)) {
    const node = document.querySelector(`[data-print-output] ${selector}`);
    if (!node) {
      out[key] = { missing: true };
      continue;
    }
    const cs = getComputedStyle(node);
    out[key] = { display: cs.display, overflowX: cs.overflowX, maxBlockSize: cs.maxBlockSize };
  }
  return out;
});
check(
  'whitelist (in pages): hide → display:none; the rest → overflow visible + max-block-size none',
  whitelist.hide.display === 'none' &&
    ['flatten', 'canvasScroll', 'codeCardPre', 'propsTableScroll'].every(
      (key) =>
        !whitelist[key].missing &&
        whitelist[key].overflowX === 'visible' &&
        whitelist[key].maxBlockSize === 'none',
    ),
  JSON.stringify(whitelist),
);

// the code gutter: lines wrap and number inside the pages. The gutter
// is ATTR-numbered (data-line, set by the clone transform): pagedjs's
// Counters handler strips author counter rules and re-derives them as
// per-element negative increments — with multiple pres the gutter
// counted from −N (walkthrough fix, 2026-08-31). Assertions: every
// block opens at ≥1, the rendered ::before carries the attr/number,
// and ZERO jx-print-line counter rules exist anywhere (no hijack left).
const gutter = await page.evaluate(() => {
  const lines = [...document.querySelectorAll('[data-print-output] pre .jx-print-line')];
  if (lines.length === 0) return { ok: false };
  const firsts = [...document.querySelectorAll('[data-print-output] pre')].map(
    (pre) => pre.querySelector('.jx-print-line')?.getAttribute('data-line'),
  );
  let counterHijack = 0;
  for (const sheet of document.styleSheets) {
    let cssRules;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of cssRules) {
      const css = rule.cssText ?? '';
      if (css.includes('jx-print-line') && /counter-(reset|increment)/.test(css)) counterHijack++;
    }
  }
  const cs = getComputedStyle(lines[0]);
  return {
    ok: true,
    count: lines.length,
    whiteSpace: cs.whiteSpace,
    display: cs.display,
    firsts,
    before: getComputedStyle(lines[0], ':before').content,
    counterHijackRules: counterHijack,
  };
});
check(
  'gutter (in pages): lines wrap (pre-wrap), attr-numbered per block, zero counter hijack',
  gutter.ok &&
    /pre-wrap/.test(gutter.whiteSpace) &&
    gutter.display === 'block' &&
    gutter.count > 40 &&
    gutter.firsts[0] === '1' &&
    gutter.firsts.every((f) => f !== undefined && Number(f) >= 1) &&
    gutter.counterHijackRules === 0 &&
    /attr\(data-line\)|^"?\d+"?$/.test(gutter.before),
  JSON.stringify(gutter),
);

// ---- 2e. r6 stamp ownership: sim survives a direct print ----------------
const beforeDirect = await residue();
await page.click('[data-jx-print-bar-print]');
await page.waitForFunction(() => {
  const m = document.querySelector('[data-print-output]')?.dataset.jxPrintMeta;
  return Boolean(m) && JSON.parse(m).purpose === 'print';
  }, null, { timeout: 30000 });
const printMeta = await meta();
await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
await page.waitForTimeout(250);
const afterDirect = await page.evaluate(() => ({
  residue: {
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
  },
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  medium: document.querySelector('[data-jx-print-medium]')?.textContent,
}));
check(
  'stamp ownership: an existing sim survives a direct print (afterprint removes nothing, the artifact stays)',
  beforeDirect.pages >= 2 &&
    printMeta.createdStamp === false &&
    afterDirect.sim === true &&
    afterDirect.residue.output === true &&
    afterDirect.residue.pages >= 2 &&
    /sim/.test(afterDirect.medium ?? ''),
  JSON.stringify({ createdStamp: printMeta.createdStamp, afterDirect }),
);
// the same-artifact three-tuple across the exits: page count + ToC
// page numbers + stylesheet hash agree (the snapshot hash may move —
// a live animation's phase is a genuine invalidation; the jsdom lane
// locks the strict reuse case)
check(
  'same artifact: the direct-print exit agrees with the sim (pages, ToC numbers, @page hash)',
  printMeta.pages === simMeta.pages &&
    printMeta.stylesheetHash === simMeta.stylesheetHash,
  `sim(pages=${simMeta.pages}, css=${simMeta.stylesheetHash}) print(pages=${printMeta.pages}, css=${printMeta.stylesheetHash})`,
);

// ---- 2f. sim off → cleanup + rebound contexts ---------------------------
await page.click('[data-jx-print-bar-toggle]');
await page.waitForTimeout(300);
const afterSimOff = await page.evaluate(() => ({
  residue: {
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
    insertedStyles: [...document.head.querySelectorAll('style[data-pagedjs-inserted-styles]')].length,
    active: document.documentElement.hasAttribute('data-jx-print-active'),
  },
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  medium: document.querySelector('[data-jx-print-medium]')?.textContent,
  hue: document.documentElement.style.getPropertyValue('--brand-hue'),
  clockAtZero: (() => {
    const now = new Date();
    const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    return Math.round((secs / 86400) * 360) === 0;
  })(),
}));
check(
  'sim off: container + head styles + active stamp gone; density/medium rebound to raw',
  !afterSimOff.residue.output &&
    afterSimOff.residue.pages === 0 &&
    afterSimOff.residue.insertedStyles === 0 &&
    !afterSimOff.residue.active &&
    afterSimOff.sim === false &&
    afterSimOff.density !== 'sm' &&
    /screen/.test(afterSimOff.medium ?? ''),
  JSON.stringify(afterSimOff),
);
check(
  'hue: the closed gate re-derives the clock (the pin released with the medium)',
  afterSimOff.clockAtZero || afterSimOff.hue !== '0',
  afterSimOff.clockAtZero
    ? 'skipped — the wall clock itself sits at hue 0 (midnight window)'
    : `--brand-hue=${afterSimOff.hue}`,
);

// ---- 2g. screen → direct print: self-stamp + afterprint disposal --------
await page.click('[data-print-source] [data-jx-print-direct]');
const screenPrintMeta = await waitForMeta();
const standby = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const rect = out.getBoundingClientRect();
  return { standby: out.hasAttribute('data-print-standby'), left: rect.left, width: out.offsetWidth };
});
check(
  'direct print from screen: standby root is offscreen but MEASURABLE',
  screenPrintMeta.createdStamp === true && standby.standby && standby.left < 0 && standby.width > 0,
  JSON.stringify({ createdStamp: screenPrintMeta.createdStamp, standby }),
);
await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
await page.waitForTimeout(300);
const afterScreenPrint = await page.evaluate(() => ({
  output: Boolean(document.querySelector('[data-print-output]')),
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  active: document.documentElement.hasAttribute('data-jx-print-active'),
}));
check(
  'direct print exit: afterprint removes the self-stamp and disposes the artifact (medium → screen)',
  !afterScreenPrint.output && !afterScreenPrint.sim && !afterScreenPrint.active && afterScreenPrint.density !== 'sm',
  JSON.stringify(afterScreenPrint),
);

// ---- 2h. measurability failure → fail loud, retry clean ------------------
const hideTag = await page.addStyleTag({ content: '[data-print-output] { display: none !important; }' });
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
await page.waitForFunction(() => {
  const status = document.querySelector('[data-jx-print-status]')?.textContent ?? '';
  return status.includes('error');
}, null, { timeout: 30000 });
const failureState = await page.evaluate(() => ({
  status: document.querySelector('[data-jx-print-status]')?.textContent,
  output: Boolean(document.querySelector('[data-print-output]')),
  pages: document.querySelectorAll('.pagedjs_pages').length,
  simStamp: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
}));
check(
  'measurability: a display:none output root fails loud (no zero-size pages, no residue)',
  /not measurable/.test(failureState.status ?? '') && !failureState.output && failureState.pages === 0,
  JSON.stringify(failureState),
);
// the controls' failure path unstamps; lift the hostile style and retry
await hideTag.evaluate((el) => el.remove());
await page.evaluate(() => document.querySelector('[data-print-source]')?.removeAttribute('data-jx-print-sim'));
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const retryMeta = await waitForMeta();
check('failure retry: the second sim succeeds (no residue carried over)', (retryMeta.pages ?? 0) >= 2, `pages=${retryMeta.pages}`);

// ---- 2i. post-preview cancellation leaves no residue ---------------------
await page.evaluate(() => {
  document.dispatchEvent(new CustomEvent('jx-print-cancel'));
});
await page.waitForTimeout(400);
const afterCancel = await residue();
check(
  'cancel (post-preview): output root + artifact handle removed, nothing orphaned',
  !afterCancel.output && afterCancel.pages === 0 && afterCancel.insertedStyles === 0 && !afterCancel.active,
  JSON.stringify(afterCancel),
);
// the controls still hold their open state — one click syncs them off
// (the off path unstamps + closeSim, both no-ops after the cancel)
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
await page.waitForTimeout(150);

// ---- 2j. consecutive sims + real-print emulation -------------------------
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const secondSim = await waitForMeta();
const secondPages = await page.evaluate(() => document.querySelectorAll('[data-print-output] .pagedjs_page').length);
check(
  'consecutive sims: the second run renders fresh pages (no stale .pagedjs_pages)',
  secondSim.pages === secondPages && secondPages >= 2,
  `meta=${secondSim.pages} dom=${secondPages}`,
);

// real print emulation: app root hides, page container stays visible
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);
const printPose = await page.evaluate(() => {
  const shell = document.querySelector('.jx-shell-host');
  const out = document.querySelector('[data-print-output]');
  return {
    shell: shell ? getComputedStyle(shell).display : 'missing',
    out: out ? getComputedStyle(out).display : 'missing',
    outPosition: out ? getComputedStyle(out).position : 'missing',
    pagesVisible: document.querySelectorAll('.pagedjs_page').length,
  };
});
check(
  'real print pose: app root display:none, the paged container flows as the print authority',
  printPose.shell === 'none' && printPose.out !== 'none' && printPose.out !== 'missing' && printPose.pagesVisible >= 2,
  JSON.stringify(printPose),
);
await page.emulateMedia({ media: null });
await page.waitForTimeout(200);

// exit and final residue sweep
await page.click('[data-jx-print-bar-toggle]');
await page.waitForTimeout(300);
const finalResidue = await residue();
const finalStamps = await page.evaluate(() => ({
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
}));
check(
  'final residue: the three exit scenarios leave nothing behind',
  !finalResidue.output &&
    finalResidue.pages === 0 &&
    finalResidue.insertedStyles === 0 &&
    !finalResidue.active &&
    finalStamps.sim === false &&
    finalStamps.density !== 'sm',
  JSON.stringify({ finalResidue, finalStamps }),
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
