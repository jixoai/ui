# TASK 70 — CODE website-scaffold.html (quill, 2026-09-22)

**Tier 2 (archetype rebuild over a content-rich stub) — the LAST CODE page of
my lane.** The 279-line stub had the fleet's best no-nest exhibit ("This page
is already the demo" + the scroll playground driving the LIVE top layer) but
no install/overview/base/see-also, a six-entry ToC with the trio misplaced, no
measured axes rows, and no EXTRA-lane/theme-strata verdicts. Two files
changed, both page-level: `+page.svelte` (279 → full archetype) + `+page.ts`
(ToC 10/10, trio last). NO commits, zero family edits.

## THE SELF-REFERENCE AT MAXIMUM (the dispatch's spine, delivered per surface)

This page LIVES in the shell it documents, so every measurement names its
surface, and the page says so in its own header comment and overview:

- **The LIVE shell** (this page's own chrome — .jx-shell-host/.jx-shell/
  .jx-shell-body/.jx-top-layer): all structural receipts read HERE — the form
  grid, --jx-header-h, the scroll reservation, the immersive law, the pointer
  law, the view-transition names, the skip link.
- **A bounded demo instance** (probe fixture, NOT rendered on the page): a
  480px host ran the NARROW form (one content column) inside the wide window
  — the embeddable-container claim measured. The page deliberately does NOT
  render a second instance: the no-nest ruling (a second 100svh overlay
  scroll plane would trap the page) is kept, and the probe receipt is cited
  where the embeddability claim appears.
