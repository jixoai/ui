// tour.stylex.ts — the tour family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the hole
// (fixed, pointer-transparent; the anchor-size() geometry stays in
// tour.css — its @supports form re-sets inset/background, so NO
// inset or background member may ride the hole atom), the surface
// body column, the title/description/meta voices, the actions row,
// the skip affordance (dotted underline ghost), and the nav chip
// (the terminal chip + the Next variant's brand lean).
//
// Value law: theme-able slots ride tokens or var() seams — the
// 0.6875rem micro voice and 0.8125rem body ride the existing
// --text-label / --jx-text-base steps; the 0.1em tracking and 1.55
// leading ride promotion seams (reported); 0.875rem/1.5 offsets ride
// ruler equations (calc(var(--jx-unit) * N)). The D1-exempt geometry
// (the anchor-size() hole, the panel's anchor() placement + @supports
// fallback, ::backdrop) stays in tour.css.
//
// Mirror law: byte-identical in registry/files/ui/tour/ and
// apps/www/src/lib/ui/tour/ (cmp); '../../tokens.stylex' resolves in
// both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tourStyles = stylex.create({
  // ── the hole: target-sized by CSS anchor-size, ONE huge shadow
  //    tint — NO inset/background member (the css law) ──
  hole: {
    position: 'fixed',
    pointerEvents: 'none',
  },

  // ── the surface body column (fill rides the theme class) ──
  surfaceBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
    paddingInline: 'var(--space-16)',
    paddingBlock: 'calc(var(--jx-unit) * 3.5)',
  },

  // ── the voices ──
  title: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-base)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-10, 0.1em)',
    color: tokens['--jx-foreground'],
  },
  description: {
    margin: 0,
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-155, 1.55)',
    color: tokens['--jx-muted-foreground'],
  },
  meta: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--text-label)',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the actions row ──
  actions: {
    marginTop: 'var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-12)',
  },
  navRow: {
    display: 'flex',
    gap: 'var(--space-8)',
  },

  // ── the skip affordance: the dotted-underline ghost ──
  skip: {
    cursor: 'pointer',
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-10, 0.1em)',
    color: tokens['--jx-muted-foreground'],
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    ':hover': { color: tokens['--jx-foreground'] },
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },

  // ── the nav chip: the terminal chip + the Next variant's lean ──
  navBtn: {
    display: 'inline-flex',
    cursor: 'pointer',
    appearance: 'none',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: 'var(--space-6)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-10, 0.1em)',
    boxShadow: tokens['--jx-shadow-2xs'],
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
    },
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },
  navNext: {
    borderColor: tokens['--jx-primary'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-primary'],
  },
});
