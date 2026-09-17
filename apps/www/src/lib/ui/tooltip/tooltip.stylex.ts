// tooltip.stylex.ts — the tooltip family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the anchor-driven rework's utility strings: the
// inline-flex anchor wrapper, and the panel's popover ink — the 12px
// label-lg voice at 1.5 leading, centered, capped at min(80vw, 18rem),
// riding the platform shell (fixed, fit-content width). The notch
// geometry (the body's reserved strip + mask, the shadow silhouette)
// stays tooltip.css keyed on the .jx-tip hooks — the unlayered notch
// rule re-sets the body's padding-block exactly as it beat the old
// py utility, so the atom tier changes nothing there.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens —
// 12px label-lg text, the 1.5 leading-15 step, the popover-foreground
// ink; geometry (fixed, fit-content, the min() cap) is structural.
// The body's 9px/5px insets are no-step oddballs riding the ruler
// equations calc(var(--jx-unit) * 2.25) / * 1.25 — byte-exact at the
// default unit.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// tooltip/ and apps/www/src/lib/ui/tooltip/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tooltipStyles = stylex.create({
  // ── the anchor wrapper: an inline-flex hit surface ──
  anchor: { display: 'inline-flex' },
  // ── the panel: the platform shell's ink + measure (the anchor
  //    geometry — margin, position-try, anchors-visible — stays
  //    tooltip.css's :focus-adjacent law) ──
  panel: {
    position: 'fixed',
    width: 'fit-content',
    maxWidth: 'min(80vw,18rem)',
    fontSize: 'var(--text-label-lg)',
    lineHeight: 'var(--leading-15)',
    textAlign: 'center',
    color: tokens['--jx-popover-foreground'],
  },
  // ── the body: the bubble's insets (block padding re-set by the
  //    unlayered notch rule when the arrow variant is live) ──
  body: {
    display: 'block',
    paddingInline: 'calc(var(--jx-unit) * 2.25)',
    paddingBlock: 'calc(var(--jx-unit) * 1.25)',
  },
});
