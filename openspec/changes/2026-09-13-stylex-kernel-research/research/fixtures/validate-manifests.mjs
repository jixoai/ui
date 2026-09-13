#!/usr/bin/env node
// validate-manifests.mjs — BLOCK-SCOPED manifest verification
// (Gate-1 r5: the r4 file-includes() checks could not prove that a
// declaration belongs to the pinned selector's block, nor that a
// moved/edited rule fails). This version:
//   1. locates each pinned SELECTOR's block (brace-matched) in the
//      named source file and asserts every pinned declaration inside
//      THAT block (printing the block's real line range);
//   2. asserts negative facts (a renamed-away selector must NOT
//      exist);
//   3. --self-test proves drift detection: three deliberately-wrong
//      anchors must each FAIL, or this script exits 1.
// Exit 0 = all checks pass; exit 1 names every failure.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..', '..', '..');
const read = (p) => readFileSync(resolve(repo, p), 'utf8');

const sources = {
  'registry/files/theme/jx-pure.css': read('registry/files/theme/jx-pure.css'),
  'registry/files/theme/jixoai.css': read('registry/files/theme/jixoai.css'),
  'registry/files/ui/tooltip/tooltip.css': read('registry/files/ui/tooltip/tooltip.css'),
  'registry/files/ui/terminal-header/terminal-header.css': read('registry/files/ui/terminal-header/terminal-header.css'),
};

// findBlock: the brace-matched block whose opening line contains
// `selPrefix` as a prefix of the trimmed line (selector-anchored).
function findBlock(text, selPrefix) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith(selPrefix) && t.includes('{')) {
      let depth = 0;
      const parts = [];
      for (let j = i; j < lines.length; j++) {
        parts.push(lines[j]);
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          else if (ch === '}') depth--;
        }
        if (depth === 0 && j > i - 1 && lines[j].includes('}')) return { start: i + 1, end: j + 1, text: parts.join('\n') };
      }
    }
  }
  return null;
}

// anchors: {row, file, sel, decls[], absent?: true} — decls must ALL
// live inside the block opened by `sel` in `file`.
const anchors = [
  { row: 'D2-02', file: 'registry/files/theme/jx-pure.css', sel: '.jx-control {', decls: [
    'padding: var(--jx-gap, 0.5rem) var(--jx-inset, 0.75rem)',
    'min-height: var(--jx-hit, 2.5rem)',
    'box-shadow: var(--shadow-well)',
  ] },
  { row: 'D2-02-env', file: 'registry/files/theme/jixoai.css', sel: ":where(:root:not([data-density]), [data-density='default']) {", decls: [
    '--jx-gap: var(--jx-density-inline-gap-default)',
    '--jx-inset: var(--jx-density-inline-inset-default)',
  ] },
  { row: 'D2-10-dark', file: 'registry/files/theme/jixoai.css', sel: '.dark {', decls: [
    '--primary: oklch(0.7044 0.1872 calc(var(--brand-hue) - 4))',
  ] },
  { row: 'D2-10-lg', file: 'registry/files/theme/jixoai.css', sel: ":where([data-density='lg']) {", decls: [
    '--jx-gap: var(--jx-density-inline-gap-lg)',
    '--jx-inset: var(--jx-density-inline-inset-lg)',
  ] },
  { row: 'D2-12', file: 'registry/files/theme/jx-pure.css', sel: '@media (forced-colors: active) {', decls: [
    'appearance: auto',
    'background-image: none',
  ] },
  { row: 'D2-12-sel', file: 'registry/files/theme/jx-pure.css', sel: ":where(.jx-pure) input[type='checkbox']:not(.no-jx-pure, .no-jx-pure *)", decls: [], tolerant: true },
  { row: 'D2-14', file: 'registry/files/ui/tooltip/tooltip.css', sel: '.jx-tip.jx-surface::after {', decls: [
    'content: none;',
  ] },
  { row: 'D2-14-shadow', file: 'registry/files/ui/tooltip/tooltip.css', sel: '.jx-tip[data-arrow] .jx-tip-shadow {', decls: [
    '-webkit-mask-image: var(--jx-surface-ring, none)',
  ] },
  { row: 'D2-15', file: 'registry/files/ui/terminal-header/terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel {', decls: [
    '--jx-panel-pad: 0.25rem',
    '--jx-pop-pad: var(--jx-panel-pad)',
    '--jx-pop-pad-inline: var(--jx-panel-pad)',
    'position-area: bottom span-right !important',
  ] },
  { row: 'D2-15-mega', file: 'registry/files/ui/terminal-header/terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel.jx-subpanel-mega {', decls: [
    '--jx-panel-pad: 0.375rem',
    'width: min(90vw, calc(4 * 14rem + 2rem))',
  ] },
  { row: 'D2-15-backdrop', file: 'registry/files/ui/terminal-header/terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel::backdrop {', decls: [
    'background: transparent',
  ] },
];

