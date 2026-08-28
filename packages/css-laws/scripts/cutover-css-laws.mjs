#!/usr/bin/env node
// cutover-css-laws.mjs — one-shot architecture cutover (2026-08-28).
// Replaces the hand-authored @utility family + @apply applications
// with @jixoai/css-laws marker slots. After this script, the slots'
// content is GENERATED (npx tsx packages/css-laws/src/build.ts).
//
// Deliberately single-use: it edits the two theme sheets at precise,
// pre-verified boundaries and refuses to run twice.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../../..', import.meta.url).pathname;
const jixoaiP = `${root}registry/files/theme/jixoai.css`;
const jxPureP = `${root}registry/files/theme/jx-pure.css`;

const UTILITY_BEGIN = '/* @jixoai/css-laws:begin:jx-html-utility — GENERATED, do not edit (source: packages/css-laws/src/laws) */';
const UTILITY_END = '/* @jixoai/css-laws:end:jx-html-utility */';
const FACE_BEGIN = '/* @jixoai/css-laws:begin:jx-html-face — GENERATED, do not edit (source: packages/css-laws/src/laws) */';
const FACE_END = '/* @jixoai/css-laws:end:jx-html-face */';
const ALIAS_BEGIN = '/* @jixoai/css-laws:begin:jx-html-alias — GENERATED, do not edit (source: packages/css-laws/src/laws) */';
const ALIAS_END = '/* @jixoai/css-laws:end:jx-html-alias */';

// ── 1. jixoai.css: the @utility family → UTILITY_SLOT ──────────────
{
  let css = readFileSync(jixoaiP, 'utf8');
  if (css.includes('jx-html-utility')) throw new Error('cutover already ran (jixoai)');
  const start = css.indexOf('/* ── jx-html standard layer');
  const endAnchor = ":where(:root:not([data-density]), [data-density='default'])";
  const end = css.indexOf(endAnchor);
  if (start === -1 || end === -1 || end < start) throw new Error('jixoai boundaries not found');
  const header = `/* ── jx-html standard layer (native-contract-fusion V2 → css-laws V3,
   2026-08-28) ──────────────────────────────────────────────────────
   The native form-control laws are SINGLE-SOURCED as TS objects in
   packages/css-laws/src/laws/*.ts. THREE projections are generated
   between the markers below and in jx-pure.css:
     utility — .jx-html-* classes here, @layer components (registry
               markup consumes the classes; consumer utilities win
               over law paint by layer order — the placement law)
     face    — element-default rules in jx-pure.css Part B
     alias   — Tier-2 opt-in classes in jx-pure.css Part A (unlayered)
   Law composition happens in TS (composeLaw) — the @apply chain is
   retired. DOM isomorphism (design §11.2) rides on top unchanged:
   the switch is ONE input[role=switch] on both sides; the tgroup is
   a subtree law over bare labels. ────────────────────────────── */

`;
  css = css.slice(0, start) + header + `${UTILITY_BEGIN}\n${UTILITY_END}\n\n` + css.slice(end);
  writeFileSync(jixoaiP, css);
  console.log('✓ jixoai.css: @utility family → marker slot');
}

// ── 2. jx-pure.css Part A: alias @apply rules → ALIAS_SLOT ─────────
{
  let css = readFileSync(jxPureP, 'utf8');
  if (css.includes('jx-html-alias')) throw new Error('cutover already ran (jx-pure)');

  const aliasBlock = `/* opt-in classes = GENERATED applications of the standard layer
   (the declarations live once in packages/css-laws/src/laws; these
   selectors bind them to the opt-in vocabulary — Tier-2, unlayered
   by design: they beat layered utilities) */
${ALIAS_BEGIN}
${ALIAS_END}`;

  // 2a. the .jx-control block becomes the slot
  const ctrl = '.jx-control {\n  @apply jx-html-control;\n}';
  if (!css.includes(ctrl)) throw new Error('.jx-control alias rule not found');
  css = css.replace(ctrl, aliasBlock);

  // 2b. the other pure alias rules are removed (generated in the slot)
  for (const rule of [
    '.jx-control-shell {\n  @apply jx-html-control-shell;\n}\n',
    '.jx-control-lane {\n  @apply jx-html-control-lane;\n}\n',
    '.jx-slider {\n  @apply jx-html-range;\n}\n',
    '.jx-color-swatch {\n  @apply jx-html-color;\n}\n',
    '.jx-tgroup {\n  @apply jx-html-tgroup;\n}\n',
  ]) {
    if (!css.includes(rule)) throw new Error(`alias rule not found: ${rule.slice(0, 40)}`);
    css = css.replace(rule, '');
  }
  writeFileSync(jxPureP, css);
  console.log('✓ jx-pure.css Part A: alias @apply rules → marker slot');
}

// ── 3. jx-pure.css Part B: face @apply/expanded rules → FACE_SLOT ──
{
  let css = readFileSync(jxPureP, 'utf8');
  if (css.includes('jx-html-face')) throw new Error('face slot already present');

  // 3a. the contiguous B4+B5 stretch: 13-type input → color rule
  const startAnchor = '  :where(.jx-pure) input:where(';
  const endAnchor = '  /* ---- B6 · label / fieldset / legend';
  const start = css.indexOf(startAnchor);
  const end = css.indexOf(endAnchor);
  if (start === -1 || end === -1 || end < start) throw new Error('Part B boundaries not found');
  const faceBlock = `  /* GENERATED between the markers (css-laws V3): the bare-element
     defaults — same declaration source as the .jx-html-* classes,
     serialized as element-default rules under :where(.jx-pure) */
  ${FACE_BEGIN}
${FACE_END}
`;
  css = css.slice(0, start) + faceBlock + '\n' + css.slice(end);

  // 3b. the B13 switch @apply rule — generated face covers it
  const sw = `  :where(.jx-pure) input[type='checkbox'][role='switch']:not(.no-jx-pure, .no-jx-pure *) {
    @apply jx-html-switch;
  }
`;
  if (!css.includes(sw)) throw new Error('switch face rule not found');
  css = css.replace(sw, '');

  writeFileSync(jxPureP, css);
  console.log('✓ jx-pure.css Part B: face rules → marker slot (switch included)');
}

console.log('\ncutover complete — now run: npx tsx packages/css-laws/src/build.ts');
