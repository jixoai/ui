# TASK 35 — CODE prototype-flex (vellum)

Tier 2 (优化重构). Gates green. NO commits — two files changed:
`apps/www/src/routes/docs/components/prototype-flex.html/+page.svelte` + `+page.ts`.

## Tier decision — gap analysis

Tier 2, not 1: the 171-line page already had install/see-also/api/usage bones and an
honest api table, but it had NO live rig (the dispatch's expectation: a flex
playground's demo surface IS user-configurable — the page shipped a static
three-chip row with an empty playground pane), no overview/law-notes/types, no
measured axes table, no query() seat, toc covered only usage+api, and the a11y story
(reversed-direction vs DOM order) was absent. Tier 2, not 3: the family is 139 lines
and its three alpha laws were already correctly told.

## What changed

1. **THE RIG built and measured** (`#live-demo`): five always-mounted controls —
   PlaySelect for direction/wrap/align/justify, PlayNumber for gap — each bound 1:1
   to a real prop, in the stage body (NOT the playground snippet: ComponentCanvas
   mounts the snippet lazily, and an unmounted rig measures nothing — that discovery
   banked in experience.md). The drawer keeps the help text. The drawer's usage file
   mirrors the live rig state (same-source law).
2. **Rig wiring measured end-to-end** (the "rig must perform its claim" class):
   direction select → computed flex-direction `column-reverse`; justify select →
   `space-evenly`; gap number 30 → computed column-gap 30px; all confirmed live and
   reverted. Baseline row measured (row/nowrap/stretch/space-between/12px).
3. **Measured axes table**: all eight axes are FORWARDERS on this zero-translation
   alpha lane — density rung stamp (data-density=lg explicit / null ambient),
   size echo (inline `font-size: var(--jx-size-effective, 1rem)`, computed 18px at
   size={18}), theme .dark bridge (measured class present with theme="dark"),
   shape/radius/color/elevation/motion carrier-stamps with zero family readers
   (grep: an inline-style-only family — no css file, no tokens, zero axis-carrier
   readers). No paint to measure is itself the measured finding.
4. **Types = the rendered union gallery**: all six justify members on identical
   chip rows; the api table keeps the 1:1 mapping (it is the control inventory's
   contract twin).
5. **Law-notes section** (`#law`): the three alpha laws (single root + rest
   spread / zero translation / inline style only) with the dispatch's gap-tokens
   hypothesis explicitly answered: the family law is ZERO tokens by design.
6. **A11y section**: the reversed-direction vs DOM-order trade (WCAG 1.3.2),
   rest-spread ARIA composition, no authored role, subtree-scoped stamps.
7. **query() seat**: `size={query({ md: 18 }, 13)}` measured 13px → 18px across
   48rem — WITH the boundary it exposes: the AXES accept query() (lanes), the
   LAYOUT props (gap: number | string) do not (typecheck-proven: QueryResult<number>
   is rejected by gap; the original gap-seat plan was corrected to size).
8. **toc == DOM** (probe PASS); duplicate-id scan: NONE.

## Measurements (probe receipts, served DOM at 5242)

- Rig baseline row: flexDirection row · flexWrap nowrap · alignItems stretch ·
  justifyContent space-between · columnGap 12px · data-density null.
- Rig end-to-end: column-reverse / space-evenly / 30px each landed in computed
  style within one frame of the control change; all reverted cleanly.
- Stamps: data-density="lg" present on the explicit specimen; .dark class present
  on the theme="dark" specimen; size carrier `var(--jx-size-effective, 1rem)`
  inline, computed 18px; gap="0.75rem" string verbatim → rowGap 12px (string
  passthrough measured).
- Query seat: 18px at ≥48rem, 13px below (the size lane's number lane bare).
- SSR: h1 ×1; order install > overview > live-demo > law > types > usage > api >
  universal-props > accessibility > see-also; toc == DOM (chrome out) PASS.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics (two of my own draft errors caught
  and fixed: A11yTable import missing; a gap-typed query seat that the family's
  `gap: number | string` prop rightly rejects).
- Specs post-edit, one run: **4 files / 348 passed** (prototype-layout-family —
  which pins the zero-translation law and the identity render — plus ambient 284,
  docs-structure, docs-nav-filter). Baselines BEFORE edits: same suites 348/348.

## Matrix

No pins exist for prototype-flex — no re-pin. The api PropsTable stays
universal/tableIndex 0 (density folds into the universal fold at runtime).

## Port discipline

lsof :5242 rc=1 before; vite wrapper 99682 / listener 99712 captured; killed by PID
at teardown; lsof rc=1 and `pgrep -lf "vite --port 5242"` empty after. Probes in
/tmp (vellum-35-{flex-verify,rigfix*,stamps}.mjs). NO commits. Siblings (quill's
scroll-virtual files, scribe's menubar review, marginalia's reference review) never
touched.

## Open questions for the reviewers

1. **Playground-snippet laziness**: ComponentCanvas mounts `{#snippet playground()}`
   content only when its pane opens — my first rig lived there and measured as
   nonexistent. The rig now lives in the stage body (always mounted). Should the
   BOARD note this for every future rig-style page (the playground snippet is for
   help text and drawer-bound controls, not primary interactive demos)?
2. **The layout-props/axes query boundary**: gap (number | string) rejects
   QueryResult while the eight axes accept it — typecheck-proven. The page teaches
   the boundary. Worth generalizing into the universal-props doctrine page as a
   named rule ("lanes take query(); passthroughs don't")?
3. **Prototype trio shared patterns**: as predicted, the trio shares the
   alpha-contract rig shape — if prototype-grid/waterfall get the same treatment,
   the rig harness (state block + PlayRow set + resolveRigUsage) is copy-adaptable;
   flag for the next two tasks.
4. **No matrix pins**: the prototype trio is absent from
   docs-ambient-vocabulary.matrix.json — deliberate (zero-hit alpha lane) or an
   eventual pin backlog when the trio graduates alpha?
