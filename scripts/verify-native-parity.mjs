#!/usr/bin/env node
// verify-native-parity — the two-renderer computed-style gate
// (native-contract-fusion Phase 6, 2026-08-27).
//
// The native vocabulary is one law with two renderers: tier0 (bare
// DOM painted by the jx-pure law) and tier1 (the registry
// component). This gate renders both sides of each fixture row on
// /parity.html and compares computed styles over each row's
// property whitelist across the state matrix. A one-sided law
// change fails here — the "gate-locked" half of the management
// design.
//
// Usage (site must be running, e.g. `npm run site` on :5199):
//   node scripts/verify-native-parity.mjs            # default :5199
//   node scripts/verify-native-parity.mjs 5200
import { chromium } from 'playwright-core';

const port = process.argv[2] ?? '5199';

// ── the probe registry: one entry per vocabulary row ────────────────
// probe: [tier0Selector, tier1Selector] — tier0 relative to its
// [data-renderer=tier0] root, tier1 relative to the row section.
// states are declarative actions applied by name inside the page
// (functions cannot cross the evaluate boundary):
//   { name, click?: relativeSelector } — clicks that selector under
//   BOTH renderer roots (`.click` is relative to each root).
const ROWS = [
  {
    row: 'toggle-group',
    probes: [
      // the segment face (label) — geometry + voice + joined edge
      ['label:nth-child(1)', '[data-renderer=tier1] label:nth-of-type(1)'],
      // the second segment (becomes the active one in the checked state)
      ['label:nth-child(2)', '[data-renderer=tier1] label:nth-of-type(2)'],
      // the disabled segment
      ['label:nth-child(3)', '[data-renderer=tier1] label:nth-of-type(3)'],
      // the container shell
      ['.jx-tgroup', '[data-renderer=tier1] .jx-tgroup'],
    ],
    properties: [
      'display', 'min-height', 'padding-top', 'padding-inline-start',
      'font-size', 'line-height', 'font-family', 'letter-spacing',
      'text-transform', 'color', 'background-color', 'border-top-width',
      'border-right-width', 'border-top-color', 'cursor', 'opacity',
      'box-shadow',
    ],
    states: [
      { name: 'base' },
      { name: 'second-checked', click: 'label:nth-of-type(2) input, label:nth-child(2) input' },
    ],
  },
];

const NORMALIZERS = [
  (v) => String(v).trim(),
  (v) => (/^rgba?\(0, 0, 0, 0\)$/.test(String(v).trim()) ? 'transparent' : v),
];
const normalize = (v) => NORMALIZERS.reduce((acc, fn) => fn(acc), v);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-proxy-server'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://localhost:${port}/parity.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);

let failures = 0;
const comparisons = await page.evaluate(
  ({ rows }) => {
    const run = [];
    for (const spec of rows) {
      const section = document.querySelector(`[data-parity="${spec.row}"]`);
      if (!section) {
        run.push({ row: spec.row, error: 'fixture row missing' });
        continue;
      }
      const t0root = section.querySelector('[data-renderer=tier0]');
      const t1root = section.querySelector('[data-renderer=tier1]');
      for (const probe of spec.probes) {
        const t0 = t0root.querySelector(probe[0]);
        const t1 = section.querySelector(probe[1]); // tier1 selectors are section-relative
        if (!t0 || !t1) {
          run.push({ row: spec.row, probe: probe.join(' ⇄ '), error: `element missing (t0:${!!t0} t1:${!!t1})` });
          continue;
        }
        for (const state of spec.states) {
          let stateError = null;
          if (state.click) {
            // the click selector list is tried under each renderer root
            for (const root of [t0root, t1root]) {
              const alternatives = state.click.split(',').map((s) => s.trim());
              const target = alternatives.map((sel) => root.querySelector(sel)).find(Boolean);
              if (!target) {
                stateError = `click target missing under ${root.dataset.renderer}: ${state.click}`;
                break;
              }
              target.click();
            }
          }
          if (stateError) {
            run.push({ row: spec.row, probe: probe.join(' ⇄ '), state: state.name, error: stateError });
            continue;
          }
          const cs0 = getComputedStyle(t0);
          const cs1 = getComputedStyle(t1);
          for (const prop of spec.properties) {
            run.push({
              row: spec.row,
              probe: probe.join(' ⇄ '),
              state: state.name,
              prop,
              v0: cs0.getPropertyValue(prop),
              v1: cs1.getPropertyValue(prop),
            });
          }
        }
      }
    }
    return run;
  },
  { rows: ROWS },
);

for (const c of comparisons) {
  if (c.error) {
    failures++;
    console.error(`✗ ${c.row} ${c.probe ?? ''} ${c.state ?? ''}: ${c.error}`);
    continue;
  }
  const a = normalize(c.v0);
  const b = normalize(c.v1);
  if (a !== b) {
    failures++;
    console.error(`✗ ${c.row} ${c.probe} [${c.state}] ${c.prop}: tier0="${a}" tier1="${b}"`);
  }
}
const total = comparisons.filter((c) => !c.error).length;
console.log(
  failures === 0
    ? `[native-parity] GREEN: ${ROWS.length} row(s), ${total} comparisons equal across the state matrix`
    : `[native-parity] ${failures} failure(s) across ${total} comparisons`,
);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
