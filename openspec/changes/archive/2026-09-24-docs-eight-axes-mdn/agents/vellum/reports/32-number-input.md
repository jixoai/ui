# TASK 32 — CODE number-input (vellum)

Tier 2 (优化重构). Gates green (receipts below). NO commits — two files changed:
`apps/www/src/routes/docs/components/number-input.html/+page.svelte` + `+page.ts`.

## Tier decision — gap analysis

Tier 2, not 1: the 397-line page had strong bones (h1 hero, workbench canvas with a
live-binding playground, RTL demo, types grid, a11y/theming/api sections) but was
missing four archetype sections (DocsInstall, Overview, the measured axes table,
DocsSeeAlso), had NO query() seat, toc ≠ DOM (toc listed api before demo; demo sat
mid-page; universal-props absent from the toc), DensityDemo rendered the default rung
only, and the copy carried falsified claims (the "28px-wide steppers / 40px law"
hardcoded pair — steppers measure 40×40 at default; "The family CONSUMES size and
color" — the exact canary-grep defect class; "dashes the shell" — the dash never
renders, see Findings). Tier 2, not 3: family untouchable, bones served.

## What changed

1. **Archetype rebuild**: hero → `#install` → `#overview` (composition clocks and
   axes story; law-notes folded) → `#live-demo` (workbench + playground) → `#types`
   (variants grid + the RTL posture canvas, moved from the old #demo) → `#usage` →
   `#theming` (DensityDemo **full 5-rung ladder `['2xs','xs','sm','default','lg']`** +
   TokenTable +well/ring/motion rows) → `#api` → `#universal-props` (measured axes
   table + receipts footnote + query() seat + explicit-lane specimens) →
   `#accessibility` (measured contract + the localization-gap honesty row) →
   `#see-also`. toc == DOM probe PASS.
2. **Axes table**: 8 rows measured/grepped (below).
3. **query() seat**: `query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small')`
   on a real field; measured both sides of 48rem.
4. **cx predicate fix** (fleet law) on the local join.
5. **Falsified copy fixed**: "CONSUMES size and color" → supply-only + §1 collision
   (grep receipts: zero readers of --jx-size-effective/--jx-color channels in
   ui/number-input/); "28px-wide steppers" → measured full-hit squares.

## Measurements (probe receipts, served DOM at 5242)

- **Density is the WHOLE composite**: shell min-height AND the steppers' width+height
  ride --jx-hit — full-hit SQUARES, measured 40×40px at default. Full served ladder:
  2xs 24px/10px voice · xs 28/11 · sm 32/12 · default 40/13 · lg 48/15. Ambient attr
  null; explicit stamp re-scopes in place (data-density=2xs → 24px, restored 40px).
  **THE FLOOR RECEIPT: the 2xs rung lands the steppers at exactly 24px — the WCAG
  2.5.8 target-size minimum** (rendered live by the page's DensityDemo).
- **Hold clock (LAW #14 receipts)**: pointerdown steps IMMEDIATELY (4→5 at t≈80ms),
  plateaus through the 300ms delay (still 5 at t≈250ms), then 100ms/step steady-state
  (5→7→10→13 at ~420/700/1000ms — 2/3/3 steps per 300ms window); release ends clean
  at 13 with no orphan step. Press physics caught mid-transition (translateY ≈ 0.84px
  toward 1px).
- **Commit semantics**: typing "007" → 7 (normalize), 99 → 16 under max=16 (clamp),
  empty → undefined (spec-proven; the workbench demo's slider binding coerces
  undefined→1 through PlayRange — a demo artifact, not family behavior, and why the
  empty-commit demo lives in the types grid).
- **Theme — the form-family split voice (measured per element)**: under .dark on the
  field root, RE-DERIVING: --shadow-well black ink → WHITE ink (end-state receipt —
  the first probe read it mid-150ms-transition and showed frozen; the transition trap
  is banked in experience.md), --ring → drifted dark primary, --muted 0.9551 → 0.2178.
  FROZEN atoms: shell background stayed oklch(1 0 0) while --background flipped to
  oklch(0 0 0); border and cell ink likewise. Verified through the REAL theme="dark"
  prop on the page's specimen (dark field: white shell + white-ink well).
- **Square corner is AUTHORED**: shell borderRadius none (measured 0px); shape/radius
  axes unread (grep).
- **Elevation = own well, axis unread**: --shadow-well/--shadow-well-hover inset pair
  (F-1 fillable-composite ruling); --jx-elevation-effective zero readers (grep).
- **Motion = sheet constants + JS clock**: --motion-150/--motion-ease-out with the
  reduced-motion kill; --jx-motion-effective zero readers (grep).
- **NO formatting/locale layer by contract**: zero Intl/NumberFormat/toLocaleString
  in the family (grep); display = String(value), commit = valueAsNumber.
- **Chrome axis is ambient, not a prop**: `chrome="bare"` on the component FAILS
  svelte-check ('"chrome"' does not exist in type 'Props' — the family reads it from
  CONTROL_CHROME context via the destructure but never declares it). Probe-simulated
  bare: shell background/border + button borders transparent, well none. The two
  specimens were removed from the page (typecheck) and the copy states the ambient
  resolution honestly; an open question asks whether Props should declare it.
- **Error state**: aria-invalid=true, aria-describedby={id}-error = the line id,
  "!" mark aria-hidden ✓. MEASURED SEAM: the dashed border is authored (shellInvalid
  atom) but the computed border-style serves SOLID — both atom classes land and the
  solid rule wins the cascade order. Documented in the receipts footnote; the api
  row now claims only the wiring.
- **aria-label anchoring honesty**: the steppers' labels are hardcoded English
  ("decrease"/"increase") — the a11y table carries this as a localization gap row.

## Matrix

No pins exist for number-input in docs-ambient-vocabulary.matrix.json (verified) —
no re-pin needed. The api table stays PropsTable universal, tableIndex 0, with the
density row's 'ambient scope' vocabulary preserved.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics on
  `routes/docs/components/number-input.html/+page.svelte|+page.ts` (after removing
  the two chrome-prop usages; fleet total 1593 errors is the pre-existing lib-wide
  baseline — I touch no lib files).
- Specs post-edit, one run: **10 files / 438 passed** (docs-ambient-vocabulary 284,
  form-components, defaults-form-families, density-adoption-form-text,
  list-item-segmented-stepper, list-item-control-chrome, carved-action-band,
  date-picker-fragments, input-picker-bridge, component-canvas-schema). Baselines
  BEFORE edits: the same suites 154/154 + ambient 282/284 — the 2 reference.html
  failures were quill's in-flight files (attributed, untouched) and CLEARED
  THEMSELVES by gate time (the task-29 nav-menu pattern).

## Port discipline

lsof :5242 rc=1 before; vite wrapper 30421 / listener 30468 captured; killed by PID
at teardown; `lsof -i :5242 -sTCP:LISTEN` rc=1 after; no vite process survives
(`pgrep -lf "vite --port 5242"` empty). Probes in /tmp
(vellum-32-numinput-{probe,probe2,verify}.mjs). NO commits. Siblings' in-flight
files (quill's reference.html, marginalia's boot-splash, scribe's input-otp review
artifacts) never touched.

## Open questions for the reviewers

1. **The dashed-border cascade defect**: the error state's dashed shell border is
   authored (shellInvalid atom: borderStyle dashed) but the served DOM computes
   SOLID — the shell atom's solid rule wins the stylesheet order over shellInvalid's
   dashed. Family-level fix (order or a dedicated class) is out of scope for docs;
   the page claims only the wiring. File for the family backlog?
2. **chrome is undeclared in Props**: the family consumes the ambient chrome axis
   (data-chrome frame|bare renders and works — meta lists the prop) but the Props
   interface omits it, so consumer call sites typecheck-fail. Should Props declare
   `chrome?: ControlChrome`? (Docs page currently describes the axis as ambient-only
   — truthful under the current signature.)
3. **The hardcoded English stepper labels** ("decrease"/"increase"): a localization
   gap — should the family accept label overrides (props or context) before more
   non-English consumers land? The a11y table now states it openly.
4. **PlayRange binding coercion**: the workbench playground's slider coerces
   undefined→min through the two-way binding (range inputs can't represent empty).
   Harmless on the demo, but a consumer binding the same field to a range slider will
   see the same surprise — worth a line in the input-group/ItemField docs eventually.
