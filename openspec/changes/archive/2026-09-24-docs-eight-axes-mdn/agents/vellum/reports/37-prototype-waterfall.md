# TASK 37 — CODE prototype-waterfall (vellum)

Tier 2 (优化重构). Gates green. NO commits — four files changed:
- `apps/www/src/routes/docs/components/prototype-waterfall.html/+page.svelte` + `+page.ts`
  (the archetype rebuild)
- `prototype-flex.html/+page.svelte` + `prototype-grid.html/+page.svelte`
  (the trio see-also loop — one cross-reference paragraph each, per the dispatch)

## Tier decision — gap analysis

Tier 2, not 1: the 182-line page was the trio's pre-archetype twin — no
overview/law-notes/types/axes-table/query seat, toc = usage+api, a static
three-article demo with no rig. Tier 2, not 3: the family (147 lines, CSS multicol
engine, zero JS) is the flex laws plus the columns-shorthand duality, and the trio
harness was already banked.

## What changed

1. **THE RIG** (`#live-demo`, controls in the STAGE BODY per the laziness bank):
   a columns-form select — count `3`, count `4`, and the auto-width FLOOR
   `"14rem"` — plus a gap number. The drawer's usage file mirrors the live state.
   LAW #18 applied: every keyed each keys on unique stable ids (`card.id`), and the
   verify probe asserts mounted children on all 8 waterfall roots (9/9/9/5/3/2/2/2).
2. **Resolved column geometry measured per control state** (computed column-count /
   column-width AND the laid-out count from the cards' distinct offsetLeft columns)
   — not the style string. No JS exists in the family (grep: zero transitions; the
   browser's column balancer is the engine), so every control change settled within
   the measuring frame — the layout-settling question has a one-frame answer.
3. **The trio see-also loop implemented NOW** (dispatch open-question 4): each of
   the three pages' law-notes carries a cross-reference pill row — flex and grid
   link their two siblings, waterfall links both. Verified live: #law renders
   `/docs/components/prototype-flex.html` + `/docs/components/prototype-grid.html`
   links.
4. **Axes table**: all eight FORWARDERS (trio pattern) with the waterfall-specific
   nuance measured: the size stamp re-scales REM-based column floors ('14rem'
   re-reads the root font) while count-form columns are scale-blind.
5. **query() seat on the size LANE** (lanes-vs-passthroughs boundary taught:
   columns/gap/strategy reject QueryResult). Measured 13px → 18px across 48rem.
6. **A11y**: multicol reading order — column flow preserves DOM sequence (announced
   order matches the visual column sequence); the split-card hazard documented
   (break-inside: avoid on every card, the usage idiom); rest-spread ARIA; no
   authored role.
7. **toc == DOM** (probe PASS); duplicate-id scan NONE; cx predicate fix carried.

## Measurements (probe receipts, served DOM at 5242)

- Rig baseline (columns=3): authored style `columns: 3`, computed column-count 3,
  column-width auto, column-gap 16px, column-fill balance, LAID-OUT 3 columns.
- columns=4 → computed count 4, laid-out 4. gap 24 → column-gap 24px.
- The FLOOR form ("14rem"): computed column-width 224px (= 14rem), computed count
  auto; LAID-OUT 3 columns at a 1400px viewport narrowing to **2 columns at 760px**
  — the masonry floor semantics measured end-to-end (width floored, count follows).
- Stamps: data-density=lg present; .dark class present on the theme="dark"
  specimen; size carrier inline (var(--jx-size-effective, 1rem)), computed 18px at
  size={18}; mounted children on every root (LAW #18 receipt).
- Query seat: 18px at ≥48rem, 13px below.
- SSR: h1 ×1; order install > overview > live-demo > law > types > usage > api >
  universal-props > accessibility > see-also; toc == DOM PASS; duplicate ids NONE.
- Grep receipts: zero axis-carrier readers and zero transition declarations in
  ui/prototype-waterfall/ (the inline-style-only alpha lane).

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics across all three prototype pages.
- Specs post-edit: prototype-layout-family + docs-structure + docs-nav-filter ✓
  **64/64**; ambient **282/284** — the 2 failures remain the sheet-route pair
  (`sheet table[0] variant#1` + its bijection row), quill's in-flight sheet.html
  files (dispatch-named; git status shows them modified; attributed, untouched,
  expected to self-clear). Baselines BEFORE edits: identical (64/64 green set +
  the same 2 sheet failures already failing pre-task).

## Matrix

No pins for prototype-waterfall — no re-pin (the trio stays pin-free pending the
alpha-graduation decision, per task 35's open question 4). api PropsTable stays
universal/tableIndex 0.

## Port discipline

lsof :5242 rc=1 before; vite wrapper 34726 / listener 34758 captured; killed by PID
at teardown; lsof rc=1 and `pgrep -lf "vite --port 5242"` empty after. Probes in
/tmp (vellum-37-waterfall-verify.mjs). NO commits. Siblings (quill's sheet files,
scribe's reference review) never touched.

## Open questions for the reviewers

1. **The 'ordered' strategy seam is now taught on the page** — if the studio or the
   family ever implements JS-measured shortest-column placement, the prop union
   grows and the a11y story CHANGES (JS placement visually reorders against DOM
   order — the flex row-reverse trade at masonry scale). Flag so the future
   implementation lands with its own a11y section update, not just a union bump.
2. **Break-inside is invisible by default**: a consumer who forgets it gets cards
   silently splitting mid-text. The page teaches the idiom, but a family-side
   `break-inside: avoid` default (opt-out) would flip the failure mode — Owner's
   call whether the declared tradeoff should stay opt-in.
3. **The trio's see-also loop is page-side** (three pill rows in law-notes). If the
   registry's see-also graph later supports layout-family grouping, the DocsSeeAlso
   component could own it — the page-side loop retires then.
4. **Multicol a11y caveat for the doctrine page**: column reading order matches the
   visual sequence but SCALES poorly for long content (readers must traverse column
   1 entirely before column 2) — the honest guidance (now on the page) is
   short-card decks only. If the studio wants long-form masonry, that's the
   'ordered' strategy's job, with its own a11y pass.
