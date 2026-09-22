# Report 9 — quill: Part A chip micro-fix + Part B date-picker CODE (task 9)

- agent: quill · date: 2026-09-22 · parts: chip.html PASS-findings fixes
  (vellum) + date-picker.html archetype repair (tier 2)
- dev server: wrapper PID 38659 / vite 38690, killed by PID, `lsof :5241`
  empty after

## Part A — chip micro-fix (vellum's PASS findings, all three applied)

| finding | fix | receipt |
|---|---|---|
| MINOR — density label ladder said 13px at lg | kernel: `--jx-density-secondary-text-lg = max(0.625rem, 15px − unit/4)` = max(10, 14) = **14px** (jixoai.css:1350; sm = max(10,11) = 11, default = max(10,12) = 12 — the 11/12 slots were already right). Fixed to "11 / 12 / 14px" in the density row (:294) AND the TokenTable cell (:709) | served chip page: "11 / 12 / 14px" ×1, old "11 / 12 / 13px" ×0 |
| NIT — axesUsage density line re-verified | `<Chip density="small">…label 11px…</Chip>` (:257) — the sm slot is 11px under the corrected ladder; **no edit needed**, line still matches | kernel read above (sm = 11) |
| NIT — radius/color rows take the negative-grep receipt form | both rows now lead "SUPPLY-ONLY — stamps …-effective; **no family css reads it (grep receipt: zero …-effective readers in the chip atoms)**" (:308, :322), modeled on the elevation/motion rows | `grep -rn -e "--jx-radius-effective" -e "--jx-color-effective" ui/chip/` → **0**; the atoms read `--jx-radius`/`--jx-fill` (chip.stylex.ts:68/77) |

svelte-check after: chip.html carries exactly its 1 standing cx-idiom error —
zero new.

## Part B — date-picker CODE

- inputs: family read in full first (date-picker.svelte 634 L, stylex, css,
  defaults, calendar/month-grid/time-stepper hooks); meta + DATE_PICKER_DOCS;
  census batch A row. Pre-flight pin grep: date-picker appears in 10 test
  files — the affected set was baselined solo BEFORE the edit.
- baseline: affected specs solo **470/470** (8 files) · tailwindless receipt
  verbatim · docs-universal 110/110 · docs staged green · svelte-check fleet
  1648 (date-picker.html: exactly 1 standing cx-idiom error at 151:28)

### Tier: 2 优化重构 — justified

Bones good and current: DocsInstall/DocsSeeAlso, the GENERATED props table
(pilot migration), the eight-cell catalogue and the playground are the page's
value and survive verbatim. Gaps filled: Overview (new — the three-orthogonal-
pieces story + the composed-consumer law), the per-axis table, the theme-split
receipts, one real query() case, archetype order. types/theming/
universal-props folded (their content preserved in the axes section; the
W3-era "family CONSUMES size and color" claim — the batch-A copy-paste —
replaced by the measured truth: zero effective-carrier readers).

### Diff

1. `date-picker.html/+page.svelte` — archetype order: hero → install →
   **Overview** → usage → live canvas → catalogue → **Props** → **The eight
   axes on date-picker** (per-axis table + density/theme demos + query case +
   two TokenTables) → accessibility → see-also. Removed: types/theming/
   universal-props (folded).
2. `date-picker.html/+page.ts` — ToC re-derived (6 ids; survivors usage/demo/
   api/accessibility kept).
3. `chip.html/+page.svelte` — the three Part A fixes.

### The axis story (grep receipts → rows)

- `grep -e "<all six --jx-*-effective>" ui/date-picker/` → **0 readers**: size,
  shape, radius, color, elevation, motion are supply-only rows in the
  negative-grep form (the house style).
- **density CONSUMED via the named rung**: the wrapper's data-density re-bases
  the jx-html-input channels (--jx-hit/--jx-inset/--jx-gap/--jx-leading) —
  measured trigger min-heights 32 / 40 / 48px at sm / default / lg (the --jx-hit
  ladder exactly). Number lane inert on an ambient wrapper (probe: coefficient
  1.5 → height 58 / min 40px / font 13px all unmoved); precision note below.
