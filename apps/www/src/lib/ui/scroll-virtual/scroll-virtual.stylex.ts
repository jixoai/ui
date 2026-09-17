// scroll-virtual.stylex.ts — the scroll-virtual family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the ONE utility the markup carried — the
// spacer's positioning law (position: relative — the absolutely
// positioned rows' offsetParent; the rows' own positioning styles
// are TanStack-driven inline styles by design, tw4 note). The
// data-jx-sv-spacer / data-jx-sv-row hooks stay attribute-stamped.
//
// Law mapping: position is structural — no theme slots.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/scroll-virtual/ and
// apps/www/src/lib/ui/scroll-virtual/ (cmp); the tokens import
// resolves in BOTH trees when needed (separator's divergence note #1
// — this table carries no theme slots).

import * as stylex from '@stylexjs/stylex';

export const scrollVirtualStyles = stylex.create({
  // ── the spacer: the rows' positioning context ────────────────────
  spacer: {
    position: 'relative',
  },
});
