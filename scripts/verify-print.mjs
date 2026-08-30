#!/usr/bin/env node
// verify-print — the print-projection probe (paged-doc-family,
// 2026-08-30). verify-press's playwright-core pattern: a REAL
// Chromium against a served site (built preview on :4173, or any
// PORT — the dev server works too, which is how this probe ran
// before the pilot route's prerender entry landed).
//
// Locks in, per the change's verification contract:
//
//   whitelist   under PRINT MEDIA EMULATION (page.emulateMedia), with
//               display:flex + overflow:auto + a max-block-size
//               utility ALL PRESENT on the same node, the audited
//               unlayered :where() whitelist wins: hide → computed
//               display:none; flatten / canvas-scroll / code-card-pre
//               / props-table-scroll → computed overflow visible AND
//               max-block-size none. Asserted on the pilot page's
//               authored probe strip (the three utilities authored as
//               real tw4 classes) AND on the REAL instances (the
//               live canvas scroll layer, the real PropsTable
//               wrapper, the real CodeCard pre).
//   sim         the same assertions under SCREEN media with the
//               data-jx-print-sim stamp active, plus the sim preview
//               chrome appearing.
//   exclusivity under print media the sim-scoped rules STOP matching
//               (the sim chrome disappears while the whitelist still
//               holds) + a structural pass: every stylesheet rule
//               mentioning [data-jx-print-sim] lives inside a
//               `@media not print` condition.
//   medium      the derived three-state loop on the doc's
//               data-jx-medium stamp: screen → sim → print → sim.
//   numbering   the ToC numbers equal the sections' DOM order, and
//               the CSS-counter ::before numbers agree with the
//               registry (the one-source law).
//   bundle      lib/paged/ + medium.svelte.ts import nothing beyond
//               'svelte' and relative files — no pagedjs, no npm.
//
// Run: node scripts/verify-print.mjs   (PORT=… to retarget)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT ?? '4173';
const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// ── self-serve: when nothing answers on PORT, spawn a static server over
// the built dist and take it down after the probe (verify-all mounts this
// gate without managing servers itself; verify-press's manual-preview
// contract stays untouched — an existing server is used as-is). ──
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
  serverProc = spawn('python3', ['-m', 'http.server', PORT, '--bind', '127.0.0.1', '--directory', dist], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await portOpen()) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}
process.on('exit', () => serverProc?.kill());

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 1080 } });
await page.goto(`http://localhost:${PORT}/docs/paged.html`);
await page.waitForLoadState('domcontentloaded');
// READINESS = hydration completed. The publication ToC is the
// DOM-derived AUTO-mode exception: its entries land only after
// hydration registers the sections (dev-mode first compile takes
// seconds; a fixed timeout would race it). A click on pre-hydration
// SSR markup is a no-op — assertions before this point prove nothing.
await page.waitForSelector('[data-jx-paged-toc] a', { timeout: 30000 });
await page.waitForTimeout(600);

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ---- the computed-style reader for one node ------------------------------
const readNode = (selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      maxBlockSize: cs.maxBlockSize,
      classes: el.className,
    };
  }, selector);

// every probe-strip node carries all three utilities (flex,
// overflow-auto, the arbitrary max-block-size) — assert the fight is
// real before asserting the whitelist wins it
const STRIP = {
  hide: '[data-jx-print-probe-item="hide"]',
  flatten: '[data-jx-print-probe-item="flatten"]',
  canvasScroll: '[data-jx-print-probe-item="canvas-scroll"]',
  codeCardPre: '[data-jx-print-probe-item="code-card-pre"]',
  propsTableScroll: '[data-jx-print-probe-item="props-table-scroll"]',
};

async function assertUtilitiesPresent() {
  const one = await readNode(STRIP.flatten);
  check(
    'fixture: the three utilities are really present (flex + overflow-auto + max-block-size)',
    one !== null &&
      one.display === 'flex' &&
      one.overflowX === 'auto' &&
      one.maxBlockSize !== 'none' &&
      one.classes.includes('overflow-auto'),
    JSON.stringify(one),
  );
}

