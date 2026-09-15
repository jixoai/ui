# 2026-09-15-visual-quality-iteration — the Owner review round

## Why

The stylex kernel phase-0 landed (archived `2026-09-14-stylex-kernel-phase0`).
The Owner then walked the running site and returned four concrete visual
verdicts, each backed by evidence gathered this session (screenshots via the
capture agent, vision reads, and deterministic in-browser probes against
http://localhost:5199):

1. **scroll-area's dual-mode design is wrong** — `native` is a themed classic
   scrollbar with a square narrow thumb and gutter; `overlay` is self-drawn
   but harsh (square corners, solid gray, no capsule softness). Owner ruling:
   do NOT split native vs non-native — the whole `scroll-area` hand-draws its
   scrollbar for complete style control; a separate `native-scroll-area`
   component ships the platform path; both share one `scroll-area-kit`
   kernel; the native path's best practices become packaged capability
   styles. (Owner 2026-09-15, items 1)
2. **timeline feels wrong** — no hard rendering defect exists (probe-verified:
   the dashed chain paints `oklch(0 0 0)` 4/4 with dot-edge phase anchor; the
   beam paints and animates `jx-tl-beam-v`; keyframes registered; alignment
   clean at 2× zoom), but the spine column is a 1px hairline and the beam
   pulse is 1px×11px — nearly invisible — plus the capture agent's
   "connector floats above the grid" plane note. This is structural design
   debt in the per-item background-seam architecture. Owner's instinct:
   rework, likely SVG-drawn. (Owner 2026-09-15, item 2)
3. **mermaid `theme="dark"` must carry its own dark background** — today
   `mermaid.svelte` paints `tokens.background` (`#000000`) as an opaque
   hard-edge rectangle on the viewport (vision-confirmed: black-on-black node
   borders, no rounding, no design). Owner ruling: a dark backdrop ships by
   default with an off-switch, and the backdrop is built with
   `backdrop-filter`. (Owner 2026-09-15, item 3)
4. **shimmer auto+light paints a dark fill (rainbow same)** —
   `press-effect-runtime.ts` `contextIsDark()` reads `html.dark` (never set
   by the docs stages, which toggle `.jx-canvas-stage[data-theme]`) then
   falls to the OS scheme; `resolveFill(undefined)` returns the CSS `Canvas`
   keyword, which follows `color-scheme`/OS, not the stage theme. Light stage
   + OS dark = dark sweep on a light stage: the Owner's exact symptom.
   (Owner 2026-09-15, item 4)

Plus the phase-0 leftovers this round folds in (Owner 2026-09-15, item 5 —
"结合你自己说的这些问题"):

5. **the inverted `position-area` mapping sweep** — four floating surfaces
   (`dropdown-menu`, `tooltip`, `float-button`, `menubar-panel`) carry
   anchor-positioning area strings mapped inversely against the CSS spec's
   `position-area` semantics (phase-0 finding, sites confirmed still live).
6. **legacy sheet headers for every family this change touches** — the
   standing transitional law says a family's migration commit carries its
   header update; the four workstreams above touch several families, and
   their sheets ride along. (The REMAINING ~65 legacy sheets stay lawfully
   legacy until their own families migrate — out of scope here, one follow-up
   change later.)

## What Changes

### W1 — the press-effect fill channel follows the theme scope (bug fix)

`registry/files/ui/press-button/press-effect-runtime.ts` (shimmer + rainbow):

- `contextIsDark()` gains a scope walk: the nearest ancestor theme scope
  (`[data-theme]`, `.dark`, `.jx-light`) resolves first; `html.dark` is just
  the root-most scope; the OS scheme answers ONLY when the whole ancestor
  chain carries no scope.
- The auto path retires the `Canvas` keyword: `resolveFill(undefined)`
  resolves the EFFECTIVE canvas from the element's own context — the nearest
  opaque ancestor background (walk-up, `backgroundColor` parse), falling back
  to the scope-resolved scheme base (white/black). The sweep color follows
  the STAGE, live.
- Explicit fills (`solidFill()` minting) are untouched.

### W2 — mermaid dark carries a designed backdrop (feature)

`registry/files/ui/mermaid/`:

- New `backdrop` prop (default ON): when the EFFECTIVE theme (pin or
  resolved) is dark, the viewport paints a designed dark surface —
  `backdrop-filter` blur + a translucent tint derived from the theme's own
  `background` token, rounded, padded, subtle border — replacing today's
  opaque hard-edge `#000000` fill. `backdrop={false}` restores transparency.
- Graceful floor under `@supports not (backdrop-filter)`: today's opaque
  fill.
- Light theme behavior unchanged.
- A contrast pass over the derived dark palette (vision measured
  black-on-black node borders on the current paint).

### W3 — timeline's spine is drawn, not backgrounded (rework)

`registry/files/ui/timeline/` reworked to a hybrid engine:

- Items/content/dots stay DOM (text layout, a11y, density contract).
- The spine becomes ONE whole-list SVG layer (measured from the live item
  geometry): continuous connectors across items (no per-item seams), real
  dash patterns with the dot-edge phase-anchor law preserved, beam presets
  with actual width and glow, and the scroll-progress spine as a
  stroke-draw. Axis/direction/RTL variants resolve in one coordinate space.
- A no-JS floor: the SSR paint keeps a simple CSS line per item; hydration
  upgrades to the measured SVG spine (progressive enhancement, the code-card
  posture).
- The `line(i)` snippet seam evolves into the spine-preset contract
  (breaking; no compat shims — the Owner's one-step ruling).

### W4 — the scroll-area family: one hand-drawn law + a native sibling on a shared kit (rework)

- New `registry/files/lib/scroll-area-kit/` (the control-chrome lib
  precedent): the measurement runtime (overflow verdict, thumb geometry,
  drag/hover/idle-fade state machine, keyboard scrolling, the custom
  scrollbar's a11y contract) — shared, family-neutral.
- `scroll-area` reworked: ALWAYS hand-drawn (the `variant` prop retires,
  breaking). Capsule thumb, hover growth, idle fade, drag opacity, keyboard
  affordances — the complete style-control surface the Owner asked for.
- New `native-scroll-area`: the platform scrollbar under the site's
  scrollbar-token law, with the native best practices packaged as capability
  styles (`scrollbar-gutter: stable`, `color-scheme` alignment,
  `scrollbar-width` tiers).
- Boundary: `scroll-run` (the linear strip edge system) is a DIFFERENT
  shared system and stays untouched — the kit models boxed-region
  scrollbars, one axis pair per region.

### W5 — the anchor sweep + the riding headers

- The four inverted `position-area` mappings align to spec-true semantics;
  each surface's placement matrix (side × align × collision) verified by
  probe + screenshot.
- Every family sheet touched by W1–W4 migrates its header to the canonical
  five-layer statement (the standing transitional law's ride-along clause).
- `buildId`/`generatorVersion` bump if the payload generator's inputs
  changed shape.

## Impact

- **Specs**: `component-authoring` — one requirement MODIFIED (the mermaid
  source-first floor gains the backdrop law), four requirements ADDED (the
  fill-channel scope law; the timeline drawn-spine law; the scroll-area
  family law; the spec-true position-area law).
- **Components (breaking, no compat)**: `scroll-area` (variant prop
  retires), `timeline` (line(i) seam becomes the spine contract), plus the
  new `native-scroll-area` registry item and the new `scroll-area-kit` lib
  item.
- **Components (additive)**: `mermaid` (backdrop prop), press-button's
  effect runtime (scope-aware auto fill).
- **Components (fix)**: `dropdown-menu`, `tooltip`, `float-button`,
  `menubar-panel` (position-area semantics).
- **Docs**: the four component pages + effects page gain/refresh demos;
  registry.json descriptions update to the new shapes.
- **Verification posture**: every visual claim in this change carries BOTH a
  deterministic probe (computed style / geometry, the discipline this
  session established: vision reads only ride on top of programmatic
  verification) and a screenshot receipt; www + plugin suites + openspec
  strict stay the standing gates.
