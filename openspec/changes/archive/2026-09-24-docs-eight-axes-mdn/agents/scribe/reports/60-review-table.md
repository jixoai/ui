# TASK 60 — FIRST REVIEW table (scribe, 2026-09-24)

- **Reviewer**: scribe (1st of 2; independence law held — quill's report 36 was opened
  only AFTER the findings below were fixed by my own source reads + live probes; the
  concordance addendum follows at the end)
- **Target**: quill's page — `apps/www/src/routes/docs/components/table.html/`
  (+page.svelte 1748 lines + +page.ts, 17 toc entries) over the table family
  `apps/www/src/lib/ui/table/` (svelte 222 / stylex 69 / css 199 / defaults). Integrated
  at d3ff3f11 WITH the radius family fix; target paths clean in the working tree; the
  in-flight sibling set untouched.
- **Method**: source reads (page, family svelte/stylex/css, the consumed-var chain),
  headless Chromium over dev SSR :5243 with warm-reload discipline, the workbench driven
  across the 30rem line (range fill 240px + stack/dense toggles), REAL-click a11y batteries
  (sort buttons vs th text; the full selection walk), stamp/voice/token reads on the axes
  panels, SSR payload parse, the three gates.
- **VERDICT: PASS** — 1 MINOR (one stale axis row contradicting the fixed behavior) / 0
  LOW / 0 NIT new; both family ledger defects reproduced exactly as receipted. The
  dispatched critical — the radius fix flip — CONFIRMED live.

## THE CRITICAL: the radius fix flip — CONFIRMED (the defect is gone)

The frame atom now reads `borderRadius: var(--jx-radius-consumed, var(--jx-radius))`
(table.stylex :40) and table.svelte stamps the consumed var flat at explicit radius,
nothing at auto (:190-194). Measured on the served page:

| Panel | lane | --jx-radius-effective | consumed stamp | computed corner |
|---|---|---|---|---|
| table-stamps | radius={12} | `12px` | **present** (flat calc × factor) | **12px** |
| table-named | radius="large" | `var(--jx-radius-large)` | present | **10px** |
| table-size | auto | *(none stamped)* | **absent** | **8px** (the site radius fallback) |
| workbench | auto | *(none stamped)* | absent | **8px** |

radius={12} paints 12px (factor 1); auto falls through to the site 8px with the stamp
omitted — BOTH halves of the fix live. The pre-fix defect receipt ("computed 8px always")
is superseded; the flip is the confirmation the dispatch asked for.

**[MINOR — one stale axis row]** The page's radius axis row (:626-631) still teaches the
defect as current: "STAMPED, SILHOUETTE DEFECT (W-next): … the silhouette **currently**
paints the static --jx-radius atom (measured 8px) … the painted corner **needs** the
family's atom to read the consumed var." Served behavior now measures 12px at radius={12}
— the row contradicts the page it sits on and would send every re-measurer hunting a bug
that d3ff3f11 fixed. One-row page edit: flip the row to the consumed-form receipt (the
table above is the copy source) and retire the W-next entry. No family change owed.

## Her measured surface — re-derived (my own instruments)

1. **FRAME-WIDTH LAW, both ends — VERIFIED digit-exact.** Wide (560px frame): real
   overflow **scrollW 646 > clientW 558** (exact), thead `table-header-group`, both pins
   `position: sticky`, header z **3**. Narrow (240px): thead **display: none**, table
   display block, a td's **::before content renders "Consumer"** (attr(data-label)), the
   first cell takes the head surface (oklch(0.9551 0 0)). `stack={false}` at 240: the table
   STAYS a table (`data-stack="off"`, thead visible, real overflow 644 > 238) — and an
   honest engine note: the sticky pins themselves stay container-gated (static below 30rem;
   they engage at ≥30rem per P3), the page never claims otherwise.
2. **A11y battery — VERIFIED on real clicks.** Caption names the table (14/14 tables
   captioned, census by name). aria-sort: absent on all 5 headers initially, caret
   aria-hidden; button click 1 → **ascending on the title th only**; click 2 →
   **descending**; a click on the **th text** (corner, outside the button) → **unchanged**
   (the th text is inert); a status-column press **moves** ascending to that th and clears
   the title; the **third press clears** to DOM order; row order visibly flips
   ("anchor lease restore" ↔ "toolbar composition" first). Selection: the polite live
   region walks **0 → 1 → 2 → 6 → 0 of 6 selected**; the header box reads
   indeterminate=true on partial, checked on select-all (6 `.row-selected`), and clears.
