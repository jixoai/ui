#!/usr/bin/env node
// self-test.mjs — the comparator's pinned test matrix (gate-1-r3 A1,
// extended gate-1-r4 + gate-1-r5 A1): every normalization carries a
// POSITIVE pair (must compare EQUIVALENT) and a NEGATIVE pair (must
// compare DIFFERENT). r4 pinned the number/quote scoping law (quoted
// digits verbatim, numeric classes distinct under --strict-selectors,
// --custom-property names never number-normalized). r5 pins the four
// adversarial boundaries Codex probed beyond the matrix: url() contents
// (digits + case), custom-property VALUE case, @media/@supports nesting
// ancestry, and same-selector cascade conflict order. Exit 0 iff all
// rows verdict as expected.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'cmp-selftest-'));
// [name, cssA, cssB, expectedEquivalent, opts?]
// opts.flags: extra comparator flags; opts.flagsBeforePaths: place flags
// BEFORE the two input paths in argv (the r3 ENOENT regression shape).
const rows = [
  ['N1 pos 12px=12.0px', '.x{padding:12px}', '.x{padding:12.0px}', true],
  ['N1 pos 0.5rem=.5rem', '.x{padding:0.5rem}', '.x{padding:.5rem}', true],
  ['N1 pos 0.50rem=0.5rem', '.x{padding:0.50rem}', '.x{padding:0.5rem}', true],
  ['N1 NEG 12px vs 2px', '.x{padding:12px}', '.x{padding:2px}', false],
  ['N1 NEG 120px vs 12px', '.x{padding:120px}', '.x{padding:12px}', false],
  ['N1 NEG quoted digits', '.x::before{content:"012"}', '.x::before{content:"12"}', false],
  ['N1 NEG custom-prop name', '.y{--token-01:red}', '.y{--token-1:red}', false],
  ['N1 NEG var() prop ref', '.y{color:var(--t-01)}', '.y{color:var(--t-1)}', false],
  ['N1 pos custom-prop value', '.y{--move:1px 1.0px}', '.y{--move:1px 1px}', true],
  ['N2 pos quote style', '.x::before{content:\'a\'}', '.x::before{content:"a"}', true],
  ['N2 pos escaped quote', '.x::before{content:\\"a\\"}', '.x::before{content:"a"}', false],
  ['N2 NEG a vs b', '.x::before{content:"a"}', '.x::before{content:"b"}', false],
  ['N3 pos steps end', '.x{animation-timing-function:steps(1,end)}', '.x{animation-timing-function:steps(1)}', true],
  ['N3 pos steps jump-end', '.x{animation-timing-function:steps(1,jump-end)}', '.x{animation-timing-function:steps(1)}', true],
  ['N3 NEG steps(2,start) vs steps(2)', '.x{animation-timing-function:steps(2,start)}', '.x{animation-timing-function:steps(2)}', false],
  ['N3 NEG steps(1) vs steps(2)', '.x{animation-timing-function:steps(1)}', '.x{animation-timing-function:steps(2)}', false],
  ['N4 pos decl order', '.x{color:red;padding:1px}', '.x{padding:1px;color:red}', true],
  ['N4 NEG value', '.x{color:red}', '.x{color:blue}', false],
  ['N4 pos quoted semicolon', '.x{content:"a;b";color:red}', '.x{color:red;content:"a;b"}', true],
  ['N5 pos renamed class', '.x01{color:red}', '.x1{color:red}', true],
  ['URL NEG unquoted digits', '.x{background:url(asset01.png)}', '.x{background:url(asset1.png)}', false],
  ['URL NEG case', '.x{background:url(Asset.png)}', '.x{background:url(asset.png)}', false],
  ['URL NEG quoted digits', '.x{background:url("a01.png")}', '.x{background:url("a1.png")}', false],
  ['URL pos quote form', '.x{background:url("a.png")}', '.x{background:url(a.png)}', true],
  ['URL pos surrounding ws', '.x{background:url( a.png )}', '.x{background:url(a.png)}', true],
  ['CPV NEG case', '.y{--x:Foo}', '.y{--x:foo}', false],
  ['MEDIA NEG width', '@media (min-width:12px){.x{color:red}}', '@media (min-width:13px){.x{color:red}}', false],
  ['MEDIA pos number format', '@media (min-width:12.0px){.x{color:red}}', '@media (min-width:12px){.x{color:red}}', true],
  ['MEDIA pos ws', '@media (min-width: 12px){.x{color:red}}', '@media (min-width:12px){.x{color:red}}', true],
  ['NESTED NEG supports>media', '@supports (a:b){@media (min-width:12px){.x{color:red}}}', '@supports (a:b){@media (min-width:13px){.x{color:red}}}', false],
  ['NESTED pos ws', '@supports ( a:b ){@media (min-width: 12px){.x{color:red}}}', '@supports (a:b){@media (min-width:12px){.x{color:red}}}', true],
  ['CASCADE NEG reversed conflict', '.x{color:red}.x{color:blue}', '.x{color:blue}.x{color:red}', false],
  ['CASCADE NEG merge split', '.x{color:red;padding:0}', '.x{color:red}.x{padding:0}', false],
  ['CASCADE NEG duplicate vs single', '.x{color:red}.x{color:red}', '.x{color:red}', false],
  ['CASCADE pos decl order in sequence', '.x{color:red;padding:0}.x{color:blue}', '.x{padding:0;color:red}.x{color:blue}', true],
  ['STRICT NEG numeric class .x01', '.x01{color:red}', '.x1{color:red}', false, { flags: ['--strict-selectors'] }],
  ['STRICT pos identical', '.x01{color:red}', '.x01{color:red}', true, { flags: ['--strict-selectors'] }],
  ['FLAG NEG strict-before-paths', '.x01{color:red}', '.x1{color:red}', false, { flags: ['--strict-selectors'], flagsBeforePaths: true }],
];

let failed = 0;
const here = process.argv[1].replace(/self-test\.mjs$/, 'compare-compiled.mjs');
for (const [name, cssA, cssB, expectedEq, opts = {}] of rows) {
  const { flags = [], flagsBeforePaths = false } = opts;
  const pa = join(dir, 'a.css');
  const pb = join(dir, 'b.css');
  writeFileSync(pa, cssA);
  writeFileSync(pb, cssB);
  const argv = flagsBeforePaths
    ? [here, ...flags, pa, pb]
    : [here, pa, pb, ...flags];
  let verdictEq;
  try {
    execFileSync('node', argv, { stdio: 'pipe' });
    verdictEq = true;
  } catch {
    verdictEq = false;
  }
  const ok = verdictEq === expectedEq;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name} — got ${verdictEq ? 'EQUIVALENT' : 'DIFFERENT'}, expected ${expectedEq ? 'EQUIVALENT' : 'DIFFERENT'}`);
}
rmSync(dir, { recursive: true, force: true });
if (failed) {
  console.error(`\nself-test: ${failed} FAILURE(S)`);
  process.exit(1);
}
console.log(`\nself-test: all ${rows.length} rows verdict as expected`);
