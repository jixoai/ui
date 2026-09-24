# Report 13 — REVIEW `date-picker` (marginalia, 2026-09-22)

Reviewer: marginalia (2nd of 2; quill's page, integrated at 9ed2a7d8 —
tree byte-identical for the route). Independence law held:
vellum/reports/10-review-date-picker.md NOT read before this report was
filed. Evidence: source read (page + curation + meta + date-picker.svelte
imports + jixoai.css input-law block), raw SSR bytes (1,077,341 B,
HTTP 200), live probes with LAW #14 settle + double-read, old-page audit
at 9ed2a7d8~1.

## Verdict: PASS — date-picker CLOSES (page #8)

Every claim re-derived holds: the one-cell theme-split measures exactly
as asserted (with the wall-clock hue tracked live), the composition
chain and the six zero-reader greps are source-true, the trigger
min-heights measure 32/40/48, the number lane is inert through the real
wrapper, the EXTRA arithmetic is exact at 17 rows, and the query case
flips both directions. One NIT (the axes drawer's import block), one
declared-debt observation.

## Findings

1. **NIT — the axes drawer lacks its import block.** `axesUsage`
   (:198-209) is comment + markup only — the composed file
   `src/lib/ui/date-picker-axes.svelte` has no
   `import DatePicker from '@ui/date-picker.svelte'`, so pasted alone it
   does not run (the chip/breadcrumb axes drawers carry the imports
   record). The canvas also carries no id (the axes/query/catalogue/
   main canvases are all outside the same-source lane; the catalogue
   mirror's resolveRawCode migration is DECLARED as the recorded
   follow-up at :158-159). Fix at the next touch: add the import block;
   the lane join stays with the declared follow-up.
2. **Observation — nothing else.** The catalogue drawer's windowed
   bounds match the stage (2026-08-04/2026-09-16 both sides); the
   density row's number-lane wording carries the declaring-element
   caveat; the Props summary's "variant keeps its own 'auto' — the
   literal-slot marker, not an axis seat" is the honest disposition of
   the one non-axis non-collision name (variant is not an axis name —
   no EXTRA-lane arithmetic impact).

## The claims, re-derived

### 1. The one-cell theme-split — VERIFIED (LAW #14 settle + double-read)

Opening the `axes-theme-dark` picker and reading a `.jx-date-day` cell
in its panel (250ms settle, double-read stable across two re-opens):

- `--primary` at the cell = **`oklch(0.7044 0.1872 calc(256 - 4))`** —
  the DARK formula (L 0.7044, hue −4).
- `--jx-primary` at the SAME cell = **`oklch(0.6489 0.237 256)`** — the
  light form of the frozen stylex alias.
- Double-read identical; a second open minutes later tracked the
  wall-clock hue (256 → 334) with the −4 drift intact on the raw token
  while the alias held the light form at the new hue — the split holds
  at every instant.
- Light picker control: `--primary` ≡ `--jx-primary`
  (`oklch(0.6489 0.237 301)`) — identical under the light profile, as
  the split predicts.

The TokenTable's receipt rows (5 FLIPS / 4 FROZEN, served) name the
voices exactly; the theme row's wording ("substituted at :root" for the
frozen aliases, "re-declared per scope" for the raw layer) matches the
declaring-selector mechanism.

### 2. Composition chain — VERIFIED

date-picker.svelte imports: `Calendar from './calendar.svelte'`,
`TimeStepper from './time-stepper.svelte'`, the surface-motion kernel,
DatePickerDefaults, date-picker.css — **zero popover-family imports**
(grep: 0 hits for popover.svelte / dropdown-menu). The panel is the
native Popover API (`popover="auto"` + `popovertarget`) over the shared
jx-surface vocabulary, exactly as the overview states; the Calendar and
TimeStepper fragments mount inside the field wrapper and inherit its
scope.

### 3. Density named rung — VERIFIED

Trigger min-heights through the real wrappers: **sm 32px / ambient
default 40px / lg 48px** — riding `--jx-hit` through the jx-html-input
law (jixoai.css ~:1552: `min-height: var(--jx-hit, 2.5rem);
padding-block: var(--jx-gap); padding-inline: var(--jx-inset)`). The
demo pickers' wrappers carry the co-stamp (`data-density="sm"` +
`--jx-density-coefficient: 1`).

### 4. Number lane inert — VERIFIED through the real wrapper

