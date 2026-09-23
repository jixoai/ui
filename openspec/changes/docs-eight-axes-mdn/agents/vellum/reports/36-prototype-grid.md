# TASK 36 — CODE prototype-grid (vellum)

Tier 2 (优化重构). Gates green. NO commits — two files changed:
`apps/www/src/routes/docs/components/prototype-grid.html/+page.svelte` + `+page.ts`.
(This page is the accepted prototype-flex rebuild's sibling — the banked rig harness
was copy-adapted as forecast.)

## Tier decision — gap analysis

Tier 2, not 1: the 171-line page was the pre-archetype twin of prototype-flex —
no overview/law-notes/types/axes-table/query seat, toc = usage+api only, a static
demo with no rig. Tier 2, not 3: the family (138 lines) is the flex laws plus one
real coercion (the track form), and the accepted flex rebuild is the direct harness.

## What changed

1. **THE RIG, track-form edition** (`#live-demo`): controls in the STAGE BODY (the
   playground-laziness bank applied) — a cols-form select demonstrating BOTH
   coercion forms AND the verbatim ratio (`3` → repeat(3, minmax(0, 1fr));
   `"repeat(auto-fit, minmax(140px, 1fr))"`; `"1fr 2fr 1fr"`), a rows select
   (auto/2/3), a gap number. The drawer's usage file mirrors the live state.
2. **Track geometry measured per control state — RESOLVED px per track, not the
   style string** (computed grid-template-columns): below.
3. **Types = the track-form inventory**: the number form, the verbatim ratio string,
   and the AREAS form with placed children (`"head head" "side main"` + grid-area
   children) — measured verbatim in the served style attr.
4. **Law-notes**: the three alpha laws + the no-max-content-blowout rationale for
   the minmax(0, 1fr) coercion + the deliberate v0 areas-as-string limit.
5. **Axes table**: all eight FORWARDERS (stamps, no paint) — density rung stamp
   measured (data-density=lg / null ambient), size carrier measured
   (font-size: var(--jx-size-effective, 1rem), computed 18px), theme .dark bridge
   measured, rest zero-reader greps.
6. **query() seat on the size LANE** (the lanes-vs-passthroughs boundary from task
   35 applied and taught: cols/rows/gap/areas are passthroughs and reject
   QueryResult — lanes take query(), passthroughs don't). Measured 13px → 18px
   across 48rem.
7. **A11y**: auto-placement keeps source order (WCAG 1.3.2); the AREAS trade — a
   template can visually reorder meaningful content and break source-order reading;
   rest-spread ARIA composition; no authored role.
8. **toc == DOM** (probe PASS); duplicate-id scan NONE; cx predicate fix carried.

## Measurements (probe receipts, served DOM at 5242)

- cols=3 → style declaration `repeat(3, minmax(0px, 1fr))`; RESOLVED tracks
  `[240px, 240px, 240px]` (1400px viewport).
- auto-fit form → tracks shrink to the minmax floor: measured `[145px ×4]` at a
  760px viewport (floor 140px engaged; re-count happens past the floor — the
  shrink-to-floor-then-re-count semantics, stated as measured).
- Verbatim `"1fr 2fr 1fr"` → RESOLVED `[180px, 361px, 180px]` = the 1:2:1 ratio.
- rows=2 → two equal row tracks (45.5px each measured); gap 30 → 30px column-gap
  with the tracks absorbing it (240 → 228px).
- Stamps: data-density=lg present on the explicit specimen; .dark class present on
  the theme="dark" specimen; size carrier inline with computed 18px; areas template
  verbatim with the head child placed (grid-area: head).
- Query seat: 18px at ≥48rem, 13px below.
- SSR: h1 ×1; order install > overview > live-demo > law > types > usage > api >
  universal-props > accessibility > see-also; toc == DOM PASS; duplicate ids NONE.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics on
  `routes/docs/components/prototype-grid.html/*`.
- Specs: prototype-layout-family + docs-structure + docs-nav-filter ✓ 64/64
  post-edit (baselines BEFORE edits: 348/348 across those + ambient). Ambient
  final run 282/284 — the 2 failures are `sheet table[0] variant#1` and the
  matrix-bijection row it feeds: **quill's sheet.html/+page.* are mid-flight in the
  working tree** (named in the dispatch; git status shows them modified). Attributed,
  never touched — the same self-clearing pattern as tasks 29/34 when the sibling's
  edits settle.

## Matrix

No pins for prototype-grid — no re-pin. api PropsTable stays universal/tableIndex 0.

## Port discipline

lsof :5242 rc=1 before; vite wrapper 21477 / listener 21509 captured; killed by PID
at teardown; lsof rc=1 and `pgrep -lf "vite --port 5242"` empty after. Probes in
/tmp (vellum-36-{grid-verify,debug,debug2}.mjs). NO commits. Siblings' in-flight
files (quill's sheet, scribe's number-input review, marginalia's press-button
review) never touched.

## Open questions for the reviewers

1. **Hydration-abort hazard for page authors**: a duplicate KEY in a keyed each
   (`each_key_duplicate`) threw client-side and aborted hydration for the ENTIRE
   page — every component's children vanished (empty `<!--[--><!--]-->` blocks)
   while SSR HTML looked fine. svelte-check does NOT catch it; only a live-page
   probe did. Worth a BOARD law: any keyed each on a docs page needs a
   uniqueness-guaranteed key (index keys for display-only galleries).
2. **The auto-fit floor demo**: minmax(140px, 1fr) measured shrinking to ~145px at
   a 760px viewport before re-counting — the exact floor semantics. The rig's
   auto-fit option + a readout is the cheapest teaching rig for the
   css-architecture grid law; consider it for card-grid's page too.
3. **Dense/flow flags remain unauthored** (dispatch hypothesis): grid-auto-flow is
   NOT a v0 prop — the density select in the studio would have no wire target
   today. Same recorded-future-enhancement bucket as the areas array-join form.
4. **The trio's shared law section**: prototype-flex and -grid now carry near-
   identical `#law` sections (three alpha laws + the family-specific coercion).
   If waterfall follows, consider a shared law-notes phrasing or a see-also loop
   among the three.
