// press-button.styles.ts — the press law + the variant ladder,
// re-authored in StyleX.
//
// Source intent (registry/files/ui/press-button + jixoai.css .jx-press):
//   - press physics: hover grows ONLY the shadow; active presses the
//     body +1px (translate) while the shadow's offsets counter-shrink
//     (the *-press poses) — the shadow paint stays anchored;
//   - pose opting through FOUR custom-property seams (--jx-press-shadow/
//     -hover/-active/--jx-press-move) — re-expressed here as a
//     defineVars CONTRACT with createTheme override classes (the
//     idiomatic StyleX replacement for TW arbitrary-property setters
//     like [--jx-press-shadow:none]);
//   - the variant ladder (fill/tonal/outline/ghost/link) supplies all
//     paint channels itself — no two same-property utilities meet;
//   - semantic hue = INJECTION through --jx-fill/--jx-fill-ink/
//     --jx-tonal/--jx-outline, never a variant;
//   - forced-colors degradations per rung; focus 2px Highlight in fc.
//
// Shorthand law: everything LONGHAND (background/border shorthands are
// compile errors under propertyValidationMode 'throw' — spike §5.3).
import * as stylex from '@stylexjs/stylex';

// ── the pose contract: four seams, convex defaults ─────────────────
export const pressPoseVars = stylex.defineVars({
  '--jx-press-shadow': 'var(--shadow-xs)',
  '--jx-press-shadow-hover': 'var(--shadow-sm)',
  '--jx-press-shadow-active': 'var(--shadow-sm-press)',
  '--jx-press-move': '1px 1px',
});

// flat texture (raised={false}): no shadows, engrave-tier inset alone,
// body never moves
export const flatPose = stylex.createTheme(pressPoseVars, {
  '--jx-press-shadow': 'none',
  '--jx-press-shadow-hover': 'none',
  '--jx-press-shadow-active': 'var(--shadow-engrave)',
  '--jx-press-move': 'none',
});

// ghost's none-trio (keeps the bare +1px press)
export const ghostPose = stylex.createTheme(pressPoseVars, {
  '--jx-press-shadow': 'none',
  '--jx-press-shadow-hover': 'none',
  '--jx-press-shadow-active': 'none',
});

// ── the hue contract: injection slots with theme-token defaults ────
export const hueVars = stylex.defineVars({
  '--jx-fill': 'var(--primary)',
  '--jx-fill-ink': 'var(--primary-foreground)',
  '--jx-tonal': 'var(--primary)',
  '--jx-outline': 'var(--border)',
});

// jx-pair-destructive: fill WITH its ink, ONE class
export const destructivePair = stylex.createTheme(hueVars, {
  '--jx-fill': 'var(--destructive)',
  '--jx-fill-ink': 'var(--destructive-foreground)',
});

// jx-hue-success (the copied transient's tonal)
export const successHue = stylex.createTheme(hueVars, {
  '--jx-tonal': 'var(--success)',
});

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
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    fontWeight: 500,
    boxSizing: 'border-box',
    // the press law (re-authored from .jx-press): owns the transition
    // chain; :active sorts after :hover by pseudo priority
    boxShadow: 'var(--jx-press-shadow)',
    transition:
      'translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    ':hover': {
      boxShadow: 'var(--jx-press-shadow-hover)',
    },
    ':active': {
      translate: 'var(--jx-press-move)',
      boxShadow: 'var(--jx-press-shadow-active)',
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
    color: 'var(--foreground)',
    ':hover': {
      backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 8%, transparent)',
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
    color: 'var(--foreground)',
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
  link: {
    color: 'var(--primary)',
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
    fontFamily: 'var(--font-mono)',
    color: 'var(--primary)',
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
    color: 'var(--primary)',
  },
});
