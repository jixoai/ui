// code-card.styles.ts — the readonly code surface, StyleX side.
//
// Source intent: card frame (muted-mix ground, hairline border), head
// (meta-tint band, filename + uppercase lang label), the <pre> AS the
// scrollport (horizontal always; vertical under maxHeight caps; the
// scrollbar-gutter compensation recipe), the veil host (edge fades
// gated on live scroll state — subtraction ink, backdrop contrast),
// foot band with the copy control. fill mode stretches the card and
// hands the whole body height to the pre.
//
// The veils' data-flag gating re-expresses as CONDITIONAL CLASSES from
// JS state (the state→class tax — the css attr-presence selector
// [data-hscroll-start] is not a StyleX construct).
// print: the print-whitelist behavior (display/overflow/maxHeight)
// rides '@media print' conditions — expressible.
import * as stylex from '@stylexjs/stylex';

export const codeCardStyles = stylex.create({
  card: {
    margin: 0,
    minWidth: 0,
    backgroundColor: 'var(--readonly-code-bg)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--readonly-code-border)',
    display: 'flex',
    flexDirection: 'column',
    '@media print': {
      display: 'none',
    },
  },
  cardFill: {
    height: '100%',
  },
  // NOTE (D5 finding, 0.19.0): FACTORY keys in camelCase
  // (maxHeight/minHeight) mint a mismatched custom property — the
  // babel rule references var(--x-maxHeight) (camel) while the
  // runtime inline lands --x-max-height (kebab, Svelte's style-object
  // serialization) — the value never reaches the rule. Both knobs
  // therefore ride the INLINE lane (the source's own form:
  // `style="max-height:…"`). Single-word factory keys (width/height,
  // the icon family) DO work end-to-end.

  // ── the head band ────────────────────────────────────────────────
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: 0,
    paddingInline: '0.75rem',
    paddingBlock: '0.32rem',
    fontSize: '11px',
    letterSpacing: '0.08em',
    backgroundColor: 'var(--readonly-code-meta-bg)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--readonly-code-border)',
    color: 'var(--readonly-code-meta-fg)',
  },
  file: {
    fontFamily: 'var(--font-nav)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  side: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    minWidth: 0,
  },
  lang: {
    letterSpacing: '0.14em',
    opacity: 0.75,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  // ── the veil host (never scrolls itself) ──────────────────────────
  scrollWrap: {
    position: 'relative',
    minWidth: 0,
  },
  scrollWrapFill: {
    display: 'flex',
    flex: '1',
    minHeight: 0,
    flexDirection: 'column',
  },

  // ── the pre: THE scrollport ──────────────────────────────────────
  pre: {
    margin: 0,
    fontFamily: 'var(--font-mono)',
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: 'var(--tok-foreground, var(--foreground))',
    overflowX: 'auto',
    overflowY: 'visible',
    overscrollBehaviorX: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: '0.875rem',
    paddingInline: 'max(0.875rem - var(--jx-scrollbar-thin, 0px), 0px)',
    tabSize: 4,
    ':focus-visible': {
      outline: '2px solid var(--ring)',
      outlineOffset: '-2px',
    },
    '@media print': {
      overflow: 'visible',
    },
  },
  vscroll: {
    overflowY: 'auto',
  },
  preFill: {
    flex: '1',
    minHeight: 0,
    overflowY: 'auto',
  },

  // ── the veils: subtraction-ink edge fades, gated by scroll state ──
  veilStart: {
    '::before': {
      content: "''",
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: 0,
      inlineSize: '1.75rem',
      pointerEvents: 'none',
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: '150ms',
      transitionTimingFunction: 'ease-out',
      backdropFilter: 'contrast(0.5)',
      WebkitBackdropFilter: 'contrast(0.5)',
      backgroundImage: 'linear-gradient(to right, rgb(0, 0, 0), transparent)',
      maskImage: 'linear-gradient(to right, rgb(0, 0, 0), transparent)',
      WebkitMaskImage: 'linear-gradient(to right, rgb(0, 0, 0), transparent)',
    },
  },
  veilEnd: {
    '::after': {
      content: "''",
      position: 'absolute',
      insetBlock: 0,
      insetInlineEnd: 0,
      inlineSize: '1.75rem',
      pointerEvents: 'none',
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: '150ms',
      transitionTimingFunction: 'ease-out',
      backdropFilter: 'contrast(0.5)',
      WebkitBackdropFilter: 'contrast(0.5)',
      backgroundImage: 'linear-gradient(to left, rgb(0, 0, 0), transparent)',
      maskImage: 'linear-gradient(to left, rgb(0, 0, 0), transparent)',
      WebkitMaskImage: 'linear-gradient(to left, rgb(0, 0, 0), transparent)',
    },
  },
  veilStartOn: {
    '::before': {
      opacity: 1,
    },
  },
  veilEndOn: {
    '::after': {
      opacity: 1,
    },
  },
  veilReducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      '::before': { transitionDuration: '0ms' },
      '::after': { transitionDuration: '0ms' },
    },
  },

  // ── the foot band ────────────────────────────────────────────────
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    minHeight: '2.1rem',
    paddingTop: '0.3rem',
    paddingBottom: '0.3rem',
    paddingInlineStart: '0.75rem',
    paddingInlineEnd: '0.5rem',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--readonly-code-border)',
  },
  footSide: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
});
