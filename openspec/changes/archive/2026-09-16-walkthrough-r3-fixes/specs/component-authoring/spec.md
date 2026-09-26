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
  probe (path geometry) across the axis × direction × RTL matrix

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

### Requirement: the scroll-area family — one hand-drawn law, a native sibling, one shared kit (Owner 2026-09-15)

`scroll-area` SHALL hand-draw its scrollbar ALWAYS (the standing
`scrollbar?: ScrollbarVariant` prop — `'native' | 'overlay'` at
`scroll-area.svelte:45,54` — and its `ScrollbarVariant` type RETIRE;
the new component has NO mode branch at all, breaking). A POINTER-TIER
floor parallels the no-JS floor (Gate-2 r1 amendment, the
implementation's honest shape): FINE pointers always draw; COARSE
pointers (touch) keep the platform scrollbar — the native best
practice for touch (momentum and edge behaviors; the hover-growth and
drag-pin interaction model has no touch equivalent) — a declared
CAPABILITY of the hand-drawn component, not a mode (no prop, no API
surface; the tier follows `pointer: coarse` media state, prerender
output keeps the platform bar exactly as the no-JS floor does). The
drawn chrome's geometry is PARAMETERIZED (Owner r2): the thumb radius
defaults to `0` (square-cut) and is configurable (`radius`: a px
number or `'full'` for the retired-by-default capsule); the chrome
WIDTH rides tiers (`width`: `'auto'` | `'thin'` | `'wide'`,
mirroring the native sibling's tier vocabulary — `none` is
native-only, a hand-drawn scrollbar that draws nothing is the
platform tier); the track sits FLUSH against the region edge (no
decorative standoff inset); and the hover/drag growth is
EDGE-ANCHORED — the thumb's outer (edge-side) flank sits AT the
region edge (the r3 ruling: `inset-inline-end: 0` / block-end `0` —
truly flush, the 2px resting inset lives on the START side) while
the cross size grows INTO the content (the
`transform-origin: right center` semantics for an inline-end vertical
track; RTL mirrors through logical properties; the horizontal axis
anchors its block-end flank). A separate `native-scroll-area` item
SHALL ship the platform scrollbar under the scrollbar-token law with the
native best practices as capability styles, and SHALL mount NO custom
scrollbar ARIA — no drawn thumb exists, and the platform scrollbar IS the
accessibility contract (a `role="scrollbar"` on a nonexistent thumb is a
violation, not a feature). Both SHALL share the `scroll-area-kit` lib
kernel (the control-chrome precedent), SPLIT BY CONCERN into THREE
parts: a shared CORE (overflow verdict, thumb geometry math,
theme-scope resolution — zero paint, zero ARIA of its own), a
HAND-DRAWN INTERACTION ADAPTER (idle fade, hover growth, drag pinning,
keyboard scrolling, the thumb's a11y contract) consumed ONLY by the
hand-drawn component, and the NATIVE CAPABILITY STYLES (the packaged
native best-practice styles) consumed ONLY by the native sibling.
Behavior lives in the kit; paint lives in the consumer. `scroll-run`
(the linear strip edge system) is a DIFFERENT shared system and is
untouched.

#### Scenario: the hand-drawn law owns the styled component

- GIVEN a scroll-area on either axis, any theme
- THEN the scrollbar is fully drawn: square-cut thumb (radius 0 by
  default, `radius` configurable to any px or the `'full'` capsule),
  `width` tiers sizing the chrome (thin/auto/wide), a track FLUSH to
  the region edge, idle
  fade (~700ms), hover growth + brightening (edge-anchored, growing
  into the content), drag-pinned opacity,
  keyboard affordances on region and thumb — restyled by tokens without
  JS, in both light and dark scopes

#### Scenario: coarse pointers keep the platform bar (the capability floor, Gate-2 r1)

- GIVEN a scroll-area under a coarse pointer (touch emulation)
- WHEN the component mounts
- THEN the platform scrollbar serves the region and NO drawn chrome
  mounts (the touch best practice — momentum and edge behaviors ride
  the platform), while a fine pointer on the SAME component always
  draws (probe-asserted both tiers, no prop involved)

#### Scenario: auto-hide never hides the affordance from keyboard users

- GIVEN a scroll-area in any of FOUR pinned states — the REGION holds
  focus within (focus-within), the THUMB holds focus, the thumb is
  being dragged, or the thumb/track is hovered
- WHEN the idle fade's timer would fire
- THEN the thumb pins visible — FOUR separately probe-asserted pins,
  one per state (region focus-within, thumb focus, drag, hover; each
  tested in isolation) — and while any pin holds, the thumb node stays
  in the accessibility tree with its role intact and `aria-valuenow`
  tracking position ("AT-engaged" is not a detectable platform state
  and is deliberately NOT the contract)

#### Scenario: the native sibling is capability styles

- GIVEN a native-scroll-area
- THEN the platform scrollbar renders under the site's scrollbar-token
  law, with `scrollbar-gutter: stable`, theme-scope-aligned
  `color-scheme`, `scrollbar-width` tiers, and `overscroll-behavior`
  containment packaged as the component's declared capabilities — and
  NO drawn thumb and NO custom scrollbar ARIA mount anywhere inside it

#### Scenario: the kit is family-neutral and split by concern

- GIVEN the kit's exported runtime
- THEN the shared CORE (verdict/geometry/scope) mounts with zero paint
  and zero ARIA of its own; the hand-drawn interaction adapter and the
  native capability styles are SEPARATE exports, each consumed by
  exactly its own component — a new consumer adopts the core with no
  CSS of the kit's look and no ARIA it did not author, and
  scroll-area and native-scroll-area share the core while touching
  disjoint kit parts

#### Scenario: the scrollbar mode prop is gone

- GIVEN the breaking migration
- THEN the acceptance is STATICALLY assertable, in three parts: (1) a
  pinned Props assertion snapshots the component's exported prop list
  and finds no `scrollbar` field and no mode-shaped field of any
  name, and the `ScrollbarVariant` type is absent from the item's
  exports; (2) a source scan finds no `'native'`/`'overlay'` consumer
  site in the shipped surface (routes excluded per the glass-canary
  precedent); (3) the canary's two-directional fixture plants a live
  `scrollbar` prop and proves BOTH detectors redden — the snapshot
  (a mode-shaped field would appear) and the scan (routes excluded,
  the planted site is inside the scanned surface)

#### Scenario: the chrome geometry is parameterized and edge-anchored (r2)

- GIVEN a hand-drawn scroll-area on a fine pointer
- THEN the thumb's computed `border-radius` is `0px` by default, paints
  any configured px, and `'full'` paints the capsule; the `width`
  tiers size the lane (thin/auto/wide, probe-measured track widths
  8/12/16; resting thumb cross sizes 6/10/14 = track − 2, the 2px
  resting inset on the START side; hover/drag 8/12/16 = the track —
  growth always exactly 2px inward); the track's computed edge inset
  is `0` (flush) and the thumb's edge-side flank sits AT the region
  edge (`0`); under hover the thumb's edge-side flank coordinate is
  UNCHANGED (to the device pixel) while its cross size grows strictly
  inward — probe-asserted on both axes and under RTL (the anchor
  mirrors with the logical edge)

### Requirement: the timeline speaks the reui step contract with fractional spine progress (Owner 2026-09-15 r2)

The timeline SHALL carry the reui-standard value contract: `defaultValue`
(default `1`), `value` (controlled, overrides), and `onValueChange` —
DECIMAL numbers first-class, never rounded. `TimelineItem` SHALL accept
`step?: number` (defaulting to DOM order + 1; steps strictly ascending
in DOM order — duplicates drop, last wins, dev-mode warned) and paint
`data-completed` when `step <= current` (attribute paint, the
`pending` precedent; `pending` WINS the paint when both apply — the
louder state). Completed dots, titles, and times restyle through
tokens. The family SHALL ship a `TimelineHeader` part (reui parity)
and `TimelineDot` SHALL accept `children` rendered inside the node
(the reui indicator-icon pattern) beside the kept 8-directional slot
grammar and variants. BEYOND reui, the drawn spine SHALL map the value
onto the measured path through a FROZEN STOPS PROTOCOL: the geometry
payload carries `stops: { step: number; arc: number }[]` — the DEDUPED
milestone table; each `arc` is the milestone's OWNING node's CENTER
position on the CONTINUOUS center-to-center `flowPath` (the r3-review
close: Chromium restarts the dash phase at every M subpath, so the
dash-driven strokes — progress and beam — MUST ride one continuous
path; the Owner-r3 dot gaps come from a MASK — white ground, one
black circle per node at the measured radius, a per-instance id —
applied to those strokes, never from their path data; the BASE
layer's `runPath` carries the per-gap edge-to-edge subpaths; the
standing first↔last CHORD `runLength` stays
retired from every dasharray consumer); `stops[0].arc` is 0 on the
unique-first-step ladder (the default) and non-zero only
when the first step duplicates (the owner is a later node); a value
below the first milestone maps to length 0; a value inside a
declared step gap interpolates across that gap's arc. The progress
stroke runs from the path's start to the interpolated point at
`value` via stroke-dashoffset arithmetic, with a CSS transition on
the dashoffset (reduced motion: none) so tweening the value animates
the draw. `animation: 'scroll'` SHALL keep owning the stroke channel —
the value-driven inline dashoffset is NOT PAINTED under scroll mode
(no CSS-accident reliance; probe-asserted) — while the value contract
still drives discrete completion; `view` composes. The no-JS floor,
RTL, density, spine presets + custom geometry snippet (payload
extended additively with the stops table), and `pending` are KEPT
(our highlights).

#### Scenario: the value contract is reui-shaped

- GIVEN a timeline with items and no explicit `value`
- THEN `defaultValue` seeds the current step; the consumer's setter
  (or bound state) moves it; every change fires `onValueChange`; and a
  controlled `value` overrides the internal state — unit-asserted,
  including a decimal default (`1.5`: item 1 completed, item 2 not)

#### Scenario: fractional progress draws between the nodes

- GIVEN a measured spine with ≥ 2 nodes and `value` between two
  bracketing steps a < value < b
- THEN the progress stroke's tip lands at the STEP-SPACE interpolated
  arc position on the continuous flowPath — probe-sampled at the
  node1→node2 gap's visual midpoint for `1.5`
  on the default 1,2,3… ladder (the dot MASK renders the
  center-space tip at the dot's edge; ±1px on the path length),
  zero-length at the first step, the full run at the last; a
  fractional value inside a
  DECLARED gap (steps 2 and 5, value 3.5)
  interpolates across that gap's arc; and a DUPLICATED first step
  (1,1,2) draws `value = 1`
  to the milestone's owning later node, with sub-first values
  clamped to 0 — all unit/probe-asserted

#### Scenario: the stops protocol retires the chord

- GIVEN a non-collinear spine (interlaced or horizontal) with the
  scroll-progress stroke or the beam active
- THEN the dasharray total equals the cumulative polyline length
  (`pathLength = stops.at(-1).arc`), NOT the first↔last chord —
  unit-asserted against a 3-node fixture whose chord < polyline

#### Scenario: tweening the value animates the draw

- GIVEN a rendered progress stroke and a value change
- THEN the dashoffset transitions (two sampled frames differ; reduced
  motion: instant)

#### Scenario: scroll animation keeps the stroke channel

- GIVEN `animation: 'scroll'`
- THEN the nearest scroller drives the progress stroke exactly as
  before (probe re-asserted; the value-driven inline dashoffset is
  ABSENT from the element under scroll mode), while
  `data-completed` still follows the value contract

#### Scenario: the reui parity parts exist

- GIVEN the family's exports
- THEN `TimelineHeader` renders the plain wrapper; `TimelineDot`
  composes `children` inside the node; `TimelineTime` maps reui's
  `TimelineDate`; `axis: 'horizontal'` maps reui's `orientation` —
  statically assertable in the item's exports and props table
