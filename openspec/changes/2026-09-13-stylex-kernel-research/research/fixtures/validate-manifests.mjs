#!/usr/bin/env node
// validate-manifests.mjs v3 — manifest-BOUND, block-scoped verification
// (Gate-1 r6: the r5 validator checked its own hardcoded anchors, so a
// manifest edit could pass silently, and D2-12 wasn't selector-scoped).
// This version binds THREE ways:
//   1. SOURCE blocks: each repo-derived row's selector block is
//      brace-matched in the named file; every pinned declaration is
//      verified INSIDE that block (real line ranges printed).
//   2. MANIFEST binding: the d2-fixture-manifest.md row for that ID
//      must contain BOTH the selector string AND the anchor
//      "file:start-end" EXACTLY equal to the source's real block
//      range — a stale/edited anchor or selector fails.
//   3. Selector-level D2-12: the checkbox selector-LIST block inside
//      @media (forced-colors: active) is located independently of the
//      media block; the pinned pair must live in THAT block.
// --self-test proves detection three ways: wrong source decls, a
// tampered manifest anchor, and a tampered manifest selector must
// EACH fail, or this script exits 1.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..', '..', '..');
const read = (p) => readFileSync(resolve(repo, p), 'utf8');

const sources = {
  'jx-pure.css': read('registry/files/theme/jx-pure.css'),
  'jixoai.css': read('registry/files/theme/jixoai.css'),
  'tooltip.css': read('registry/files/ui/tooltip/tooltip.css'),
  'terminal-header.css': read('registry/files/ui/terminal-header/terminal-header.css'),
};

function braceMatch(lines, openIdx) {
  let depth = 0;
  for (let k = openIdx; k < lines.length; k++) {
    for (const ch of lines[k]) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    if (depth === 0) return k;
  }
  return -1;
}

// block whose opening line contains selPrefix AND '{'
function findBlock(text, selPrefix) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith(selPrefix) && t.includes('{')) {
      const end = braceMatch(lines, i);
      if (end > 0) return { start: i + 1, end: end + 1, text: lines.slice(i, end + 1).join('\n') };
    }
  }
  return null;
}

// selector-LIST block: first line starts with firstLinePrefix, '{' on a
// later line (multi-line selector groups) — searched inside `within`
// (a previously found block) when given.
function findSelectorListBlock(text, firstLinePrefix, within) {
  const lines = (within ? within.text : text).split('\n');
  const offset = within ? within.start - 1 : 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(firstLinePrefix)) {
      let j = i;
      while (j < lines.length && !lines[j].includes('{')) {
        if (j - i > 12) return null; // not a selector list after all
        j++;
      }
      const end = braceMatch(lines, j);
      if (end > 0) return { start: offset + i + 1, end: offset + end + 1, text: lines.slice(i, end + 1).join('\n') };
    }
  }
  return null;
}

