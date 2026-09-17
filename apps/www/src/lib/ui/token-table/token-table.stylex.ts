// token-table.stylex.ts — the token-table family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// SITE-ONLY family (apps/www/src/lib/ui/token-table — no registry
// item): the docs token reference table's former utility strings
// re-authored as static stylex atoms (the separator law). Values:
// structural constants (flow/measure) lawful; theme-able slots ride
// channels — the density kernel lanes as PLAIN var() strings
// (--jx-stack/--jx-inset/--jx-text/--jx-text-secondary), the theme
// scale through the typed tokens layer.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.14em] → --jx-track-wide (0.08em) — the nearest
//     EXISTING step; the exact 0.14em header tracking has no step
//     (reported; a --jx-track-table step is the promotion candidate).
//   - border / border-border / border-border/50 → borderWidth
//     var(--hairline) + explicit borderStyle solid (no preflight to
//     lean on — the separator divergence #2 law); the /50 alpha
//     rides the oklab color-mix translation of TW's opacity modifier.
//   - border-collapse / whitespace-nowrap are structural.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tokenTableStyles = stylex.create({
  // ── the scroller: full width, horizontal overflow lane ──
  scroller: {
    width: '100%',
    overflowX: 'auto',
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

  // ── the body voices: mono token names / muted defaults ──
  nameCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    whiteSpace: 'nowrap',
  },
  defaultCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-muted-foreground'],
  },
  sourceCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
});
