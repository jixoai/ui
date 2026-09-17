// popconfirm.stylex.ts — the popconfirm family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the anchor
// wrapper lane, the anchored panel geometry (position-try fallbacks,
// anchors-visible, the 8px gap margin), the surface body column, the
// title/description voices, the action row, and the two buttons
// (the shared control body + the destructive/primary confirm tones).
//
// Value law: theme-able slots ride tokens or var() seams — the
// density channels (--jx-gap/--jx-inset/--jx-stack/--jx-hit/--jx-text/
// --jx-line) ride plain var() strings as before; 12px title text and
// 0.08em tracking ride the existing --text-label-lg / --track-wide
// steps; 13px body rides --jx-text-base (kernel channel); the 0.1em
// button tracking and the 1.5 description leading have no sheet steps
// yet (promotion seams, reported). The panel atom sets NO display
// (the closed-popover display:none law, Codex r1); the ::backdrop
// and the @supports no-anchor fallback stay in popconfirm.css.
//
// Mirror law: byte-identical in registry/files/ui/popconfirm/ and
// apps/www/src/lib/ui/popconfirm/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const pcStyles = stylex.create({
  // ── the anchor wrapper (the trigger lane's host) ──
  anchor: { display: 'inline-flex' },

  // ── the anchored panel (NO display member — the UA sheet's
  //    closed-popover display:none must survive) ──
  panel: {
    position: 'fixed',
    margin: 'var(--jx-pc-gap, 8px)',
    positionTryFallbacks: 'flip-block, flip-inline',
    positionTry: 'flip-block, flip-inline',
    positionVisibility: 'anchors-visible',
    width: 'fit-content',
    maxWidth: 'min(88vw, 18rem)',
    color: tokens['--jx-popover-foreground'],
  },

  // ── the surface body column (fill + border ride the theme class) ──
  surfaceBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-stack)',
  },

  // ── the voices ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
  },
  description: {
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-15, 1.5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the action row ──
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-8)',
  },

  // ── the buttons: the shared control body ──
  button: {
    minHeight: 'var(--jx-hit)',
    appearance: 'none',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    letterSpacing: 'var(--track-10, 0.1em)',
    textTransform: 'uppercase',
    cursor: 'pointer',
    boxShadow: tokens['--jx-shadow-xs'],
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },
  // the confirm tones: destructive is the loud default, primary opt-in
  buttonDestructive: {
    borderColor: tokens['--jx-destructive'],
    backgroundColor: tokens['--jx-destructive'],
    color: tokens['--jx-destructive-foreground'],
  },
  buttonPrimary: {
    borderColor: tokens['--jx-primary'],
    color: tokens['--jx-primary'],
  },
});
