// table.stylex.ts — the table family's atom table (tailwindless
// one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-22/24): the figure frame's responsive engines (the named
// jx-table inline-size container, isolation, the native overflow-x
// lane, the hairline rule-tinted border, the site radius), the LOCAL
// --jx-table-* token surface (the color-freedom seam: theme-token
// defaults, per-instance overrides through the style passthrough),
// the table element's border-separated grid (w-full, min-w-fit, the
// text/line voice), and the caption's secondary voice.
//
// Law mapping (the tier-2 value rule): every paint rides semantic
// tokens or the local --jx-table-* channels (custom properties the
// frame atom seeds — structural seam plumbing, not theme literals).
// The consumer-authored descendant paint (:global th/td), the
// @container engines, and the hover/stack state machines stay lane-2
// in table.css (D1-exempt; the stack law rides the UNLAYERED
// :where() carve-out, which beats this table's atoms exactly as it
// beat the old utilities); `dense` and data-stack stay css law hooks.
//
// Mirror law: this file is byte-identical in registry/files/ui/table/
// and apps/www/src/lib/ui/table/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tableStyles = stylex.create({
  // ── the figure frame: the named responsive container ──
  frame: {
    isolation: 'isolate',
    margin: 0,
    overflowX: 'auto',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'var(--jx-table-rule)',
    // §3/§14: the consumed chain first, the site radius as the auto
    // fallback (the frame's resting corner — explicit lanes stamp
    // --jx-radius-consumed in table.svelte's rootStyle)
    borderRadius: 'var(--jx-radius-consumed, var(--jx-radius))',
    containerType: 'inline-size',
    containerName: 'jx-table',
    // the local token surface (the color-freedom seam)
    '--jx-table-surface': 'var(--background)',
    '--jx-table-head': 'var(--muted)',
    '--jx-table-hover': 'color-mix(in oklab, var(--primary) 7%, var(--jx-table-surface))',
    '--jx-table-hairline': 'color-mix(in oklab, var(--border) 12%, transparent)',
    '--jx-table-rule': 'color-mix(in oklab, var(--border) 18%, transparent)',
    '--jx-table-edge': 'color-mix(in oklab, var(--border) 34%, transparent)',
  },
  // ── the table element: separated hairlines, the body voice ──
  table: {
    width: '100%',
    minWidth: 'fit-content',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
  },
  // ── the caption: the title over the frame, top-aligned ──
  caption: {
    captionSide: 'top',
    paddingBlockEnd: 'var(--jx-stack)',
    textAlign: 'start',
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
});
