/**
 * The generator — writes the four projections into the REAL theme
 * sheets between marker slots, then mirror-syncs to apps/www.
 *
 *   utility → jixoai.css   @layer components slot  (replaces the retired
 *             @utility family; registry markup consumes the classes)
 *   face    → jx-pure.css  Part B slot (inside the sheet's own
 *             @layer components block; bare elements under :where(.jx-pure))
 *   alias   → jx-pure.css  Part A slot (unlayered — the Tier-2
 *             opt-in vocabulary beats layered utilities by design)
 *   vocab   → jx-pure.css  jx-icon-vocab slot (the icon vocabulary:
 *             --jx-icon-* custom properties + the two mask rules;
 *             URI geometry from lucide via icon-uris.ts)
 *   mount   → the component's own css file, <law>-mount slot (E-1,
 *             2026-09-02: a registry component mounting a generated
 *             face on its hook — range on [data-jx-range] — receives
 *             the SAME law's rules re-anchored on that hook, inside
 *             the component sheet's own @layer components context so
 *             it beats nothing unfairly; the anchor keeps the law's
 *             :not(.no-jx-pure) opt-out so the escape hatch is
 *             consistent across every mounting surface)
 *
 * Marker law: content between begin/end markers is GENERATED — never
 * hand-edit. The generator errors if markers are missing (run the
 * cutover first). Idempotent: same laws → same bytes.
 *
 * Run: npx tsx src/generate.ts
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeCollection, serializeLaw } from './serializers/core';
import type { ComponentLaw } from './types';
import { allLaws } from './laws/all';
import { buildIconVocabSheet } from './icon-vocab';

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(here, '../../..');

export const UTILITY_SLOT = 'jx-html-utility';
export const FACE_SLOT = 'jx-html-face';
export const ALIAS_SLOT = 'jx-html-alias';
export const ICON_VOCAB_SLOT = 'jx-icon-vocab';

const LAWS_SOURCE = 'packages/css-laws/src/laws';
const begin = (slot: string, source: string = LAWS_SOURCE) =>
  `/* @jixoai/css-laws:begin:${slot} — GENERATED, do not edit (source: ${source}) */`;
const end = (slot: string) => `/* @jixoai/css-laws:end:${slot} */`;

function replaceSlot(css: string, slot: string, content: string, source: string = LAWS_SOURCE): string {
  const b = begin(slot, source);
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

/**
 * the component-mount registry — WHICH laws ride a component hook and
 * WHERE. The registry/files copy is canonical (the mirror law); run()
 * writes it first, then copies the exact bytes to the apps/www mirror
 * exactly like the theme sheets.
 */
export interface ComponentMount {
  /** the law's name in allLaws */
  readonly law: string;
  /** marker slot name — the <law>-mount convention */
  readonly slot: string;
  /** the full hook anchor, INCLUDING the law's opt-out */
  readonly anchor: string;
  /** repo-relative registry source file carrying the marker slot */
  readonly registryPath: string;
  /** repo-relative apps/www mirror (byte-identical, the mirror law) */
  readonly mirrorPath: string;
}

export const COMPONENT_MOUNTS: readonly ComponentMount[] = [
  {
    law: 'range',
    slot: 'range-mount',
    anchor: '[data-jx-range]:not(.no-jx-pure, .no-jx-pure *)',
    registryPath: 'registry/files/ui/range/range.css',
    mirrorPath: 'apps/www/src/lib/ui/range/range.css',
  },
  {
    // the Owner's color rebase (2026-09-02): the picker's swatch rides
    // the color LAW face (the conic well chip) — retiring the H1 ruled
    // divergence (the square hand-authored chip). One visual law, every
    // mounting surface; the component adds SLOTS and semantics on top,
    // never re-draws the control (the range precedent verbatim).
    law: 'color',
    slot: 'color-mount',
    anchor: '[data-jx-color-picker-swatch]:not(.no-jx-pure, .no-jx-pure *)',
    registryPath: 'registry/files/ui/color-picker/color-picker.css',
    mirrorPath: 'apps/www/src/lib/ui/color-picker/color-picker.css',
  },
];

function mountSheetFor(laws: readonly ComponentLaw[], mount: ComponentMount): string {
  const law = laws.find((l) => l.name === mount.law);
  if (!law) {
    throw new Error(`component mount ${mount.slot}: no law named "${mount.law}" in the law registry`);
  }
  const css = serializeLaw(law, { format: 'mount', mountAnchor: mount.anchor }).css;
  if (!css.trim()) {
    throw new Error(`component mount ${mount.slot}: law "${mount.law}" serialized to nothing`);
  }
  // the component sheet's own @layer components context — the mount
  // beats nothing unfairly (consumer utilities still win, alias tiers
  // still outrank it; spec: the component-mount projection, 2026-09-02)
  return `@layer components {\n${css}\n}`;
}

export function generateAll(laws: readonly ComponentLaw[]): {
  utilitySheet: string;
  faceSheet: string;
  aliasSheet: string;
  iconVocabSheet: string;
  mountSheets: Record<string, string>;
} {
  const collection = { laws };
  const utility = serializeCollection(collection, { format: 'utility' });
  const face = serializeCollection(collection, { format: 'face' });
  const alias = serializeCollection(collection, { format: 'alias' });
  const mountSheets: Record<string, string> = {};
  for (const mount of COMPONENT_MOUNTS) mountSheets[mount.slot] = mountSheetFor(laws, mount);

  const utilitySheet = `@layer components {
${utility}
}`;
  return { utilitySheet, faceSheet: face, aliasSheet: alias, iconVocabSheet: buildIconVocabSheet(), mountSheets };
}

export function run(): void {
  const { utilitySheet, faceSheet, aliasSheet, iconVocabSheet, mountSheets } = generateAll(allLaws);

  const jixoaiPath = resolve(repoRoot, 'registry/files/theme/jixoai.css');
  const jxPurePath = resolve(repoRoot, 'registry/files/theme/jx-pure.css');

  let jixoai = readFileSync(jixoaiPath, 'utf8');
  jixoai = replaceSlot(jixoai, UTILITY_SLOT, utilitySheet);
  writeFileSync(jixoaiPath, jixoai);

  let jxPure = readFileSync(jxPurePath, 'utf8');
  jxPure = replaceSlot(jxPure, FACE_SLOT, faceSheet);
  jxPure = replaceSlot(jxPure, ALIAS_SLOT, aliasSheet);
  jxPure = replaceSlot(jxPure, ICON_VOCAB_SLOT, iconVocabSheet, 'packages/css-laws/src/icon-vocab');
  writeFileSync(jxPurePath, jxPure);

  console.log(`✓ jixoai.css  [${UTILITY_SLOT}] ${utilitySheet.length} bytes`);
  console.log(`✓ jx-pure.css [${FACE_SLOT}] ${faceSheet.length} bytes`);
  console.log(`✓ jx-pure.css [${ALIAS_SLOT}] ${aliasSheet.length} bytes`);
  console.log(`✓ jx-pure.css [${ICON_VOCAB_SLOT}] ${iconVocabSheet.length} bytes`);

  // the 4th surface: component-mount slots (registry copy canonical,
  // then the exact bytes to the apps/www mirror — the theme-sheet law)
  for (const mount of COMPONENT_MOUNTS) {
    const registryPath = resolve(repoRoot, mount.registryPath);
    const mirrorPath = resolve(repoRoot, mount.mirrorPath);
    const sheet = mountSheets[mount.slot];
    let css = readFileSync(registryPath, 'utf8');
    css = replaceSlot(css, mount.slot, sheet);
    writeFileSync(registryPath, css);
    copyFileSync(registryPath, mirrorPath);
    console.log(`✓ ${mount.registryPath} [${mount.slot}] ${sheet.length} bytes (+ mirror synced)`);
  }
}

// laws barrel keeps the law list in one place (laws/all.ts)
export { replaceSlot, begin, end };
