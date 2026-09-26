// carousel.stylex.ts — the carousel family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the family carried since
// tw4 (2026-08-24). Hover/focus paint rides stylex-native pseudo
// conditions (the corpus law — press-button's own form); the on-dot
// state is a LATER atom overriding the base dot's ground/border
// (same-tier rule order — the standard stylex override idiom).
// The slide law (every direct child sized + snapped) stays in
// carousel.css — a child boundary is selector architecture.
//
// Value receipts (missing steps reported for serial promotion):
//   - text-lg (18px) has no step → calc(var(--jx-text-base) +
//     var(--jx-unit) * 1.25), the ruler equation (13px + 5px);
//   - leading-none (1) has no step → an exact equation over the
//     density ladder's 1.6 rung;
//   - the -1rem arrow overhang rides the space-16 token negated
//     (calc(var(--jx-space-16) * -1)).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const carouselStyles = stylex.create({
  // ── the region: track window over the dot row ──
  root: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-12'] },
  window: { display: 'grid' },
  // ── the scroll track (the keyboard surface) ──
  track: {
    gridArea: '1/1',
    display: 'flex',
    gap: tokens['--jx-space-12'],
    overflowX: 'auto',
    overscrollBehaviorX: 'contain',
    scrollSnapType: 'x mandatory',
    paddingBlockEnd: tokens['--jx-space-4'],
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '-1px',
    },
  },
  // ── the paging arrows (grid items of the window's one cell) ──
  arrow: {
    gridArea: '1/1',
    alignSelf: 'center',
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    backgroundColor: tokens['--jx-popover'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.25)',
    lineHeight: 'calc(var(--jx-density-leading-lg) * 0.625)',
    cursor: 'pointer',
    boxShadow: tokens['--jx-shadow-xs'],
    borderColor: {
      default: tokens['--jx-border'],
      ':hover': tokens['--jx-primary'],
    },
    color: {
      default: tokens['--jx-foreground'],
      ':hover': tokens['--jx-primary'],
    },
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '-1px',
    },
  },
  // hung 1rem outside the cell (negative margin over the space token)
  arrowPrev: { justifySelf: 'start', marginInlineStart: 'calc(var(--jx-space-16) * -1)' },
  arrowNext: { justifySelf: 'end', marginInlineEnd: 'calc(var(--jx-space-16) * -1)' },
  // ── the dot row ──
  dots: { display: 'flex', justifyContent: 'center', gap: tokens['--jx-space-8'] },
  // ── one dot; the on state is the later atom (ground + border flip) ──
  dot: {
    appearance: 'none',
    width: '0.5rem',
    height: '0.5rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    cursor: 'pointer',
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '2px',
    },
  },
  dotOn: {
    borderColor: tokens['--jx-primary'],
    backgroundColor: tokens['--jx-primary'],
  },
});
