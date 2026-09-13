# R6 — the decision (decision.md)

> The synthesis over all lanes (R0–R5, L1–L3c). Every verdict cites
> its receipt. Structure per verification.md: hard gates first
> (dual-column where ledger rulings apply), then scored dimensions
> with the pre-registered anchors (F8: D4–D6 only, max 35, bar
> ≥21/35 with D4≥3), sensitivity recomputes, missing-data flags,
> RQ8, the difficulty register, the verdict, and the blueprint.
> Written by the orchestrator, 2026-09-13, at HEAD 98a733e7.

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
(Firefox closed by L3b after engine install). The two official blind
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
- D6a=3: healthy but 0.x single-vendor (1.43M downloads/wk, Meta
  full-line, official Svelte support 2026-04, Figma/Snowflake/
  HubSpot; minors DO break — #1834 happened).
- D6b=3: we own glue only — the @jixoai plugin wrapper + F9 entry
  generation + mix helper + Svelte-chain watch. No fork, no patch.

**Total: 9 + 10 + 6 = 25 / 35 ≥ 21 (bar), D4 = 3 ≥ 3.**

Weight sensitivity (±1, one-at-a-time): D4→2: 22 ✓; D4→4: 28 ✓;
D5→3(already at 5? then 5→4-equivalent −2): 23 ✓; D6→2: 23 ✓;
D6→4: 27 ✓. **No single-weight flip.** Worst honest combo (D4→2 AND
D5 down-weighted to 3's score): 6+6+6=18 <21 → flip — reported, not
hidden; that combo requires BOTH a heavier D4 devaluation AND
discounting the corpus evidence, which Gate 2 should adjudicate.

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

## 5. VERDICT: **GO** (conditional)

Conditions: (1) Gate 2 upholds ledger rulings F9 + F10 (or the Owner
overrides knowingly — striking either flips the corresponding gate);
(2) distribution architecture **B** (the @jixoai/ui-vite-plugin
absorbs the wiring — the only architecture that passes the burden
vectors AND deletes the silent F9 footgun class); (3) the pin set is
locked at kernel-build time and bumps re-run D1's fixtures.

Honesty ledger: the blind-label control (design §5) was NOT
implemented — receipts use open labels; mitigation = Gate 2's fresh
agent re-derives spot-checks. D4's per-page metric is a payload
proxy (1 missing-data flag; <2 so the verdict is not PROVISIONAL).
L3c's payload trims are disclosed in its receipt.

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
- **Spec deltas the follow-up change carries**: css-architecture
  placement law #1 (utility-first → atom-first with the folder-css
  boundary), component-authoring styling posture, registry
  prerequisites, the dynamic-value safety rule (single-word-key
  factory at markup level) as an authoring law.
