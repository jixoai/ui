// hover-card.stylex.ts — the hover-card family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the hover intent surface's utility strings: the
// inline-flex anchor wrapper, and the panel's reading voice — 13px
// --jx-text-base at 1.55 leading-155, capped at min(88vw, 20rem),
// riding the platform shell (fixed, fit-content width). The anchor
// geometry (margin, position-try, the @supports viewport-center
// fallback) stays hover-card.css keyed on the .jx-hover-card hook —
// no atom shares a property with it. The body's 16px/14px insets ride
// the space-16/space-14 steps.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — the popover-foreground ink, the leading-155
// step, the spacing steps; 13px is the ruler's T_base (--jx-text-base,
// a kernel channel the typed map never wraps). Geometry (fixed,
// fit-content, the min() cap) is structural.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// hover-card/ and apps/www/src/lib/ui/hover-card/ (cmp); the tokens
// import '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const hoverCardStyles = stylex.create({
  // ── the anchor wrapper: an inline-flex hit surface ──
  anchor: { display: 'inline-flex' },
  // ── the panel: the platform shell's ink + measure ──
  panel: {
    position: 'fixed',
    width: 'fit-content',
    maxWidth: 'min(88vw,20rem)',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-155)',
    color: tokens['--jx-popover-foreground'],
  },
  // ── the body: the card's insets (fill + ::after shadow are the
  //    unlayered surface-body law's) ──
  body: {
    paddingInline: 'var(--space-16)',
    paddingBlock: 'var(--space-14)',
  },
});
