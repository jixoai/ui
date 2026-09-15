# Design — 2026-09-15-visual-quality-iteration

## Evidence base (all gathered 2026-09-15 against the running dev server)

Receipts live in this change's `research/` directory (screenshots +
probe scripts + outputs); the table cites the load-bearing facts.

| Claim | Deterministic evidence |
| --- | --- |
| shimmer auto fill is OS-scheme-bound | `registry/files/ui/press-button/press-effect-runtime.ts:131-136` (`contextIsDark` = `html.dark` → `matchMedia`), `:191` (`resolveFill(undefined)` → `'Canvas'`); docs stages toggle `.jx-canvas-stage[data-theme]`, `html.dark` is never set |
| mermaid dark paints an opaque hard black | `registry/files/ui/mermaid/mermaid.svelte:163-168` (`viewport.style.backgroundColor = tokens.background`; dark table `#000000` at `mermaid-engine.ts:167`); vision receipt: black-on-black node borders, no rounding |
| scroll-area is a 352-line dual-mode | `scroll-area.svelte` (291) + `scroll-area.css` (61), `ScrollbarVariant = 'native' \| 'overlay'`; vision receipts: native = square gray thumb + gutter classic bar; overlay = square-cornered solid thumb, no capsule |
| timeline has NO rendering defect | headless probe on `/docs/components/timeline.html`: dashed = `repeating-linear-gradient(oklch(0 0 0) 0 4px, transparent 4 8px)` with `background-position: 0 var(--jx-icon)`; beam = `::after` gradient + `jx-tl-beam-v` running; keyframes registered; `--border: oklch(0 0 0)` is the site's intentional light token (`apps/www/src/lib/jixoai.css:58`) |
| timeline's visual debt is structural | spine column measured 1px wide; beam pulse 1px×11px; per-item background seams (the dashed phase-anchor comment in `timeline.css:350-358` documents the dead-window class of problems); capture agent: connector reads as floating above the grid plane |
| four inverted position-area sites live | `registry/files/ui/dropdown-menu/dropdown-menu.svelte:286`, `registry/files/ui/tooltip/tooltip.svelte:677` (both `{area}` from mapping tables at dropdown `:107-111` / tooltip `:184-188`), `registry/files/ui/float-button/float-button.svelte:128` (`top span-right`), `registry/files/ui/menubar/menubar-panel.svelte:144` (`bottom span-left`) |
| legacy headers | 65 sheets still open `@layer theme, base, components, utilities;` (spec wrote ~147 at phase-0; migration continues lawfully); confirmed old-form today: `scroll-area.css`, `menubar.css` among them |

Vision reads in this table ride ON TOP of the probes (the anti-hallucination
law): every vision claim above was either confirmed programmatically or
downgraded — e.g. "dashed/beam invisible" was a vision resolution artifact,
cleared by probe + 2× zoom crop.

## W1 — the fill channel's scope law

**Problem shape.** The fill default must follow "the Context's dark/light"
(the Owner's r12 ruling). The runtime's context ladder reads
`html.dark` then the OS scheme — but this site's (and any consumer's) themed
STAGES carry their theme as a scoped attribute/class on an ancestor, and the
OS scheme is not a statement about the element's context at all. The `Canvas`
keyword inherits the same flaw one layer down: it resolves from
`color-scheme`, which the page never scopes per-stage.

**The law.** The context is RESOLVED FROM THE HOST ELEMENT, not the document:

1. Walk the host's ancestor chain (self included) for the nearest theme
   scope — `[data-theme="light"|"dark"]`, `.dark`, `.jx-light` — first hit
   wins (a dark stage on a light site is dark).
2. No scope anywhere → the OS scheme answers (an unthemed page follows the
   user, honest fallback).
3. The auto FILL COLOR retires `Canvas`: resolve the effective canvas as the
   nearest OPAQUE ancestor `backgroundColor` (walk-up + parse), falling back
   to white/black by the resolved context. The sweep follows the stage's
   actual base — tinted stages included — and flips live with scope
   mutation.
4. Explicit fills are untouched (`solidFill()` minting, numeric fills).

