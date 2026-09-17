// mermaid.stylex.ts — the mermaid family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the figure
// frame (readonly-code ground/border over the jx-mermaid hook), the
// caption band, the error strip, the footer rail, the copy control
// (press customs + the copied surface swap), the zoom chip, and the
// icon lanes. The readonly-code-* values ride the css-scoped tokens
// exactly as the utilities did (plain var() strings — the tokens are
// DEFINED in mermaid.css, not the theme sheet).
//
// Value law: theme-able slots ride tokens or var() seams — 11px rides
// --text-label, 0.08em rides --track-wide (typed); the 0.04em
// trackings, the medium weight, and the off-step one-off insets
// (0.32/0.6/0.4rem, 2.1rem, 0.3rem) ride promotion seams / ruler
// equations (reported where a step is missing). The veil chain, the
// viewport pan law, the floor pre dialect, the fade keyframe, and
// the copied-state svg sizing stay in mermaid.css (lane-2: descendant
// + @supports + @keyframes).
//
// Mirror law: byte-identical in registry/files/ui/mermaid/ and
// apps/www/src/lib/ui/mermaid/ (cmp); '../../tokens.stylex' resolves
// in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const mermaidStyles = stylex.create({
  // ── the figure frame ──
  figure: {
    margin: 0,
    minWidth: 0,
    backgroundColor: 'var(--readonly-code-bg)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'var(--readonly-code-border)',
  },

  // ── the caption band ──
  caption: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-12)',
    minWidth: 0,
    paddingInline: 'var(--space-12)',
    paddingBlock: 'calc(var(--jx-unit) * 1.28)',
    fontSize: 'var(--text-label)',
    letterSpacing: tokens['--jx-track-wide'],
    backgroundColor: 'var(--readonly-code-meta-bg)',
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--readonly-code-border)',
    color: 'var(--readonly-code-meta-fg)',
  },
  captionFile: {
    fontFamily: tokens['--jx-font-nav'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // ── the error summary strip ──
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    minWidth: 0,
    paddingInline: 'var(--space-12)',
    paddingBlock: 'calc(var(--jx-unit) * 1.28)',
    fontSize: 'var(--text-label)',
    letterSpacing: 'var(--track-04, 0.04em)',
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--readonly-code-border)',
    color: 'var(--error)',
  },
  errorLabel: { whiteSpace: 'nowrap' },
  errorDiagnostic: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    opacity: 0.8,
  },

  // ── the footer rail ──
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-12)',
    minHeight: '2.1rem',
    paddingBlockStart: 'calc(var(--jx-unit) * 1.2)',
    paddingInlineEnd: 'var(--space-8)',
    paddingBlockEnd: 'calc(var(--jx-unit) * 1.2)',
    paddingInlineStart: 'var(--space-12)',
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: 'var(--readonly-code-border)',
  },
  footLead: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },

  // ── the copy control (press customs + the copied swap) ──
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--jx-unit) * 1.6)',
    backgroundColor: tokens['--jx-background'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-foreground'],
    cursor: 'pointer',
    fontSize: 'var(--text-label)',
    fontWeight: 'var(--weight-medium, 500)',
    letterSpacing: 'var(--track-04, 0.04em)',
    paddingInline: 'calc(var(--jx-unit) * 2.4)',
    paddingBlock: 'var(--space-4)',
    whiteSpace: 'nowrap',
    '--jx-press-shadow': 'var(--shadow-2xs)',
    '--jx-press-shadow-hover': 'var(--shadow-xs)',
    '--jx-press-shadow-active': 'var(--shadow-xs-press)',
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
    },
  },
  copyBtnCopied: {
    backgroundColor: tokens['--jx-secondary'],
    color: tokens['--jx-secondary-foreground'],
    ':hover': {
      backgroundColor: tokens['--jx-secondary'],
    },
  },

  // ── the zoom chip ──
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-6)',
  },
  zoomBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: tokens['--jx-background'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-foreground'],
    cursor: 'pointer',
    padding: 'calc(var(--jx-unit) * 1.28)',
    '--jx-press-shadow': 'var(--shadow-2xs)',
    '--jx-press-shadow-hover': 'var(--shadow-xs)',
    '--jx-press-shadow-active': 'var(--shadow-xs-press)',
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
    },
  },

  // ── the icon lanes (svg sizing rides mermaid.css — descendants) ──
  iconLane: { display: 'inline-flex' },
});
