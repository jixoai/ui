# component-authoring delta — visual-quality-iteration

## ADDED Requirements

### Requirement: the press-effect fill channel resolves from the host's theme scope (Owner 2026-09-15)

The press-effect runtime's AUTO fill (shimmer sweep, rainbow wash —
`fill: undefined`) SHALL resolve the Context from the HOST ELEMENT, never
from the OS scheme when a theme scope exists: the nearest ancestor theme
scope (`[data-theme="light"|"dark"]`, `.dark`, `.jx-light`, self included)
answers light/dark first; the OS scheme answers ONLY when the whole
ancestor chain carries no scope. The auto fill COLOR SHALL be the effective
canvas — the nearest OPAQUE ancestor background (walk-up + parse), falling
back to white/black by the resolved context — and SHALL follow live scope
mutation (class observer on the ancestor chain, disconnected on cleanup).
The CSS `Canvas` keyword SHALL NOT appear in the auto path. Explicit fills
(solidFill minting, numeric fills) are untouched.

#### Scenario: the stage's theme answers, not the OS

- GIVEN a shimmer host inside a light theme scope (`[data-theme="light"]`
  or `.jx-light`) on a page whose OS scheme is dark
- WHEN the effect mounts with `fill` omitted
- THEN the sweep paints LIGHT (the scope-resolved effective canvas) and
  the OS scheme never reaches the fill; the dark-stage converse on an
  OS-light page paints dark

#### Scenario: the nearest scope wins over the site root

- GIVEN a dark stage mounted on a site whose root carries `dark` off (or
  on)
- WHEN the fill resolves
- THEN the STAGE's scope answers (a `.dark` panel inside a light site
  paints the dark sweep), `html.dark` being merely the root-most scope in
  the same walk

#### Scenario: no scope anywhere follows the user

- GIVEN a host whose entire ancestor chain carries no theme scope
- THEN the OS scheme answers (the honest fallback for unthemed pages) and
  the fill derives from the measured page base

#### Scenario: the fill follows a live scope flip

- GIVEN a rendered shimmer under a scope that flips class
  (`jx-light` → `dark`)
- WHEN the observer fires
- THEN the fill re-resolves to the new context's canvas without a
  re-mount, and the observer disconnects on destroy

#### Scenario: rainbow rides the same channel

- GIVEN rainbow's fill default shares `resolveFill`
- THEN the same scope ladder governs it — one battery, both effects,
  asserted by the same probes

### Requirement: the timeline spine is drawn (Owner 2026-09-15)

The timeline's spine SHALL be ONE whole-list SVG layer — measured from the
live item geometry, absolutely positioned over the list, `pointer-events:
none`, painted UNDER the dots and content — never per-item background
seams. Items, content, titles, times, and dots stay DOM. A no-JS floor
SHALL paint a simple CSS line per item before hydration (progressive
enhancement); hydration upgrades to the measured spine. The `line(i)`
per-item snippet seam RETIRES; the spine contract (a `spine` prop taking
`'plain' | 'dashed' | 'beam'` presets, names preserved, or a custom
snippet receiving the measured geometry) replaces it. Breaking, no compat.

#### Scenario: connectors are continuous paths

- GIVEN a multi-item timeline on any axis/direction/interlacing variant
- WHEN the spine draws
- THEN the connector runs item-center to item-center as ONE path per
  run — no per-item seams, no dead windows at node edges, verified by
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

- GIVEN `anim='scroll'`
- THEN the progress spine draws as `stroke-dashoffset` along the measured
  path in response to scroll position (the abspos/implicit-track
  machinery retires)

#### Scenario: the no-JS floor stands and upgrades

- GIVEN a prerendered (pre-hydration) timeline
- THEN every item shows the plain CSS line floor; after hydration the
  measured SVG spine replaces it with no layout shift beyond the
  spine's own width

### Requirement: the scroll-area family — one hand-drawn law, a native sibling, one shared kit (Owner 2026-09-15)

`scroll-area` SHALL hand-draw its scrollbar ALWAYS (the `variant` prop
RETIRES — no native mode, breaking). A separate `native-scroll-area` item
SHALL ship the platform scrollbar under the scrollbar-token law with the
native best practices as capability styles. Both SHALL share the
`scroll-area-kit` lib kernel (the control-chrome precedent): overflow
verdict, thumb geometry, the interaction state machine, and the custom
scrollbar's a11y contract — behavior in the kit, paint in the consumer.
`scroll-run` (the linear strip edge system) is a DIFFERENT shared system
and is untouched.

#### Scenario: the hand-drawn law owns the styled component