**The scope observer.** ONE `MutationObserver` per mounted effect on the
host's ancestor chain (self through root), `attributeFilter: ['class',
'data-theme']` — a class flip (`jx-light` → `dark`) AND an attribute flip
(`data-theme="light"` → `"dark"`) both re-resolve; disconnected on effect
cleanup. (The r1 review's catch: watching class alone would leave
`data-theme` stages — this very site's demo mechanism — stale.)

**Why walk-up beats token reads.** The measured base cannot lie (the
`contextBase` comment's own doctrine: "tokens lie, the rendered root does
not"); scope classes answer light/dark even when the page sets no
`color-scheme`.

**Tests.** jsdom ladder battery (scope beats html.dark beats OS; no-scope →
OS; gradient-stage walk-up; explicit fills untouched; BOTH observer
mutation kinds fire). Browser pixel probe: light stage +
`emulateMedia({ colorScheme: 'dark' })` → the sweep must sample LIGHT (the
Owner's exact symptom inverted), the dark-stage converse, and the two
attribute/class flips re-resolving without re-mount. Rainbow shares
`resolveFill` — one battery covers both.

## W2 — the mermaid backdrop (subtraction ink, not a tint)

**The law this must obey.** The subtraction ink law (design-tokens, Owner
2026-09-01): masks, shades, veils and darkening overlays SHALL NOT add ink —
no dark `background`, no hand-mixed tint over content; they SHALL subtract
color via `backdrop-filter`. The r1 design's "translucent tint derived from
the theme background" was an ink-adding veil and is RETIRED here.

**The surface.** When the EFFECTIVE theme is dark and `backdrop` is on
(default), the viewport's veil layer paints ZERO background and darkens the
page behind subtractively:

- `backdrop-filter: blur(<radius>) contrast(<c>) brightness(<b>)
  saturate(<s>)` — the chain pulls near-white hard toward the dark ground
  (and leaves an already-dark page dark); the veil is the Owner's directive
  ("用 backdrop-filter 做暗色背景") and the law's sanctioned technique in
  one move.
- Geometry/falloff where needed ride mask gradients (the law's own tool);
  the box carries the card dialect's corner (radius token), inner padding,
  and a 1px token-law border.
- `backdrop={false}`: no veil and no ground — transparent as light mode.
- `@supports not (backdrop-filter: blur(1px))`: the component's OWN opaque
  theme-ground fill returns — the standing PRE-CHANGE behavior, positioned
  as the surface's own ground (a surface may paint its ground; a veil may
  not add ink), recorded as this change's named floor boundary.
- Light themes never paint a backdrop (unchanged). The zoom-pan scrollbar
  exemption and the source-first floor are untouched.

**Contrast acceptance (fixed numbers, not taste).** The r1 design left the
threshold to the reviewer — retired. The contract:

- Algorithm: WCAG 2.x relative-luminance contrast ratio.
- Objects: (a) diagram LABEL text against its own node fill; (b) node
  fill and node border against the veil ground sampled 2px past the
  node border; (c) CONNECTORS ≥ 3:1 sampled antialias-proof — every
  edge connector in the fixture, at three equally spaced centerline
  points (1/4, 1/2, 3/4), the stroke's line-core pixel versus a ground
  patch 2px past the stroke edge along the normal, the patch the mean
  of its 3×3 device-pixel window.
- Thresholds: labels ≥ 4.5:1; non-text graphics (fills, borders,
  connectors) ≥ 3:1.
- Fixture: the docs page's dark-pinned demo diagram rendered on the light
  page (the Owner's exact viewing condition), pinned Chromium, 2× DPI
  screenshot, pixel sampling at label strokes and node boundaries.
- Fail condition: ANY sampled pair below its threshold reds the probe.
- The filter-chain constants are calibrated to pass; the THRESHOLD is the
  acceptance and does not move. If the token-derived palette cannot clear
  the graphics threshold on the subtractive ground, the derived palette
  lifts node fills toward white THROUGH ITS OWN TOKENS (a derived-palette
  adjustment, never a hand-mixed hex) — measurement decides, and the
  lift is recorded in the receipts.

## W3 — timeline's drawn spine

**Rejected first: the pure-CSS quality pass.** Widening the column,
fattening the beam, and z-ordering the grid plane would address symptoms;
the structural complaints — per-item background seams (the phase-anchor
dead-window note), seam-by-seam continuity, 1px-everything precision, the
`line(i)` per-segment contract — are architectural. The Owner's instinct
(SVG) is correct; this change takes it.

**The hybrid engine.**

- DOM keeps what DOM is for: items, content, titles, times, dots, the
  density contract, a11y, text layout.
- ONE whole-list SVG layer paints the spine, mounted as a `grid-area: 1/1`
  SIBLING of the item list inside a one-cell grid host — the css
  architecture law's overlay dialect (grid supplies stacking; `position:
  absolute` is not for layout). Source order paints the SVG UNDER the
  items (the zero-z dialect); `pointer-events: none` keeps it inert; the
  ladder roots with `isolation: isolate` on the LIST ROOT — the law's own
  timeline ruling (a multi-parent ladder isolates at its true common
  parent, never per-item).
- TWO standing abspos exemptions RETIRE with this design — net spec
  hygiene: the timeline beam (TRANSIENT INK, it now lives inside the SVG
  layer) and the scroll-progress spine's absolute channel
  (CONTAINING-BLOCK NEEDS 2026-09-02, replaced by the whole-list stroke
  draw). The css-architecture exemption list shrinks; the change records
  the retirement.

**The spine's paint.**

- connectors as continuous paths item-center to item-center (axis,
  direction, interlacing resolve in one coordinate space);
- dash presets as real `stroke-dasharray` with the dot-edge phase law
  preserved (`stroke-dashoffset` anchored to the node edge — the
  background-position trick's semantic successor);
- the beam as a stroked gradient segment with actual width + soft edges
  (SVG gradient + optional blur), animated along the path;
- the scroll-progress spine as `stroke-dashoffset` draw-on.

**The geometry payload contract (fixed).** The measurement runtime emits,
per list: node centers in LIST-ROOT coordinates (flow order), axis /
direction / interlaced metadata, per-segment path data, and the density
scale. Re-measure triggers: root resize (ResizeObserver), membership
mutation (childList observer), density/context change. RTL resolves in the
coordinate transform (physical geometry, logical chronology). A custom
`spine` snippet receives exactly this payload — stable, typed, documented
in the item's docs.

**The floor.** SSR (and pre-hydration) paints a simple per-item CSS line —
today's plain preset, no JS — and hydration swaps in the measured SVG
(progressive enhancement, the code-card posture; reduced-motion freezes
beams exactly as today). The floor receipt is a REAL JS-disabled
screenshot (browser context with `javaScriptEnabled: false`), not an
assertion.

**The seam.** `line(i)` (per-item snippet) is replaced by the spine
contract: a `spine` prop taking a preset (`'plain' | 'dashed' | 'beam'`,
names preserved) or a custom snippet receiving the geometry payload.
Breaking, no compat — and a source-scan canary ships (zero `line(i)`
residue in the shipped surface after migration, two-directional fixture).

**Why not full-SVG.** Text layout, wrapping, density scaling, and a11y in
SVG are regressions waiting; the spine is the only part that suffers as
DOM. Hybrid is the honest split.

## W4 — the scroll-area family

**The kit** (`registry/files/lib/scroll-area-kit/`, the control-chrome lib
precedent), SPLIT BY CONCERN (the r1 review's catch: one monolithic
state machine would force the native sibling to mount custom-thumb ARIA
it cannot honestly carry):

- **the shared CORE** — overflow verdict (the scroll-run verdict's shape,
  one per axis pair), thumb geometry (ratio/position math), theme-scope
  resolution. Zero paint, zero ARIA of its own.
- **the hand-drawn INTERACTION ADAPTER** — idle-fade timer, hover grow,
  drag pinning, keyboard scrolling, and the thumb's a11y contract
  (`role="scrollbar"`, `aria-controls`/`aria-valuenow`/
  `aria-orientation`, focusable, keyboard-draggable). Consumed ONLY by
  the hand-drawn component.
- **the native CAPABILITY STYLES** — the packaged best practices (below).
  Consumed ONLY by the native sibling.

**`scroll-area` (reworked).** One mode: hand-drawn. Capsule thumb
(full-radius), auto-hiding with idle fade (~700ms), hover widens +
brightens, drag pins opaque, keyboard focus ring on the region + thumb,
track-click paging, both axes, RTL. The look follows the scrollbar TOKEN
law (currentColor family) so themes/dark stages restyle without JS.

**The auto-hide pins (testable, not aspirational).** "AT-engaged" is not a
detectable platform state and is deliberately NOT the contract. The pins
are: region focus-within, thumb focus, active drag, hover — each
separately probe-asserted to suspend the fade; and while any pin holds,
the thumb node stays in the accessibility tree (role intact,
`aria-valuenow` tracking). That covers keyboard and AT users by
construction without claiming an undetectable state.

**`native-scroll-area` (new).** Zero drawn chrome: the platform scrollbar
under the site's scrollbar-token law, with the native best practices as
packaged capability styles: `scrollbar-gutter: stable` (no layout shift on
overflow), theme-scope-aligned `color-scheme` (the bar follows the stage
scope, not just the OS — the W1 lesson applied to native),
`scrollbar-width: auto | thin | none` tiers, `overscroll-behavior`
containment. NO custom scrollbar ARIA mounts anywhere inside it — the
platform scrollbar IS the accessibility contract.

**Boundary.** `scroll-run` (linear strip edges — tabs, button-group) is a
different shared system and stays untouched; the kit models boxed-region
scrollbars. The zoom-pan exemption in the mermaid spec keeps its recorded
status.

**Registry proof.** Both new items enter the clean-consumer harness (the
registry spec's real-install proof — `verify-shadcn-add.mjs` cases for the
component, the lib-item install-proof lane for the kit), not just
registry.json entries.

## W5 — the anchor sweep + ride-alongs

**The mapping law.** `position-area` names the region the SURFACE occupies
relative to its anchor — the surface that should sit ABOVE its anchor
declares the area `top`, never the inverse. The four sites' mapping tables
(and the two literal strings) flip to this grammar; the corrected
side × align tables are written INTO the components' source as the single
mapping truth, and the SAME corrected table feeds BOTH emission channels —
the modern `position-area` string AND the legacy `inset-area` fallback
string (the components currently stamp both; one table, two emissions, no
divergence between them).

**The probe protocol (reused, not invented).** The standing
`scripts/verify-popover-area-align.mjs` harness extends to the four
surfaces with thresholds, plus a swapped-map NEGATIVE control (the old
inverted table planted must red the probe — two-directional proof), plus
baseline-diff screenshots per surface so the correction moves the RIGHT
surfaces the RIGHT way.

**The ride-along headers (enumerated).** These exact css paths migrate to
the canonical five-layer statement and enter the migration ledger:
`registry/files/ui/press-button/press-button.css`,
`registry/files/ui/mermaid/mermaid.css`,
`registry/files/ui/timeline/timeline.css`,
`registry/files/ui/scroll-area/scroll-area.css` (new-form by rework),
`registry/files/ui/menubar/menubar.css`,
`registry/files/ui/dropdown-menu/dropdown-menu.css`,
`registry/files/ui/tooltip/tooltip.css`,
`registry/files/ui/float-button/float-button.css`. Untouched families stay
lawfully legacy until their own migration (follow-up change, not this one).

**buildId/generatorVersion.** Bump IFF the payload generator's inputs
changed — new items, removed/renamed exports, dependency-edge changes. The
no-bump branch carries its own proof: generator input diff empty +
manifest regenerated byte-identical. Both branches recorded in the
receipts.

## Risks / open questions for the reviewer

1. **W3 measurement cost**: the SVG spine re-measures on resize/density/
   membership mutation — the scroll-run observer shape is proven, but the
   interlaced+horizontal+RTL matrix is the widest in the family; the probe
   battery must pin all three axes of the matrix before any taste question.
2. **W1 walk-up vs gradient stages**: the nearest-opaque-ancestor walk reads
   `backgroundColor` only; a gradient-having stage resolves to the opaque
   base UNDER the gradient (correct for light/dark reading). Confirm no
   demo stage paints BOTH a gradient and expects the gradient's local color
   to drive the sweep.
3. **W2 subtractive reach**: the filter chain pulls near-white toward dark
   but a mid-tone page (≈50% gray) moves least — the contrast probe runs on
   the light-page fixture (the Owner's condition); a mid-tone backdrop page
   is the known soft spot of subtraction generally, inherited from the law,
   not introduced by this veil.
4. **W4 idle-fade vs a11y**: covered by the four testable pins + tree
   persistence (above); if the reviewer wants a fifth pin (e.g. screen-
   reader-specific), it must name a DETECTABLE platform state.
5. **Change size**: five workstreams in one change is deliberate (the
   Owner's "下一轮大迭代"); if the review surface is still too wide, the
   split line is W3+W4 (reworks) vs W1+W2+W5 (fixes/features) — flag it,
   do not silently split.
