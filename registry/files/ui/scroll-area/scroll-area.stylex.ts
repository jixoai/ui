// scroll-area.stylex.ts — the scroll-area family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the hand-drawn chrome rework's utility strings
// (2026-09-15): the region's positioning context (the drawn lanes are
// absolute children), the scrollport's overscroll containment + the
// deterministic orientation overflow law, and the content's full-height
// ride. The chrome's PAINT (lanes, thumb, focus rings, width tiers)
// stays scroll-area.css keyed on the .jx-scroll-* hooks — no atom
// shares a property with any of it (the scrollbar-hiding rules touch
// scrollbar-width/-ms-overflow-style/::-webkit-scrollbar only).
//
// Law mapping (the tier-2 value rule): everything here is structural
// geometry (position, overscroll-behavior, overflow, height) — no
// theme-able slot rides a literal.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// scroll-area/ and apps/www/src/lib/ui/scroll-area/ (cmp).

import * as stylex from '@stylexjs/stylex';

export const scrollAreaStyles = stylex.create({
  // ── the region: the positioning context for the drawn lanes ──
  region: { position: 'relative' },
  // ── the scrollport: overscroll containment, orientation-scoped ──
  viewport: { overscrollBehavior: 'contain' },
  viewportVertical: { overflowX: 'hidden', overflowY: 'auto' },
  viewportHorizontal: { overflowX: 'auto', overflowY: 'hidden' },
  viewportBoth: { overflowX: 'auto', overflowY: 'auto' },
  // ── the content rides the scrollport's full height ──
  content: { height: '100%' },
});
