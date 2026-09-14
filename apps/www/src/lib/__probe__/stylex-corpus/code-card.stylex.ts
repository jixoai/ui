// code-card.stylex.ts — the corpus dogfood, code-card family
// (stylex-kernel phase 0, P0.6).
//
// Source of record: the research spike's re-authoring
// (archive/2026-09-13-stylex-kernel-research/spike/corpus/src/
// families/code-card/code-card.stylex.ts) — this module re-authors
// the SAME atom surface under the phase-0 authoring law (design §4):
//   - static longhand atoms ONLY (propertyValidationMode:'throw'
//     rides the real pipeline — no factory calls, no vars-keys, no
//     shorthands);
//   - THEME references ride the typed token layer (design §2/§4.1):
//     whole-value refs are `tokens['--jx-…']` members; refs embedded
//     in composite values name the typed layer's var literally
//     (`var(--jx-ring)` inside the outline shorthand-free longhand);
//   - component seams (--readonly-code-*, --tok-*) and kernel
//     channels (--jx-scrollbar-thin) stay plain `var()` strings —
//     the §4.2 CSS-var binding idiom (components compute them at
//     runtime; the D1-08-proven degradation path).
//
// Divergences vs the spike artifact (all designed, receipted in
// research/p0-dogfood-receipt.md): every theme var(--x) the spike
// emitted compiles here as var(--jx-x) — the typed indirection the
// phase-0 token layer introduces; resolution is the tokens :root
// block (P0.3b live-probe chain).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

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
    fontFamily: tokens['--jx-font-nav'],
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
    fontFamily: tokens['--jx-font-mono'],
    fontSize: '12.5px',
    lineHeight: 1.6,
    color: 'var(--tok-foreground, var(--jx-foreground))',
    overflowX: 'auto',
    overflowY: 'visible',
    overscrollBehaviorX: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: '0.875rem',
    paddingInline: 'max(0.875rem - var(--jx-scrollbar-thin, 0px), 0px)',
    tabSize: 4,
    ':focus-visible': {
      outline: '2px solid var(--jx-ring)',
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
