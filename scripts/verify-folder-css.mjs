#!/usr/bin/env node
// folder-css contract probe (tw4-css-modularization P0.1, 2026-08-24).
//
// Verifies the D2 folder-css contract in a REAL browser against the
// RUNNING dev server (start one first: `pnpm dev`):
//   1. output   — the probe route renders, the relative side-effect
//                 css import from a Svelte component works;
//   2. layer    — the folder css rules live inside a real CSS
//                 @layer components block (not unlayered);
//   3. pseudo   — the ::after build survives the pipeline;
//   4. @container — the container-query block applies AND releases
//                 when the container shrinks below the threshold;
//   5. single-load — the sheet appears EXACTLY once even though the
//                 route ALSO imports it (duplicate-import probe);
//   6. layer law — a stylex ATOM applied over a :where() folder rule
//                 WINS (the tailwindless engine's inversion proof;
//                 the TW-era arm added engine-generated p-8 /
//                 text-primary classes, which died with the engine —
//                 the script now reloads with ?pad=32&ink=primary and
//                 the probe component applies its own atoms);
//
// Usage:
//   pnpm dev &               # server on :5199
//   node scripts/verify-folder-css.mjs         # default port 5199
//   node scripts/verify-folder-css.mjs 5200
import { chromium } from 'playwright-core';

const port = process.argv[2] ?? '5199';
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/ Google Chrome.app/Contents/MacOS/Google Chrome'.replace(' ', ''),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// dev server serves the SvelteKit route; a static build serves the
// prerendered .html file — probe whichever answers
let path = '/probe-folder-css';
const probe = await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'domcontentloaded' });
if (probe && probe.status() === 404) {
  path = '/probe-folder-css.html';
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
} else {
  await page.waitForLoadState('networkidle');
}

const facts = await page.evaluate(() => {
  const root = document.querySelector('[data-probe="root"]');
  const lane = document.querySelector('[data-probe="lane"]');
  const box = document.querySelector('[data-probe="box"]');

  // walk every sheet; find our rules and whether they sit inside a layer
  const hits = [];
  const walk = (rules, layer, sheetHref) => {
    for (const rule of rules) {
      if (rule.cssRules) {
        const nestedLayer = rule.name ?? layer; // CSSLayerBlockRule has .name
        walk(rule.cssRules, nestedLayer, sheetHref);
      }
      const text = rule.selectorText ?? rule.conditionText ?? '';
      if (String(text).includes('jx-probe')) {
        hits.push({ selector: String(text), layer: layer ?? null, href: sheetHref });
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules, null, sheet.href ?? 'inline');
    } catch {
      /* cross-origin sheet, irrelevant */
    }
  }

  const cs = (el, prop, pseudo) => getComputedStyle(el, pseudo ?? null).getPropertyValue(prop);
  return {
    present: { root: !!root, lane: !!lane, box: !!box },
    laneAfterContent: cs(lane, 'content', '::after'),
    boxBorderWide: cs(box, 'border-top-width'),
    sheetHits: hits,
  };
});

// 1. output
check('probe route renders with the component', facts.present.root && facts.present.lane && facts.present.box);

// 2. layer membership
const layered = facts.sheetHits.filter((h) => h.layer === 'components');
check(
  'folder css rules sit inside @layer components',
  layered.length > 0,
  `${layered.length}/${facts.sheetHits.length} rule hits layered`,
);

// 3. pseudo-element survival
check('::after pseudo build survives', facts.laneAfterContent.includes('⟡'), `content=${facts.laneAfterContent}`);

// 4. @container apply + release (frame is the container; box the child)
check('@container applies at wide width (6px top border)', facts.boxBorderWide === '6px', `got ${facts.boxBorderWide}`);
const narrow = await page.evaluate(() => {
  const frame = document.querySelector('[data-probe="frame"]');
  frame.style.width = '80px';
  return getComputedStyle(frame.querySelector('.jx-probe-box')).getPropertyValue('border-top-width');
});
check('@container releases below threshold (2px top border)', narrow === '2px', `got ${narrow}`);
await page.evaluate(() => {
  document.querySelector('[data-probe="frame"]').style.width = '';
});

// 5. single-load (duplicate-import probe): count SHEETS carrying the
//    marker rules (rule-hit counting double-counts ::after selectors)
const sheetsWithProbe = await page.evaluate(() => {
  let count = 0;
  for (const sheet of document.styleSheets) {
    try {
      const text = [...sheet.cssRules].map((r) => r.cssText).join('|');
      if (text.includes('jx-probe')) count += 1;
    } catch {
      /* cross-origin, irrelevant */
    }
  }
  return count;
});
check('sheet loaded EXACTLY once (route + component both import it)', sheetsWithProbe === 1, `${sheetsWithProbe} sheet(s) carry the rules`);

// 6. layer law — a stylex atom beats :where() (the engine that
//    replaced TW utilities). The probe component applies its own
//    atoms (folder-css-probe.stylex) when the page loads with
//    ?pad=32&ink=primary — read once per load, browser-side only.
const before = await page.evaluate(() => {
  const root = document.querySelector('[data-probe="root"]');
  const lane = document.querySelector('[data-probe="lane"]');
  return {
    pad: getComputedStyle(root).getPropertyValue('padding-top'),
    color: getComputedStyle(lane).getPropertyValue('color'),
  };
});
await page.goto(`http://localhost:${port}${path}?pad=32&ink=primary`, { waitUntil: 'networkidle' });
await page.waitForFunction(
  () => getComputedStyle(document.querySelector('[data-probe="root"]')).paddingTop === '32px',
  { timeout: 5_000 },
);
const after = await page.evaluate(() => {
  const root = document.querySelector('[data-probe="root"]');
  const lane = document.querySelector('[data-probe="lane"]');
  return {
    pad: getComputedStyle(root).getPropertyValue('padding-top'),
    color: getComputedStyle(lane).getPropertyValue('color'),
  };
});
check(
  'stylex atom beats the :where() padding rule',
  before.pad !== '32px' && after.pad === '32px',
  `${before.pad} → ${after.pad}`,
);
check('stylex atom recolors the :where() lane', before.color !== after.color, `${before.color} → ${after.color}`);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nfolder-css contract: ALL GREEN' : `\nfolder-css contract: ${failed.length} FAILURE(S)`);
process.exit(failed.length === 0 ? 0 : 1);
