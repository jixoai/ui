// button-group.stylex.ts — the button-group family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the r13 grid container's utility strings as the
// flow-law rework spelled them: the joined row is an INLINE-GRID capped
// at the available inline size; the flow law rides the orientation —
// HORIZONTAL groups flow COLUMNS over auto columns (the one implicit
// row grows), VERTICAL groups flow ROWS over auto rows; members
// stretch the cross axis; justify packs the cluster on the main axis
// (justify-content inline-axis, content-* block-axis). The ⋯ collapse
// trigger is an inline-flex chip; the scroll host is a one-cell
// inline-grid (the shared ScrollChrome stacks over it).
//
// Precedence audit (the layer law): the wrap-state flip
// ([data-jx-overflow='wrap'] grid-auto-flow row / max-content columns)
// lives in @layer components in button-group.css — the flow atoms nest
// UNDER components (components.stylex), sorting after it exactly as
// the utilities-layer forms always did (the flip was already inert
// under the utility; wrap layout rides the component's explicit inline
// placement). The overflow display flips stay UNLAYERED in the css and
// keep beating the atom tier, as they beat the utilities before.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// button-group/ and apps/www/src/lib/ui/button-group/ (cmp); the
// tokens import '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';

export const buttonGroupStyles = stylex.create({
  // ── the joined row: an inline grid, capped at the available width ──
  root: { display: 'inline-grid', maxWidth: '100%' },
  // ── THE FLOW LAW (r13): horizontal grows the one implicit ROW with
  //    columns; vertical grows the one implicit COLUMN with rows;
  //    members stretch the cross axis either way ──
  flowCol: {
    gridAutoFlow: 'column',
    gridAutoColumns: 'auto',
    alignItems: 'stretch',
  },
  flowRow: {
    gridAutoFlow: 'row',
    gridAutoRows: 'auto',
    alignItems: 'stretch',
  },
  // ── cluster packing: the main axis (inline for horizontal groups) ──
  justifyStart: { justifyContent: 'start' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'end' },
  // ── cluster packing: the track axis (block for vertical groups) ──
  contentStart: { alignContent: 'start' },
  contentCenter: { alignContent: 'center' },
  contentEnd: { alignContent: 'end' },
  // ── the ⋯ collapse trigger's chip (visibility flips stay css law) ──
  more: { display: 'inline-flex' },
  // ── the scroll-mode HOST: a one-cell inline grid — the run, the
  //    veil layer and the chevron chips stack in the single cell ──
  host: {
    display: 'inline-grid',
    maxWidth: '100%',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
});
