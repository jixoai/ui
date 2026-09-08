# Proposal: the canvas playground dock (canvas-playground-dock)

## Why

The Owner's reform ruling (2026-09-08): ComponentCanvas carries too
many responsibilities, and the PLAYGROUND lane is the worst of them —
a permanent `<aside>`泳道 that eats 18-22rem of stage width (or a
below-strip), carrying the "Playground" eyebrow, reset, controls, and
intro prose (PlayHelp) whether or not the reader wants them. The
canvas should be a simple component (the code-card posture); the
playground should be a FLOATING, COLLAPSIBLE, DRAGGABLE dock inside
the canvas, controls-only, assembled through the list-item family's
ItemGroup.

Three rulings locked in plan review: **默认展开** (mounts expanded;
click collapses to an icon chip), **PlayHelp 保留可用不占道** (still
renderable inside the expanded dock as a compact footnote — zero page
migration), **canvas 家族内部件** (the dock is a family sub-file; the
canvas's public Props stay stable so all 104 playground-carrying
pages inherit automatically).

## What Changes

- **NEW** `registry/files/ui/component-canvas/canvas-playground.svelte`
  — the dock: absolute in the stage-row (scroll-layer sibling),
  default top-right, `clamp(240px, 30cqi, 300px)` wide, internal
  scroll; head row (toggle + reset) doubles as the drag grab bar
  (carousel-style pointer capture, horizontal-only, clamped to the
  host width, <4px = click-to-toggle); expanded body composes ONE
  `<ItemGroup mode="plain" controlChrome="integrated">` (B5: the
  dock frame is the sole surface owner, in-row shells dissolve) with
  schema rows OR the page's `playground` snippet inside; the output
  `<dl>` rides the dock foot. Pointer law: only the dock's own
  surface takes pointer events — the stage stays interactive.
- **Kernel extraction** `canvas-schema.svelte.ts` — the module-script
  schema kernel (types + controlsFor + schemaDefaultsOf + constants)
  leaves component-canvas.svelte; the canvas re-exports (public
  surface unchanged); schema2form points at the kernel file; the
  dock imports the kernel (no circularity).
- **Canvas slimming** — the aside lane template, the schema-row
  rendering, the output dl, and the schema state machine move into
  the dock; the `pane` prop RETIRES (one consumer swept); the css
  side/below tiers and `.jx-canvas-fields` width laws die; new dock
  css (float pose, drag var, collapse transition, focus residue).
  ~969 → ~650 lines, three responsibilities gone.
- **Kit unification** — PlayFields renders the same
  `ItemGroup mode="plain" controlChrome="integrated"` and PlayRow
  gains the Item row shell (99 pages, API stable); PlayHelp stays,
  restyled as the dock's compact footnote.

## Impact

component-canvas family (canvas + new dock + kernel file + css),
site playground kit (PlayFields/PlayRow/PlayHelp/css), one pane=
consumer page, the component-canvas docs page (workbench demo
rework), specs pinning the old lane structure, vision snapshots
(structural change across all canvas pages). No new registry item;
no docs-structure count change; canvas public Props surface
unchanged except the retired `pane`.

## Amendment (Owner, mid-execution 2026-09-08)

The dock head becomes the UNIFIED CHROME STANDARD (the Owner's
normative sketch): `[drag-handle-icon, theme-toggle-icon-button,
size-toggle-select, →]` collapsed / `↓` expanded. The canvas
header's theme + density toggles MOVE INTO the dock; the size select
speaks the repo-standard Density vocabulary **xs/sm/default/lg**
(the `density` prop type changes from 'comfortable'|'compact' to
`Density`; the stage stamps data-density directly). The dock mounts
on EVERY canvas — the chrome row is standard on all demos; the
expand chevron only exists when the dock has a body. Page-side
bind:density sweeps ride with the docs lane.

The EVERY-DEMOS sweep (ruling 2: the slimmed canvas ≈ a light
code-card, so every docs demo renders through it — no more
effect-only showcases without source) is its own follow-up change
(2026-09-08-canvas-everywhere-demos) in this same worktree, executed
on top of the landed dock.
