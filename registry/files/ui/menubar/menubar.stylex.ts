// menubar.stylex.ts — the menubar family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the family's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — density kernel lanes as
// PLAIN var() strings, the theme scale through the typed tokens.
//
// Lane split (the placement law): the INTERACTIVE poses (hover,
// focus-visible rings, the color transitions) live as NATIVE pseudos
// in menubar.css keyed on the family's semantic hooks — never JS
// data-attrs; the open-state paint is JS-known here as the
// triggerOpen atom group.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.1em] → --jx-track-wide (0.08em) — nearest EXISTING
//     step (reported).
//   - border / border-r border-border → borderWidth var(--hairline)
//     + explicit borderStyle solid (no preflight — the separator
//     divergence #2 law).
//   - p-1 (4px) → --jx-space-4 — EXACT (the unit step).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const menubarStyles = stylex.create({
  // ── the bar: wrapping row of items, hairline card shell ──
  bar: {
    display: 'flex',
    width: 'fit-content',
    listStyleType: 'none',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: 0,
    margin: 0,
    boxShadow: tokens['--jx-shadow-2xs'],
  },

  // ── the trigger: transparent nav-cased label (hover/focus/transition
  // are native pseudos in menubar.css; the open pose is triggerOpen) ──
  trigger: {
    cursor: 'pointer',
    borderRightWidth: 'var(--hairline)',
    borderRightStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
    fontFamily: tokens['--jx-font-nav'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-muted-foreground'],
  },
  // the JS-known open state: muted ground, full ink (matches the
  // hover pose — an open trigger reads as hovered)
  triggerOpen: {
    backgroundColor: tokens['--jx-muted'],
    color: tokens['--jx-foreground'],
  },

  // ── the panel menu item: full-bleed inherit-ink row (hover/focus
  // pseudos in menubar.css) ──
  menuItem: {
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'start',
    fontFamily: tokens['--jx-font-sans'],
    color: 'inherit',
    textDecorationLine: 'none',
  },

  // ── the panel body: one unit of inner padding ──
  panelBody: {
    padding: tokens['--jx-space-4'],
  },

  // ── the item's anchor slot span ──
  slot: {
    display: 'inline-flex',
  },
});
