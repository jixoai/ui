// range.stylex.ts — the range family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the native rebase's utility strings (2026-09-01):
// the slider head's baseline row (label above value, space-between at
// the 12px gap), the value readout's mono tabular voice (destructive
// ink when invalid), and the sr-only collapse for label-only sliders.
// The native face (track/thumb fill, focus ring, ticks ruler paint)
// stays range.css + the css-laws generated face keyed on the jx-field
// / jx-slider-* hooks — no atom shares a property with any of it.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens —
// the mono font, the foreground/destructive inks, the space-12 step;
// geometry (flex row, baseline, space-between, the sr-only clip
// recipe with the ruler's -1px margin equation) is structural.
//
// Mirror law: this file is byte-identical in registry/files/ui/range/
// and apps/www/src/lib/ui/range/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const rangeStyles = stylex.create({
  // ── the head: label and readout share a baseline row ──
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--space-12)',
  },
  // ── the value readout: mono, tabular, the reading ink ──
  value: {
    fontFamily: tokens['--jx-font-mono'],
    color: tokens['--jx-foreground'],
    fontVariantNumeric: 'tabular-nums',
  },
  // the invalid readout flips to the destructive ink
  valueInvalid: { color: tokens['--jx-destructive'] },
  // ── the AT-readable label, hidden from the eye (the v4 clip recipe;
  //    structural geometry, the -1px margin as the ruler equation) ──
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 'calc(var(--jx-unit) * -0.25)',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});
