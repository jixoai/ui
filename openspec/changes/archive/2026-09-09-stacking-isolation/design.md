# Design: stacking-isolation

## The doctrine (two clauses, one law)

The existing law — *"grid supplies stacking; position is for
transient ink"* — stays verbatim. It governs ORDER inside a one-cell
grid host: siblings at `grid-area: 1/1`, z-index decides paint
order, numbers are a dense local ladder (run auto < veil 1 < chips
2; layer auto < dock 1).

The missing half governs SCOPE: **a z ladder is component-private.
The owner roots it in a stacking context of its own.** Mechanism:
`isolation: isolate` on the ladder's common parent (the host whose
children compare). After isolation, the component participates
outside as ONE atomic unit at z auto — internal rungs stop being
comparable with foreign z, and foreign z stops reaching inside.

## Why `isolation: isolate` and not the alternatives

- **Renumbering (z 10/100 "ceilings")** — rejected: global magic
  number coordination across independent components is the disease
  itself; numbers only mean order inside a deliberately scoped
  context.
- **`position: relative; z-index: 0`** — works, but drags in
  positioning semantics (and `position: relative` on a host changes
  it into the offsetParent for descendants — the scroll-run run is
  itself LOAD-BEARING as its members' offsetParent; a second
  positioned ancestor invites measurement regressions).
- **`contain: layout`** — creates a stacking context but also a
  containing block for absolutely-positioned descendants and more;
  broader blast radius than the intent.
- **`isolation: isolate`** — purpose-built: creates exactly a
  stacking context, nothing else. No number, no positioning, no
  layout or pointer side effects. Its entire semantics is "this
  subtree's z ladder is private."

## The measured platform fact (recorded in the law)

`container-type: inline-size` does **not** establish a stacking
context in Chrome (hit-test-probed on the incident page: a z:2 chip
inside a `@container` layer beat a z:1 sibling OF the layer).
Neither `.jx-scroll-host` (consumer markup, `@container`-carrying)
nor `.jx-canvas-scroll` (`@container/jx-canvas`) scoped anything.
Conclusion for authors: containment utilities are NOT isolation;
isolation is one explicit property.

## Boundary placements (the incident fix)

1. **scroll-run** — `.jx-scroll-host`: the veil layer (z 1) and
   chevron chips (z 2) are the host's children; isolating the host
   scopes the whole ladder. Internal order unchanged (veils still
   paint over run content, chips still paint over veils).
