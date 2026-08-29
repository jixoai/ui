#!/usr/bin/env node
// verify-standards — the frozen alignment laws, statically enforced
// (merge-alignment B1/B2, Codex ruling 2026-08-29).
//
//   B1  native form-control laws are TS-law-generated ONLY: outside
//       the css-laws marker slots, neither theme sheet may author
//       `@utility jx-html-*` or `@apply jx-html-*` (the retired chain
//       must never creep back by hand). The jx-hue-*/jx-pair-*
//       intent utilities are OUT OF SCOPE (a different, legal layer).
//
//   B2  icon paints ride the slot system: every data-URI glyph in the
//       theme sheets must be either a slot DEFINITION
//       (`--jx-icon-x: url(...)`) or a slot USE
//       (`var(--jx-icon-x, url(...))`) — a bare `url("data:image/svg`
//       in any other position is an untracked duplicate paint.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sheets = [
  ['jixoai.css', readFileSync(resolve(root, 'registry/files/theme/jixoai.css'), 'utf8')],
  ['jx-pure.css', readFileSync(resolve(root, 'registry/files/theme/jx-pure.css'), 'utf8')],
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};

// ── B1: the retired @utility/@apply chain stays retired ─────────────
for (const [name, css] of sheets) {
  // strip the generated slots first — the laws themselves live there
  const stripped = css.replace(
    /\/\* @jixoai\/css-laws:begin:[\s\S]*?\/\* @jixoai\/css-laws:end:[a-z-]+ \*\//g,
    '',
  );
  const handUtility = [...stripped.matchAll(/@utility\s+(jx-html-[a-z-]+)/g)].map((m) => m[1]);
  const handApply = [...stripped.matchAll(/@apply\s+(jx-html-[a-z-]+)/g)].map((m) => m[1]);
  if (handUtility.length) fail(`${name}: hand-authored @utility outside the law slots: ${handUtility.join(', ')}`);
  if (handApply.length) fail(`${name}: hand-authored @apply of jx-html-* outside the law slots: ${handApply.join(', ')}`);
}
console.log('✓ B1: no hand-authored jx-html-* @utility/@apply outside the generated slots');

// ── B2: every glyph paint rides a --jx-icon-* slot ──────────────────
for (const [name, css] of sheets) {
  for (const line of css.split('\n')) {
    if (!line.includes('url("data:image/svg') && !line.includes("url('data:image/svg")) continue;
    const isDefinition = /--jx-icon-[a-z-]+\s*:\s*url\(/.test(line);
    const isSlotUse = /var\(--jx-icon-[a-z-]+\s*,\s*url\(/.test(line);
    if (!isDefinition && !isSlotUse) {
      const snippet = line.trim().slice(0, 90);
      fail(`${name}: data-URI glyph outside the slot system (define --jx-icon-* or use var(--jx-icon-*, fallback)): "${snippet}…"`);
    }
  }
}
console.log('✓ B2: every data-URI glyph is a slot definition or a slotted use');

if (failures) {
  console.error(`\n[verify-standards] ${failures} violation(s)`);
  process.exit(1);
}
console.log('[verify-standards] GREEN — the alignment laws hold');
