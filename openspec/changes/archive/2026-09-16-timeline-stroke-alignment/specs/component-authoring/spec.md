# component-authoring deltas

## MODIFIED Requirements

### Requirement: the timeline spine is drawn (Owner 2026-09-15)

The timeline's spine SHALL be ONE whole-list SVG layer — measured from the
live item geometry, mounted as a `grid-area: 1/1` SIBLING of the item
list inside the one-cell grid host (the law's overlay dialect — never
`position: absolute` for layout), `pointer-events: none`, painted UNDER
the dots and content by source order (the zero-z dialect), the ladder
rooted by `isolation: isolate` on the list root — never per-item
background seams. The standing abspos exemptions RETIRE with it: the
timeline beam (TRANSIENT INK) now lives inside the SVG layer, and the
scroll-progress spine's absolute channel (CONTAINING-BLOCK NEEDS,
2026-09-02) is replaced by the whole-list stroke draw. Items, content, titles, times, and dots stay DOM. A no-JS floor
SHALL paint a simple CSS line per item before hydration (progressive
enhancement); hydration upgrades to the measured spine. The `line(i)`
per-item snippet seam RETIRES; the spine contract (a `spine` prop taking
`'plain' | 'dashed' | 'beam'` presets, names preserved, or a custom
snippet receiving the measured geometry) replaces it. Breaking, no compat.

#### Scenario: connectors are continuous paths

- GIVEN a multi-item timeline on any axis/direction/interlacing variant
- WHEN the spine draws
- THEN the connector runs dot-EDGE to dot-EDGE as one path element per
  run (per-gap subpaths, `M edge L edge`) — the axis NEVER crosses a
  dot: a gap of the dot's diameter interrupts the stroke at every
  node (hollow and pending dots show no line through their centers —
  the Owner's r3 ruling, superseding the center-to-center W3 freeze),
  no per-item seams, verified by
  probe (path geometry) across the axis × direction × RTL matrix —
  AND every join carries THE JOINT-LAP (r4): each subpath laps 1px
  INTO the node's edge band (`shave = nodeRadius − 1`; the dot mask's
  circles shrink in step), the lap hiding UNDER the dot's own ink —
  the join is structural ink-under-ink, never a knife-edge butt
  against the beveled diamond's vertex (raster: zero background
  slivers at the join rows, hollow interiors clean) — AND the
  STRUCTURAL strokes carry THE STROKE-ALIGNMENT LAW (Owner r5):
  `stroke-linecap: butt` on the plain, dashed, and progress strokes
  (the crisp edge grammar of the beveled site — no cap overshoot
  past the lapped tip), and the stroke weight IS the dot's border
  width through ONE shared token `--jx-tl-stroke-w` (the default
  dot's `border-width` and those `stroke-width`s consume the same
  variable — they can never drift apart); the beam preset is the
  standing EXEMPTION (a traveling light, not a connector — its
  width, round caps, and blur are the glow grammar), and the ring
  dot's 2px border keeps its variant identity (identity outranks
  the shared token, as it outranks the state paints)

#### Scenario: the dash phase anchors to the node edge

- GIVEN the dashed preset
- THEN `stroke-dashoffset` phase-anchors the pattern so a dash STARTS at
  the node's flow-end edge regardless of density scale (the
  background-position phase law's SVG successor, probe-pinned)

#### Scenario: the beam has width and travels the path

- GIVEN the beam preset
- THEN the light paints as a stroked gradient segment with visible
  inline width and soft edges, animated along the path, frozen under
  prefers-reduced-motion (a static lit segment, not a disappearance)

#### Scenario: scroll-progress is a stroke draw

- GIVEN `animation='scroll'` (the standing prop, unchanged)
- THEN the progress spine draws as `stroke-dashoffset` along the measured
  path in response to scroll position (the abspos/implicit-track
  machinery retires)

#### Scenario: the no-JS floor stands and upgrades

- GIVEN a prerendered (pre-hydration) timeline
- THEN every item shows the plain CSS line floor; after hydration the
  measured SVG spine replaces it with no layout shift beyond the
  spine's own width