- GIVEN a scroll-area on either axis, any theme
- THEN the scrollbar is fully drawn: capsule thumb (full-radius), idle
  fade (~700ms), hover growth + brightening, drag-pinned opacity,
  keyboard affordances on region and thumb — restyled by tokens without
  JS, in both light and dark scopes

#### Scenario: auto-hide never hides the affordance from keyboard/AT

- GIVEN a focused or AT-engaged scroll-area
- THEN the thumb pins visible (focus/AT context suspends the idle fade)
  — `role="scrollbar"`, orientation, and value semantics live on the
  thumb

#### Scenario: the native sibling is capability styles

- GIVEN a native-scroll-area
- THEN the platform scrollbar renders under the site's scrollbar-token
  law, with `scrollbar-gutter: stable`, theme-scope-aligned
  `color-scheme`, `scrollbar-width` tiers, and `overscroll-behavior`
  containment packaged as the component's declared capabilities

#### Scenario: the kit is family-neutral

- GIVEN the kit's exported runtime
- THEN scroll-area and any consumer-built scroller mount the same
  verdict/geometry/state/a11y machinery with zero family paint — a new
  consumer adopts it with no CSS of the kit's look

#### Scenario: the variant prop is gone

- GIVEN the breaking migration
- THEN a source scan finds no `variant` prop on scroll-area and no
  `'native'`/'overlay' consumer site in the shipped surface (routes
  excluded per the glass-canary precedent)

### Requirement: floating surfaces speak spec-true position-area (Owner 2026-09-15)

Every floating surface that places through CSS anchor positioning
(`dropdown-menu`, `tooltip`, `float-button`, `menubar-panel` — the four
recorded inverted sites, and any future anchored surface) SHALL map its
side/align props to `position-area` values with the SPEC's semantics
(the area names where the SURFACE wants to sit relative to its anchor),
never the inverse. Each surface's placement matrix (side × align ×
collision flip) SHALL be verified by probe + screenshot against the
pre-sweep baseline.

#### Scenario: the four recorded sites flip to spec semantics

- GIVEN dropdown-menu, tooltip, float-button, and menubar-panel carry
  inverted `{area}` mapping tables or literal area strings
- WHEN the sweep lands
- THEN every placement in each surface's matrix lands where the spec's
  `position-area` grammar says (probe: computed anchor/area + screenshot
  diff against the recorded wrong baseline)

#### Scenario: collision flips stay in the spec grammar

- GIVEN a placement that flips on collision
- THEN the flipped area is still a spec-grammar area string derived
  from the same mapping — no ad-hoc insets patching a wrong area

## MODIFIED Requirements

### Requirement: the diagram surface keeps the source-first floor (mermaid)

The mermaid surface SHALL follow the code-card progressive-enhancement
contract: prerender paints the escaped diagram source as a readable
plain-text floor (zero JS), and after hydration the lazily-loaded
engine (a code-split singleton — the engine never rides a page's
critical path) swaps the rendered, sanitized SVG into the same box.
When the EFFECTIVE theme (pinned or resolved) is dark, the surface
SHALL carry its own dark backdrop by default (Owner 2026-09-15): a
designed veil built on `backdrop-filter` — blur plus a translucent tint
derived from the theme's own background token, rounded, padded, subtly
bordered — never the opaque hard-edge fill. The backdrop SHALL be
switchable off (`backdrop={false}` → transparent, as light mode today),
and SHALL degrade to today's opaque fill where `backdrop-filter` is
unsupported. Light themes never paint a backdrop.

#### Scenario: the floor upgrades after hydration

- GIVEN a prerendered page with a mermaid diagram
- THEN the served HTML shows the diagram source as escaped plain text
  - AND after hydration the engine chunk loads and the rendered SVG
    replaces the floor inside the same box (fade-in, reduced-motion
    respected)

#### Scenario: the site theme flip re-renders the palette

