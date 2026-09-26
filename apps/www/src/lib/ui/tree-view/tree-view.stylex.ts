// tree-view.stylex.ts — the tree-view family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the core + multiselect components' former utility
// strings re-authored as static stylex atoms (the separator law).
// Structural constants lawful; theme-able slots ride channels — the
// density kernel lanes as PLAIN var() strings, the theme scale through
// the typed tokens.
//
// Lane split (the placement law): the state machines (row hover ink,
// suffix reveal, caret flip, focus rings, the multiselect tri-state,
// the reduced-motion kill) already live UNLAYERED in tree-view.css
// (the Part A carve-out — stylex tiers nest under components, so
// overriding the family's own atom paint requires the unlayered
// level); the row/caret/group/suffix/check transitions join them.
//
// Value-law receipts (tier-2 slots, mapped per the playbook — the
// tree's custom rhythm held NO exact steps; all reported):
//   - text-xs (12px) → --jx-text-label-lg (12px) — EXACT.
//   - leading-[2] → var(--jx-leading) (1.6) — the nearest channel;
//     the 24px row rhythm has no 2.0 step (REPORTED — the tree's
//     visual density changes without a --jx-lead-tree promotion).
//   - gap-[0.45rem] (7.2px) → --jx-space-8 (8px) — nearest step.
//   - ps-[0.35rem] (5.6px) → --jx-space-6 (6px) — nearest step.
//   - pe-2 (8px) → --jx-space-8 — EXACT.
//   - gap-[0.15rem] (2.4px) → --jx-space-4 (4px) — the smallest
//     typed step (REPORTED — no space-2 rung exists).
//   - border-l-2 (2px) → calc(var(--jx-unit) / 2) — EXACT pixels.
//   - w-3/h-3 (12px), w-[0.75rem], h-[1em], svg 3.5 — structural
//     glyph geometry (width/height are not theme slots).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const treeStyles = stylex.create({
  // ── the tree voice: nav face at 12px on the (nearest) leading ──
  root: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'var(--jx-leading)',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },

  // ── the row: items-centered, the logical 2px selection edge ──
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    minWidth: 0,
    borderLeftWidth: 'calc(var(--jx-unit) / 2)',
    borderLeftStyle: 'solid',
    paddingInlineStart: tokens['--jx-space-6'],
    paddingInlineEnd: tokens['--jx-space-8'],
  },
  rowEnabled: { cursor: 'pointer' },
  rowDisabled: { cursor: 'not-allowed', opacity: 0.5 },
  // selected: terminal-hover fill + primary edge + full ink (the
  // `selected` semantic hook stays — the css tints descendants off it)
  rowSelected: {
    backgroundColor: tokens['--jx-terminal-hover'],
    borderLeftColor: tokens['--jx-primary'],
    color: tokens['--jx-foreground'],
  },
  rowIdle: { borderLeftColor: 'transparent' },

  // ── the caret cell ──
  caret: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '1em',
    width: '0.75rem',
    flex: 'none',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the prefix / typeicon columns ──
  prefix: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: 'none',
    minWidth: 0,
  },
  typeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: 'none',
    minWidth: 0,
    color: tokens['--jx-muted-foreground'],
  },

  // ── the label lane: one truncating line ──
  label: { flex: '1 1 0%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  // ── the suffix (actions) column: hidden until the row engages ──
  suffix: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: 'none',
    gap: tokens['--jx-space-4'],
    marginInlineStart: 'auto',
    opacity: 0,
    pointerEvents: 'none',
  },

  // ── the collapse group: the 0fr/1fr grid-rows accordion ──
  group: { display: 'grid' },
  groupOpen: { gridTemplateRows: '1fr' },
  groupCollapsed: { gridTemplateRows: '0fr' },

  // ── the nested group list: indent channel + hidden overflow ──
  groupList: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    paddingInlineStart: 'var(--jx-indent)',
    minHeight: 0,
    overflow: 'hidden',
  },
  groupListLines: { position: 'relative' },

  // ── the multiselect tri-state box: 12px compact checkbox ──
  check: {
    appearance: 'none',
    WebkitAppearance: 'none',
    position: 'relative',
    margin: 0,
    width: '12px',
    height: '12px',
    flex: 'none',
    backgroundColor: tokens['--jx-background'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  checkEnabled: { cursor: 'pointer' },
  checkDisabled: { cursor: 'not-allowed' },
  checkDisabledInk: { opacity: 0.5 },
});