// repo-derived rows: what the source of truth is (file, selector, decls).
const blocks = {
  'D2-02': { file: 'jx-pure.css', sel: '.jx-control {', decls: [
    'padding: var(--jx-gap, 0.5rem) var(--jx-inset, 0.75rem)',
    'min-height: var(--jx-hit, 2.5rem)',
    'box-shadow: var(--shadow-well)',
  ] },
  'D2-02-env': { file: 'jixoai.css', sel: ":where(:root:not([data-density]), [data-density='default']) {", decls: [
    '--jx-gap: var(--jx-density-inline-gap-default)',
    '--jx-inset: var(--jx-density-inline-inset-default)',
  ] },
  'D2-10-dark': { file: 'jixoai.css', sel: '.dark {', decls: [
    '--primary: oklch(0.7044 0.1872 calc(var(--brand-hue) - 4))',
  ] },
  'D2-10-lg': { file: 'jixoai.css', sel: ":where([data-density='lg']) {", decls: [
    '--jx-gap: var(--jx-density-inline-gap-lg)',
    '--jx-inset: var(--jx-density-inline-inset-lg)',
  ] },
  'D2-12': { file: 'jx-pure.css', sel: '@media (forced-colors: active) {', decls: [], nested: {
    firstLine: ":where(.jx-pure) input[type='checkbox']:not(",
    decls: ['appearance: auto', 'background-image: none'],
  } },
  'D2-14': { file: 'tooltip.css', sel: '.jx-tip.jx-surface::after {', decls: ['content: none;'] },
  'D2-14-shadow': { file: 'tooltip.css', sel: '.jx-tip[data-arrow] .jx-tip-shadow {', decls: [
    '-webkit-mask-image: var(--jx-surface-ring, none)',
  ] },
  'D2-15': { file: 'terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel {', decls: [
    '--jx-panel-pad: 0.25rem',
    '--jx-pop-pad: var(--jx-panel-pad)',
    '--jx-pop-pad-inline: var(--jx-panel-pad)',
    'position-area: bottom span-right !important',
  ] },
  'D2-15-mega': { file: 'terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel.jx-subpanel-mega {', decls: [
    '--jx-panel-pad: 0.375rem',
    'width: min(90vw, calc(4 * 14rem + 2rem))',
  ] },
  'D2-15-backdrop': { file: 'terminal-header.css', sel: '.jx-nav .jx-pop.jx-subpanel::backdrop {', decls: [
    'background: transparent',
  ] },
};

const manifestPath = resolve(here, 'd2-fixture-manifest.md');
const d1 = readFileSync(resolve(here, 'd1-fixture-manifest.md'), 'utf8');
const pinRows = [
  ['D1 pin svelte', '| svelte | 5.57.0 |'],
  ['D1 pin kit', '| @sveltejs/kit | 2.70.3 |'],
  ['D1 pin vite', '| vite | 8.3.0 |'],
  ['D1 pin stylex', '| @stylexjs/stylex | 0.19.0 |'],
  ['D1 pin unplugin', '| @stylexjs/unplugin | 0.19.0 |'],
  ['D1 pin tw', '| tailwindcss (coexist side) | 4.3.3 |'],
];

// manifest binding tiers: tier-1 rows are real manifest table rows —
// the row line must carry BOTH the selector and the anchor (exact
// real range). Helper anchors (sub-blocks of a row) must appear
// SOMEWHERE in the manifest text. ownerMap routes helpers to rows.
const tier1 = ['D2-02', 'D2-10', 'D2-12', 'D2-14', 'D2-15'];
const ownerMap = {
  'D2-02-env': 'D2-02',
  'D2-10-dark': 'D2-10',
  'D2-10-lg': 'D2-10',
  'D2-14-shadow': 'D2-14',
  'D2-15-mega': 'D2-15',
  'D2-15-backdrop': 'D2-15',
};

