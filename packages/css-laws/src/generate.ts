/**
 * The generator — writes the three projections into the REAL theme
 * sheets between marker slots, then mirror-syncs to apps/www.
 *
 *   utility → jixoai.css   @layer components slot  (replaces the retired
 *             @utility family; registry markup consumes the classes)
 *   face    → jx-pure.css  Part B slot (inside the sheet's own
 *             @layer components block; bare elements under :where(.jx-pure))
 *   alias   → jx-pure.css  Part A slot (unlayered — the Tier-2
 *             opt-in vocabulary beats layered utilities by design)
 *
 * Marker law: content between begin/end markers is GENERATED — never
 * hand-edit. The generator errors if markers are missing (run the
 * cutover first). Idempotent: same laws → same bytes.
 *
 * Run: npx tsx src/generate.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeCollection } from './serializers/core';
import type { ComponentLaw } from './types';
import { allLaws } from './laws/all';

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(here, '../../..');

export const UTILITY_SLOT = 'jx-html-utility';
export const FACE_SLOT = 'jx-html-face';
export const ALIAS_SLOT = 'jx-html-alias';

const begin = (slot: string) => `/* @jixoai/css-laws:begin:${slot} — GENERATED, do not edit (source: packages/css-laws/src/laws) */`;
const end = (slot: string) => `/* @jixoai/css-laws:end:${slot} */`;

function replaceSlot(css: string, slot: string, content: string): string {
  const b = begin(slot);
  const e = end(slot);
  // structural validation (Codex r2 closeout): exactly one begin, one
  // end, correctly paired — duplicated or orphaned markers are a
  // corrupted sheet, not a regeneration target
  const countOf = (needle: string) => css.split(needle).length - 1;
  if (countOf(b) !== 1 || countOf(e) !== 1) {
    throw new Error(`marker slot ${slot}: expected exactly one begin/end pair (found ${countOf(b)}/${countOf(e)})`);
  }
  const bi = css.indexOf(b);
  const ei = css.indexOf(e);
  if (ei < bi) {
    throw new Error(`marker slot ${slot}: end precedes begin — corrupted sheet`);
  }
  const head = css.slice(0, bi);
  const tail = css.slice(ei + e.length);
  const body = content.trim().length ? `\n${content.trim()}\n` : '\n';
  return `${head}${b}${body}${e}${tail}`;
}

export function generateAll(laws: readonly ComponentLaw[]): {
  utilitySheet: string;
  faceSheet: string;
  aliasSheet: string;
} {
  const collection = { laws };
  const utility = serializeCollection(collection, { format: 'utility' });
  const face = serializeCollection(collection, { format: 'face' });
  const alias = serializeCollection(collection, { format: 'alias' });

  const utilitySheet = `@layer components {
${utility}
}`;
  return { utilitySheet, faceSheet: face, aliasSheet: alias };
}

export function run(): void {
  const { utilitySheet, faceSheet, aliasSheet } = generateAll(allLaws);

  const jixoaiPath = resolve(repoRoot, 'registry/files/theme/jixoai.css');
  const jxPurePath = resolve(repoRoot, 'registry/files/theme/jx-pure.css');

  let jixoai = readFileSync(jixoaiPath, 'utf8');
  jixoai = replaceSlot(jixoai, UTILITY_SLOT, utilitySheet);
  writeFileSync(jixoaiPath, jixoai);

  let jxPure = readFileSync(jxPurePath, 'utf8');
  jxPure = replaceSlot(jxPure, FACE_SLOT, faceSheet);
  jxPure = replaceSlot(jxPure, ALIAS_SLOT, aliasSheet);
  writeFileSync(jxPurePath, jxPure);

  console.log(`✓ jixoai.css  [${UTILITY_SLOT}] ${utilitySheet.length} bytes`);
  console.log(`✓ jx-pure.css [${FACE_SLOT}] ${faceSheet.length} bytes`);
  console.log(`✓ jx-pure.css [${ALIAS_SLOT}] ${aliasSheet.length} bytes`);
}

// laws barrel keeps the law list in one place (laws/all.ts)
export { replaceSlot, begin, end };
