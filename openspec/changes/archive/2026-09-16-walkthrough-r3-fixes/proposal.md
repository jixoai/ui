# The Owner walkthrough r3: thumb truly flush, the spine never crosses a dot

## Why

The Owner's walkthrough of ebbe97d6 returned two rulings:

1. **scroll-area**: `inset-inline-end: 2px` on the thumb keeps a 2px
   standoff from the region edge — NOT flush. The ruling: the
   edge-side inset is **0** (the thumb touches the region edge);
   the 2px goes to the START side. Resting cross size = track − 2
   (6/10/14), hover/drag = track (8/12/16 — growth still strictly
   inward, the edge flank pinned at 0).
2. **timeline**: the drawn spine runs node-CENTER to node-CENTER,
   so the axis visibly crosses THROUGH the dots (hollow/pending
   dots show the line inside their centers). The ruling: the line
   **never crosses a dot** — segments run dot-EDGE to dot-EDGE (a
   gap of the dot's diameter at every node). The no-JS floor
   already interrupts at dots by essence; the drawn spine now
   agrees. The center-to-center "no dead windows" scenario in the
   living spec was the W3 freeze — this supersedes it (the W3
   anti-seam concern is honored differently: one path element with
   per-gap subpaths, not per-item seams).

## What Changes

- scroll-area.css: thumb.y `inset-inline-end: 0;
  inset-inline-start: 2px` (hover/drag: start → 0); thumb.x
  `inset-block-end: 0; inset-block-start: 2px` (hover/drag: start →
  0). Numbers everywhere (spec scenario, probe, registry docs):
  resting 6/10/14, hover/drag 8/12/16, edge flank at 0.
- timeline-spine geometry, the TWO-LAYER law (the r3-review catch:
  Chromium restarts the dash phase at every M subpath, so per-gap
  subpaths would DUPLICATE the drawn progress in every gap): the
  BASE layer (`runPath` + the dashed preset's segments) runs
  EDGE-to-EDGE per-gap subpaths; the DASH-DRIVEN strokes (progress,
  beam) ride ONE CONTINUOUS center-to-center `flowPath` with a DOT
  MASK applied (white ground + one black circle per node at the
  measured radius, per-instance id) — the math stays single-path
  (stops in center space, pathLength = the center polyline), the
  visual stays dot-free; dedup, sort, monotone clamp, interpolation,
  scroll ownership unchanged; node CENTERS stay in the payload
  (custom snippets + the slot law).
- Tests/probes/docs updated to the new numbers and the gapped path
  (the W2 chrome probe, the W3 spine battery's path expectations,
  the progress probe's midpoint arm — 1.5 still lands halfway
  between the nodes' edges).

## Impact

component-authoring: the scroll-area family requirement's r2
geometry scenario MODIFIED (numbers + flush-at-0); the timeline
spine requirement MODIFIED (the base layer's edge-to-edge subpaths
superseding center-to-center); the r2 timeline requirement's stops
wording MODIFIED (the continuous flowPath + dot-mask law, center-space
arcs). Registry docs + probes + payloads
follow. Breaking-visual, additive-API.
