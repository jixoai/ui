// statistic.stylex.ts — the statistic family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old readout authored (tw4,
// 2026-08-24): the micro-label voice (font-nav, secondary scale, the
// 0.14em uppercase tracking — now the promoted --track-14 step), the
// big tabular-num mono value over the --jx-line channel, and the
// text-glyph trend's shared voice (up=primary, down=destructive).
//
// Law mapping (the tier-2 value rule): the trend colors ride the
// typed semantic tokens; the -0.02em tight tracking rides the promoted
// --track-tight step; the value's 1.5× line height rides an equation
// over the --jx-line kernel channel (byte-exact, no step exists).
// `jx-stat*` hooks stay data attributes (css-less anchors).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// statistic/ and apps/www/src/lib/ui/statistic/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const statisticStyles = stylex.create({
  // the readout column: stack over the family's block gap
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-stack)',
  },
  // the metric's name — the micro-label above the value
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    letterSpacing: tokens['--jx-track-14'],
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // the number row: prefix / value / trend / suffix on the baseline
  value: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--jx-gap)',
    color: tokens['--jx-foreground'],
  },
  affix: {
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-muted-foreground'],
  },
  // the big tabular-num value: mono at 1.5× the line channel
  num: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-line) * 1.5)',
    lineHeight: 'var(--jx-line)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: tokens['--jx-track-tight'],
  },
  // the text-glyph trend (▲/▼ — no icon dependency), one voice per
  // direction; up=primary (brand emphasis), down=destructive
  trendUp: {
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-primary'],
  },
  trendDown: {
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-destructive'],
  },
});
