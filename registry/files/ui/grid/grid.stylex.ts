/**
 * grid.stylex.ts — the token-bound two-dimensional layout atoms
 * (registry/files/ui/grid/grid.stylex.ts, layout-family round 3,
 * 2026-09-19).
 *
 * The Layout family's GRID primitive: track arrangement over the
 * typed space ladder. Numeric cols take the blowout-proof form —
 * repeat(N, minmax(0, 1fr)) — the css-architecture grid-law
 * vocabulary (a bare 1fr row of wide children overflows its
 * container; minmax(0, 1fr) cannot). The rows lane carries the
 * DISCLOSURE vocabulary the canvas drawer and the header drawer
 * both ride: 'collapse' (0fr — the height-animation-friendly
 * collapsed track) and 'open' (1fr).
 */
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const gridStyles = stylex.create({
  base: { display: 'grid' },

  // ── numeric tracks: the blowout-proof form, one atom per count ──
  cols1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
  cols2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  cols3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  cols4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  cols5: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
  cols6: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
  cols7: { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' },
  cols8: { gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' },
  cols9: { gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' },
  cols10: { gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' },
  cols11: { gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' },
  cols12: { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' },

  // ── the disclosure lane: the 0fr→1fr collapse (the drawer law —
  //    grid-template-rows animates; height:auto never does) ──
  rowsCollapse: { gridTemplateRows: '0fr' },
  rowsOpen: { gridTemplateRows: '1fr' },

  // ── the space ladder (token-bound, the stack twin's 16 rungs) ──
  gap2: { gap: tokens['--jx-space-2'] },
  gap4: { gap: tokens['--jx-space-4'] },
  gap6: { gap: tokens['--jx-space-6'] },
  gap8: { gap: tokens['--jx-space-8'] },
  gap10: { gap: tokens['--jx-space-10'] },
  gap12: { gap: tokens['--jx-space-12'] },
  gap14: { gap: tokens['--jx-space-14'] },
  gap16: { gap: tokens['--jx-space-16'] },
  gap18: { gap: tokens['--jx-space-18'] },
  gap20: { gap: tokens['--jx-space-20'] },
  gap24: { gap: tokens['--jx-space-24'] },
  gap28: { gap: tokens['--jx-space-28'] },
  gap32: { gap: tokens['--jx-space-32'] },
  gap40: { gap: tokens['--jx-space-40'] },
  gap48: { gap: tokens['--jx-space-48'] },
  gap80: { gap: tokens['--jx-space-80'] },
});

/** the gap rung vocabulary (the sheet's space ladder, verbatim) */
export const GRID_GAP_RUNGS = [
  '2', '4', '6', '8', '10', '12', '14', '16', '18', '20',
  '24', '28', '32', '40', '48', '80',
] as const;

export type GridGap = (typeof GRID_GAP_RUNGS)[number];