- **theme PARTIAL — the theme-split showcase** (probe 3, single-element reads
  under the wrapper's .dark): at the SAME day cell, `--primary` reads the dark
  formula `oklch(0.7044 0.1872 …)` (flipped) while `--jx-primary` at that cell
  still reads the light formula `oklch(0.6489 0.237 …)` (frozen at :root). The
  bezel flips (oklch 0.9551 → 0.2, the --popover fill), the day ink flips
  (black → white, raw --terminal-foreground); the selected fill keeps the
  light-profile L/C (the frozen --jx-primary pair), as do the placeholder
  chevron and the nav/stepper buttons. Both halves named voice-by-voice in the
  page's theme-split TokenTable.
- **elevation nuance** (the composed-consumer law in action): the panel's
  jx-surface-body law reads a consumption PAIR
  (`var(--jx-elevation-surface, var(--popover))` / `var(--jx-elevation-shadow,
  none)`) but date-picker never stamps the pair — the stampers are toast,
  terminal-card, press-button — so the lane lands inert on this family's own
  bezel. The row names them.
- **Composed consumers**: Calendar + TimeStepper mount inside the field
  wrapper and inherit its scope; the popover FAMILY is NOT in the chain (the
  panel is the native Popover API + the shared jx-surface vocabulary) — stated
  in the Overview, per the regression-sensitive warning (popover's
  extra-bearing table untouched by this task: zero edits outside the
  date-picker route + chip route).
- variant: the literal slot (own 'auto', the dialog/sheet precedent) — not an
  axis name, stays in the main table with the Own-default marker.

### EXTRA-lane arithmetic (raw SSR)

meta = 25 props; axis-named filtered = 8; rendered main table = **17 rows**
(25 − 8 = 17, extras 0 — exact); universal section = 8 rows; marker ×1. No
family-local prop shadows an axis name → no EXTRA lane needed (variant is not
an axis name).

### SSR + probe receipts

| claim | receipt | verdict |
|---|---|---|
| archetype + marker | SSR 200 / 1,077,341 B; marker ×1; ToC 6/6 unique | TRUE |
| density named rung repaints | trigger min-height 32/40/48px at sm/default/lg; field roots carry `data-density="sm"/"lg"` | TRUE |
| query() case | two-generic form served (6 DensityLane); SSR base → `data-density="lg"` (48px); 1440px → sm (32px compact); 600px (< 40rem) → lg — caption's direction verbatim | TRUE |
| number lane inert (pure case) | ambient wrapper + coefficient 1.5 → unmoved | TRUE |
| theme split, flipping half | bezel oklch 0.9551→0.2; border black→white; day ink black→white (72% mixes); `--primary` at the cell = dark formula | TRUE |
| theme split, frozen half | `--jx-primary` at the SAME dark cell = light formula (0.6489/0.237) — no re-substitution | TRUE |

Probe precision note (for the ledger, not a page defect): stamping
coefficient 1.5 onto a NAMED-RUNG wrapper DOES recompose (min-height 32→39px)
— the rung scope block re-declares the channels AT the wrapper, making the
wrapper a declaring element; the component never renders that state (the rung
stamp resets the coefficient to 1 atomically). The page's wording already
names both declaring sites (":root and the rung scopes").

## Gates

| gate | result | evidence |
|---|---|---|
| affected specs solo BEFORE | 470/470 | 8 date-picker/docs files (/tmp/quill-9-specs-baseline.log) |
| affected specs solo AFTER | 559/563 — the 4 failures are **avatar.html** (a sibling's in-flight pilot: snapshot mismatches mid-edit); every chip/date-picker/docs file green | /tmp/quill-9-specs-final.log |
| `verify:tailwindless` | GREEN, receipt verbatim unmoved (both runs; one earlier exit-1 was a cwd mistake, rerun from root) | files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 |
| `verify:docs-universal` | GREEN 110/110 — **stale-dist caveat below** | /tmp/quill-9-du-f.log |
| `verify:docs` | GREEN — same caveat | /tmp/quill-9-vd-f.log |
| svelte-check | 1648 → **1648** count-neutral; date-picker.html 1 error (the standing cx idiom, 151:28→152:28); chip.html 1 (same idiom) | /tmp/quill-9-sc.log vs /tmp/quill-8-sc.log |
| `npm run build` | **BLOCKED — cross-agent, not mine**: breadcrumb.html canvas "demo" is not self-contained (references `href` outside the slice; exact RolldownError in /tmp/quill-9-build*.log). breadcrumb.html/+page.svelte was mid-edit during my gates (mtime 00:51, sibling's task); two retries + one 90s wait, still failing. The dist is therefore STALE (00:13, pre-my-edits) — the dist gates above prove the fleet invariants; my pages' per-page truths are the dev-SSR receipts (captured fresh before server kill) | quoted above |

The orchestrator's integration build will surface the breadcrumb state; my
pages' own build-worthiness is evidenced by the dev SSR (both render 200 with
correct stamps/tables) and the count-neutral type check.

## Process receipt

Dev server wrapper 38659 / vite 38690 killed by PID; `ps` gone; `lsof :5241`
empty (exit 1). Probes /tmp/quill-9-axis-probe*.mjs + SSR captures + all gate
logs in /tmp only. My diff: chip.html/+page.svelte (3 prose fixes),
date-picker.html/+page.svelte + +page.ts (the repair). Siblings' in-flight
files (breadcrumb, avatar, and their tests) untouched. No commits, no push.
Measurement-only — no visual judgment entered any verdict.
