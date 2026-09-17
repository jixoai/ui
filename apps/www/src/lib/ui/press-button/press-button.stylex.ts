// press-button.stylex.ts — the press-button family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload — the
// stylex-kernel corpus dogfood (apps/www/src/lib/__probe__/stylex-
// corpus/press-button.stylex.ts) graduated into the registry
// canonical, aligned with the shipping component's CURRENT surface
// (the semantic-injection seams --jx-fill/--jx-fill-ink/--jx-tonal/
// --jx-outline ride plain var() strings, the §4.2 idiom; the frame
// contributes geometry ONLY — every rung supplies all three paint
// channels itself, so no two same-property declarations meet in one
// atom join, the collision-free map law).
//
// Value notes (receipted):
//   - the 1px frame rides --jx-hairline;
//   - font-medium (500) has NO weight token — lane-2 css keyed on
//     [data-jx-press-button], reported MISSING (--jx-weight-medium);
//   - the press POSE customs (--jx-press-shadow*/--jx-press-move) are
//     custom-property seams — lane-2 css keyed on the ghost/flat data
//     hooks (the separator sheet's "press-physics vars land here"
//     law); ghost's none-trio and the flat pose strip/replace dance
//     the old string surgery performed is now pure css source order;
//   - the spinner frames' animation (800ms steps(1) + the 200/400/
//     600ms delays) is motion — lane-2 css keyed on .jx-press-spin-
//     frames i (the existing reduced-motion kill already targets that
//     selector unlayered and keeps winning);
//   - the forced-colors focus trio (2px Highlight, offset 2 — design
//     §6) rides nested media conditions; outlineWidth literals are
//     structural (not theme slots).
//
// Lane-2 residue (press-button.css): the effect-loop machinery
// (keyframes, @property, host-channel scenery — pre-existing) + the
// four rules above.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const pressButtonStyles = stylex.create({
  // ── the shared body (density-geometric; link rides it too) ──────
  base: {
    display: 'inline-flex',
    minHeight: 'var(--jx-hit)',
    alignItems: 'center',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    '@media (forced-colors: active)': {
      outlineWidth: '2px',
      outlineOffset: '2px',
      outlineColor: 'Highlight',
    },
  },
  // the square pose: one --jx-hit band, glyph centered
  baseSquare: {
    minWidth: 'var(--jx-hit)',
    justifyContent: 'center',
  },
  // the text pose: inline gap + inset padding
  baseText: {
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
  },
  // the frame (link opts out): geometry only — every rung paints itself
  frame: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
  },

  // ── the ladder ────────────────────────────────────────────────────
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
  outlineVar: {
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
  // ghost keeps the box geometry but presses without a shadow — the
  // none-trio pose customs live in press-button.css keyed on the
  // ghost data hook (custom-property seams never ride atoms)
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: tokens['--jx-foreground'],
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 8%, transparent)',
      color: 'var(--jx-tonal)',
    },
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
  // link: the interaction exception — no frame, no press shadow,
  // primary text, hover underline (the explicit none guards the
  // anchor's UA underline for the post-preflight world)
  link: {
    color: tokens['--jx-primary'],
    textDecorationLine: 'none',
    textDecorationThickness: 'from-font',
    textUnderlineOffset: '4px',
    ':hover': {
      textDecorationLine: 'underline',
    },
    '@media (forced-colors: active)': {
      color: 'LinkText',
    },
  },

  // ── the leading lane glyphs ───────────────────────────────────────
  spinner: {
    fontFamily: tokens['--jx-font-mono'],
    color: tokens['--jx-primary'],
  },
  spinnerFrames: {
    position: 'relative',
    display: 'inline-grid',
    width: '1ch',
    textAlign: 'center',
    verticalAlign: 'bottom',
  },
  spinnerFrame: {
    fontStyle: 'normal',
    gridRowStart: '1',
    gridColumnStart: '1',
  },
  frameVisible: { visibility: 'visible' },
  frameHidden: { visibility: 'hidden' },
  checkGlyph: {
    display: 'inline-flex',
    flex: 'none',
    alignItems: 'center',
    color: tokens['--jx-primary'],
  },
});
