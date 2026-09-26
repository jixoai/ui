// badge-indicator.stylex.ts — the badge-indicator family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the two DETERMINISTIC utility paints the old
// markup authored (tw4, 2026-08-24): the count chip (18px min box,
// destructive) and the 10px primary presence dot, plus the corner
// placement offsets that ride when a child anchors the indicator.
// The hooks (data-jx-bi*) are css-less anchors and stay attributes.
//
// Law mapping (the tier-2 value rule): geometry rides ruler equations
// — 10px/18px/±6px are calc(var(--jx-unit) * N) (no space steps at
// those odd measures; byte-exact), the micro text rides the promoted
// --text-micro step, the unitless 1 leading rides --leading-none,
// the corner rides --jx-radius, the frame rides --jx-hairline. No
// css residue (the family keeps its zero-css posture).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// badge-indicator/ and apps/www/src/lib/ui/badge-indicator/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const badgeIndicatorStyles = stylex.create({
  // the wrapper when a child anchors the indicator
  wrap: { position: 'relative', display: 'inline-flex' },
  // the shared chip frame (dot and count each complete the paint)
  base: {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-background'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    lineHeight: tokens['--jx-leading-none'],
    borderRadius: tokens['--jx-radius'],
  },
  // the dot idiom: the 10px primary presence box
  dot: {
    width: 'calc(var(--jx-unit) * 2.5)',
    minWidth: 'calc(var(--jx-unit) * 2.5)',
    height: 'calc(var(--jx-unit) * 2.5)',
    padding: 0,
    backgroundColor: tokens['--jx-primary'],
  },
  // the count idiom: the 18px destructive number box
  count: {
    minWidth: 'calc(var(--jx-unit) * 4.5)',
    height: 'calc(var(--jx-unit) * 4.5)',
    paddingInline: 'calc(var(--jx-unit) * 1)',
    paddingBlock: 0,
    backgroundColor: tokens['--jx-destructive'],
    color: tokens['--jx-destructive-foreground'],
  },
  // the corner offsets — joined ONLY when a child anchors the chip
  // (a bare span is position:static already)
  anchored: {
    position: 'absolute',
    top: 'calc(var(--jx-unit) * -1.5)',
    right: 'calc(var(--jx-unit) * -1.5)',
  },
});