3. **Density — VERIFIED own-default + override.** The bare workbench stamps
   **data-density="sm" on BOTH the figure and the table** with no prop (the family's own);
   density="large" overrides to **lg**.
4. **SIZE VOICE SPLIT — VERIFIED.** size={18}: the FRAME computes **18px**
   (`--jx-size-effective: 18px; font-size: var(—jx-size-effective, 1rem)` inline) while a
   body cell computes **12px** (the density-tuned table voice wins inside the frame).
5. **W-next #10 (dense no-op at sm) — REPRODUCED as receipted.** dense toggle at the own
   sm: padding 8px/8px before AND after; the family vars read gap == inset (both
   `calc(calc(0.25rem * 2) * 1)` = 8px) — the dense rule has nothing to bite on. Ledger
   item confirmed live; the api row's measured note is accurate.
6. **W-next #11 (playground rowIds cross-canvas) — REPRODUCED, pair identified.** The live
   id census reads **195 ids with exactly one duplicate: `jx-play-row-1-label` ×2** — the
   workbench's "frame width" row and the tasks drawer's "page size" row (the playground's
   module uid restarts for the lazily-mounted drawer, so both canvases mint row-1). All 15
   aria-labelledby references resolve, but the colliding pair associates ambiguously. Her
   mechanism (salt the rowId with canvas/section identity) is the right owner fix; ledger
   item, not a page blocker.
7. **Page diagnostics — CONFIRMED FIXED.** Page-scoped svelte-check: **0 diagnostics**
   (the standing untyped-TreeFile and unguarded-cx diagnostics are gone; the page's cx
   carries the type predicate).

## Standard battery

- **SSR/post-settle duality**: payload 1,694,241 bytes; h1 ×1; universal marker ×1
  (PropsTable `universal` — in #api per the archetype); 0 undefined/null literals; toc =
  the 17 +page.ts ids ×2 rail surfaces (skip-link the only extra anchor).
- **Warm-reload law**: every probe session visited → reloaded → measured; all machines
  hydrated and stable across reruns.
- **EXTRA-lane by name**: 14 tables all captioned; the recipe suite's outputs law-table 6
  postures, axes 8 rows, api 5 props + universal appendix all served by name.
- **THEME-SPLIT**: the dark stamps panel re-voices the LOCAL token surface —
  `--jx-table-surface` oklch(0 0 0) / `--jx-table-head` oklch(0.2178 0 0) under the
  `.dark` class vs oklch(1 0 0)/oklch(0.9551 0 0) on the light panel — the bridge re-scores
  the --jx-table-* locals, not just text.
- **Vocabulary-grep**: zero `jxoai` misspellings in family or page; the SSR `data-theme`
  hits are the canvas-stage chrome (attribution per the stack/grid receipts).
- **KEYED-EACH + mounted children**: every rendered each keys on `consumer.name`/`row.id`/
  `status`/`item` — unique by construction; zero console errors/warnings across every
  session, including the full sort cycling and the dense/stack toggles; 60 tbody rows
  mounted across the 14 tables matching the authored slices.
- **LAW #19**: **195 ids, ONE duplicate — `jx-play-row-1-label`** (W-next #11, the
  playground family's uid, receipted above as the ledger reproduction; zero page-authored
  twins — the toc/section ids are clean).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, exit 0** (no keyed noise from the siblings' in-flight files) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 604 files) | **page 0 diagnostics**; family table.svelte carries :181 7× state_referenced_locally (the provideUniversalLanes pattern — density absent from the warnings, the provider-snapshot kernel law visible in the diagnostics) + :80 cx-overload and :213 `false \| "dense"` errors — pre-existing, unchanged family files |

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 36035 + wrapper 36006**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** The workbench toggles were returned
  to their initial states after each drive; siblings' in-flight files untouched.
- Independence: quill 36 opened only after the findings above were fixed; concordance
  follows.
- Instrument honesty: my first stack-toggle locator (`button[role=switch]`) timed out —
  the playground Toggle is ONE `input[role=switch]` (the native input IS the control);
  my first selection locator repeated the mistake with role=switch where the Checkbox
  family renders `input[type=checkbox]`; the sort-button locator needed #table-sortable
  scoping (the tasks table carries an identical "sort by title" button — strict mode
  caught it). The stack-off sticky read (static at 240) is engine truth, not a defect —
  reported as measured.
- Artifacts: /tmp/scribe-60-probe{1,2,3,4,5}.mjs, /tmp/scribe-60-ssr.html,
  /tmp/scribe-60-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill's report 36)

My findings above were fixed before this section.

- **FULL CONCORDANCE on every overlapping receipt**: the frame container (source :41-42),
  the frame-width law both ends (her 646>558 = mine digit-exact; her 238 keyboard drive =
  my 240 fill drive, same fold), the td::before "Consumer" content, the a11y battery
  (button-driven aria-sort, inert th text, the polite readout), density own-sm/override,
  the size-voice split (18px frame / 12px cells), page 0 diagnostics including her two
  fixes, ambient 284/284 + universal 110/110.
- **THE DISPATCHED CRITICAL — her defect #2 is FIXED and my measurement flips it**:
  her receipt ("the computed border-radius is 8px — the static atom outranks") described
  the pre-fix tree; the integrated d3ff3f11 atom now reads the consumed var and my table
  shows 12px at radius={12}, 10px at the named large, and the 8px site fallback with NO
  stamp at auto. The flip is confirmed — which is exactly why the **page's radius axis row
  is now stale** (my MINOR): it still teaches the defect as current. Her own probe-carry
  ("ready to flip when they land") anticipated this; the row is the one surface that
  didn't flip with the family.
- **Her defects #1 and #3 reproduce exactly as receipted**: dense at sm (padding 8/8
  unchanged, gap==inset) and the rowId twins — my census pins the pair (workbench
  "frame width" vs tasks-drawer "page size", both `jx-play-row-1-label`) and her salt
  recommendation stands as the owner fix.
- **Additions (mine, not in report 36)**: the full consumed/effective stamp table across
  all three lanes (her probe checked r12 only); the stack-off pin behavior at 240 with
  the container-gated sticky note; the complete selection walk (indeterminate law + the
  0→6→0 live-region transcript + `.row-selected` counts); the dark panel's re-voiced
  LOCAL token surface (the theme claim measured at the token layer); the W-next #11 pair
  identified by label text; the family-diagnostic receipt at exact lines (:181 7 warnings
  with density ABSENT — the kernel law visible; :80/:213 the two family errors); and the
  stale-row MINOR, which is the one fix the page owes.
