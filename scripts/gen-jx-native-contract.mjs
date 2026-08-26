#!/usr/bin/env node
/**
 * gen-jx-native-contract — slice Part A out of the face, byte-exact
 * (native-contract-fusion, 2026-08-27).
 *
 * Single source: registry/files/theme/jx-pure.css. The region between
 * the BEGIN/END jx-native-contract markers (the Part A class
 * vocabulary + icon custom properties + reduced-motion prelude) is
 * sliced VERBATIM under a static generated header into
 * registry/files/theme/jx-native-contract.css — the shared contract
 * item (@jixoai/jx-native-contract) the Tier-1 native-family
 * components depend on instead of the full face.
 *
 * The header is intentionally VOLATILE-FREE (no date/sha) so the
 * output is idempotent and the mirror/payload hashes stay stable.
 *
 * usage:
 *   node scripts/gen-jx-native-contract.mjs           # generate
 *   node scripts/gen-jx-native-contract.mjs --check   # drift gate
 *
 * After generating: cp the canonical AND the extract to their
 * apps/www/src/lib/ mirrors, then run gen-mirror-manifest.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const FACE = resolve(repoRoot, 'registry/files/theme/jx-pure.css');
const EXTRACT = resolve(repoRoot, 'registry/files/theme/jx-native-contract.css');

const BEGIN = '/* ==[ BEGIN jx-native-contract region';
const END = '/* ==[ END jx-native-contract region';

const HEADER = `/**
 * jx-native-contract — the shared Part A class vocabulary
 * (registry/files/theme/jx-native-contract.css).
 *
 * GENERATED FILE — never hand-edit. This sheet is the byte-exact
 * Part A region of registry/files/theme/jx-pure.css, sliced by
 * scripts/gen-jx-native-contract.mjs (single source: the face; the
 * drift gate fails when the two diverge).
 *
 * Registry item @jixoai/jx-native-contract (registryDependencies:
 * @jixoai/jixoai-theme): the Tier-1 native-family components consume
 * these unlayered classes (.jx-field/.jx-label/.jx-error/.jx-control/
 * .jx-control-shell/.jx-control-lane/.jx-slider/.jx-color-shell/
 * .jx-color-swatch + icon custom properties + the structural
 * input-group law) without shipping the full 2000-line face. The
 * jixoai token sheet (tokens + density aliases) is a prerequisite.
 * Unlayered BY DESIGN — the cascade exception that beats layered
 * utilities (openspec: native-contract / jx-pure specs).
 */

`;

function generate() {
  const face = readFileSync(FACE, 'utf8');
  const begin = face.indexOf(BEGIN);
  const end = face.indexOf(END);
  if (begin === -1 || end === -1 || end < begin) {
    die(`markers not found in jx-pure.css (BEGIN:${begin} END:${end}) — the contract region must stay delimited`);
  }
  // slice from AFTER the begin-marker line's closing, to the START of
  // the end marker — preserving every internal byte
  const afterBegin = face.indexOf('\n', face.indexOf(']== */', begin));
  const region = face
    .slice(afterBegin + 1, end)
    .replace(/^\n+/, '')
    .replace(/\s+$/, '');
  return `${HEADER}${region}\n`;
}

const check = process.argv.includes('--check');
const next = generate();
if (check) {
  let current = '';
  try {
    current = readFileSync(EXTRACT, 'utf8');
  } catch {
    die('jx-native-contract.css is missing — run the generator (never hand-write it)');
  }
  if (current !== next) {
    die('contract drift: jx-native-contract.css ≠ the Part A region of jx-pure.css — regenerate (node scripts/gen-jx-native-contract.mjs)');
  }
  console.log('[jx-native-contract] check GREEN: extract is byte-identical to the Part A region');
} else {
  writeFileSync(EXTRACT, next);
  console.log(`[jx-native-contract] wrote ${EXTRACT.replace(`${repoRoot}/`, '')} (${next.length}B) — cp it to apps/www/src/lib/ and regen the mirror manifest`);
}

function die(msg) {
  console.error(`[jx-native-contract] ${msg}`);
  process.exit(1);
}
