// badge.stylex.ts — the badge family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old span authored (tw4,
// 2026-08-24): the kbd-law geometry (height from --jx-line-secondary,
// inline insets only, never block padding), the three-rung variant
// ladder over the global hue slots, the conditional has() padding
// halving (ONLY beside a label — an icon-only badge keeps the
// symmetric inset, the tabs-trigger guard F-6), and the §6
// forced-colors degradation (Canvas ground + CanvasText ink and
// border on EVERY rung — the badge dialect; the chip's activation
// twins differ).
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens
// or kernel channels — the 0.14em micro-label tracking now rides the
// PROMOTED step var(--track-14) (W1's ladder; chip's seam form predates
// the promotion), the corner rides --jx-radius, the hairline frame
// rides --jx-hairline. Geometry (display, box-sizing, max-width, the
// :has() padding-halving calc over --jx-inset) is structural. The
// slot lanes' svg sizing is a DESCENDANT boundary — :where([data-
// icon='inline-*'] > svg) in badge.css (lane-2; StyleX forbids
// descendant combinators).
//
// Mirror law: this file is byte-identical in registry/files/ui/badge/
// and apps/www/src/lib/ui/badge/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const badgeStyles = stylex.create({
  // ── the kbd-law body: height from the secondary line, inline
  // insets only, never block padding ──
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--jx-gap) / 2)',
    boxSizing: 'border-box',
    maxWidth: '100%',
    paddingInline: 'var(--jx-inset)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    letterSpacing: 'var(--track-14)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    forcedColorAdjust: 'auto',
  },
  // ── silhouette: square keeps the site radius; pill rounds fully ──
  square: { borderRadius: tokens['--jx-radius'] },
  pill: { borderRadius: 'calc(infinity * 1px)' },
  // ── the slot-vs-padding law (tabs-trigger dialect, F-6): an icon
  // lane replaces its side's label inset — ONLY beside a label. The
  // atom is joined CONDITIONALLY on children (an icon-only badge
  // keeps the symmetric padding so the glyph centers) ──
  slotLanes: {
    ':has([data-icon="inline-start"])': {
      paddingLeft: 'calc(var(--jx-inset) / 2)',
    },
    ':has([data-icon="inline-end"])': {
      paddingRight: 'calc(var(--jx-inset) / 2)',
    },
  },

  // ── the ladder (each rung the sole bg/border-color/color source) ──
  fill: {
    backgroundColor: 'var(--jx-fill)',
    borderColor: 'var(--jx-fill)',
    color: 'var(--jx-fill-ink)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  tonal: {
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)',
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'var(--jx-outline)',
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },

  // ── the slot lanes (svg sizing rides badge.css — descendant rule) ──
  slotStart: { display: 'inline-flex' },
  slotEnd: { display: 'inline-flex' },
});