2. **component-canvas, demo ceiling** — `.jx-canvas-scroll`: the
   demo content subtree becomes one atomic unit; the dock (z 1,
   sibling in the stage-row's cell) paints above EVERY demo
   internal regardless of what the demo's own sheets do. This is
   the canvas-side contract: "demo content never paints above
   canvas chrome" — guaranteed by the canvas, not by auditing 134
   pages of demos.
3. **component-canvas, page boundary** — `.jx-canvas-stage-row`:
   scopes the dock's own z 1 (the stage-row is a plain grid, not a
   stacking context; without this, the dock's number leaks to the
   page context exactly the way the chips' did). The canvas is one
   atomic unit at page level; page chrome above it is correct page
   ordering.

## What isolation does NOT change

- Internal ordering: the new stacking context preserves the
  relative order of everything inside it (same tree, same z's).
- The dock's acrylic: `backdrop-filter` samples everything painted
  below it in the backdrop root; isolation creates stacking
  contexts, not backdrop roots — blur/translucency unaffected.
- Pointer laws: hit-testing follows paint order; the dock above the
  isolated demo unit keeps its own-surface-only contract.
- The veils' scroll-driven entry, the chips' existence gating, the
  run's `position: relative` offsetParent duty — all untouched.

## The paint contract (stated once, encoded by the boundaries)

content < decorative ink < interactive chrome < canvas chrome <
page chrome. Each boundary owns its ordering; rungs stay small,
dense and local; cross-component order is decided between ATOMIC
UNITS (auto vs z at the shared boundary, or DOM order), never by
comparing one component's internal rung against another's.

## The sweep (audit-landed; research subagent inventory)

Class-(a) isolation points THIS round (each + www mirror):

| # | point | file | rationale |
|---|---|---|---|
| 1 | `:where(.jx-scroll-host)` | scroll-run.css (var-family rule) | The incident's leaking side. One edit covers scroll-run demos AND tabs (`.jx-tabs-horizontal` carries the class) AND button-group |
| 2 | `:where(.jx-canvas-scroll)` + `:where(.jx-canvas-stage-row)` | component-canvas.css | The canvas's two boundaries (demo ceiling + page boundary) — planned pre-audit |
| 3 | `:where([data-jx-timeline])` — the ol ROOT, never per-item | timeline.css | The ladder spans items (bridging lines' negative margins overlap neighbors); per-item isolation would freeze cross-item order to DOM order |
| 4 | the `.jx-table` scrollport | table.css/table.svelte | The leakiest positioned ladder in a canvas demo (sticky 3/2) |
| 5 | `:where(.jx-shell-host)` | website-scaffold.css | The scaffold's own "embeddable" contract; scopes the top-layer (40) + skip-link inside the shell |
| 6 | `isolate` on the spin wrap; `.jx-nav` bezel | spin.svelte / terminal-header.css | Low priority but demo-able standalone; one utility / one css line each |

DEFERRED (recorded, not this round): the input picker-overlay /
floating-label shells and the `.jx-color-shell` swatch/pipette pair —
the latter lives in `registry/files/theme/jx-pure.css`, Part A
(css-laws territory); it needs its own jx-pure spec touch, not a
drive-by.

Standing inventory facts from the audit (law-relevant):
- ~half the repo's ladders live in MARKUP UTILITIES (`z-[1]`, `z-0`,
  `z-[80/90]`), not css — doctrine and gates must read both.
- Two in-repo isolation idioms already exist and stay lawful:
  `.jx-surface`'s `isolation: isolate` (jixoai.css:387, the
  precedent) and press-button/chip's `relative z-0` host rooting
  (press-button.css:46-50). The law accepts both proofs.
- Zero-z SOURCE-ORDER is a legitimate dialect (carousel, section-
  card, tree-view: same-cell grid siblings ordered by DOM source) —
  the spec's exemplar list must say so, not imply z is required.
- The page-terminal calibrated plane ladder {content < toc/top-layer
  40 < fab 80 < toast 90 < skip-link 100} is cross-component BY
  DESIGN at page level — the terminal context where raw-number
  comparison is the sanctioned mechanism. `.jx-toc-aside` itself
  must NEVER be isolated (its comment: becoming a backdrop root
  kills the glass blur).
- table's sticky columns lack the spec's category annotation
  ("closed by un-annotated use") — a review miss; folded into this
  round's table touch.

## The print-determinism debt found and paid (bisect chain)

The first full gate of this round failed at verify:print
(800×600 ≡ 1600×1200 DIVERGED on the accordion carrier, pages 2-3
code-block fragmentation). Bisect, three cuts:

1. dist css with EVERY `isolation:isolate` stripped → still
   diverged (this round's isolations exonerated);
2. HEAD (a0a512e9) clean rebuild → still diverged, identical
   signature (this round's whole diff exonerated);
3. e96f55bb (pre-grid-dock main) rebuild → **EQ**.

Root cause: the a0a512e9 grid-era dock CONTRIBUTES its natural
height to the stage-row (the absolute era contributed zero), and
its width clamp is cqi of the canvas host — both vary with the
rendering viewport, so the print snapshot's fragmentation boundary
drifted between viewports. The gate that shipped a0a512e9 passed
verify:print by luck (the divergence is deterministic today).

Fix (semantically right, not just a gate appeasement): paper has no
interactive chrome — the dock RETIRES in print, both sides:

- `kernel-print.css` §5b: `[data-print-output] [data-jx-canvas-dock]
  { display: none }` — the artifact scope (the sim renders
  screen-media, so an @media print rule alone can never reach it);
- `component-canvas.css`: the component's own `@media print`
  display:none — raw consumer prints outside the site pipeline.

With the dock retired, the stage-row's height returns to pure
content drive and the determinism differential holds (probed EQ at
both viewports; signature differs from e96f55bb's only by this
round's additive markup).

ENVIRONMENT POSTSCRIPT (the gate's PORT contract blind spot): the
fix's first gate rerun STILL failed verify:print while a fresh-dist
standalone probe was EQ — a `python3 -m http.server 4173` residue
from Sep 3 was serving a SIX-DAY-OLD dist of the MAIN checkout;
verify-print's "use whoever answers on 4173" contract has no
artifact-ownership check, so every print gate since Sep 3 tested
whatever that server held. Killed the residue (predates every live
session); the gate then self-serves the real dist. Follow-up
recorded: verify-print should validate artifact ownership (or
verify-all should pass an ephemeral --url like verify:km does).

## Enforcement (decided)

Two layers, both this round:
1. HARD, browser-computed: the gate asserts `isolation: isolate`
   (computed style) on every isolation point shipped above, on live
   probe pages — true to paint, zero false positives (extends an
   existing verify-* browser script; no host-resolution heuristics).
2. ADVISORY, static: verify-standards prints the z-index/z-[n]
   census over registry css AND svelte markup (host + proof columns)
   so drift surfaces in every gate run without false-blocking; the
   full host-resolution linter (resolve each ladder's common host,
   require an SC proof or category annotation, accept var-keyed
   calc z, flag `static z-[n]` no-ops) is the recorded follow-up.
