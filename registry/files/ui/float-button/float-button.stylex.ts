// float-button.stylex.ts — the float-button family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the press-law
// body at float scale (hit lanes, popover ground, site radius, the
// --jx-press-shadow* customs re-pointed to the --shadow family,
// primary hover ink, the focus ring), the fixed corner map (the top
// corners' 5.5rem clears the sticky bar — structural geometry), the
// menu stack column, and the menu body's 4px inset.
//
// Value law: theme-able slots ride tokens — the corner 5-step rides
// --space-20, the stack gap --space-8, the body inset --space-4; the
// 5.5rem top offset and the z-index 80 are structural literals (the
// sticky-bar clearance and the float layer are geometry, not theme).
// The MENU panel law (anchor geometry, position-try fallbacks, the
// transparent ::backdrop) stays in float-button.css (lane-2 residue).
//
// Mirror law: byte-identical in registry/files/ui/float-button/ and
// apps/www/src/lib/ui/float-button/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const fabStyles = stylex.create({
  // ── the press-law body at float scale ──
  body: {
    display: 'inline-flex',
    minHeight: 'var(--jx-hit)',
    minWidth: 'var(--jx-hit)',
    appearance: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens['--jx-radius'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-popover'],
    color: tokens['--jx-popover-foreground'],
    cursor: 'pointer',
    // the pose opting the .jx-press law reads: rest on --shadow, hover
    // grows to --shadow-md, active presses on --shadow-md-press
    '--jx-press-shadow': 'var(--shadow)',
    '--jx-press-shadow-hover': 'var(--shadow-md)',
    '--jx-press-shadow-active': 'var(--shadow-md-press)',
    ':hover': {
      borderColor: tokens['--jx-primary'],
      color: tokens['--jx-primary'],
    },
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },

  // ── the fixed stack (menu idiom): corner-pinned column ──
  stack: {
    position: 'fixed',
    zIndex: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-8)',
  },
  // the menu button swaps fixed for static (the stack carries the pin)
  stackButton: {
    position: 'static',
    zIndex: 80,
  },
  // the plain button IS the fixed corner
  fixedButton: {
    position: 'fixed',
    zIndex: 80,
  },

  // ── the corner map (top corners clear the sticky bar: 5.5rem) ──
  bottomRight: {
    bottom: 'var(--space-20)',
    right: 'var(--space-20)',
  },
  bottomLeft: {
    bottom: 'var(--space-20)',
    left: 'var(--space-20)',
  },
  topRight: {
    top: '5.5rem',
    right: 'var(--space-20)',
  },
  topLeft: {
    top: '5.5rem',
    left: 'var(--space-20)',
  },

  // ── the menu body's 4px inset (the surface body paints the panel) ──
  menuBody: { padding: 'var(--space-4)' },
});
