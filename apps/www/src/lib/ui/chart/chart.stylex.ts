// chart.stylex.ts — the chart family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the family's parts carried
// since OpenSpec 2026-08-30-add-chart-family — structural constants
// lifted verbatim; every theme-able slot already rode the density
// channels (var(--jx-gap), var(--jx-text)) or the ink roles, and
// those flow into atoms as plain var() strings (the kernel-channel
// law: a var() reference is not a literal). The variant grammar's
// hue slots (fill/tonal/outline) ride the GLOBAL SLOT channels the
// jx-hue-* utilities stamp on ancestors — var(--jx-fill)/--jx-tonal/
// --jx-outline, injected per the variant-grammar law.
//
// The MONO LOCK, the visually-hidden table recipe, and the svg paint
// stay in chart.css (pseudo-adjacent residue + at-var seams atoms
// cannot own); geometry (dasharray, points) stays inline in the
// markup — it is data, not paint (unchanged laws).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const chartStyles = stylex.create({
  // ── the ensemble root: layout-transparent ──
  contents: { display: 'contents' },

  // ── bar: one grid row per datum ──
  barRoot: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 'var(--jx-gap)',
    fontSize: 'var(--jx-text)',
    fontVariantNumeric: 'tabular-nums',
  },
  barRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'baseline',
    gap: 'var(--jx-gap)',
  },
  barLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens['--jx-muted-foreground'],
  },
  barValue: { color: tokens['--jx-foreground'] },
  // the ink rungs through the global hue slots (variant grammar)
  inkFill: { color: 'var(--jx-fill)' },
  inkTonal: { color: 'color-mix(in oklab, var(--jx-tonal) 70%, transparent)' },
  inkOutline: { color: 'var(--jx-outline)' },

  // ── line: the plot shell (geometry is the svg's own) ──
  lineRoot: { height: 'auto', width: '100%', maxWidth: '100%' },

  // ── donut: the svg/center stack ──
  grid: { display: 'grid' },
  stacked: { gridArea: '1/1' },
  center: { display: 'grid', placeItems: 'center' },

  // ── sparkline: the glyph run ──
  spark: {
    display: 'inline-block',
    verticalAlign: 'baseline',
    color: tokens['--jx-primary'],
  },
});
