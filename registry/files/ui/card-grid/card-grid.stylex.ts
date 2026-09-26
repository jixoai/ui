// card-grid.stylex.ts — the card-grid family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the grid container's own paint as the old
// markup's utility string spelled it — the auto-fit column law
// (repeat(auto-fit, minmax(min(100%, var(--jx-grid-min)), 1fr)), the
// collapse width a consumer-tunable inline var), the 20px gutter,
// the equalizing stretch. Every rule that reaches the
// consumer-authored children (the subgrid laws, the only-child cap,
// the entrance state machine) stays in card-grid.css — the
// D1-exempt residue, untouched.
//
// Law mapping (the tier-2 value rule): gap-5 (20px) maps to the
// space ladder's --space-20 step (4px ruler × 5 — the existing step
// IS the value); the columns template is structural geometry over
// the family's own --jx-grid-min var; display + alignment are
// structural. The .jx-card-grid hook stays a STATIC class string —
// card-grid.css's own key.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/card-grid/ and apps/www/src/lib/ui/card-grid/
// (cmp); the tokens import '../../tokens.stylex' resolves in BOTH
// trees (separator's divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const cardGridStyles = stylex.create({
  // ── the landlord's grid (the row contract lives in card-grid.css) ──
  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(min(100%, var(--jx-grid-min)), 1fr))',
    gap: tokens['--jx-space-20'],
    alignItems: 'stretch',
  },
});