async function assertWhitelist(mediaLabel) {
  const hide = await readNode(STRIP.hide);
  check(
    `whitelist (${mediaLabel}): data-jx-print="hide" computes display:none over the flex utility`,
    hide !== null && hide.display === 'none',
    `display=${hide?.display}`,
  );
  for (const [key, selector] of Object.entries(STRIP)) {
    if (key === 'hide') continue;
    const node = await readNode(selector);
    check(
      `whitelist (${mediaLabel}): ${key} → overflow visible + max-block-size none`,
      node !== null && node.overflowX === 'visible' && node.overflowY === 'visible' && node.maxBlockSize === 'none',
      `overflow=${node?.overflowX}/${node?.overflowY} maxBlockSize=${node?.maxBlockSize}`,
    );
  }
}

// ---- 1. screen baseline: utilities rule, no projection -------------------
await assertUtilitiesPresent();
const stripVisible = await readNode(STRIP.hide);
check(
  'screen baseline: the hide fixture is VISIBLE (no print media, no sim)',
  stripVisible !== null && stripVisible.display === 'flex',
  `display=${stripVisible?.display}`,
);

// ---- 2. sim projection: stamp on, still screen media ---------------------
await page.click('button:has-text("打印预览")');
await page.waitForTimeout(300);
const simMedium = await page.evaluate(
  () => document.querySelector('[data-jx-paged-doc]')?.getAttribute('data-jx-medium'),
);
check('sim: the derived medium reads "sim" on the doc stamp', simMedium === 'sim', `medium=${simMedium}`);
await assertWhitelist('sim');

const simChrome = await page.evaluate(() => {
  const doc = document.querySelector('[data-jx-paged-doc]');
  return doc ? getComputedStyle(doc).boxShadow : 'none';
});
check('sim: the preview paper chrome is applied (sim-only rule live)', simChrome !== 'none', simChrome.slice(0, 60));

// ---- 3. real print: whitelist holds, sim rules exit ----------------------
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);
const printMedium = await page.evaluate(
  () => document.querySelector('[data-jx-paged-doc]')?.getAttribute('data-jx-medium'),
);
check('print: real print wins the derived medium ("print")', printMedium === 'print', `medium=${printMedium}`);
await assertWhitelist('print');

const printChrome = await page.evaluate(() => {
  const doc = document.querySelector('[data-jx-paged-doc]');
  return doc ? getComputedStyle(doc).boxShadow : 'none';
});
check(
  'exclusivity: the sim chrome EXITS under print media while the whitelist holds',
  printChrome === 'none',
  `boxShadow=${printChrome.slice(0, 60)}`,
);

// ---- 4. back to screen: the stamp restores sim ---------------------------
await page.emulateMedia({ media: null });
await page.waitForTimeout(300);
const backMedium = await page.evaluate(
  () => document.querySelector('[data-jx-paged-doc]')?.getAttribute('data-jx-medium'),
);
check('afterprint semantics: leaving print media restores sim (stamp survived)', backMedium === 'sim', `medium=${backMedium}`);

// ---- 5. real instances (not just the authored strip) ---------------------
// the live canvas scroll layer, the real PropsTable wrapper, the real
// CodeCard pre — all must flatten under print emulation
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(200);
for (const [label, selector] of [
  ['canvas scroll (live)', '[data-jx-paged-doc] [data-jx-canvas-scroll]'],
  ['props-table wrapper (live)', '[data-jx-paged-doc] [data-jx-props-table-scroll]'],
  ['code-card pre (live)', '[data-jx-paged-doc] [data-jx-code-card-pre]'],
]) {
  const node = await readNode(selector);
  check(
    `real instance under print: ${label} flattened`,
    node !== null && node.overflowX === 'visible' && node.maxBlockSize === 'none',
    `overflow=${node?.overflowX} maxBlockSize=${node?.maxBlockSize}`,
  );
}

// the freeze verb's CSS half: the loading spinner inside the freeze
// wrapper pauses under print
const freezeState = await page.evaluate(() => {
  const frozen = document.querySelector('[data-jx-paged-doc]');
  const spin = frozen?.querySelector(
    '[data-jx-print="freeze"] [data-jx-press-spin], [data-jx-print="freeze"] .jx-spin, [data-jx-print="freeze"] [data-jx-press-button] span',
  );
  if (!spin) return { found: false };
  return { found: true, playState: getComputedStyle(spin).animationPlayState };
});
check(
  'freeze (CSS half): animations pause inside the frozen subtree under print',
  freezeState.found === true && freezeState.playState === 'paused',
  JSON.stringify(freezeState),
);

