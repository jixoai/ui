// popover.stylex.ts — the corpus dogfood, popover family
// (stylex-kernel phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/popover/popover.stylex.ts) — trigger button paint,
// caret, surface shadow/body/scroll ring, all static longhand atoms.
//
// Law mapping (design §4): theme refs ride the typed token layer
// (whole-value members; embedded refs name --jx-* literally — e.g.
// the acrylic mix's var(--jx-popover)); the surface-translate and
// popover-pad seams and the --jx-scrollbar-thin kernel channel stay
// plain var() strings (§4.2 CSS-var bindings).
//
// Divergences vs the spike artifact (receipted): theme var indirection
// only — var(--border)→var(--jx-border) etc., resolved by the tokens
// :root block.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const popoverStyles = stylex.create({
  anchor: {
    display: 'inline-flex',
  },
  // ── the default trigger: bordered press button ────────────────────
  trigger: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '0.625rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: '0.875rem',
    paddingBlock: '0.625rem',
    fontFamily: tokens['--jx-font-sans'],
    fontSize: '0.875rem',
    fontWeight: 500,
    color: tokens['--jx-foreground'],
    // the press law (pose vars default to the source's explicit
    // xs/sm/sm-press carriers)
    boxShadow: tokens['--jx-shadow-xs'],
    transition:
      'translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
      boxShadow: tokens['--jx-shadow-sm'],
    },
    ':active': {
      translate: '1px 1px',
      boxShadow: tokens['--jx-shadow-sm-press'],
    },
    ':focus-visible': {
      outline: '2px solid Highlight',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  caret: {
    display: 'inline-flex',
    flex: 'none',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-out',
  },

  // ── the surface (children of the platform panel element) ──────────
  shadow: {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundColor: 'var(--jx-surface-shadow, oklch(1 0 0 / 0.32))',
    backdropFilter: 'brightness(0.5) blur(8px) contrast(2)',
    WebkitBackdropFilter: 'brightness(0.5) blur(8px) contrast(2)',
    translate: 'var(--jx-surface-ox, 6px) var(--jx-surface-oy, 6px)',
  },
  body: {
    position: 'relative',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-popover'],
  },
  bodyAcrylic: {
    backgroundColor: 'color-mix(in oklab, var(--jx-popover) 72%, transparent)',
    backdropFilter: 'blur(14px) saturate(1) brightness(2)',
    WebkitBackdropFilter: 'blur(14px) saturate(1) brightness(2)',
    // auto = acrylic UNLESS reduced transparency — then exactly solid
    '@media (prefers-reduced-transparency: reduce)': {
      backgroundColor: tokens['--jx-popover'],
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
  },
  // the scroll+padding ring: overflow + padding live INSIDE the body
  scroll: {
    maxHeight: '72vh',
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',
    padding: 'var(--jx-pop-pad, 12px 14px)',
    paddingInline: 'max(var(--jx-pop-pad-inline, 14px) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
});
