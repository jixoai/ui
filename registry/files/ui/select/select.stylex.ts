// select.stylex.ts — the select family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the component's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-inset/--jx-gap/--jx-hit/--jx-icon/
// --jx-text/--jx-leading/--jx-leading-secondary), the theme scale
// through the typed tokens.
//
// Lane split (the placement law): the trigger/option/chevron state
// machines (hover, focus-visible, disabled, the well ladder) already
// live UNLAYERED in select.css (the Part A carve-out — the stylex
// tiers nest under components, so overriding the family's own atom
// paint requires the unlayered level); the row transitions and the
// open chevron's transform transition join them there. Markup-known
// states (active/selected/disabled rows, the open flip, the
// placeholder ink) are JS conditionals over atom groups here.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - py-1/px (4px) steps → --jx-space-4 — EXACT.
//   - text-[11px] → --jx-text-label (11px) — EXACT.
//   - leading-[1.4] → var(--jx-leading-secondary) (density secondary
//     leading = 14/10 = 1.4) — EXACT channel.
//   - border-s-2 (2px) → calc(var(--jx-unit) / 2) — the unit channel's
//     half step, EXACT pixels.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const selectStyles = stylex.create({
  // ── the faceless form bridge: box-tree transparent ──
  bridge: { display: 'contents' },

  // ── the trigger wrap: anchor-name carrier ──
  wrap: { position: 'relative', display: 'block', width: '100%', maxWidth: '100%' },

  // ── the trigger: flex row over the jx-html-input control law ──
  trigger: {
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 'var(--jx-inset)',
    textAlign: 'start',
    cursor: 'pointer',
  },

  // ── the value lane: ellipsized single line (placeholder dims) ──
  value: {
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  valuePlaceholder: { color: tokens['--jx-muted-foreground'] },

  // ── the chevron lane: icon-sized mask glyph (paint in select.css) ──
  chevron: {
    flex: 'none',
    width: 'var(--jx-icon)',
    height: 'var(--jx-icon)',
    pointerEvents: 'none',
    color: tokens['--jx-muted-foreground'],
  },
  chevronOpen: { transform: 'rotate(180deg)' },

  // ── the scroll ring: capped run with a stable gutter and the
  // scrollbar-aware 4px inline floor ──
  scroll: {
    maxHeight: '60vh',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: tokens['--jx-space-4'],
    paddingInline: 'max(4px - var(--jx-scrollbar-thin, 0px), 0px)',
  },

  // ── the listbox: list reset ──
  list: { margin: 0, padding: 0, listStyleType: 'none' },

  // ── the option row: two-line stack at hit height, the LOGICAL 2px
  // start edge (transparent at rest, primary on selection) ──
  option: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-gap)',
    minBlockSize: 'var(--jx-hit)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-leading)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    cursor: 'pointer',
    borderInlineStartWidth: 'calc(var(--jx-unit) / 2)',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'transparent',
  },
  // active + selected rows: hover-tier fill, full terminal ink
  rowActive: {
    backgroundColor: tokens['--jx-terminal-hover'],
    color: tokens['--jx-terminal-foreground'],
  },
  // the selected row's primary edge line
  rowSelectedEdge: { borderInlineStartColor: tokens['--jx-primary'] },
  rowDisabled: { opacity: 0.5, pointerEvents: 'none' },

  // ── the row's two voices ──
  optionLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  optionDesc: {
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'var(--jx-leading-secondary)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },
});
