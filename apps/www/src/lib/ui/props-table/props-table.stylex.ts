// props-table.stylex.ts — the props-table family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// SITE-ONLY family (apps/www/src/lib/ui/props-table — no registry
// item): the API reference table's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-stack/--jx-inset/--jx-text/
// --jx-text-secondary), the theme scale through the typed tokens.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.14em] → --jx-track-wide (0.08em) — nearest EXISTING
//     step; the exact 0.14em header tracking has no step (reported).
//   - font-medium (500) on the title → NO weight token exists; the
//     weight rides the lane-2 rule in props-table.css (reported as
//     the --jx-weight-medium promotion candidate).
//   - text-[0.65rem] (10.4px) → --jx-text-micro (10px) — nearest
//     step (reported).
//   - ml-1 (4px) → --jx-space-4 (calc(--jx-unit) * 1) — EXACT.
//   - border / border-border / border-border/50 → borderWidth
//     var(--hairline) + explicit borderStyle solid (no preflight —
//     the separator divergence #2); /50 rides the oklab color-mix
//     translation of TW's opacity modifier.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const propsTableStyles = stylex.create({
  // ── the scroller: full width, horizontal overflow lane ──
  scroller: {
    width: '100%',
    overflowX: 'auto',
  },

  // ── the title voice: nav face at body size (weight in lane-2 css:
  // no token step exists for 500 — see module header) ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    marginBlockEnd: 'var(--jx-stack)',
    fontSize: 'var(--jx-text)',
  },

  // ── the table: collapsed borders, start-aligned voices ──
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'start',
  },

  // ── rows: hairline separators — solid under the head, half-alpha
  // under the body (the oklab mix translation of border-border/50) ──
  headRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  bodyRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },

  // ── the header voice: nav face, secondary size, uppercase ──
  headCell: {
    fontFamily: tokens['--jx-font-nav'],
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
  },

  // ── the body voices ──
  nameCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    whiteSpace: 'nowrap',
  },
  typeCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
  defaultCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
  descriptionCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text)',
  },

  // ── the markers: required asterisk in brand ink; the bind chip at
  // micro size, one space-step out ──
  required: { color: tokens['--jx-primary'] },
  bindChip: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    marginInlineStart: tokens['--jx-space-4'],
  },
});
