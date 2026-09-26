# TASK 56 — SECOND REVIEW prototype-grid (scribe, 2026-09-24)

- **Reviewer**: scribe (2nd of 2; independence law held — vellum's report 36 and
  marginalia's report 44 were opened only AFTER the findings below were fixed by my own
  source reads + live probes; the concordance addendum follows at the end)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/prototype-grid.html/`
  (+page.svelte 499 lines + +page.ts) over the inline-style-only family
  `apps/www/src/lib/ui/prototype-grid/prototype-grid.svelte` (139 lines). Both target paths
  clean in the working tree; the in-flight sibling set (vellum's tabs.html, marginalia's
  waterfall reverify) untouched and outside my probe paths.
- **Method**: source reads (page, family, +page.ts, the 831fbadb diff), headless Chromium
  over dev SSR :5243 with warm-reload discipline, the rig driven through its REAL controls
  (PlaySelect ×2 + PlayNumber) with computed `grid-template-columns` reads per state, a
  rect-geometry no-blowout injection, an auto-fit re-count ladder, areas-placement geometry,
  stamp reads on the universal specimens, breakpoint-disciplined query(), SSR payload parse,
  the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 NEW LOW / the carried LOW + NIT confirmed
  settled-or-conventional. Every named receipt reproduced at its named width; the trio's
  middle page closes (waterfall's 2nd in flight).

## The landed width-naming clause — re-derived at the named widths (831fbadb verified)

`git show 831fbadb` = "prototype-grid 1st PASS (marginalia 44)" touching only the page's
readout (+5/−3). The served readout now names its seats: "px receipts name their seat —
re-measures match to the rounding only at the named widths". My re-measures AT those named
widths:

| Named receipt | Named seat | My measure | Verdict |
|---|---|---|---|
| cols=3 → 240px ×3, `repeat(3, minmax(0px, 1fr))` | 1400px viewport | **240.328px ×3**, CSSOM decl verbatim | ✓ to the rounding |
| gap 30 → 30px column-gap, tracks 240 → **228px** | 1400px viewport | **228.328px ×3**, column-gap 30px | ✓ to the rounding |
| ratio "1fr 2fr 1fr" → **180/361/180** | 1400px viewport | **180.25 / 360.5 / 180.25** = exact 1:2:1 | ✓ to the rounding |
| auto-fit floor → **145px** tracks | 760px viewport | **145.25px ×4** (floor 140 engaged) | ✓ to the rounding |

Clean reverts measured (gap 30 → 12 returns 240.328×3; the cols form cycles back to the
baseline). The rig readout's numbers are the claims under test and they all hold at their
seats.

## The claims — verified TRUE (my own instruments)

1. **NO-BLOWOUT injection — VERIFIED with a rect-geometry proof.** A `min-width: 600px`
   chip injected into the cols=3 rig at column 3 leaves the tracks at **240.328px ×3
   unchanged** while the content overflows the grid box (chip right edge 1435 vs grid right
   edge 1075 = 360px overflow; chip 600 > track 240.328). Removal restores the baseline
   exactly. A track can never grow past its fr share because a chip is wide — the
   minmax(0, 1fr) coercion's guarantee, live.
2. **Auto-fit re-count — VERIFIED as a real mechanism.** The same form re-counts its tracks
   with the viewport: **4 × 145.25px @760 → 3 × ~149.7px @600 → 2 × 160.5px @460** — the
   count drops and the per-track share rises as the container narrows, every track ≥ the
   140px floor (converging toward it as the count rises). "Shrinks to the floor and
   re-counts past it" is what the engine does.
3. **Flex-harness adaptation — VERIFIED.** Three real bound controls (rigCols/rigRows/
   rigGap through PlaySelect ×2 + PlayNumber); every state change measured against the
   container's RESOLVED grid-template-columns (px per track), never the style string; the
   drawer's usage file mirrors live state (`resolveRigUsage`, same-source law). rows=2
   pins the declaration `grid-template-rows: repeat(2, minmax(0px, 1fr))` (CSSOM form) with
   two equal computed row tracks (45.5px each).
4. **Areas-as-string — VERIFIED verbatim + geometric.** The types demo's
   `"head head" "side main"` computes to exactly `"head head" "side main"` on a 2fr 1fr
   track pair (468.656/234.328); head spans the full top row (w=711 = both tracks + gap),
   side and main split row 2 at the measured x positions (347/824). The family passes
   grid-template-areas through as one template string (source :134; the array-join form is
   the recorded non-guessed future enhancement).
5. **Forwarder stamps + omission transparency — VERIFIED.** density="small" →
   `data-density="sm"` + `--jx-density-coefficient: 1`; density="large" → "lg"; theme="dark"
   → the `dark` class WITH a real paint consequence (the island's `--foreground` computes
   oklch(1 0 0) vs oklch(0 0 0) on the light specimens — THEME-SPLIT with the read, the
   subtree re-scope is real); size={18} → `--jx-size-effective: 18px; font-size:
   var(--jx-size-effective, 1rem)` verbatim inline, computed 18px; size="medium" → the
   named-step var form (`--jx-size-effective: var(--jx-size-medium)`, computed 16px;
   likewise radius-effective → radius-large). **The all-auto specimen stamps NOTHING**:
   zero carriers in its style attr, density null, dark false — pure layout declarations
   (omission transparency measured). The rig itself (no axes) matches: style attr is layout
   only.
6. **query() — VERIFIED both directions, live.** The size-lane seat: **13px @600 fresh
   (base) → 18px @1280 (the 48rem md key) → 13px back**, the `--jx-size-effective` stamp
   tracking the computed value. The lanes-vs-passthroughs boundary is source-proven
   (cols/rows/gap/areas are `number | string`; only the eight lanes accept QueryResult).
7. **LAW #18 with extra weight — CLEAN (this page's birthplace).** Every keyed surface
   keys on defined unique values: the rig's `(g)` Greek-letter keys (6 chips), the types
   demos' `(n)`/`(i)` (4/3/3 chips, static literals), the query seat's `(t)`. A 12-flip
   control stress (cols form ×6, rows ×6) leaves exactly **6 chips, no duplicates, no
   ghosts**, and **zero console errors/warnings across every probe session** — no
   `each_key_duplicate`, the incident that birthed the law, absent.
8. **LAW #19 — CLEAN, one line.** Post-hydration id scan: **66 ids, zero duplicates**.
9. **SSR/post-settle duality — VERIFIED.** Payload 1,057,994 bytes; h1 ×1; toc = the 8
   +page.ts ids ×2 rail surfaces (overview, live-demo, law, types, usage, api,
   universal-props, accessibility; install/see-also chrome OUT; skip-link the only extra
   anchor); 0 undefined/null literals. EXTRA-lane by name: the api table serves all 6 rows
   (cols/rows/gap/areas/class/rest) and the axes section all 8 forwarder rows by name.
10. **Vocabulary — CLEAN.** The family greps carry zero `data-theme`/`jxoai` tokens; the
    4 SSR `data-theme="light"` hits are all `data-jx-canvas-stage` chrome (the canvas's own
    stage stamp), not family vocabulary. Theme rides the `.dark` class bridge exactly as
    the axis row teaches.

## Findings (severity-tagged)

1. **[NONE new]** — no MAJOR, no MINOR, no new LOW on any dispatched claim.
2. **[LOW — carried, SETTLED]** The 1st review's width-naming suggestion landed at
   831fbadb; my re-measures at the named seats all match to the rounding (table above).
   Nothing further owed.
3. **[NIT — carried, convention]** The rig canvas carries no onreset (the trio
   convention — prototype-flex's page has none either); the controls themselves revert
   cleanly (measured). Not a defect.
4. **[LOW — pre-existing diagnostics, unchanged files]** Family :115 carries 8×
   state_referenced_locally warnings (the fleet-wide provideUniversalLanes pattern — the
   same count and line as the 1st review). Page: **0 diagnostics**. Fleet 1568/1028 (606
   files) is the in-flight sibling set + ambient debt, attributed not chased.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, exit 0** (benign vitest close-timeout warning; no keyed noise from vellum's tabs.html — not in this suite's candidates) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 606 files) | **page 0 diagnostics**; family :115 8 warnings pre-existing (unchanged file) |
| Raw SSR + real DOM | h1 ×1; toc 8 == +page.ts == DOM (×2 surfaces); 66 ids 0 twins; 0 undefined/null; api 6 + axes 8 rows served by name |

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 6709 + wrapper 6680**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** The no-blowout injection was a
  live-DOM probe (chip appended and removed); siblings' in-flight files (vellum's tabs,
  marginalia's experience + report 57) untouched.
- Independence: vellum 36 / marginalia 44 opened only after the findings above were fixed;
  the concordance addendum follows.
- Instrument honesty: my first blowout injection auto-placed the wide chip into column 1
  where 600px fit INSIDE the 745px container (no overflow possible) — re-run with the chip
  explicitly in column 3; and `scrollWidth` proved ambiguous on overflow:visible grid
  children (two runs read 745 == 745 while the boolean flip-flopped), so the filed receipt
  is the rect-geometry read (chip right 1435 > grid right 1075), not scrollWidth. My first
  specimen census used `.panel` class selectors — stylex hashes defeat them; re-anchored on
  `[data-jx-prototype-grid]` + chip text.
- Artifacts: /tmp/scribe-56-probe{1,2,3,4}.mjs, /tmp/scribe-56-ssr.html,
  /tmp/scribe-56-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum 36 + marginalia 44)

My findings above were fixed before this section.

- **FULL CONCORDANCE with marginalia 44 — every number to the third decimal**: 240.328×3,
  180.25/360.5/180.25, 145.25×4 @760, 228.328 under gap 30, rows 45.5px each, the alpha
  laws at the same source lines (trackStyle :100-104, the stamp-after-spread root
  :123-136), the stamps (sm/lg, the size carrier verbatim, named-step var forms, all-auto
  stamps nothing), query 13↔18, **66 ids zero duplicates (exact match)**, family :115 8
  warnings (same line), page 0 diagnostics. Her no-blowout injection (2000px chip in the
  cols=4 demo, tracks 171.75×4 unchanged) reproduces in my instrument as the 600px/col-3
  variant; my rect-geometry proof adds a decisive overflow read where scrollWidth proved
  ambiguous.
- **ADDITIONS (mine, not in report 44)**: the auto-fit re-count LADDER (4 → 3 → 2 tracks
  at 760/600/460 with shares rising 145 → 149 → 160.5, floor never breached — the
  re-count mechanism instrumented as a sequence, not two points); the dark island's
  `--foreground` flip (oklch(1 0 0)) as the theme bridge's paint-consequence read; the
  12-flip control stress for LAW #18; the 831fbadb diff receipt (the clause is exactly the
  +5/−3 readout edit); the canvas-stage attribution for the SSR `data-theme` hits.
- **vellum 36 reconciliation**: all her measurements reproduce; her OQ1 (the keyed-each
  BOARD law) is LAW #18, banked, and my receipts confirm svelte-check's blindness to
  each_key_duplicate (page 0 diagnostics with keyed surfaces present, law enforced only by
  probe); OQ3 (dense/flow unauthored) re-confirmed against the Props interface (no
  grid-auto-flow); OQ4 (trio law phrasing) stays a future consistency pass. Her OJ2
  auto-fit rig suggestion is already realized — this page IS the teaching rig.
- **Trio state**: flex (closed), grid (this PASS), waterfall (marginalia's 2nd in flight,
  report 57 present in the tree) — the layout trio closes with this page.
