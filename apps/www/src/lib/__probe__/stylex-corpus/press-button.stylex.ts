// press-button.stylex.ts — the corpus dogfood, press-button family
// (stylex-kernel phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/press-button/press-button.stylex.ts) — the press law +
// the variant ladder.
//
// THE PHASE-0 RE-AUTHORING (the load-bearing divergence, receipted):
// the spike expressed pose/hue opting through stylex.defineVars
// contracts + stylex.createTheme override classes (the "idiomatic
// StyleX replacement for TW arbitrary-property setters" the research
// measured). Phase 0's authoring law (design §4.2) sanctions EXACTLY
// ONE dynamic idiom — atoms consume var() seams, components compute
// the vars at runtime (inline style or scoped stamp, the D1-08
// degradation path); build-time theme classes are outside it. The
// four pose seams and four hue seams therefore ride ATOM FALLBACKS
// carrying the spike's own default values:
//
//     spike: boxShadow: 'var(--jx-press-shadow)'
//            (+ :root, .x… { --jx-press-shadow: var(--shadow-xs) … })
//     here:  boxShadow: 'var(--jx-press-shadow, var(--jx-shadow-xs))'
//
// Runtime semantics preserved (unset seam → the spike's default);
// compiled divergence = the fallback text + the absent defineVars /
// createTheme :root and override-class blocks (5 rules on the spike
// side with no counterpart here).
//
// Shorthand law: everything LONGHAND (background/border shorthands
// are compile errors under propertyValidationMode 'throw' — spike
// §5.3, unchanged). Theme refs ride the typed token layer.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

// the loading spinner's frame keyframes (the spin family's bracket
// cursor, inlined — registry items stay dependency-free)
const spinFrames = stylex.keyframes({
  '0%, 24%': { visibility: 'visible' },
  '25%, 100%': { visibility: 'hidden' },
});

export const pressButtonStyles = stylex.create({
  // ── the shared body (density-geometric) ───────────────────────────
  base: {
    display: 'inline-flex',
    minHeight: 'var(--jx-hit)',
    alignItems: 'center',
    fontFamily: tokens['--jx-font-sans'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    fontWeight: 500,
    boxSizing: 'border-box',
    // the press law (re-authored from .jx-press): owns the transition
    // chain; :active sorts after :hover by pseudo priority
    boxShadow: 'var(--jx-press-shadow, var(--jx-shadow-xs))',
    transition:
      'translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    ':hover': {
      boxShadow: 'var(--jx-press-shadow-hover, var(--jx-shadow-sm))',
    },
    ':active': {
      translate: 'var(--jx-press-move, 1px 1px)',
      boxShadow: 'var(--jx-press-shadow-active, var(--jx-shadow-sm-press))',
    },
    ':focus-visible': {
      outline: '2px solid Highlight',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  // the text pose: inline gap + inset padding
  textBody: {
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
  },
  // the square pose: one 42px band (--jx-hit square), glyph centered
  squareBody: {
    minWidth: 'var(--jx-hit)',
    justifyContent: 'center',
  },
  // the frame (link opts out): 1px solid — every rung supplies colors
  frame: {
    borderWidth: '1px',
    borderStyle: 'solid',
  },

  // ── the ladder ────────────────────────────────────────────────────
  fill: {
    backgroundColor: 'var(--jx-fill, var(--jx-primary))',
    borderColor: 'var(--jx-fill, var(--jx-primary))',
    color: 'var(--jx-fill-ink, var(--jx-primary-foreground))',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      borderColor: 'ButtonText',
      color: 'ButtonText',
    },
  },
  tonal: {
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal, var(--jx-primary)) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal, var(--jx-primary)) 45%, transparent)',
    color: 'var(--jx-tonal, var(--jx-primary))',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'var(--jx-outline, var(--jx-border))',
    color: tokens['--jx-foreground'],
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal, var(--jx-primary)) 8%, transparent)',
    },
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: tokens['--jx-foreground'],
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal, var(--jx-primary)) 8%, transparent)',
      color: 'var(--jx-tonal, var(--jx-primary))',
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

  // ── the flat corner tint (raised=false × :active): the carved face ──
  flatActiveTint: {
    ':active::before': {
      content: "''",
      position: 'absolute',
      inset: '-1px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: 'inherit',
      backgroundImage:
        'linear-gradient(to bottom right, color-mix(in oklab, var(--jx-engrave-shade) 55%, transparent), transparent 60%), linear-gradient(to top left, color-mix(in oklab, var(--jx-engrave-glow) 55%, transparent), transparent 60%)',
      maskImage: 'linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)',
      WebkitMaskImage: 'linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)',
      maskComposite: 'exclude',
      WebkitMaskComposite: 'xor',
      pointerEvents: 'none',
    },
  },
  flatHost: {
    position: 'relative',
  },

  // ── the leading lane glyphs ───────────────────────────────────────
  spinnerWrap: {
    display: 'inline-flex',
    alignItems: 'center',
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
    animationName: spinFrames,
    animationDuration: '800ms',
    animationTimingFunction: 'steps(1)',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  frameVisible: { visibility: 'visible' },
  frameHidden: { visibility: 'hidden' },
  delay200: { animationDelay: '200ms' },
  delay400: { animationDelay: '400ms' },
  delay600: { animationDelay: '600ms' },
  checkGlyph: {
    display: 'inline-flex',
    flex: 'none',
    alignItems: 'center',
    color: tokens['--jx-primary'],
  },
});
