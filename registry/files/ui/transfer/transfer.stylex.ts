// transfer.stylex.ts — the transfer family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the two-panel selector
// carried since tw4 (2026-08-24). The phones @container stacking law,
// the row/mover hover poses and the focus laws stay in transfer.css
// (unchanged); the mover buttons' DISABLED dim moved INTO the css
// (:disabled is a state seam — the unlayered carve-out already owned
// its hover).
//
// Value receipts (missing steps reported for serial promotion):
//   - 7px/5px row paddings have no steps → ruler equations
//     (calc(var(--jx-unit) * 1.75) / * 1.25);
//   - 10px/6px ARE --jx-space-10 / --jx-space-6 (typed);
//   - 13px rides the var(--jx-text) channel (equal at the default
//     density scope); 12px/11px ARE --jx-text-label-lg / --jx-text-label;
//   - text-base (16px) has no step → calc(var(--jx-text-base) +
//     var(--jx-unit) * 3) (13px + 3px, the ruler equation);
//   - leading-none → an exact equation over the density 1.6 rung;
//   - tracking-[0.12em] → calc over --jx-track-wide;
//   - the list's scrollbar-gutter padding keeps its authored max()
//     seam, 0.25rem re-expressed through the ruler unit.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const transferStyles = stylex.create({
  // ── the root: two panels, movers between ──
  root: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-12'] },
  // ── one panel: a real fieldset ──
  panel: {
    flex: '1 1 0%',
    minWidth: 0,
    margin: 0,
    padding: 0,
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-2xs'],
    borderRadius: tokens['--jx-radius'],
  },
  legend: {
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: 'calc(var(--jx-unit) * 1.75)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: 'calc(var(--jx-track-wide) * 1.5)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the search lane (focus law in the css) ──
  search: {
    boxSizing: 'border-box',
    width: '100%',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: 'calc(var(--jx-unit) * 1.75)',
    borderTopWidth: tokens['--jx-hairline'],
    borderRightWidth: 0,
    borderBottomWidth: tokens['--jx-hairline'],
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
  },
  // ── the option list (a real scroller) ──
  list: {
    margin: 0,
    paddingBlock: tokens['--jx-space-4'],
    paddingInline: 'max(calc(var(--jx-unit) * 1) - var(--jx-scrollbar-thin, 0px), 0px)',
    listStyleType: 'none',
    maxHeight: '14rem',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
  },
  // ── one row (hover pose in the css) ──
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    paddingInline: tokens['--jx-space-6'],
    paddingBlock: 'calc(var(--jx-unit) * 1.25)',
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-foreground'],
    cursor: 'pointer',
  },
  rowDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  rowLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  empty: {
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-16'],
    textAlign: 'center',
    fontSize: tokens['--jx-text-label-lg'],
    color: tokens['--jx-muted-foreground'],
  },
  // ── the movers column ──
  movers: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-8'] },
  // ── one mover button (hover/disabled poses in the css) ──
  move: {
    appearance: 'none',
    width: '2rem',
    height: '2rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    color: tokens['--jx-foreground'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 3)',
    lineHeight: 'calc(var(--jx-density-leading-lg) * 0.625)',
    cursor: 'pointer',
    boxShadow: tokens['--jx-shadow-xs'],
  },
});
