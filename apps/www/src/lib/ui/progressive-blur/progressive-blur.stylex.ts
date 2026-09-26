// progressive-blur.stylex.ts — the progressive-blur family's atom
// table (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the GRID
// dialect's band (one-cell host placement, block-edge spanning, the
// no-op translateZ(0) compositor isolation) and its [grid-area:1/1]
// ladder layers; the STICKY dialect's zero-layout pinned root (the
// LOAD-BEARING sticky offsets) with its absolute inner band and
// inset-0 layers. PURE structure — every value here is placement
// geometry (grid areas, insets, z-index, the zero sizes); the paint
// (blur ladder, masks, the reveal opacity law) rides the inline
// layerStyle channel + progressive-blur.css exactly as before.
//
// Mirror law: byte-identical in registry/files/ui/progressive-blur/
// and apps/www/src/lib/ui/progressive-blur/ (cmp); '../../tokens.
// stylex' resolves in both trees.

import * as stylex from '@stylexjs/stylex';

export const pblurStyles = stylex.create({
  // ── shared: scenery, never a target ──
  scenery: { pointerEvents: 'none' },

  // ── the grid dialect ────────────────────────────────────────────
  gridBand: {
    display: 'grid',
    transform: 'translateZ(0)',
  },
  // INLINE edges: the one-cell host placement + inline aim
  gridStart: {
    gridArea: '1 / 1',
    justifySelf: 'start',
    alignSelf: 'stretch',
  },
  gridEnd: {
    gridArea: '1 / 1',
    justifySelf: 'end',
    alignSelf: 'stretch',
  },
  // BLOCK edges: span the host's whole block extent, hang by align
  gridTop: {
    gridRow: '1 / -1',
    gridColumn: '1 / -1',
    alignSelf: 'start',
  },
  gridBottom: {
    gridRow: '1 / -1',
    gridColumn: '1 / -1',
    alignSelf: 'end',
  },
  // the ladder layers stack as grid items of the band
  gridLayer: { gridArea: '1 / 1' },

  // ── the sticky dialect ──────────────────────────────────────────
  // the zero-layout pinned root: position sticky WITHOUT an offset
  // is inert — the edge offsets below are load-bearing
  stickyRoot: {
    position: 'sticky',
    zIndex: 10,
  },
  hZero: { height: 0 },
  wZero: { width: 0 },
  topEdge: { top: 0 },
  bottomEdge: { bottom: 0 },
  startEdge: { insetInlineStart: 0 },
  endEdge: { insetInlineEnd: 0 },
  // the band hangs INTO the viewport from the pinned edge
  bandBlock: {
    position: 'absolute',
    insetInline: 0,
  },
  bandInline: {
    position: 'absolute',
    insetBlock: 0,
  },
  // the ladder layers: absolute, covering the band
  layer: {
    position: 'absolute',
    inset: 0,
  },
});
