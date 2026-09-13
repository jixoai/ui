#!/usr/bin/env node
// validate-manifests.mjs — the D2 manifest's parseable verification
// (Gate-1 r4, blocker 2): every selector/declaration the manifest
// pins against the REAL repo CSS is checked verbatim, TODAY, so
// manifest-reality drift is mechanical, not editorial.
//
// Intent list (2026-09-13, stylex-kernel-research):
//   1. D2 manifest anchors still exist in the repo sheets.
//   2. D1 pin-set rows still name the pinned versions.
// Exit 0 = all checks pass; exit 1 names every failure.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..', '..', '..');

const read = (p) => readFileSync(resolve(repo, p), 'utf8');
const jxPure = read('registry/files/theme/jx-pure.css');
const tooltip = read('registry/files/ui/tooltip/tooltip.css');
const terminalHeader = read('registry/files/ui/terminal-header/terminal-header.css');
const d1 = readFileSync(resolve(here, 'd1-fixture-manifest.md'), 'utf8');

const checks = [
  // D2-02/D2-05 — the REAL Tier-2 alias is .jx-control (not .jx-input)
  ['D2-02 selector .jx-control', jxPure.includes('.jx-control {')],
  ['D2-02 declaration padding', jxPure.includes('padding: var(--jx-gap, 0.5rem) var(--jx-inset, 0.75rem)')],
  ['D2-02 declaration min-height', jxPure.includes('min-height: var(--jx-hit, 2.5rem)')],
  // D2-12 — the REAL forced-colors Part C block
  ['D2-12 media block', jxPure.includes('@media (forced-colors: active)')],
  ['D2-12 appearance', jxPure.includes('appearance: auto')],
  ['D2-12 background-image', jxPure.includes('background-image: none')],
  ['D2-12 checkbox selector', jxPure.includes("input[type='checkbox']:not(.no-jx-pure, .no-jx-pure *)")],
  // D2-14 — the REAL tooltip surface-kernel override
  ['D2-14 selector', tooltip.includes('.jx-tip.jx-surface::after {')],
  ['D2-14 content none', tooltip.includes('content: none;')],
  ['D2-14 shadow child owns mask', tooltip.includes('.jx-tip[data-arrow] .jx-tip-shadow {')],
  ['D2-14 ring var', tooltip.includes('-webkit-mask-image: var(--jx-surface-ring, none)')],
  // D2-15 — the REAL terminal-header foreign override (two concrete selectors)
  ['D2-15 base selector', terminalHeader.includes('.jx-nav .jx-pop.jx-subpanel {')],
  ['D2-15 mega selector', terminalHeader.includes('.jx-nav .jx-pop.jx-subpanel.jx-subpanel-mega {')],
  ['D2-15 panel pad', terminalHeader.includes('--jx-panel-pad: 0.25rem;')],
  ['D2-15 mega pad', terminalHeader.includes('--jx-panel-pad: 0.375rem;')],
  ['D2-15 pop pad bridge', terminalHeader.includes('--jx-pop-pad: var(--jx-panel-pad);')],
  ['D2-15 !important over inline', terminalHeader.includes('position-area: bottom span-right !important;')],
  ['D2-15 backdrop', terminalHeader.includes('.jx-nav .jx-pop.jx-subpanel::backdrop {')],
  // D1 — the pin set rows
  ['D1 pin svelte', d1.includes('| svelte | 5.57.0 |')],
  ['D1 pin kit', d1.includes('| @sveltejs/kit | 2.70.3 |')],
  ['D1 pin vite', d1.includes('| vite | 8.3.0 |')],
  ['D1 pin stylex', d1.includes('| @stylexjs/stylex | 0.19.0 |')],
  ['D1 pin unplugin', d1.includes('| @stylexjs/unplugin | 0.19.0 |')],
  ['D1 pin tw', d1.includes('| tailwindcss (coexist side) | 4.3.3 |')],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`✗ ${name}`);
    failed++;
  } else {
    console.log(`✓ ${name}`);
  }
}
if (failed) {
  console.error(`\nvalidate-manifests: ${failed} FAILURE(S) — the manifest drifted from the repo CSS; fix the manifest + ledger the change`);
  process.exit(1);
}
console.log('\nvalidate-manifests: all anchors verified against the repo sheets');
