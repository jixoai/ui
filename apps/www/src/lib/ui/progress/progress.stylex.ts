// progress.stylex.ts — the progress family's atom table (tailwindless
// one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old native <progress>
// authored (tw4, 2026-08-24): the determinate bar frame (appearance
// none, 10px block, hairline border, muted ground), the label/value
// readout voices, and the indeterminate run's stripe paint (brand
// repeating gradient + the jx-progress-run sweep).
//
// Law mapping (the tier-2 value rule): the 10px bar height and the 6px
// readout gaps ride ruler equations / space steps; text-xs maps to the
// promoted --text-label-lg step, the 0.1em tracking to --track-10.
// The indeterminate sweep's 900ms/linear motion has NO sheet step —
// both ride promotion seams (--motion-indeterminate, --motion-linear;
// reported). The stripe keyframes, the native ::-webkit/::-moz pseudo
// resets, and the reduced-motion kills stay lane-2 in progress.css
// (D1-exempt; the UNLAYERED kills still beat this table's atoms);
// jx-progress-bar / jx-indeterminate stay the css law's hooks.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// progress/ and apps/www/src/lib/ui/progress/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const progressStyles = stylex.create({
  // the readout column: head row over the bar, 6px gap
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
  },
  // the label/value head: baselines pinned to both ends
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-12'],
  },
  label: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: tokens['--jx-track-10'],
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  value: {
    fontSize: tokens['--jx-text-label-lg'],
    fontVariantNumeric: 'tabular-nums',
    color: tokens['--jx-foreground'],
  },

  // ── the determinate bar frame ──
  bar: {
    appearance: 'none',
    WebkitAppearance: 'none',
    display: 'block',
    width: '100%',
    height: 'calc(var(--jx-unit) * 2.5)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 'var(--progress-radius, 4px)',
    backgroundColor: tokens['--jx-muted'],
    overflow: 'hidden',
  },
  // ── the indeterminate run: transparent ground + the brand stripe
  // sweep (keyframes + reduced-motion kill in progress.css) ──
  indeterminate: {
    position: 'relative',
    backgroundColor: 'transparent',
    backgroundImage:
      'repeating-linear-gradient(-55deg, var(--primary) 0 6px, transparent 6px 12px)',
    backgroundSize: '24px 100%',
    animationName: 'jx-progress-run',
    animationDuration: 'var(--motion-indeterminate, 900ms)',
    animationTimingFunction: 'var(--motion-linear, linear)',
    animationIterationCount: 'infinite',
  },
});