// ---- 6. numbering: ToC text vs DOM order vs CSS counters -----------------
const numbering = await page.evaluate(() => {
  const doc = document.querySelector('[data-jx-paged-doc]');
  const sections = [...doc.querySelectorAll('[data-jx-paged-section]')].filter(
    (s) => s.id && !s.id.includes('nested'),
  );
  const domOrder = sections.map((s) => s.id);
  const tocLinks = [...doc.querySelectorAll('[data-jx-paged-toc] a')].map((a) => ({
    href: a.getAttribute('href').slice(1),
    num: a.querySelector('[data-jx-paged-toc-num]')?.textContent.trim(),
  }));
  // Chromium's computed ::before content comes back UNRESOLVED (the
  // prototype's finding — `counter(jxsec)` itself): what a real engine
  // CAN prove is that the counter rule is armed on every heading.
  const counterArmed = sections.map((s) => {
    const h = s.querySelector('[data-jx-paged-heading]');
    return getComputedStyle(h, '::before').content;
  });
  return { domOrder, tocLinks, counterArmed };
});
check(
  'numbering: the ToC numbers equal the section DOM order',
  JSON.stringify(numbering.tocLinks.map((l) => l.href)) === JSON.stringify(numbering.domOrder) &&
    numbering.tocLinks.every((l, i) => l.num === String(i + 1)),
  JSON.stringify(numbering.tocLinks.map((l) => `${l.num}:${l.href}`)),
);
check(
  'numbering: the CSS counter is armed on every heading (computed content stays unresolved — the registry is the readable source)',
  numbering.counterArmed.length === numbering.domOrder.length &&
    numbering.counterArmed.every((c) => c.includes('counter(jxsec)')),
  JSON.stringify(numbering.counterArmed.slice(0, 2)),
);

// ---- 7. structural exclusivity: sim rules only inside `not print` --------
const structural = await page.evaluate(() => {
  const offenders = [];
  const walk = (rules, insideNotPrint) => {
    for (const rule of rules) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        const cond = rule.conditionText || rule.media?.mediaText || '';
        walk(rule.cssRules, insideNotPrint || /not\s+print/i.test(cond));
      } else if (rule.type === CSSRule.STYLE_RULE) {
        if (/\[data-jx-print-sim/i.test(rule.selectorText) && !insideNotPrint) {
          offenders.push(rule.selectorText);
        }
      } else if (rule.cssRules) {
        walk(rule.cssRules, insideNotPrint);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules, false);
    } catch {
      /* cross-origin sheet — not ours */
    }
  }
  return offenders;
});
check(
  'exclusivity (structural): every [data-jx-print-sim] rule sits inside @media not print',
  structural.length === 0,
  structural.slice(0, 3).join(' | ') || 'clean',
);

await page.emulateMedia({ media: null });
await browser.close();

// ---- 8. the bundle probe: zero pagedjs, zero npm imports ------------------
const pagedDir = resolve(root, 'apps/www/src/lib/paged');
const mediumFile = resolve(root, 'apps/www/src/lib/medium.svelte.ts');
const files = [
  ...readdirSync(pagedDir).map((f) => join(pagedDir, f)),
  mediumFile,
].filter((f) => /\.(svelte|ts|css)$/.test(f));
const importRe = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;
const badImports = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  let m;
  while ((m = importRe.exec(src))) {
    const spec = m[1] ?? m[2];
    if (!spec) continue;
    // allowed: the svelte runtime + relative files (the family is
    // self-contained by construction — no $lib, no npm, therefore no
    // pagedjs possible; comments may legitimately DISCUSS pagedjs)
    if (spec === 'svelte' || spec.startsWith('.')) continue;
    badImports.push(`${file}: ${spec}`);
  }
}
check(
  'bundle: lib/paged + medium.svelte.ts carry zero npm imports (no pagedjs, svelte + relative only)',
  badImports.length === 0,
  badImports.slice(0, 5).join(' | ') || `${files.length} files clean`,
);

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
