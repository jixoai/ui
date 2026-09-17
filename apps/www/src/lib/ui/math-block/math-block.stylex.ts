// math-block.stylex.ts — the math-block family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (the
// katex-mermaid change, 2026-09-06): the figure's zero margins, the
// scroll-host grid, the footer's copy lane (the code-card pattern —
// press seams, 11px/0.04em label voice, the copied state's secondary
// ground).
//
// Law mapping (the tier-2 value rule): the copy control's 11px label
// voice rides the promoted --text-label step, the 0.04em tracking the
// --track-04 step, the 500 weight the promoted --weight-medium token;
// the odd 0.4rem/0.6rem/0.3rem measures ride ruler equations
// (byte-exact, no steps). The press physics keep the .jx-press law
// (press-button.css) and the --jx-press* seams; the copied state
// keeps the `copied` hook class; the focus-visible ring and the
// reduced-motion kill stay lane-2 in math-block.css (already
// unlayered); the scroll law stays the shared scroll-run contract.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// math-block/ and apps/www/src/lib/ui/math-block/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const mathBlockStyles = stylex.create({
  // the figure: zero margins, the run's min-width floor
  figure: { margin: 0, minWidth: 0 },
  // the scroll host (the shared jx-scroll-host law class joins it)
  host: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // the footer's copy lane: the run's trailing edge
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens['--jx-space-12'],
    paddingBlockStart: 'calc(var(--jx-unit) * 1.2)',
  },
  // the copy control (the code-card pattern verbatim, on the press law)
  copy: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--jx-unit) * 1.6)',
    backgroundColor: tokens['--jx-background'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-foreground'],
    cursor: 'pointer',
    fontSize: tokens['--jx-text-label'],
    fontWeight: tokens['--jx-weight-medium'],
    letterSpacing: tokens['--jx-track-04'],
    paddingInline: 'calc(var(--jx-unit) * 2.4)',
    paddingBlock: tokens['--jx-space-4'],
    whiteSpace: 'nowrap',
    '--jx-press-shadow': 'var(--shadow-2xs)',
    '--jx-press-shadow-hover': 'var(--shadow-xs)',
    '--jx-press-shadow-active': 'var(--shadow-xs-press)',
    ':hover': { backgroundColor: tokens['--jx-muted'] },
  },
  // the copied state: the secondary ground holds through hover
  copyCopied: {
    backgroundColor: tokens['--jx-secondary'],
    color: tokens['--jx-secondary-foreground'],
    ':hover': { backgroundColor: tokens['--jx-secondary'] },
  },
  // the icon lanes beside the labels
  icon: { display: 'inline-flex' },
});