Stripping the rung attr from the lg wrapper (ambient posture) and
sweeping the coefficient 1.5 → 3: min-height **40px unmoved** at both
values (the ambient default's channel composition); restoring
`data-density="lg"` → 48px. The declaring-element caveat in the density
row is measured-true.

### 5. EXTRA arithmetic — VERIFIED from raw SSR

Meta carries 25 props; 8 axis-named rows split to the shared section;
DATE_PICKER_DOCS has no extra lane → family table = **17 rows, parsed
exactly** (value bind, range bind, mode, showTime, label, error,
placeholder, min, max, format, locale, presets, preset, isDisabled, id,
variant, class). 25 − 8 + 0 = 17. No axis-named rows remain in the
family table; the shared section renders the 8-lane infrastructure.

### 6. Six zero-reader greps — VERIFIED (my own run)

`--jx-size-effective` / `--jx-shape-effective` / `--jx-radius-effective`
/ `--jx-color-effective` / `--jx-elevation-effective` /
`--jx-motion-effective`: **0 readers each** under `ui/date-picker/`.
The six SUPPLY-ONLY rows' receipts reproduce; the density row is the
one CONSUMED row (the input-law channels), matching the grep asymmetry.
The elevation row's nuance (the jx-surface-body consumption PAIR exists
but date-picker never stamps it — its stampers are toast,
terminal-card, press-button) is the honest supply-only wording.

### 7. query() — VERIFIED

`query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')` —
both generics in source and served (×2 surfaces, the asymmetric
entity-encoding noted). Flip measured across the real 40rem boundary:
1280px → `sm` (min-height 32px); 600px (37.5rem) → base `lg` (48px);
back → `sm`. The drawer carries the imports record.

## Standard pass

- **Tier 2 justified (old-page audit)**: the P0 page (433 lines) had
  install/see-also already, but no Overview, no per-axis table, no
  query() case, a theming card with the FloatingSurface vocabulary
  (`variant 'solid' | 'acrylic' | 'auto'` — a different component's
  grammar in this family's table), and the SAME copy-paste lie
  cascader's old page carried: "The family CONSUMES size and color" —
  disproven by the six greps. The repair replaced the invented
  consumption with measured receipts, folded types/theming/universal-
  props into the axes section (content preserved: the anchor/motion
  notes live in the overview and motion row), and kept the catalogue,
  playground and generated props table. Survivor ids kept
  (usage/demo/accessibility/api).
- **Archetype order** monotonic (hero → install → overview → usage →
  catalogue → Props → axes → a11y → see-also); **toc 6/6** ids in DOM.
- **Markers** ×1 each (universal / install / see-also).
- **test/ pins**: date-picker pinned in defaults-form-families,
  docs-structure, docs-ambient-vocabulary, batch specs (the drift spec's
  DATE_PICKER_LOCALE_ROW + universal-pilots membership).

## Gates

Reviewer-side. Dev smoke HTTP 200, bytes 1,077,341. SSR checks 7/9 —
both "fails" were my own byte-grep artifacts (the asymmetric
entity-encoding of the closing `>`; a family-table detector that
required the wrong row names), both resolved by direct re-inspection of
the same capture.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; lsof → 0 lines BEFORE.
  Kill-by-PID: listener PID **92912** killed; post-kill lsof → 0 lines;
  pgrep → empty.
- Probe/scratch: /tmp only (`marginalia-13-live-probe.mjs`,
  `marginalia-13-probe2.mjs`, `marginalia-13-dp-ssr.html`,
  `marginalia-13-dev.log`). Repo-side writes: this report +
  experience.md. NO commits, NO push.

## Consolidation note (short)

Cross-read vellum/reports/10-review-date-picker.md (PASS, 0 BLOCKER ·
0 MAJOR · 1 MINOR · 1 NIT — both verdicts agree, no divergence on any
claim). The headline pair reproduced at equal sharpness with
complementary receipts: vellum asserts the L/C polar invariants with a
calc()-tolerant parser (their probe lesson — which explains my own
`pHue: null`, my regex not tolerating `calc(256 - 4)`); I add the
double-open wall-clock tracking (256 → 334 with the −4 drift intact and
the alias holding the light form at the new hue). Density min-heights,
number-lane inertness, EXTRA arithmetic (same 17 row names), six greps,
composition imports, query flip — full agreement. Their MINOR-1 (a
precision clause separating the trigger's directly visible min-height
re-base from the panel's inherited scope) and NIT-1 (the `--jx-hit`
row's "the whole box steps" — the box is content-driven above the floor;
my own probe measured the same overshoot, 58/70 rendered over 40/48
floors, and I failed to flag it) — both adopted into the fix list. My
unique NIT (the axes drawer's missing import block + the declared
same-source follow-up) stands beside them. Date-picker CLOSES.
