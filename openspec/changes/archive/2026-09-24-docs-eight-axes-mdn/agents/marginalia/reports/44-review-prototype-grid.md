# TASK 44 — REVIEW prototype-grid (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — vellum's report 36 NOT
  read before the findings below were fixed; the concordance addendum at the end was appended
  after filing, per the dispatch)
- **Target**: vellum's page — `prototype-grid.html/+page.svelte` (496 lines) + `+page.ts` +
  the family (prototype-grid.svelte, 138 lines, inline-style-only). Zero drift on
  prototype-grid paths; the tree's uncommitted set (system-dialog — quill, scroll-area,
  agents' experience files) belongs to siblings — untouched.
- **Method**: source reads (page, family, meta), a live rig battery at the claimed 1400px
  viewport plus 760/500/700 excursions (computed `grid-template-columns` per state — the
  resolved px per track, not the style string), a no-blowout injection probe (a 2000px chip),
  an areas-placement geometry read, stamp reads on the universal specimens, breakpoint-
  disciplined query(), SSR parse + real-DOM duplicate-id scan, ambient solo + docs-universal +
  fleet svelte-check.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT. Every headline number reproduced
  (most to the third decimal), the three alpha laws and the no-blowout guarantee verified
  live, the areas-as-string v0 limit source-true, and LAW #18's keyed-each clean on every
  keyed surface.

## The headline claims — verified TRUE

1. **Track geometry — VERIFIED digit-exact** (computed `grid-template-columns`, the rig
   container 745px at the 1400 viewport):
   - **cols=3 → `240.328px 240.328px 240.328px`** (three equal tracks; her [240,240,240] is
     the rounding), style declaration `repeat(3, minmax(0px, 1fr))` verbatim;
   - **verbatim "1fr 2fr 1fr" → `180.25px 360.5px 180.25px`** — the exact 1:2:1 split whose
     browser rounding IS her [180,361,180];
   - **auto-fit at a 760 viewport → `145.25px × 4`** (the 140px floor plus the fr share — her
     [145px×4] reproduced) and it RE-COUNTS: at a 500 viewport the same form serves
     **2 × 180.5px**; at 1400 it serves 4 × 177.25px;
   - **gap absorbed**: gap 12 → 240.328 tracks; gap 30 (column-gap computed 30px) → **228.328px
     tracks** — the tracks absorb the gap, her 240→228 exactly.
2. **The three alpha laws — VERIFIED**: SINGLE ROOT + REST SPREAD (one div; `{...rest}` first,
   the `data-jx-prototype-grid` stamp after — replace, never merge, source :245-247); ZERO
   TRANSLATION (cols/rows/gap/areas pass through; the sole vocabulary event is the number-form
   coercion `repeat(N, minmax(0, 1fr))`, trackStyle() :110-112); INLINE STYLE ONLY (the family
   is two files, no css, no tokens — dir listing + grep).
3. **minmax(0, 1fr) no-blowout — VERIFIED live**: injecting a 2000px min-width chip into the
   cols=4 demo leaves the tracks at **171.75px × 4 unchanged** (trackStretch false) while the
   grid overflows its box (scrollWidth > clientWidth) — a wide chip can never stretch a track
   past its fr share.
4. **Areas-as-string v0 limit — source-true and rendering**: the family passes
   `grid-template-areas` verbatim (one template string; the array-join convenience is a
   recorded non-guessed future enhancement); the types demo's `"head head" "side main"`
   resolves computed areas and real placements (head spans the top row; side/main split row 2
   at the measured x positions).