// negative facts: renamed-away or must-not-exist selectors
const negatives = [
  ['D2-02-neg .jx-input never exists', sources['registry/files/theme/jx-pure.css'], '.jx-input {'],
];

const d1 = readFileSync(resolve(here, 'd1-fixture-manifest.md'), 'utf8');
const pinRows = [
  ['D1 pin svelte', '| svelte | 5.57.0 |'],
  ['D1 pin kit', '| @sveltejs/kit | 2.70.3 |'],
  ['D1 pin vite', '| vite | 8.3.0 |'],
  ['D1 pin stylex', '| @stylexjs/stylex | 0.19.0 |'],
  ['D1 pin unplugin', '| @stylexjs/unplugin | 0.19.0 |'],
  ['D1 pin tw', '| tailwindcss (coexist side) | 4.3.3 |'],
];

function runChecks() {
  const failures = [];
  for (const a of anchors) {
    const text = sources[a.file];
    if (!text) { failures.push(`${a.row}: source file missing ${a.file}`); continue; }
    if (a.tolerant) {
      // multi-line selector lists: existence check only (plain includes)
      if (!text.includes(a.sel)) failures.push(`${a.row}: selector text not found — ${a.file} :: ${a.sel}`);
      else console.log(`✓ ${a.row} anchor present (plain) ${a.file}`);
      continue;
    }
    const block = findBlock(text, a.sel);
    if (!block) { failures.push(`${a.row}: selector block not found — ${a.file} :: ${a.sel}`); continue; }
    for (const d of a.decls) {
      if (!block.text.includes(d)) failures.push(`${a.row}: declaration NOT in block ${a.file}:${block.start}-${block.end} — missing "${d}"`);
    }
    console.log(`✓ ${a.row} ${a.sel.replace(' {', '')} block ${a.file}:${block.start}-${block.end} (${a.decls.length} decls)`);
  }
  for (const [name, text, needle] of negatives) {
    if (text.includes(needle)) failures.push(`${name}: FORBIDDEN string present — ${needle}`);
    else console.log(`✓ ${name}`);
  }
  for (const [name, needle] of pinRows) {
    if (!d1.includes(needle)) failures.push(`${name}: pin row missing — ${needle}`);
    else console.log(`✓ ${name}`);
  }
  return failures;
}

if (process.argv.includes('--self-test')) {
  // Prove drift detection: three deliberately-wrong anchors MUST fail.
  const saved = structuredClone(anchors);
  const bad1 = { row: 'SELFTEST-1', file: 'registry/files/theme/jx-pure.css', sel: '.jx-control {', decls: ['padding: 999px'] };
  const bad2 = { row: 'SELFTEST-2', file: 'registry/files/theme/jx-pure.css', sel: '.jx-does-not-exist {', decls: [] };
  const bad3 = { row: 'SELFTEST-3', file: 'registry/files/ui/tooltip/tooltip.css', sel: '.jx-tip.jx-surface::after {', decls: ['box-shadow: 0 0 99px red'] };
  anchors.push(bad1, bad2, bad3);
  const failures = runChecks();
  anchors.length = 0; anchors.push(...saved);
  const selftestFailures = failures.filter((f) => f.startsWith('SELFTEST'));
  const expected = ['SELFTEST-1', 'SELFTEST-2', 'SELFTEST-3'];
  const allCaught = expected.every((e) => selftestFailures.some((f) => f.startsWith(e)));
  if (!allCaught) {
    console.error('\nvalidate-manifests SELF-TEST FAILED: a deliberately-wrong anchor was NOT caught. This validator is broken.');
    console.error(selftestFailures.join('\n') || '(no SELFTEST failures recorded — detection is dead)');
    process.exit(1);
  }
  console.log(`\nvalidate-manifests SELF-TEST PASS: all 3 deliberately-wrong anchors caught (${selftestFailures.length} failures as expected).`);
  const realFailures = failures.filter((f) => !f.startsWith('SELFTEST'));
  if (realFailures.length) {
    console.error(`\n${realFailures.length} REAL failure(s):`);
    realFailures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }
  console.log('validate-manifests: all real anchors verified (block-scoped) + drift detection proven.');
  process.exit(0);
}

const failures = runChecks();
if (failures.length) {
  console.error(`\nvalidate-manifests: ${failures.length} FAILURE(S) — manifest/repo drift; fix + ledger:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('\nvalidate-manifests: all anchors verified block-scoped against the repo sheets (run with --self-test to prove drift detection).');