function runChecks(manifestText) {
  const failures = [];
  const found = {};
  for (const [row, spec] of Object.entries(blocks)) {
    const text = sources[spec.file];
    let block = findBlock(text, spec.sel);
    if (!block) { failures.push(`${row}: selector block not found — ${spec.file} :: ${spec.sel}`); continue; }
    if (spec.nested) {
      const inner = findSelectorListBlock(null, spec.nested.firstLine, block);
      if (!inner) { failures.push(`${row}: nested selector block not found inside ${spec.file}:${block.start}-${block.end}`); continue; }
      block = { ...inner, file: spec.file, outer: `${block.start}-${block.end}` };
    }
    for (const d of spec.decls.length ? spec.decls : (spec.nested ? spec.nested.decls : [])) {
      if (!block.text.includes(d)) failures.push(`${row}: declaration NOT in block ${spec.file}:${block.start}-${block.end} — missing "${d}"`);
    }
    found[row] = block;
    console.log(`✓ ${row} ${spec.sel.replace(' {', '')} block ${spec.file}:${block.start}-${block.end}${block.outer ? ` (inside media ${block.outer})` : ''}`);
  }
  // manifest binding
  const manifestLines = manifestText.split('\n');
  const rowLine = (id) => manifestLines.find((l) => l.trimStart().startsWith(`| ${id} `) || l.trimStart().startsWith(`| ${id}|`));
  for (const id of tier1) {
    const block = found[id];
    if (!block) continue;
    const spec = blocks[id];
    const line = rowLine(id);
    if (!line) { failures.push(`manifest-bind ${id}: no manifest row found`); continue; }
    const needles = [spec.sel.replace(' {', ''), `${spec.file}:${block.start}-${block.end}`];
    if (spec.nested) {
      needles.push(`${spec.file}:${block.start}-${block.end}`); // nested anchor already the block's
      if (block.outer) needles.push(`${spec.file}:${block.outer}`); // AND the outer media range (Gate-1 r6 B2)
    }
    for (const [helper, owner] of Object.entries(ownerMap)) {
      if (owner !== id || !found[helper]) continue;
      needles.push(blocks[helper].sel.replace(' {', ''), `${blocks[helper].file}:${found[helper].start}-${found[helper].end}`);
    }
    for (const n of needles) {
      if (!line.includes(n)) failures.push(`manifest-bind ${id}: needle "${n}" absent from the manifest row`);
    }
  }
  // negative fact: the renamed-away selector must not exist
  if (sources['jx-pure.css'].includes('.jx-input {')) failures.push('D2-02-neg: FORBIDDEN ".jx-input {" present in jx-pure.css');
  else console.log('✓ D2-02-neg .jx-input never exists');
  for (const [name, needle] of pinRows) {
    if (!d1.includes(needle)) failures.push(`${name}: pin row missing — ${needle}`);
    else console.log(`✓ ${name}`);
  }
  return failures;
}

if (process.argv.includes('--self-test')) {
  const realFailures = runChecks(readFileSync(manifestPath, 'utf8'));
  const caught = { wrongSource: false, tamperedAnchor: false, tamperedSelector: false };
  // (1) wrong source decls
  const savedDecls = blocks['D2-14'].decls;
  blocks['D2-14'].decls = ['box-shadow: 0 0 99px red'];
  caught.wrongSource = runChecks(readFileSync(manifestPath, 'utf8')).some((f) => f.startsWith('D2-14:'));
  blocks['D2-14'].decls = savedDecls;
  // (2) tampered manifest anchor
  const orig = readFileSync(manifestPath, 'utf8');
  const tamperedAnchor = orig.replace('tooltip.css:42-44', 'tooltip.css:37-41');
  caught.tamperedAnchor = runChecks(tamperedAnchor).some((f) => f.startsWith('manifest-bind D2-14'));
  // (3) tampered manifest selector
  const tamperedSel = orig.replace('.jx-tip.jx-surface::after', '.jx-tip.jx-surface::before');
  caught.tamperedSelector = runChecks(tamperedSel).some((f) => f.startsWith('manifest-bind D2-14'));
  const allCaught = Object.values(caught).every(Boolean);
  if (!allCaught) {
    console.error(`\nvalidate-manifests SELF-TEST FAILED — detection gaps: ${JSON.stringify(caught)}`);
    process.exit(1);
  }
  console.log('\nvalidate-manifests SELF-TEST PASS: wrong-source ✓, tampered-anchor ✓, tampered-selector ✓ (all caught).');
  if (realFailures.length) {
    console.error(`\n${realFailures.length} REAL failure(s):`);
    realFailures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }
  console.log('validate-manifests: real anchors verified + manifest bound + detection proven.');
  process.exit(0);
}

const failures = runChecks(readFileSync(manifestPath, 'utf8'));
if (failures.length) {
  console.error(`\nvalidate-manifests: ${failures.length} FAILURE(S):`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('\nvalidate-manifests: all anchors block-scoped + manifest-bound (run --self-test to prove detection).');