5. **The flex-harness copy-adaptation — VERIFIED**: the rig's three controls are real bound
   props (PlaySelect ×2 + PlayNumber → rigCols/rigRows/rigGap), every state change measured
   against the container's RESOLVED tracks (the readout paragraph's numbers are the claims
   under test), and the controls revert cleanly (select back → tracks return to the 240.328
   baseline; the rig canvas follows the trio convention of no onreset — matches
   prototype-flex's own page, so the omission is the convention, not a dropped feature).
6. **Forwarder stamps — VERIFIED on the universal specimens**: density="small" →
   `data-density="sm"` + `--jx-density-coefficient: 1`; density="large" → "lg"; theme="dark" →
   the dark class; size={18} → `--jx-size-effective: 18px; font-size: var(--jx-size-effective,
   1rem)` verbatim in the style attr with computed 18px; size="medium" → the named-step var
   form; the all-auto specimen stamps NOTHING (omission transparency, measured — its style attr
   is pure layout). The layout is theme-blind and geometry-blind as claimed.
7. **query() — VERIFIED with breakpoint discipline**: the query seat's grid computes **18px at
   1400** and **13px at 700** (below the 48rem key), fresh-load consistent — while an explicit
   size={18} specimen on the same page holds 18px at both widths (the lane boundary is real).
   The lanes-vs-passthroughs boundary (cols/rows/gap/areas reject query()) is source-proven
   (number | string types) — noted, not re-typechecked.
8. **LAW #18 keyed-each — CLEAN with the extra weight this page carries**: every keyed surface
   keys on defined values (the rig's `(g)` Greek-letter keys; the types demos' `(n)`/`(i)`),
   all mounted-children counts match their arrays (6 rig chips; 4/3/3 types chips), zero
   undefined keys — no EACH_KEY_DUPLICATE surface anywhere on the page.
9. **LAW #19 one-liner**: **zero twins** (SSR + post-hydration, 66 ids unique), wrapper ids in
   SSR, all ToC hrefs resolving — the guard holds.
10. **Chrome — VERIFIED**: h1 ×1; served toc = all 8 non-chrome sections in DOM order
    (overview, live-demo, law, types, usage, api, universal-props, accessibility);
    universal marker ×1; install/see-also markers present; 0 literal undefined/null text
    nodes. Meta: 16 named entries (cols/rows/gap/areas/class + 8 axes + children + rest —
    rest IS stored for this family), consistent with the rest-spread api row; the api summary
    makes no arithmetic claim.

## Findings (severity-tagged)

1. **[LOW — the rig's absolute px receipts are viewport-conditional and the readout says so
   only partly]** The receipts paragraph quotes "240px each at 1400px viewport" (fair) but the
   auto-fit "145px at a 760px viewport" and the ratio "180/361/180" omit their container
   widths — all three reproduce only at the named widths (my 145.25 and 180.25/360.5 match to
   the rounding). Suggested one-word tightening ("at the 760px viewport", "at the 1400px
   container") so future re-measures at other widths don't read as drift. Cosmetic precision;
   every number verified as measured.
2. **[LOW — pre-existing diagnostics, unchanged files]** family :115 8×
   state_referenced_locally warns (the fleet-wide provideUniversalLanes pattern) +
   scenes/prototype-grid 1 error. Page: **0 diagnostics**. Fleet 1575/609 (sibling set —
   quill's system-dialog files in flight).
3. **[NIT]** The rig's canvas carries no onreset (the trio convention — prototype-flex's page
   has none either), so the canvas reset affordance does not restore cols/rows/gap; the
   controls themselves revert cleanly (measured). Convention, not a defect.
4. **[NONE]** on the dispatched claims.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean this pass (the in-tree matrix re-pin from the sheet/scroll-area work carried the prior sheet keys; no new keyed noise) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 609 files) | **page 0 diagnostics**; family/scene debt pre-existing (unchanged files) |
| Raw SSR + real DOM | h1 ×1; SSR ids clean; post-hydration 66 unique ids, 0 twins; ToC complete (8/8 non-chrome); 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite killed by PID (+ wrapper);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The no-blowout injection was a live-DOM
  probe (min-width set and cleared); sibling files (system-dialog, scroll-area) untouched.
- Independence: vellum's report 36 not read before the findings were fixed; the concordance
  addendum follows after filing.
- Artifacts: /tmp/marginalia-44-probe{1,2}.mjs, /tmp/marginalia-44-ssr.html,
  /tmp/marginalia-44-{specs,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 36)

My findings above were fixed before this section; the cross-check against report 36:

- **FULL CONCORDANCE — every measurement reproduced**: cols=3 [240×3] (mine 240.328×3),
  auto-fit [145×4]@760 (mine 145.25×4), the ratio [180/361/180] (mine
  180.25/360.5/180.25 — her integers are the browser rounding), rows=2 → 45.5px each (exact),
  gap 30 → 30px column-gap with the tracks absorbing (mine 228.328), the stamps (lg/null
  ambient, the size carrier verbatim + 18px computed, the .dark class, areas verbatim with
  head placed), query 13px→18px across 48rem, and the SSR receipt (h1 ×1, order, toc==DOM,
  duplicate ids NONE). Her "PROBE receipts, served DOM" headline is honest — this was a
  measured CODE pass and it holds.
- **ADDITIONS (mine, not in report 36)**: the no-blowout guarantee measured LIVE (a 2000px
  min-width chip leaves the tracks at 171.75px × 4 with the grid overflowing — her rationale
  statement, now a probe receipt); the areas placements measured as GEOMETRY (head spans the
  top row, side/main split row 2); the omission-transparency receipt (the all-auto specimen's
  style attr is pure layout — stamps nothing); and the rounding note (her integer receipts are
  the roundings of 240.328/180.25/360.5 — my LOW suggests the readout name the widths).
- **HER OPEN QUESTIONS, updated**: (1) the keyed-each BOARD law — ALREADY BANKED as LAW #18
  (this page is its birthplace; my keyed receipts on every surface came back clean, and
  svelte-check's blindness to each_key_duplicate is confirmed by my run — page 0 diagnostics
  with four keyed surfaces present); (2) the auto-fit floor rig for card-grid — good teaching
  suggestion, no action from this review; (3) dense/flow flags unauthored — CONCURRRED (the
  Props interface carries no grid-auto-flow; the recorded-future bucket is right); (4) the
  trio's shared law phrasing — concurred as a future consistency pass.
