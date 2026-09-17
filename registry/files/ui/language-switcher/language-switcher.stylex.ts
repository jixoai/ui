// language-switcher.stylex.ts — the language-switcher family's atom
// table (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the component's former utility strings re-authored
// as static stylex atoms (the separator law). The bezel's currentColor
// color-mix paint rides atoms verbatim (channel formulas, no literal
// theme slots); the interactive poses (hover, the color transitions)
// and the medium weight live as native pseudos in
// language-switcher.css keyed on the family's data hooks.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - gap-2/1.5, px-2.5, py-1/1.5, p-1 → --jx-space-8/6/10/4/6/4 —
//     EXACT step arithmetic (4px unit ladder).
//   - text-xs (12px) → --jx-text-label-lg (12px) — EXACT.
//   - font-medium (500) → NO weight token; rides the lane-2 css rule
//     (reported as the --jx-weight-medium promotion candidate).
//   - border (1px) → borderWidth var(--hairline) + explicit
//     borderStyle solid (no preflight — the separator divergence #2).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const langStyles = stylex.create({
  // ── the root: icon + control row at one space-8 gap ──
  root: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-8'] },
  iconLane: { display: 'inline-flex', opacity: 0.7 },

  // ── the bezel chrome (shared by the pair group and the menu
  // button): currentColor color-mix ground + border over the dark
  // terminal bezel (the theme-toggle twin law) ──
  bezel: {
    display: 'inline-flex',
    width: 'fit-content',
    maxWidth: '100%',
    overflow: 'hidden',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, currentColor 30%, transparent)',
    backgroundColor: 'color-mix(in oklab, currentColor 6%, transparent)',
  },
  bezelButton: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: tokens['--jx-space-6'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, currentColor 30%, transparent)',
    backgroundColor: 'color-mix(in oklab, currentColor 6%, transparent)',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label-lg'],
    color: 'color-mix(in oklab, currentColor 72%, transparent)',
  },

  // ── the pair segment item ──
  segItem: {
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label-lg'],
    textDecorationLine: 'none',
  },
  segActive: {
    backgroundColor: tokens['--jx-primary'],
    color: tokens['--jx-primary-foreground'],
  },
  segIdle: { color: 'color-mix(in oklab, currentColor 72%, transparent)' },

  // ── the chevron lane: flips with the open state ──
  chevron: { display: 'inline-flex' },
  chevronOpen: { transform: 'rotate(180deg)' },

  // ── the menu panel: terminal ground popover ──
  menu: {
    margin: 0,
    minWidth: '9rem',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    padding: tokens['--jx-space-4'],
    color: tokens['--jx-terminal-foreground'],
    boxShadow: tokens['--jx-shadow'],
  },
  menuList: { margin: 0, listStyleType: 'none', padding: 0 },
  menuItem: {
    display: 'block',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-label-lg'],
    textDecorationLine: 'none',
  },
  menuActive: { color: tokens['--jx-primary'] },
  menuIdle: { color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)' },
});