- **The stage pin** (the HOST LAYER's source): the component canvas stamps
  `data-theme="light"` + `.jx-light` + `data-jx-canvas-stage` on its stage —
  measured present on this page's canvases. The scaffold HOSTS the strata;
  the canvas stamps them.

## The theme strata terminate here (the theme axis row, in full)

theme="dark" stamps the .dark class on the shell-host, and the shell IS the
page ground — measured: the body ground flips oklch(1 0 0) → oklch(0 0 0)
under the page bridge while the live shell hosts everything. The strata's
other layers (the root alias, the canvas island, the component stamp, the ink
freezes) are stamped by OTHER families measured in tasks 53/67/68/69 — the
scaffold hosts the strata rather than joining them all. That sentence is the
row.

## Measurements (probe receipts, served DOM at :5241 — 17/17, two consecutive runs)

- **LIVE shell (surface: this page's chrome)**: container-name `jx-shell`,
  container-type inline-size; the ≥1200 form measured
  **[256 | 1104 | 240]** (rail 16rem / content / toc 15rem);
  `--jx-header-h` **74px** with the ResizeObserver correction landing on
  .jx-shell — the var's DECLARING scope (the toc-flush seam); body
  reservation scroll-padding 106px, 6164px scrollable; skip link →
  **main#main**; view-transition names **site-header / page-main** live.
- **The immersive law**: scroll DOWN 500 → `data-hidden="true"` + the header
  at `translateY(−74.74px)` (the header-h itself); scroll UP → revealed
  (data-hidden cleared). Threshold 8px, rAF-throttled, one state.
- **The overlay pointer law**: `.jx-scaffold-header` pointer-events **auto**;
  `.jx-float-slot` pointer-events **none** (the grant stops at float
  wrappers — the adjudicated D-1 fix, measured).
- **The named-area budget** (the float-plane placements, measured per form):
  ≥1200 `header header header / tree stage toc` · 900–1199 `header header /
  stage toc` · <900 `header tocbar stage` — five named areas across three
  forms; that is the placement budget toast's "nine-slot" note budgets
  against.
- **Embeddable container**: the 480px bounded instance measured a ONE-column
  grid (460px inner) — the narrow form inside the wide window, container
  queries on the instance's own host.
- **The stage pin**: this page's canvas stages carry `data-theme="light"` +
  the `.jx-light` scope class — the island law's stamp, present and named.
- **The boot splash (the dogfood receipt)**: the ROOT LAYOUT renders
  `<BootSplash title="jixoai-ui" …>` (src/routes/+layout.svelte:724) — the
  SSR HTML ships `data-jx-splash="layer"` + `jx-boot-splash-layer` (measured
  in the served HTML), and the LIVE DOM has unmounted the layer while the
  head-carried `<style data-jx-boot-splash>` persists by design (the FOUC
  mask rides the HTML). SSR ships it, the captor dismisses it, the style
  stays — the seat, measured end to end.
- **Axes**: auto density stamps NOTHING on the host (measured absent — the
  no-opinion law made visible); zero effective-carrier readers across all
  eight (grep receipt); the immersive leaves are transforms, never shadows.

## What changed (page-level)

1. **Archetype rebuild**: hero → `#install` → `#overview` (the four-name
   architecture, the three forms, the strictest contract, the surface-naming
   spine) → `#live-demo` (the no-nest exhibit + the scroll playground driving
   the REAL top layer) → `#scaffold-base` (W3C foundation: container queries,
   subgrid, :has(), view transitions) → `#shell-law` (one scroll plane, one
   grid, the pointer law, static/dynamic separation) → `#types` (the three
   forms, measured) → `#usage` → `#theming` (structural tokens) → `#api` →
   `#universal-props` (measured axes table + receipts + query() seat) →
   `#accessibility` → `#see-also`. ToC == DOM **10/10**, trio last, and the
   page RIDES the page-toc channel (the layout rail renders this array inside
   the scaffold's chrome cell — the host serving its own documentation, named
   in +page.ts).
2. **Measured axes table ×8** (the theme row terminates the strata; rows
   above).
3. **EXTRA-lane BY NAME — the strictest verdict in the fleet**: the scaffold
   is SNIPPET-COMPOSED AND REST-LESS. No rest spread exists (Props ends at
   the eight axes): nothing consumer-authored lands on the shell except
   through the four snippet seams; placement rides `data-area` roles (static
   chrome) or the `adopt()` context (dynamic floats — ordered, release fn,
   consumer teardown). The splash seat is a named prop. The TopLayerApi
   context is a named api row.
4. **query() seat**: `query({ md: 18 }, 13)` on the size lane (the type-scale
   seam scales the HOST root — every zone grows together).
5. **KEYED-EACH/mounted-children**: no keyed loops on this page; the family
   renders all snippets via `{@render ...()}` (mounted-children law held).
   **LAW #19**: the page-toc channel + the archetype ids — zero duplicate ids
   (a stray duplicate accessibility section from the rebuild was caught by
   the probe's twin audit and removed pre-gates), zero dangling hashes.

## Gates (repo root unless noted)

| Gate | Result |
|---|---|
| verify:tailwindless | GREEN — receipt VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check page-scoped | **0 diagnostics on website-scaffold.html/+page.svelte and +page.ts**; family standing debt unchanged and untouched (9: website-scaffold.svelte :191 8× `state_referenced_locally` warns + 1 cx-typing) |
| docs-ambient-vocabulary solo (apps/www) | 284/284, exit 0 |
| Probe battery | 17/17, two consecutive runs (chrome 5/5 via the toc-chrome adapter: h1 ×1, marker ×1, dupes 0, zero dangling) |
| Mirror law | `cmp` byte-identical registry/files/ui/website-scaffold/ ⇄ apps/www/src/lib/ui/website-scaffold/ (5/5 files — zero family edits) |
| SSR | page 200; h1 ×1; toc 10/10 (the layout rail renders the page channel); universal marker ×1; the splash markers in the served HTML, the layer unmounted live |

## Process evidence

- Port **5241**: `lsof` EMPTY before; dev server started for the session
  (vite PID 46487); after gates killed by PID; **port 5241 EMPTY after**.
- **NO commits, NO pushes.** Zero product-tree edits; family + registry
  mirrors byte-identical to HEAD.
- Sibling noise receipted, not chased: vellum's terminal-footer review,
  marginalia's re-adjudication probe, scribe's toast review in flight.
- Two authoring errors caught by the canaries: a missing `query` import
  (SSR 500 — the ReferenceError named it) and a stray duplicate
  accessibility section from the rebuild (the twin audit caught it). Both
  fixed pre-gates; neither reached a gate green.
- Artifacts: /tmp/ws-probe.mjs, /tmp/ws-chrome.mjs, /tmp/ws-dev.log,
  /tmp/svelte-check-ws.txt.

## Open questions for the reviewers

1. The no-nest ruling and the measured bounded-instance embeddability are
   both true and now both written down; if the fleet ever wants a live
   bounded scaffold demo on the page, the probe's fixture (fixed-height
   body, no second scroll plane over the content) is the safe shape.
2. The api table's TopLayerApi context row is the first context-props row in
   my pages — if the fleet prefers context contracts documented on a
   separate page (scaffold-float's lane), the row can move.
3. The scaffold page rides the page-toc channel while its sibling lanes opt
   out — the channel census across the campaign (rider vs opt-out per page)
   could be a one-table receipt in the closing report if the coordinator
   wants the self-reference story summarized.
