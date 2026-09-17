// item.stylex.ts — the list-item family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the ItemDivider's utility string — the empty
// presentation <li>'s UA reset (no list marker, no margins, no
// padding). The divider's PAINT (the full-strength 1px top border,
// the 100% width, the grid-column span, the :has()-based adjacency
// exclusivity) stays item.css keyed on [data-slot='item-divider'] —
// FROZEN law; the atom shares only properties the css already owns
// identically (margin 0 rides both; the css rule wins or ties, never
// conflicts).
//
// Law mapping (the tier-2 value rule): pure structural resets — no
// theme-able slot exists here.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// list-item/ and apps/www/src/lib/ui/list-item/ (cmp).

import * as stylex from '@stylexjs/stylex';

export const itemStyles = stylex.create({
  // ── the empty presentation <li>: the UA list chrome reset ──
  divider: { listStyleType: 'none', margin: 0, padding: 0 },
});
