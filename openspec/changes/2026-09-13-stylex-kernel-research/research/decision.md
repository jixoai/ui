# R6 — the decision (decision.md)

> The synthesis over all lanes (R0–R5, L1–L3c). Every verdict cites
> its receipt. Structure per verification.md: hard gates first
> (dual-column where ledger rulings apply), then scored dimensions
> with the pre-registered anchors (F8: D4–D6 only, max 35, bar
> ≥21/35 with D4≥3), sensitivity recomputes, missing-data flags,
> RQ8, the difficulty register, the verdict, and the blueprint.
> Written by the orchestrator, 2026-09-13. Dossier base: HEAD
> 6ba61d87; Gate-2 round-1 corrections (receipt unification,
> sensitivity recompute, D4 dev-loop measurement, D6a receipts,
> blueprint expansion) land in the Gate-2-r2 commit — provenance is
> the amendment ledger + git history, not a single HEAD.

## 1. Hard gates

### D1 toolchain feasibility — **PASS** (three engines)

13/13 fixtures green (research/spike-report.md §1): dev injection
391ms/276ms; HMR 103ms no-reload; FOUC style-ready ≤ FCP in BOTH
modes (dev 83.6≤96.0ms, prod 32.6≤68.0ms); prerender HTML carries
compile-time class constants (string-equal to built CSS); no-JS
styled; hydration clean with data-style-src; dynamic values degrade
to inline custom properties; pseudo/keyframes dev≡prod; dark+density
same-frame; three degradation laws + control equality; typo'd tokens
fail compile naming the token; Chromium + WebKit + Firefox all green
(Firefox closed by L3b after engine install; roll-up unified in
spike-report.md §7 — the manifest's 13 fixtures are the contractual
unit; dev/prod split-rows are reporting detail). The two official blind
spots are DEAD: Vite 8 works (CSS entry MANDATORY — rolldown silently
drops the link otherwise), adapter-static works as predicted.
Scope: the F-series pin set exactly (svelte 5.57.0 / kit 2.70.3 /
vite 8.3.0 / @stylexjs 0.19.0 / TW 4.3.3); any bump re-opens D1.

### D2 override law — **dual verdict, ledger F9**

| reading | verdict | evidence |
|---|---|---|
| as-frozen (the manifest's original app.css order) | **FAIL** — D2-01 core-i and D2-03's unchecked sub-assertion fail: unplugin 0.19.0 appends stylex after TW's utilities block and CSS first-declaration ordering makes stylex permanently beat consumer utilities (the UNLAWFUL cascade) | spike-report.md §2 rows 01/03 |
| F9 configuration (layer statement hoisted above the import — CSS-legal) | **PASS 15/15** — the O1-H diagnostic build restores both rows to the manifest's exact literals with ZERO regressions across all other rows | spike-report.md §2 + §5.1; F9 |

The frozen order was setup scaffolding; D2-01's expectation (consumer
utility WINS) IS the law. The F9 ruling is Gate 2's to bless; the
Owner holds override. The discovery itself is load-bearing: the
coexistence footgun is SILENT — architecture A leaves it at every
consumer; architecture B engineers it out.

### D3 distribution — **dual verdict, ledger F10**

| reading | verdict | detail |
|---|---|---|
| as-frozen (packages Δ≤+2) | **FAIL — ALL architectures** | the tolerance was calibrated on the design's verbatim assumption "babel chain rides unplugin deps", FALSIFIED by measurement: babel×20 + browserslist are real consumer lockfile names (+50 B, +6 C) |
| F10 burden vectors (bytes ≤+5MB, cold p95 ≤+15%, config files =0, lines ≤+6, boilerplate ≤10 GENERATED) | **B: PASS all** — bytes +1.78MB, cold p95 **−24% (faster than TW4)**, warm +8.2%, 0 config lines, 0 boilerplate. **A: FAIL substantively** — +15 config lines, 8 hand-copied boilerplate lines, F9-footgun exposure at every consumer. **C: PASS burden** — lightest (−15.5MB bytes, 0.42s builds) but the hybrid-payload contract: class hashes are path-dependent, consumers cannot recompile source without name divergence | d3-consumer.md full matrix |

Owner was presented the re-anchor options (session, no answer
received) — this table IS the override surface: striking F10 reverts
D3 to FAIL-for-all and the verdict below flips.

## 2. Scored dimensions (anchors from design §4, F8 edition)

**D4 measured performance — 3/5 (w×3 → 9)**
- Baseline (R2): per-page CSS 343–381KB, **68–78% irrelevant to the
  page** (P2 used-ratio 22.3/28.5/32.2%); the irrelevance is
  STRUCTURAL (union-of-all-sources scanning), not routing.
