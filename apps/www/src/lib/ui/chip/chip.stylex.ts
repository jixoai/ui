// chip.stylex.ts — the chip family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the variant-grammar ladder as the old component's
// utility strings spelled it (byte-aligned with press-button's landed
// map — the activation twin keeps the same recipes): fill (solid
// ground + same-hue border), tonal (12%/45% color-mix tint recipe),
// outline (structural --jx-outline border + 8% hover overlay, border
// unchanged), ghost (transparent frame, tonal hover, press shadows
// nulled through the --jx-press* seams the .jx-press law reads).
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens
// or var() seams ONLY — the badge-twin micro-label tracking (0.14em)
// has no sheet step yet and rides the promotion seam
// var(--track-14, 0.14em) (reported; the orchestrator promotes steps
// serially); geometry (display, box-sizing, max-width, the :has()
// padding-halving calc over --jx-inset) is structural. forced-colors
// degradation (design §6) rides nested @media blocks — the exact
// StyleX-expressible forms the probe corpus proved (press-button
// P0.6). The slot lanes' svg sizing is a DESCENDANT boundary —
// :where([data-icon='inline-*'] > svg) in chip.css (lane-2 residue;
// StyleX forbids descendant combinators).
//
// Mirror law: this file is byte-identical in registry/files/ui/chip/
// and apps/www/src/lib/ui/chip/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (the registry root
// carries the paired copy — separator's divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const chipStyles = stylex.create({
  // ── the badge-twin body (scale law 2026-09-01): height from
  // --jx-line-secondary, inline insets only, never block padding ──
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(var(--jx-gap) / 2)',
    boxSizing: 'border-box',
    maxWidth: '100%',
    paddingInline: 'var(--jx-inset)',
    // the data-icon law, badge dialect: a lane replaces its side's
    // padding — the inset halves when the valued hook is present
    ':has([data-icon="inline-start"])': {
      paddingLeft: 'calc(var(--jx-inset) / 2)',
    },
    ':has([data-icon="inline-end"])': {
      paddingRight: 'calc(var(--jx-inset) / 2)',
    },
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    letterSpacing: 'var(--track-14, 0.14em)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    // the §6 forced-colors focus ring: 2px Highlight, offset 2
    '@media (forced-colors: active)': {
      ':focus-visible': {
        outlineWidth: '2px',
        outlineOffset: '2px',
        outlineColor: 'Highlight',
      },
    },
  },
  // ── silhouette: pill rounds fully; square keeps the site radius ──
  pill: { borderRadius: 'calc(infinity * 1px)' },
  square: { borderRadius: tokens['--jx-radius'] },
  // ── the bordered, shadow-bearing frame (ghost owns its own) ──
  frame: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
  },

  // ── the ladder ──────────────────────────────────────────────────
  fill: {
    backgroundColor: 'var(--jx-fill)',
    borderColor: 'var(--jx-fill)',
    color: 'var(--jx-fill-ink)',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      borderColor: 'ButtonText',
      color: 'ButtonText',
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
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 8%, transparent)',
    },
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  // ghost keeps the box geometry (hairline transparent border) but
  // presses without a shadow; hover derives entirely from --jx-tonal
  ghost: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: tokens['--jx-foreground'],
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 8%, transparent)',
      color: 'var(--jx-tonal)',
    },
    // the pose opting the .jx-press law reads: all three shadows none
    '--jx-press-shadow': 'none',
    '--jx-press-shadow-hover': 'none',
    '--jx-press-shadow-active': 'none',
    '@media (forced-colors: active)': {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: 'CanvasText',
      ':hover': {
        backgroundColor: 'ButtonFace',
        color: 'ButtonText',
      },
    },
  },

  // ── the slot lanes (svg sizing rides chip.css — descendant rule) ──
  slotStart: { display: 'inline-flex' },
  slotEnd: { display: 'inline-flex' },
});