- GIVEN a rendered diagram in light mode with `theme="auto"`
- WHEN the root element's `dark` class toggles on
- THEN the diagram re-renders with themeVariables re-derived from the
  dark tokens (the SVG's baked colors change; the source does not)

#### Scenario: concurrent instances never cross wires

- GIVEN two mermaid instances mounted together, one light-pinned and
  one dark-pinned
- WHEN both render
- THEN each SVG comes out in its own theme with distinct ids (the
  engine's serial queue ordered the initialize/render pairs)

#### Scenario: a hostile config cannot break the floor

- GIVEN `config={{ securityLevel: 'loose', startOnLoad: true, theme: 'dark' }}`
- WHEN the engine initializes
- THEN startOnLoad stays false, securityLevel stays strict, and the
  theme stays base with the token-derived palette (protected fields
  survive; the rest of the config merges below)

#### Scenario: a parse error keeps the floor

- GIVEN a diagram whose source fails mermaid's parser
- THEN an error summary strip paints above the standing source floor
  and the surface never blanks

#### Scenario: zoom transforms without re-rendering

- GIVEN a rendered diagram
- WHEN the zoom-in control is pressed
- THEN the inner wrapper scales and the viewport becomes the pan
  surface, with no engine call, no SVG regeneration, and no shared
  scroll chrome inside the viewport

#### Scenario: dark carries its own backdrop (Owner 2026-09-15)

- GIVEN a mermaid surface whose effective theme is dark, mounted on a
  light page, with the default props
- THEN the viewport paints the backdrop-filter veil (blur + the
  theme-background-derived translucent tint, rounded, padded, subtle
  border) — no opaque hard-edge rectangle, the page readable through
  the translucency
- AND the derived dark palette keeps node fills and borders readable
  against the tinted ground (probe-measured contrast, not eyeballed)

#### Scenario: the backdrop switches off

- GIVEN the same surface with `backdrop={false}`
- THEN no veil and no opaque fill paint — the diagram sits on the page
  transparently, exactly as a light-theme surface does today

#### Scenario: no backdrop-filter support keeps a readable floor

- GIVEN a browser without `backdrop-filter` support
- THEN the veil degrades to the opaque theme-background fill (today's
  behavior) — the diagram never loses its ground

> Effect discipline SHALL match the code-card generation law: prop
> changes drop the previous paint booking, out-of-order resolutions
> no-op, and the floor shows the CURRENT source while a render is
> in flight; render ids SHALL follow the engine's collision contract (a
> per-instance monotonic base + per-render suffix — two instances,
> same-named instances, and consecutive re-renders never share a live
> id), and the engine's serial queue SHALL order initialize/render
> pairs so concurrent instances with different themes never interleave.
> The surface SHALL pass its own container as the engine's theme root
> (scoped containers — a `.jx-light` stage, a dark panel — resolve THEIR
> tokens, never the page's). `theme="auto"` (the default) SHALL follow
> the theme flip across the container's ENTIRE effective scope — a
> class observer filtered to the container ITSELF plus its current
> ancestors catches a scope class flipping on either (the figure
> directly, or an ancestor `.jx-light`→`.dark`) even when the document
> root never mutates — re-reading the live
> computed tokens after the change and re-rendering with re-derived
> themeVariables, with every observer disconnected on cleanup; an
> unrelated element's class change triggers nothing; an explicit
> `light|dark` SHALL pin the palette to the TARGET sheet's values, read
> through a temporary local probe wrapper under the same theme root
> (never a global class mutation — a light page with `theme="dark"`
> renders the dark sheet's colors). The engine's protected fields
> (startOnLoad:false,
> securityLevel strict, theme base) SHALL survive any consumer config —
> user config merges BELOW them, and user themeVariables merge
> field-wise over the derived palette. Controls SHALL cover the Owner
> minimum (copy source + zoom in/out/reset) under the press physics and
> the localization-payload law; zoom is a pure transform on the
> viewport's inner wrapper (no engine re-render). The zoom-pan viewport
> is a RECORDED scroll-run exemption: a two-axis pan surface for scaled
> content is not a linear overflow strip (the unification contract
> models one axis per run with linear nudge chips), so the viewport
> rides the scrollbar-token law (thin currentColor thumbs, both axes)
> and MUST NOT mount the shared chrome (no run, chips, or veils inside).
> The floor box reserves `min-height: var(--jx-mermaid-floor-min, 6rem)`
> while unrendered — a consumer-tunable token bounding the layout
> shift. A render failure SHALL paint an error summary strip and KEEP
> the source floor standing. The first render fades in, killed under
> `prefers-reduced-motion`. The surface SHALL honor the
> rest-attributes contract (rest spreads on the figure before the
> component's own stamps); the viewport SHALL carry `role="img"` with a
> NON-EMPTY accessible name at ALL times — the trimmed ladder
> `name?.trim() || labels?.diagram?.trim() || 'Diagram'` (an empty or
> whitespace `name` falls through; a nameless diagram never mounts a
> nameless img). The backdrop law (2026-09-15) rides the EFFECTIVE
> theme — the same resolution the palette uses — so a dark-pinned
> surface on a light page veils, a `theme="auto"` surface inside a dark
> scope veils, and the `backdrop={false}` switch and the
> no-backdrop-filter floor both keep the surface readable with zero
> config beyond the one boolean.