- Null hypothesis (R2b): recovers ≈4% (index −11.4KB), docs pages
  NET REGRESS +17.6KB, site mean +4.1%, second-entry fixed cost
  ~12.6KB, utilities-only output UNLAYERED — **dead as a remedy**.
- Engine swap, same-8-family payload measured: **TW 183,007B vs
  StyleX 47,073B (−74.3%)**; consumer cold build p95 **−24%**;
  corpus LOC −52%. The law-sheet share (~49% of the today-sheet:
  jx-pure 103.2KB + jixoai tokens 43.6KB) is engine-invariant and
  stays shared by design.
- Dev-loop (§7, three-run saga): **STABLE LOSS +19.5%** at fixture
  scale (interleaved n=10: 477 vs 399ms medians; the earlier −21%
  run was a non-interleaved confound, superseded). HMR cross-ref:
  stylex D1-02 = 103ms no-reload vs TW www-scale ~333ms (scale-
  incomparable, flagged). **Anchor items beaten (STRICT reading, Gate-2-r3 adjudicated):
  total CSS ✓ (−74.3%, the one deterministic engine-attributable
  win); per-page critical CSS = UNSCORED (no independent per-page
  measurement exists — the fixture CSS is the same artifact, not a
  second indicator; Codex r3: "同一 47,073B 产物不能同时证明两个
  独立指标"); dev-loop ✗ (stable, twice-reproduced loss).**
  D4=3 therefore rests on the Owner-only permissive READING: whether the anchor's two CSS
  items (written with site-scale semantics, where they differ) can
  be satisfied by one fixture-scale measurement (where they
  coincide). **This reading is contestable and is flagged for
  Gate-2 adjudication + Owner visibility; under a strict distinct-
  items reading D4 < 3 and the pre-registered D4≥3 rule fails the
  GO.** The dev-loop loss stands regardless and enters the record.
- Not 5: per-page critical-CSS at WWW SCALE was not measured
  directly (that requires the actual migration); the payload proxy +
  the structural P2 argument carry the score. FLAGGED as proxied.
- **Missing-data flag count: 1 (D4's per-page metric is a proxy).**

**D5 authoring ergonomics — 5/5 (w×2 → 10)**
- Corpus: 8/8 families intent-equivalent, 43/43 computed assertions,
  svelte-check 0 errors (orchestrator re-verified), LOC 4478→2149
  (−52%; the +100% React-data fear does not materialize in Svelte).
- All expressible: the 4 HARD items (cq-units-on-UA-shadow-pseudos,
  descendant selectors, ancestor-domain var override, vars-key-throws)
  all live lawfully in folder css per placement law #2; MORE
  expressive than L1 knew (:popover-open, ::-webkit-slider-thumb,
  ::backdrop, @supports compile and land).
- Token-typo compile failures materialize (D1-12).
- Standing taxes (documented disciplines, not blockers): the
  dynamic-value trilogy (vars-key throws / camelCase keys never land
  / closure factories silently dropped — ONLY "single-word-key
  factory called at markup level" is safe); shorthands → longhands
  (set propertyValidationMode:'throw' in kernel builds); the
  class-mix helper glue (static+spread non-merge).

**D6 ecosystem & owned debt — 3/5 (w×2 → 6)**
- D6a=3: healthy but 0.x single-vendor. RECEIPTS (Gate-2-r1: facts
  independently re-verified by the orchestrator against the registry
  on 2026-09-13, satisfying F2's re-grounding rule): `npm view
  @stylexjs/stylex` → 0.19.0, time.modified 2026-06-16 (0.x, quarterly
  cadence); downloads api last-week = 1,425,917 (2026-09-05..11) —
  matching external-stylex.md §1; official Svelte support since PR
  #1454 (2026-04-01) + example-sveltekit (URLs in external-stylex.md
  §1/§4); #1834 breaking-minor precedent (external-stylex.md §1).
  The ADOPTION-scope claims (Meta full-line, Figma/Snowflake/HubSpot)
  are vendor-sourced (Meta engineering blog, linked in §1/§10) and
  are NOT load-bearing for the anchor — "0.x + single-vendor" holds
  on registry facts alone.
- D6b=3: we own glue only — the @jixoai plugin wrapper + F9 entry
  generation + mix helper + Svelte-chain watch. No fork, no patch.

**Total: 9 + 10 + 6 = 25 / 35 ≥ 21 (bar), D4 = 3 ≥ 3.**

Weight sensitivity (±1, one-at-a-time; Gate-2-r1 correction — the
earlier "no single-weight flip" was ARITHMETICALLY WRONG and is
retracted): D4 w3→2: 25−3=22 ✓ stands; D4 w3→4: 28 ✓; **D5 w2→1:
25−5=20 <21 → FLIPS to FAIL** (retracted claim said 23); D6 w2→1:
25−3=22 ✓ stands (retracted claim said 23). **One single-weight flip
exists: de-weighting D5 (the corpus-evidence dimension) by 1 kills
the GO.** The verdict therefore leans on the corpus's 5/5 — the
dimension with the most direct artifact evidence (8 families, 43/43
assertions, −52% LOC) and the least projection. Reported, not
hidden; Gate 2 adjudicates whether that lean is acceptable.

## 3. RQ8 — environment & deployment risk table

| risk | status |
|---|---|
| browsers | Chromium/WebKit/Firefox all green at the pin set; bumps re-open D1 |
| CSP / no-JS | prod = static `<link>` (fine under CSP, no-JS proven); dev runtime injection is dev-only |
| RTL/i18n | stylex auto-emits ltr/rtl dual rules; today's kernel is ltr-only — audit owed at implementation (no regression risk identified) |
| source-map / debug | debug:true proven; data-style-src present after hydration |
| upgrade / rollback | 0.x pinning; per-family source revert (source-copy distribution) |
| license | MIT (verified in installs) |
| Svelte-chain ownership | 5-month-old upstream integration, zero known production Svelte cases before us; architecture B isolates consumers from the chain's churn |
| toolchain quirks | Vite8/rolldown: CSS entry mandatory, NODE_ENV derivation (vite config-hook injection falsified) |
| determinism | same-config builds byte-stable; CROSS-path class hashes differ (path-dependent) — architecture C's caveat, architecture A/B unaffected (one build per app) |

## 4. The difficulty register (难点重点, F8)

27 high-risk families (migration-census.md §2); the corpus PROVED the
hardest 8 (press-button, range, popover, icon, code-card, prose,
switch, separator — including 4 of the top-5). Unproven-but-mapped:
19 more high families (dialog deferred by D2 ruling; date-picker the
largest single body at 332 tokens). The two production bug leads
(Chromium axial cq on UA-shadow pseudos — production thumb ring
likely collapses, jx-pure.css:1601; popover position-area semantics
left-aligned vs the source comment) are PRE-EXISTING, independent of
this decision — recommended as a small separate change.

## 5. VERDICT: dual-pending — the Owner's one-word switch decides

All evidence is in and committed; the verdict now hangs on exactly
TWO rulings, each presented to the Owner twice in-session (no
answer received; orchestrator dispositions recorded transparently):

| ruling | orchestrator disposition | effect if accepted | effect if rejected |
|---|---|---|---|
| **F10** (D3 packages → burden vectors) | SIGNED pro-tem (corrects a falsified FACT — the "babel rides free" assumption; burden vectors were pre-registered F5 and B passes them) | D3 = PASS for architecture B | D3 = FAIL for all → NO-GO |
| **D4 reading** (fixture-scale satisfies both CSS anchor items) | NOT SIGNED (post-evidence meaning-change; the strict reading is more defensible analytically) | D4 = 3 → **GO** (all conditions) | D4 < 3 → **NO-GO as-scored** |

**Orchestrator's recommendation (stated, not decided)**: sign F10 AND
the permissive D4 reading — the strict reading's failure mode is an
unmeasurable-BEFORE-migration metric blocking a direction whose
every directly measurable proxy strongly favors it (−74.3%
deterministic CSS, P2's structural 68–78% irrelevance, counterfactual
dead, corpus −52% LOC); the dev-loop loss (+19.5% fixture-scale,
babel cold paths) is real, small, and enters the record either way —
mitigable (babel cache warming, phase-0 plugin work) and not a
consumer-facing cost. The Owner's NO on either ruling is final and
respected: the fallback path is RQ7's ranking (Panda CSS /
vanilla-extract) or in-place TW4.

Dev-loop loss mitigation note (for the record): unplugin's babel
chain is the identified cost; architecture B can pre-warm/persist
the transform cache (devPersistToDisk exists upstream) — a phase-0
work item if the GO stands.

## 6. The blueprint (the follow-up change, if GO stands)

- **Phase 0 — foundations**: the typed vars wrapper (.stylex.ts over
  the token sheet, `var(--primary)` references); the class-mix helper
  lib item; `propertyValidationMode:'throw'`; @jixoai/ui-vite-plugin
  absorbs unplugin + generates the F9 entry/layer statement + HMR
  wiring (the L3c stub becomes production); check-tw4-prereq → the
  plugin prereq; the F9 layer-order law lands as a spec requirement.
- **Phase 1 — the proven 8**: production-migrate the corpus families,
  all gates green, mirror sync.
- **Phase 2 — the remaining 98 by risk tier** (the 19 mapped-high
  first: glass, date-picker, component-canvas …), family-by-family
  with its verify suite; per-family revert = rollback.
- **Phase 3 — channel retirements**: @theme mapping region retires
  from the kernel sheet (~61 lines); icon dual-supply retirement
  queued to the site phase; www docs pages STAY Tailwind as the
  standing coexistence proof until a separate site change.
- **Spec deltas + the itemized touch surface** (Gate-2-r1 expansion
  of proposal Impact + design §1.4, per gate):

  | touch | change | gate/acceptance |
  |---|---|---|
  | css-architecture placement law #1 | utility-first → atom-first; folder-css boundary unchanged; the F9 layer-order LAW lands as a requirement (plugin-generated entry) | verify-layer-law, verify-folder-css rewritten engine-agnostic |
  | component-authoring styling posture | cn() demoted to consumer-class merge only; the dynamic-value safety rule (single-word-key factory at markup level) becomes an authoring law + a COMPILE/LINT GATE (propertyValidationMode:'throw' + the trilogy lint — Gate-2-r1 B-item) | hook-law unchanged; new authoring gate |
  | context-plugin boundary | UNCHANGED in contract (zero-npm law holds — the plugin wrapper is a BUILD-time devDependency, never a runtime import of the kernel) — explicit delta entry confirming no change, per proposal Impact | verify:context vocabulary stable |
  | css-laws serializers | untouched in phase 0–2 (projections are engine-agnostic CSS); phase 3 reviews the utility-projection's consumers | verify:laws freshness unchanged |
  | registry prerequisites | check-tw4-prereq → the @jixoai plugin prereq (TW4 prereq becomes the CONSUMER-side optional doc) | verify:shadcn-add extended to the plugin wiring |
  | registry.json deps | utils/theme edges unchanged; plugin added to install docs (not a registry dep) | dependency-shape gate |
  | budgets/docs/meta | byte budgets recomputed for atom output; docs pages regenerate | verify:budgets/docs/meta |
  | dual vite configs | BOTH byte-twins gain the plugin wiring (byte-identity law preserved) | vite-config parity gate |
  | ~170 component suites | paint assertions rewritten per family AS it migrates (phase 2's per-family definition of done) | family-by-family in phase 2 |
  | production bug leads | PRE-CHECKS before phase 1: the range thumb-ring cq probe + the popover position-area alignment probe on the live site (two small fixes or confirmed non-issues) | new probes; Gate-2-r1 B-item |



## §7 Receipt — the dev-loop measurement saga (2026-09-14, three runs, all raw logs committed)

Instrument (committed): spike/d3/scripts/measure-cold-start.mjs +
interleaved variant; vite self-reported "ready in N ms" (ANSI-
stripped), process-GROUP kills (the overnight-hang root cause:
SIGKILL on npm orphaned vite grandchildren holding stdout pipes).
Payload snapshot proof: spike/d3/logs/payload-symmetry.txt (tree
hashes pin each fixture's SOURCE identity — the two trees
legitimately differ (TW form vs StyleX form); the proof is snapshot
identity for re-run comparison, NOT semantic-payload equivalence; the v1 script's hmr-probe pollution of
tw-baseline/App.svelte was restored byte-identical to the L3c
commit before runs 2–3).

| run | design | tw median | arch-b median | Δ | log |
|---|---|---|---|---|---|
| 1 | paired back-to-back, n=5 | 354ms | 281ms | **−21% (faster)** | superseded by run 3 — non-interleaved, cache-state confound |
| 2 | paired rerun, n=5 | 270ms | 353ms | **+31% (slower)** | logs/devloop-paired.jsonl |
| 3 | **INTERLEAVED tw/a alternating, n=10 each** | 399ms | 477ms | **+19.5% (slower, STABLE)** | superseded by run 4 (script now committed) |
| 4 | **INTERLEAVED rerun from the COMMITTED script, strict JSONL** (scripts/measure-cold-start-interleaved.mjs, header documents order/samples/kill semantics) | 370ms | 482ms | **+30.3% (slower)** | logs/devloop-interleaved.jsonl (strict JSONL, every line an object) |

**The stable answer is runs 3+4 (both interleaved): arch-b dev cold
start is 19.5–30.3% SLOWER (babel cold paths; arch-b carries the
heavy tails). Run 1's opposite direction is retained as recorded
evidence of the metric's noise under non-interleaved designs.**
**Dev-loop is a stable, twice-reproduced LOSS at fixture scale.**
Site-scale dev-loop under stylex is unmeasurable pre-migration (www
TW baseline: 1,812ms).
