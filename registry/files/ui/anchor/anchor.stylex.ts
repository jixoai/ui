// anchor.stylex.ts — the anchor family's atom table (tailwindless
// one-shot Wave 1b batch A, 2026-09-17). Both halves of the DOM-
// delegated family share ONE table: the root rail (nav landmark) and
// the fragment link the items render.
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-24): the rail's hairline left spine over the family stack
// gap; the item's hit-lane geometry (min-height --jx-hit, the 2px
// active/transparent spine, the -1px overlap that eats the rail's
// hairline), the nav-label voice (uppercase, the 0.08em --track-wide
// step), and the color/border-color transition whose 150ms ease-out
// ride the promoted --motion-150/--motion-ease-out tokens.
//
// Law mapping (the tier-2 value rule): the 2px spine rides an equation
// over --jx-hairline (byte-exact, no step); hover/focus-visible ride
// native pseudos INSIDE the atoms (the pilot ruling); no css residue
// (the family keeps its zero-css posture).
//
// Mirror law: this file is byte-identical in registry/files/ui/anchor/
// and apps/www/src/lib/ui/anchor/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const anchorStyles = stylex.create({
  // ── the root rail ──
  rail: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-stack)',
    borderLeftWidth: tokens['--jx-hairline'],
    borderLeftStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },

  // ── the fragment link (AnchorItem) ──
  link: {
    marginInlineStart: 'calc(var(--jx-hairline) * -1)',
    display: 'flex',
    minHeight: 'var(--jx-hit)',
    alignItems: 'center',
    borderLeftWidth: 'calc(var(--jx-hairline) * 2)',
    borderLeftStyle: 'solid',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    textDecoration: 'none',
    transitionProperty: 'color, border-color',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
    ':hover': { color: tokens['--jx-foreground'] },
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },
  // the active pick: primary spine + foreground ink
  linkActive: {
    borderLeftColor: tokens['--jx-primary'],
    color: tokens['--jx-foreground'],
  },
  // the resting pick: transparent spine, muted ink
  linkIdle: {
    borderLeftColor: 'transparent',
    color: tokens['--jx-muted-foreground'],
  },
});
