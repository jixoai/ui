# Design — 2026-09-15-visual-quality-iteration

## Evidence base (all gathered 2026-09-15 against the running dev server)

| Claim | Deterministic evidence |
| --- | --- |
| shimmer auto fill is OS-scheme-bound | `registry/files/ui/press-button/press-effect-runtime.ts:131-136` (`contextIsDark` = `html.dark` → `matchMedia`), `:191` (`resolveFill(undefined)` → `'Canvas'`); docs stages toggle `.jx-canvas-stage[data-theme]`, `html.dark` is never set |
| mermaid dark paints an opaque hard black | `registry/files/ui/mermaid/mermaid.svelte:163-168` (`viewport.style.backgroundColor = tokens.background`; dark table `#000000` at `mermaid-engine.ts:167`); vision receipt: black-on-black node borders, no rounding |
| scroll-area is a 352-line dual-mode | `scroll-area.svelte` (291) + `scroll-area.css` (61), `ScrollbarVariant = 'native' \| 'overlay'`; vision receipts: native = square gray thumb + gutter classic bar; overlay = square-cornered solid thumb, no capsule |
| timeline has NO rendering defect | headless probe on `/docs/components/timeline.html`: dashed = `repeating-linear-gradient(oklch(0 0 0) 0 4px, transparent 4 8px)` with `background-position: 0 var(--jx-icon)`; beam = `::after` gradient + `jx-tl-beam-v` running; keyframes registered; `--border: oklch(0 0 0)` is the site's intentional light token (`apps/www/src/lib/jixoai.css:58`) |
| timeline's visual debt is structural | spine column measured 1px wide; beam pulse 1px×11px; per-item background seams (the dashed phase-anchor comment in `timeline.css:350-358` documents the dead-window class of problems); capture agent: connector reads as floating above the grid plane |
| four inverted position-area sites live | `dropdown-menu.svelte:286`, `tooltip.svelte:677` (both `{area}` from mapping tables at dropdown `:107-111` / tooltip `:184-188`), `float-button.svelte:128` (`top span-right`), `menubar-panel.svelte:144` (`bottom span-left`) |
| legacy headers | 65 sheets still open `@layer theme, base, components, utilities;` (spec wrote ~147 at phase-0; migration continues lawfully) |

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
   mutation (a class observer on the ancestor chain, the mermaid theme
   observer's shape, disconnected on cleanup).
4. Explicit fills are untouched (`solidFill()` minting, numeric fills).

**Why walk-up beats token reads.** The measured base cannot lie (the
`contextBase` comment's own doctrine: "tokens lie, the rendered root does
not"); scope classes answer light/dark even when the page sets no `color-scheme`.

**Tests.** jsdom ladder battery (scope beats html.dark beats OS; no-scope →
OS); browser pixel probe: light stage + `emulateMedia({ colorScheme: 'dark' })`
→ the sweep must sample LIGHT (the Owner's exact symptom inverted), and the
dark-stage converse. Rainbow shares `resolveFill` — one battery covers both.

## W2 — the mermaid backdrop

**The surface.** When the EFFECTIVE theme is dark and `backdrop` is on
(default), the viewport paints a designed dark veil INSTEAD of the opaque
`backgroundColor` fill:

- `backdrop-filter: blur(<token>) saturate(<token>)` over a translucent tint
  layer at `color-mix(in srgb, <theme background> ~72%, transparent)` — the
  tint derives from the SAME `readThemeTokens` background the opaque fill
  used, so the veil is the theme's own dark, at translucency.
- The veil box carries the card dialect's corner (radius token), inner
  padding, and a 1px `color-mix` border — a surface, not a rectangle.
- `backdrop={false}`: no veil, no opaque fill — transparent as light mode.
- `@supports not (backdrop-filter: blur(1px))`: the opaque `background`
  fill returns (today's behavior as the graceful floor).

**Contrast pass.** The dark palette derivation lifts node fills one step off
the veil (`mainBkg` mixed ~6-10% toward white) so borders and fills read
against the tinted — not pure-black — ground; measured by screenshot diff,
not eyeballed. If the probe shows the token-derived borders already read
(the dark `--border` is `oklch(1 0 0)` — white), the lift narrows to zero;
the measurement decides, not the taste.

**Boundary.** Light themes never paint a veil (unchanged). The zoom-pan
scrollbar exemption and the source-first floor are untouched.

## W3 — timeline's drawn spine

**Rejected first: the pure-CSS quality pass.** Widening the column, fattening
the beam, and z-ordering the grid plane would address symptoms; the
structural complaints — per-item background seams (the phase-anchor
dead-window note), seam-by-seam continuity, 1px-everything precision, the
`line(i)` per-segment contract — are architectural. The Owner's instinct
(SVG) is correct; this change takes it.

**The hybrid engine.**

- DOM keeps what DOM is for: items, content, titles, times, dots, the
  density contract, a11y, text layout.
- ONE whole-list SVG layer paints the spine, absolutely positioned over the
  list, `pointer-events: none`, drawn UNDER the dots and content (the
  floating-above-the-grid complaint dies at the z-order root):
  - connectors as continuous paths item-center to item-center (axis,
    direction, interlacing resolve in one coordinate space);
  - dash presets as real `stroke-dasharray` with the dot-edge phase law
    preserved (`stroke-dashoffset` anchored to the node edge — the
    background-position trick's semantic successor);
  - the beam as a stroked gradient segment with actual width + soft edges
    (SVG gradient + optional blur), animated along the path;
  - the scroll-progress spine as `stroke-dashoffset` draw-on (the
    abspos/implicit-track machinery retires).
- Geometry from measurement: a ResizeObserver + item-locator pass computes
  node centers after mount and on mutation/density change; RTL mirrors in
  the coordinate transform.
- The floor: SSR (and pre-hydration) paints a simple per-item CSS line —
  today's plain preset, no JS — and hydration swaps in the measured SVG
  (progressive enhancement, the code-card posture; reduced-motion freezes
  beams exactly as today).

**The seam.** `line(i)` (per-item snippet) is replaced by the spine
contract: a `spine` prop taking a preset (`'plain' | 'dashed' | 'beam'`,
the defaults mapping 1:1) or a custom snippet that receives the measured
geometry (path data, node centers, axis metadata) and paints SVG. Breaking,
no compat — but the three shipped presets keep their names.

**Why not full-SVG.** Text layout, wrapping, density scaling, and a11y in
SVG are regressions waiting; the spine is the only part that suffers as
DOM. Hybrid is the honest split.

## W4 — the scroll-area family

**The kit** (`registry/files/lib/scroll-area-kit/`, the control-chrome lib
precedent): family-neutral runtime — overflow verdict (the scroll-run
verdict's shape, one per axis pair), thumb geometry (ratio/position math),
the interaction state machine (idle-fade timer, hover grow, drag opacity,
wheel/keyboard scroll), and the custom scrollbar's a11y contract
(`role="scrollbar"`, `aria-controls`/`aria-valuenow`/`aria-orientation`,
focusable, keyboard-draggable). No paint in the kit — consumers own the
look, the kit owns the behavior.

**`scroll-area` (reworked).** One mode: hand-drawn. Capsule thumb
(full-radius), auto-hiding with idle fade (~700ms), hover widens + brightens,
drag pins opaque, keyboard focus ring on the region + thumb, track-click
paging, both axes, RTL. The `variant` prop retires. The look follows the
scrollbar TOKEN law (currentColor family) so themes/dark stages restyle
without JS.

**`native-scroll-area` (new).** Zero drawn chrome: the platform scrollbar
under the site's scrollbar-token law, with the native best practices as
packaged capability styles: `scrollbar-gutter: stable` (no layout shift on
overflow), `color-scheme` alignment (the bar follows the theme scope, not
just the OS — the W1 lesson applied to native), `scrollbar-width: auto |
thin | none` tiers, `overscroll-behavior` containment. This is the
"specific capability styles" the Owner asked the native path to become.

**Boundary.** `scroll-run` (linear strip edges — tabs, button-group) is a
different shared system and stays untouched; the kit models boxed-region
scrollbars. The zoom-pan exemption in the mermaid spec keeps its recorded
status.

## W5 — the anchor sweep + ride-alongs

- The four sites' `{area}` mapping tables (and the two literal strings)
  flip to spec-true `position-area` semantics; verification is a placement
  matrix probe (side × align × collision flip) per component + screenshot
  receipts against the current (wrong) baseline, so the diff shows the
  correction moving the RIGHT surfaces the RIGHT way.
- Family sheets touched by W1–W4 open with the canonical five-layer
  statement (the standing transitional ride-along). Untouched families stay
  legacy until their own migration (follow-up change, not this one).
- `buildId`/`generatorVersion` bump rides the registry shape change (new
  items, retired prop) if the generator's inputs say so.

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
3. **W2 translucency level**: ~72% tint over blur is the starting constant;
   the probe (min-contrast over the diagram's own nodes) calibrates it, not
   taste. Reviewer may set the acceptance number.
4. **W4 idle-fade vs a11y**: auto-hide must never hide the scroll AFFORDANCE
   from keyboard/AT users (focus/AT-context pins the thumb visible). The
   kit's state machine takes this as a law, not a default.
5. **Change size**: five workstreams in one change is deliberate (the
   Owner's "下一轮大迭代"); if the reviewer finds the review surface too
   wide, the split line is W3+W4 (reworks) vs W1+W2+W5 (fixes/features) —
   flag it, do not silently split.
