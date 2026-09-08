# Proposal: stacking-context isolation for z ladders (stacking-isolation)

## Why

The Owner found a live stacking collision (2026-09-09, scroll-run
docs page): the scroll-run chevron chips (`z-index: 2`) painted
ABOVE the canvas dock (`z-index: 1`) — demo chrome over canvas
chrome, hit-test-confirmed at the overlap pixel. Root cause is a
LAW GAP, not a coding slip: the css-architecture requirement "grid
supplies stacking; position is for transient ink" governs how
siblings ORDER inside a one-cell grid host, but says nothing about
WHERE a z ladder lives. Neither the scroll-run host
(`.jx-scroll-host`, consumer markup), nor the canvas scroll layer
(`.jx-canvas-scroll` — `@container` inline-size, measured NOT a
stacking context in Chrome), nor the canvas root establishes a
stacking context, so both private ladders leaked into a shared
ancestor context and compared raw numbers: 2 > 1, chips win.

Two independently designed ladders meeting in one shared context is
exactly the coordination problem stacking contexts exist to
eliminate. The ordering law stays; it gains its missing half:
**scoping**.

## What Changes

- **MODIFIED** `css-architecture` — the "grid supplies stacking"
  requirement gains the isolation clause: every component sheet
  that assigns z-index to its own parts SHALL root that ladder in
  its own stacking context (`isolation: isolate` on the ladder's
  common parent), so component ladders never compare across
  components. Cross-component paint order is decided at boundaries
  (atomic units), never by comparing internal rungs. Plus the
  recorded platform fact: `container-type` does NOT establish a
  stacking context (measured, Chrome) — isolation is explicit.
- **MODIFIED** `canvas-schema` — the dock's pose wording corrected:
  the archived canvas-playground-dock delta described the dock as
  "absolute-positioned over the stage-row"; the pose was re-ruled
  to the grid law (a0a512e9) and the living spec still carries the
  stale absolute wording. This delta re-states it as the one-cell
  grid host (grid-area 1/1 siblings + z-index).
- **The incident fix (both sides of the boundary):**
  - scroll-run: `.jx-scroll-host` gets `isolation: isolate` — the
    veil/chip ladder (1/2) becomes component-private; the whole run
    subtree is one atomic unit to every embedder.
  - component-canvas: `.jx-canvas-scroll` gets `isolation:
    isolate` — the demo ceiling: demo content (any component, any
    internal z) is one atomic unit UNDER the dock; the canvas stops
    trusting demo internals across its 134 demo pages.
  - component-canvas: `.jx-canvas-stage-row` gets `isolation:
    isolate` — the canvas chrome ladder (dock z 1) is scoped inside
    the canvas; the canvas is one atomic unit at page level.
- **The sweep:** full-registry z-index inventory (research
  subagent, in flight) — every class-(a) ladder owner (leakable,
  un-scoped) gains isolation at its ladder's common parent; mirrors
  synced. Class-(b) (already scoped by an ancestor stacking
  context) and class-(c) (platform positioning) are recorded, not
  touched.

## Impact

- Specs: `css-architecture` (MODIFIED requirement + scenarios),
  `canvas-schema` (MODIFIED pose wording).
- Files: `registry/files/ui/scroll-run/scroll-run.css`,
  `registry/files/ui/component-canvas/component-canvas.css` (+ the
  audit's isolation points), each with its apps/www byte-mirror.
- No markup changes; no public API changes; no behavior change for
  in-component ordering (internal ladders keep their order inside
  the new boundary).
- The encoded paint contract, stated once in the law: content <
  decorative ink < interactive chrome < canvas chrome < page chrome
  — each boundary owns its ordering; numbers stay small and local.
