# component-authoring — spec delta (spin-ora-svg-lane)

## ADDED Requirements

### Requirement: the spin component renders the ora catalog and the svg posture under one name lane

The Spin component's text posture SHALL draw from a NAMED catalog
of plain-text frame sequences (`spin-catalog.ts`, the
cli-spinners@2.9.2 corpus curated by the objective rule —
text-presentation glyphs only, ≤30 frames, ≤10ch width,
`bouncingBar` excluded as bracket art) with frames VERBATIM and
per-spinner intervals riding; the decorative `[` `]` wrapping is
RETIRED (bare frames only). One `spinner` prop SHALL govern both
postures — `SpinName | TextSpinnerName`, default `'dots'` — with
artifact-first resolution (an svg spinner named like a text one
overrides it; unknown names fall back to frame 0 of `dots` with one
dev warn, never a blank region). Frame cycling SHALL be a JS
interval driven by `$effect`: SSR paints frame 0, and
`prefers-reduced-motion` never starts the interval (the
frozen-first-frame law).

#### Scenario: the default spinner renders bare frames

- GIVEN `<Spin />` with no props
- WHEN it renders server-side
- THEN the markup shows `dots` frame 0 (⠋) with NO bracket
  characters, under `role=status` with the default label

#### Scenario: reduced motion freezes on frame 0

- GIVEN a user agent reporting `prefers-reduced-motion: reduce`
- WHEN the component mounts
- THEN no interval starts and the text stays on frame 0 (and an
  svg root, when present, gets `pauseAnimations()` called)

#### Scenario: a spinner change restarts the cycle

- GIVEN a mounted `<Spin spinner="line" />`
- WHEN `spinner` changes to `arc`
- THEN the old interval clears and the new one runs at `arc`'s
  catalog interval

### Requirement: the svg posture owns the root and freezes under reduced motion

The svg posture SHALL render a component-owned `<svg>` root —
viewBox from the artifact, `size` square edge (default 16 through
the Defaults open literal slot), nature-aware currentColor
painting, `aria-hidden`, `data-jx-spin-svg` — with the artifact's
`d` children (SMIL animate included) crossing through `{@html}`
exclusively (the sink law: payload is build-time-extracted,
RAW-gated; nothing prop-reachable). Under `prefers-reduced-motion:
reduce` the component SHALL call the root's `pauseAnimations()`
(SMIL freeze on first frame) and spin.css's static kill SHALL stop
CSS-keyframed loaders (`:where([data-jx-spin-svg] *)` unlayered
carve-out). The wrapping posture (aria-busy, scrim owning
pointers, the one-cell grid host) SHALL remain byte-equivalent in
law to the pre-change contract.

#### Scenario: the svg root contract holds

- GIVEN `<Spin spinner="blocks-wave" />`
- WHEN it renders
- THEN the root is an `<svg>` carrying the artifact viewBox,
  `width`/`height` from the size slot, `fill="currentColor"`,
  `aria-hidden="true"`, `data-jx-spin-svg` — and its children
  include the nine animated `<rect>` elements verbatim

#### Scenario: the wrapping posture is unchanged

- GIVEN `<Spin label="building"><content/></Spin>`
- WHEN it renders
- THEN the container carries `aria-busy="true"`, the scrim owns
  pointer events over the content cell, and the status pill holds
  the spinner glyph — identical structure to the pre-change
  component modulo the glyph itself
