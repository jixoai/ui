# TASK 69 — SECOND REVIEW table (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (second reviewer; independence law held — quill's report 36 and
  scribe's report 60 NOT read before the findings below were fixed; the concordance
  addendum follows after filing).
- **Target**: quill's page — `table.html/+page.svelte` (1747 lines, the full recipe suite)
  + the family (table.svelte 221 + css/stylex/defaults). The landed MINOR (0edd6862) is in
  the tree. Zero edits by me; sibling noise (vellum's tour.html, quill's terminal-footer,
  scribe's tabs) receipted — none keyed in my gates.
- **VERDICT: PASS — the page closes.** 0 MAJOR / **1 MINOR (rides closure — the LAW #19
  residue, which IS ledger item #11's AT cost)** / 0 LOW / 1 NIT.

## The dispatched surface — verified TRUE

1. **THE LANDED MINOR — the three radius lanes re-derived digit-exact.** The axis row now
   carries the post-fix receipt, and my probe reproduces all three lanes on the axes
   specimens: **explicit 12 → corner 12px** (style attr `--jx-radius-effective: 12px` + the
   consumed calc), **'large' → 10px** (`--jx-radius-effective: var(--jx-radius-large)` +
   consumed), **auto → 8px** (the site fallback; NO radius stamp — the consumed calc
   absent). The consumed stamp is present exactly when the lane is explicit, as taught.
2. **THE FRAME-WIDTH LAW, both ends — VERIFIED.** Driving the workbench's frame-width
   range: **narrow (240px)** — the figure computes min(240px, 100%) = 240, **the thead
   collapses (display: none)**, every td carries its `::before` data-label ("Consumer" read
   verbatim), 40 data-labels on the frame, and the table does NOT overflow in card mode
   (scroll 238 == client 238). **Wide** — thead returns (table-header-group), the ::before
   labels vanish, and the real overflow receipts at the content's fit width: at a 560px
   frame the table measures **646 wide inside the 560 frame** (the scroll container is the
   figure — her 646>558 receipt, same content width at my range step); the **sticky pin
   holds** (first column position: sticky, left: 0, the fold mark present).
3. **THE A11Y BATTERY ON REAL CLICKS — VERIFIED.** The sortable table: clicking the header
   **button** drives the th's tri-state — **absent → ascending → descending → absent**
   (one column at a time, the caret aria-hidden); the selection table: one row checked →
   the header checkbox **indeterminate: true, checked: false**; all rows → **indeterminate:
   false, checked: true** — the indeterminate-rule traversal exact. **Caption census: 20
   tables, every one exactly one caption.**
4. **Density — sm OWN DEFAULT vs explicit override — VERIFIED**: the bare workbench table
   and the modes tables stamp **data-density="sm" with no prop** (the fleet's
   density-opinion family); the stamps specimen's explicit **large → data-density="lg"**.
5. **THE SIZE-VOICE SPLIT — VERIFIED 18px frame / 12px cell.** The size={18} specimen: the
   frame computes **18px** while the cells hold the density-tuned **12px**
   (`--jx-text = calc(0.8125rem − 0.0625rem)` at the sm own). (An 11px first read was a
   mid-reveal artifact — the anchored re-read is 12px, receipted.)
6. **W-NEXT #10 — CONFIRMED as a ledger item**: the channels are EQUAL at the sm own
   (`--jx-gap` == `--jx-inset` == 8px) and the row-level A/B proves the no-op — the modes
   demo's default table and dense table mount **identical 34px rows** at sm. (See the NIT
   for the lg clause.)
7. **W-NEXT #11 — CONFIRMED as a ledger item, live**: the rowId pair is the **PlayRow label
   id collision** — the workbench playground's "frame width" row and the tasks pagination's
   "page size" row are BOTH row 1 of their PlayFields instance, so both labels render
   `id="jx-play-row-1-label"` (×2 in SSR and live). The SSR census adds the sibling
   collision `id="tasks-columns"` ×3 (the column-visibility popover id, echoed across the
   tasks table's triggers; one element live — self-resolving at hydration).
8. **THE TOKENS CLASSIFICATION — VERIFIED** (the theming classes named): the --jx-table-*
   locals are the **color-surface class** — `--jx-table-surface` = var(--background)
   (oklch(1 0 0) here — the opaque ground that masks sticky scrolls), `--jx-table-head` =
   the muted band (oklch(0.9551 0 0)), `--jx-table-hover` = the primary-7% mix that follows
   --brand-hue at runtime; hairline/rule/edge are the border mixes. When theming: they ride
   the **color class via the style seam** (per-instance `--jx-table-hover` override
   verified live: before = the primary mix, after an override = rgb(255,0,0)), while the
   **theme bridge (class:dark)** re-voices them through the token scope — the two classes
   the dispatch asked to separate, now measured apart.

## Standard battery

- **SSR/post-settle duality + warm-reload law**: two fetches hash-identical
  (b7b5a71d…); 1.69MB payload clean.
- **EXTRA-lane by name**: the recipe canvases (workbench, sortable, filter-row, pagination,
  selection, row-actions, sticky-header, tasks, semantic set) all mounted; the toc carries
  14+ entries (the suite's full depth).
- **Vocabulary-grep**: zero --jx-color-effective / elevation-effective / motion-effective
  readers in ui/table/ (the color row's supply-only + the elevation/motion receipts hold).
- **KEYED-EACH**: the workbench consumers each keys `(consumer.name)`; the recipe lists key
  their rows.
- **LAW #19**: **h1 ×1; toc all resolving — but the served page carries the two duplicate-id
  families** (the PlayRow pair + tasks-columns ×3 SSR): the MINOR below.

## Findings (severity-tagged)

1. **[MINOR — the LAW #19 residue, which is ledger item #11's AT cost]** the served page
   carries **`id="jx-play-row-1-label"` ×2** (the workbench's "frame width" control and the
   tasks pagination's "page size" control — both row 1 of their PlayFields instances), and
   SSR adds **`id="tasks-columns"` ×3** (self-resolving live). The AT cost is real: both
   controls' aria-labelledby resolve to the FIRST label, so the page-size control announces
   "frame width". This is W-next #11's pair made concrete — the fix is scoping the
   PlayRow/PlayFields id counters per instance (or explicit ids on the two seats). Rides
   closure with #11; not a regression (the collision is the ledger item's own shape).
2. **[NIT — the dense "bites at higher rungs" clause]** the api row says the dense no-op
   "bites at the higher density rungs"; my channel reads show `--jx-gap` == `--jx-inset` at
   lg too (both 16px) — the bite is not visible in the channels at lg. I did not row-height
   A/B at lg; either soften the clause or receipt the lg row A/B that shows the bite.
3. **[NONE]** otherwise — the landed MINOR verifies, the frame-width law holds both ends,
   the a11y battery is exact, and no MAJOR/LOW surfaced.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean (0 table.html keys) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family = the fleet's state_referenced_locally warns at :181 (pre-existing); fleet 1561/1028/601 |
| Raw SSR | warm-reload identical; dups = the two MINOR families (receipted); h1 ×1 |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 974 / pgid 970) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** The live mutations (the frame-width
  drives, the sort/selection clicks, the token override, the density stamp) all restored
  in-probe.
- Independence: quill's report 36 and scribe's report 60 not read before the findings were
  fixed.
- Instrument honesty: **dsf 1, viewport-clip space**; the first LAW #18-style census and
  the voice read were taken mid-reveal (1-row wrappers, an 11px cell) — re-anchored after
  the full reveal pass and re-read (12px). The overflow receipt is measured at the figure
  scroll container (the table's own scrollWidth reads equal to its client because the
  FIGURE is the scroller).
- Artifacts: /tmp/marginalia-69-probe{1,2,3}.mjs, /tmp/marginalia-69-ssr.html,
  /tmp/marginalia-69-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill's report 36 and scribe's report 60)

## Concordance addendum (appended after reading quill's report 36 and scribe's report 60)

My findings above were fixed before this section; cross-check against both:

- **FULL CONCORDANCE with scribe's 1st PASS**: the radius flip table reproduces digit-exact
  (12 / 10 / 8 with the consumed stamp present exactly when the lane is explicit); the
  frame-width law both ends (her 646>558 — my 646-in-560 at the range's step; thead fold +
  the ::before "Consumer" content); the a11y battery (button-driven tri-state, the
  indeterminate law — her transcript 0→6→0, my one-row/all-rows reads); density own-sm/
  lg-override; the size-voice split (12px cells — her census and my anchored re-read
  agree); W-next #10 (gap==inset 8px at sm) and #11 (her census: 195 ids, ONE duplicate
  pair, identified by label text) — both ledger items confirmed. Her :181 7× warns
  reproduce in my log.
- **FULL CONCORDANCE with quill's CODE receipts**: her three defect receipts stand as
  ledgered — #1 dense-no-op (reproduced at the row level, 34 == 34), #2 the radius
  silhouette (SUPERSEDED by the d3ff3f11 fix + the landed row — her "ready to flip"
  probe-carry anticipated exactly what my A-probe measured), #3 the rowId twins (her salt
  recommendation stands as the owner fix; my live pair read names the two labels). Her toc
  and chrome receipts reproduce.
- **ADDITIONS (mine)**: the MINOR's AT-cost sharpening — the #11 pair is not just a
  duplicate id: BOTH controls' aria-labelledby resolve to the FIRST label, so the tasks
  pagination's page-size control announces "frame width" (the SSR census adds the
  tasks-columns ×3 echo, self-resolving live); the tokens-classification receipt (the
  style seam retunes --jx-table-hover per instance while the theme bridge re-voices through
  the scope — the two theming classes measured apart); and the NIT on the dense clause.
- **The dense-clause NIT, sharpened against her receipt**: her "inset 12/16 at higher
  rungs" implied a gap≠inset bite; my lg read shows gap == inset == 16px. Either the bite
  needs the row A/B receipted at lg, or the clause softens — flagged, not adjudicated.
