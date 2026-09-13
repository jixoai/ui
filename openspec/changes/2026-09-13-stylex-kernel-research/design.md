# Design: the StyleX kernel research program (r2, post Gate-1 review)

> Orthogonal intents: (1) concretize the Owner's perf/redundancy
> complaints into measurable claims; (2) pre-register the decision
> framework BEFORE evidence lands (bias control); (3) define research
> lanes, spikes, and orchestration; (4) fix the evidence standard every
> finding must meet. Owner input 2026-09-13: "彻底放弃对 Tailwind CSS
> 的依赖，改成用 stylex……不排除开发者自己搭配 Tailwind……我们自己
> 的内核和 stylex 做集成".
>
> r2 (2026-09-13): full revision after Codex Gate-1 (6.2/10, REVISE) —
> styling-surface inventory replaces the naive "three-channel" model
> (A2/A3), the kernel boundary becomes a four-role scope table (A4),
> the gate inventory is enumerated (A5), D1/D2 get pre-registered
> fixture matrices (A6/A7), D3 gets quantified dimensions and a REAL
> TW4-counterfactual build (A8), the spike corpus is mandatory and
> frozen (A9), plus non-blocking adoptions (B1–B4).

## §1.1 The performance claim, decomposed and measured

"Tailwind 对整个 CSS 的渲染性能带来很大的困难" decomposes into four
falsifiable sub-claims. R2 measures each on a FROZEN corpus (same
pages, same states, same device, cold cache, recorded env) — and R2b
builds a REAL counterfactual, not a thought experiment:

| # | sub-claim | measurement |
|---|---|---|
| P1 | one monolithic render-blocking sheet | built CSS assets: bytes raw/gzip/br, rule counts, attribution by origin (R0 receipts method); per-page `<link>` analysis — how many distinct CSS files exist, how many bytes each page actually loads |
| P2 | sheet content mostly irrelevant per page | used-selector ratio sampled on 3 frozen representative pages (index, a heavy docs page, a component page) via headless-browser coverage-style probing |
| P3 | dev-loop cost (TW4 scan/generate) | dev cold-start + HMR settle times, median of ≥5 runs each, on www scale |
| P4 | style-recalc / dynamic-class cost | AUXILIARY ONLY: rule count × dynamic-class census heuristic, plus — if tooling permits within budget — a scripted interaction trace (DevTools protocol recalc-style event counts on the docs icon page). P4 CANNOT drive GO/NO-GO alone (Gate-1 A8 ruling) |

**R2b — the null hypothesis is BUILT, not estimated**: a TW4
counterfactual variant of www where (a) docs-route utility generation
splits into a route-family sheet loaded only by docs pages (TW4
multiple-entry CSS), and (b) kernel-sheet content prunable without
touching component source is measured. Same corpus, same device, same
browser, same cache protocol as R2. If the counterfactual closes the
P1/P2 gap the engine swap claims to close, D4 prices that honestly.

> **R0 preliminary receipts (2026-09-13, full data in
> research/r0-census.md — HISTORICAL ARTIFACT RECEIPT, Gate-1 r3
> demotion)**: the attribution below was measured over the 2026-09-11
> 20:59 dist (baseline d17abd58). The d17abd58→current-HEAD input
> drift is NOT just spin.css: 19 files, 2,575 insertions including new
> static Tailwind classes (spin component, docs pages' new max-w-* /
> gap-* / text-* candidates) that TW4 folds into the shared utility
> sheet. Therefore these numbers are (a) NOT the current-HEAD
> performance baseline and (b) NOT the movable-share estimate for D4.
> They are an order-of-magnitude anchor only. R2's FIRST act after
> disk frees is a rebuild at the frozen HEAD; R2/R2b comparisons start
> from THAT build. Interim anchor, for orientation only: main sheet
> 0.BINDZyoA.css = 300,245B raw / 43,352B gzip, 2309 top-level rules;
> TW-generated ≈45% (utilities 106,954B / 1501 rules) · jx-pure 34.4%
> · jixoai.css 14.5% (nearly all OUTSIDE layers, per the cascade law)
> · component css 2.2% · site+residual 3.4%; 126/126 pages mount this
> one sheet + ~13 full-page shared assets; per-page render-blocking
> 337.8–466.5KB raw (mean 386KB / 63.4KB gzip); 31 more assets ride
> only client-side navigation. Disk incident: the machine hit **disk
> 100% (254Mi free)** killing both fresh build attempts — ENOSPC at
> prerender, receipts carry the incident.

## §1.2 The styling-surface inventory (replaces "three channels")

Gate-1 A2/A3 ruling: the earlier "three token channels + dual supply"
model conflated INDEPENDENT CHANNELS with PROJECTIONS OF ONE LAW and
mislabeled INTENTIONAL carrier hierarchies as duplication. The honest
inventory, with equivalence classes (each row carries its receipt;
R4 turns this into a per-declaration table with byte counts):

```
STYLING SURFACES (2026-09-13, HEAD 3c9097e0)
├─ LAW SOURCES (single owner, typed TS)          [class: OWNER]
│  └─ packages/css-laws/src/laws/*.ts — 13 laws
│     └─ 5 projections from ONE source (generate.ts:127-145):
│        utility → jixoai.css @layer components slot
│        face    → jx-pure.css Part B (:where(.jx-pure))
│        alias   → jx-pure.css Part A (unlayered, Tier-2 by design)
│        vocab   → jx-pure.css jx-icon-vocab slot
│        mount   → component folder css <law>-mount slots
│        ⇒ 5 outputs, 1 declaration source — projection, NOT
│          channel duplication (verify:laws gates freshness)
├─ THEME SHEET HAND REGIONS (single owner: jixoai.css)
│  ├─ OKLCH token blocks (:root/.dark)           [OWNER]
│  ├─ density ladder ([data-density] scopes)     [OWNER]
│  ├─ jx-hue-*/jx-pair-* intent utilities        [OWNER — legal layer,
│  │   css-laws boundary law names it out of scope]  (jixoai.css:1084+)
│  └─ glass family / print whitelist region      [OWNER]
├─ TW4 INTEGRATION REGION (single owner: app.css + jixoai.css @theme)
│  ├─ @import 'tailwindcss' (sole fan-in, app.css:23)  [OWNER]
│  └─ @theme inline token→utility mapping        [OWNER — THIS is the
│      (jixoai.css:783-843)                         region a StyleX
│      GO would rewrite or retire]
├─ AUTHORING LAYERS (per component)
│  ├─ utilities-in-markup (Tier-1 paint)         [the layer the GO
│  │   press-button variant tables etc.              migrates]
│  └─ folder css (placement law #2: at-rules,
│      pseudo geometry, @container, keyframes)  [stays CSS under any
│      outcome — StyleX has no container queries (L1 §9)]
├─ RUNTIME CHANNELS (spec-mandated)
│  ├─ density TWO-CHANNEL contract: Svelte policy context +
│  │  data-density CSS scopes (component-authoring:495-504 — the
│  │  spec itself mandates both)                 [LAW, not redundancy]
│  ├─ hue: runtime setProperty --brand-hue (hue-runtime)  [CHANNEL]
│  ├─ glass: glassAttrs stamps style:--jx-glass-* (glass.ts:188-208)
│  │                                             [CHANNEL — inline
│  │                                              style, not class]
│  └─ typography context → --jx-ty-* vars        [CHANNEL]
└─ ICON CARRIER HIERARCHY (placement law B2 — INTENTIONAL)
   ├─ inline SVG (component contexts)            [carrier tier 1]
   ├─ mask carrier (CSS-only contexts)           [carrier tier 2]
   ├─ UA-pseudo background fallback              [carrier tier 3]
   └─ THE one true byte-duplication: virtual:jixoai-icons.css ≡
      jx-pure icon-vocab slot (byte-identical by construction,
      bounded ≤2 copies, locked by icons-dogfood.spec.ts:153-170,
      240-256) — deliberate TW-generate-phase workaround [FALLBACK,
      documented as dual supply; a GO may retire it, R4 prices it]
```

**TRUE-DUPLICATION candidates** (the Owner's complaint, quantified in
R4 as declaration/byte counts, per equivalence class): semantic
intent expressible simultaneously via (a) TW token utilities, (b)
context vars bridged by arbitrary-value utilities, (c) alias
vocabulary; the @theme mapping region's own byte mass; the icon dual
supply. R4's acceptance bar (RQ3): each candidate architecture must
REDUCE the true-duplication class — never grow the runtime-channel
class, and never count projections-of-one-law as removable duplication
(retiring a projection is a serializer change, not a channel collapse).

## §1.3 The kernel boundary — four roles (Gate-1 A4 ruling)

| role | contents | meaning for research |
|---|---|---|
| **implementation inputs** — a GO would EDIT these | `registry/files/ui/**` (markup paint, variant tables), `registry/files/lib/utils.ts` (cn), theme-sheet authoring regions (jixoai.css hand regions + @theme mapping + @custom-variant), `packages/css-laws/src/**` (serializers — IF channel (c) collapses or mounts change carrier), `registry/files/app.css` + `apps/www/src/app.css` (entry), BOTH vite configs (byte-locked pair), registry.json dependency edges, consumer-facing install docs/prereq gate (check-tw4-prereq.mjs) | studied AND drafted against; never observation-only |
| **observation-only consumers** | www docs routes (16.8k tracked-source utility tokens — stays TW, doubles as coexistence proof), demo/, examples/, packages/vite-plugin (BECOMES an implementation input only under distribution architecture B), openspec specs (read as law, amended only by the follow-up change) | measured, not modified |
| **generated artifacts** (fresh-through-generators, byte-locked) | theme sheet css-laws slots, mount sheets, icon/spin artifacts, mirror manifest, blueprints, www dist | re-derivable; receipts pin their bytes |
| **gates & mirrors** | the §1.4 inventory | every gate gets a row: touched-or-not, why, research-evidence vs follow-up-apply |

## §1.4 The gate inventory (Gate-1 A5 ruling)

Every gate in `verify:all` (scripts/verify-all.mjs) plus the
law-probing www suites, each classified for this research:

| gate | what it locks | StyleX relevance |
|---|---|---|
| registry dependency shape (A4 prefix law) | @jixoai/* edges | follow-up-apply: edge set changes if utils/theme deps change |
| verify:standards (B1/B2) | css-laws boundary, icon slot system | research-evidence: which laws a GO rewrites |
| verify:laws / icons / spins / migration | generator freshness | observation: generators untouched during research |
| verify:mirror | registry ⇄ www byte-identity | research-evidence: mirror law survives any outcome |
| verify:context | context coverage vocabulary | research-evidence: runtime channels stay (spec-mandated) |
| verify:deps / budgets / docs / meta | dep shape, byte budgets, docs taxonomy, metadata | follow-up-apply: budgets/docs change with any migration |
| vite.config.ts dual-app byte-identity | www ≡ registry configs | follow-up-apply: any StyleX vite wiring lands in BOTH |
| ghostty-pin / betlang-pin / registry-test-mirror | supply chain, local mirrors | untouched |
| verify:shadcn-add | REAL consumer install contract | **research input**: RQ4 rides this infra (Gate-1 B2) |
| verify:km / isolation / print (managed) | browser probes over own server | observation: probe method reused for D1/D2 fixtures |
| www law suites: tw-context-probe, tw-standard-layer-probe, jx-pure-parity, dld-layers, density-adoption ×5, density-context, props-table-print-hook, registry-payload-parity, press-button, hook-law (scripts/verify-hook-law.mjs), check-tw4-prereq | layer law, Tier-2 parity, density ladder, print hooks, payload parity, hook vocabulary, consumer prereq | research-evidence: D2 matrix fixtures derive FROM these suites' expectations; the tw-* probes are the direct TW-coupling gates a GO retires or rewrites |
| specialized cascade probes (Gate-1 r2 B addition): scripts/verify-folder-css.mjs, verify-layer-law.mjs, verify-jx-pure.mjs, verify-jx-pure-engines.mjs, verify-press.mjs, verify-surface.mjs, verify-trygrid.mjs, verify-native-parity.mjs | folder-sheet layering, the layer law per sheet, jx-pure Part A–D engines, press physics, the surface kernel, trygrid, native parity | research-evidence: D2-14/D2-15 derive from verify-surface's enumerated-override registry; a GO rewrites every probe whose selector vocabulary moves |
| ~170 component suites (batch*, per-family) | behavior + paint contracts | follow-up-apply: paint assertions rewritten where computed styles move to stylex classes |

## §2 Research questions

- **RQ1 Toolchain feasibility** — StyleX WITHOUT React in Svelte 5 +
  Vite 8 + SvelteKit adapter-static: transform path (@stylexjs/unplugin
  `.svelte` support is official since 2026-04 — L1 §4; Vite 8 and
  adapter-static are the TWO unverified blind spots), dev injection,
  prod CSS delivery, class determinism kernel-build vs consumer-build.
- **RQ2 Cascade & the override law** — the §4 D2 fixture matrix, in
  full, against TW4's layer stack.
- **RQ3 Theming & channel fusion** — defineVars referencing existing
  custom properties (`var(--primary)` is legal — L1 §6, compile-tested);
  `.dark` scope, density scopes, runtime hue; the §1.2 true-duplication
  table before/after per candidate architecture.
- **RQ4 Distribution model** — architectures A (consumer runs unplugin
  directly) / B (@jixoai/ui-vite-plugin absorbs the transform) /
  C (pre-compiled CSS + plain class strings); measured by the D3
  dimension table; validated on a REAL clean consumer via the
  verify:shadcn-add infra pattern (clean dir, shadcn add, source↔payload
  parity, install, build).
- **RQ5 Performance evidence** — R2 + R2b + spike measurements under
  one frozen protocol.
- **RQ6 Migration scope & cost** — per-family census with effort,
  file counts, and the risk register; feeds D7.
- **RQ7 Alternatives** — null hypothesis (R2b) priced equally; ranked
  fallbacks (L1: Panda CSS, vanilla-extract, UnoCSS; PigmentCSS
  excluded — on hold; style9/Linaria dead/fading).
- **RQ8 Environment & deployment risk table** (Gate-1 B1) — browser
  support matrix (Chromium full / WebKit+Firefox smoke), CSP & no-JS
  behavior (prod static link vs dev runtime injection), RTL/i18n
  (StyleX auto ltr/rtl dual rules vs current authored CSS), source-map
  & debug DX (data-style-src, experimental intellisense), upgrade/
  rollback path (0.x pinning strategy, per-family rollback via source
  distribution), license scan (expected MIT — verified in spike),
  Svelte-chain ownership debt (5-month-old upstream integration — who
  fixes Svelte-specific breakage).

## §3 Method per lane

- **L1 external intel** — DONE (research/external-stylex.md; completed
  during Gate 1, explicitly excluded from that review's considerations).
- **L0 receipts** (running) — research/r0-census.md + r0-census.mjs:
  frozen token grammar, pinned HEADs (main 3477a6d0 ≡ branch HEAD
  3c9097e0 for measured trees, diff-stated), raw outputs, built-sheet
  attribution with method + error sources, real www build (one build,
  process-reclaim receipts).
- **L2 baseline + counterfactual** — R2 (P1–P4 on frozen corpus) and
  R2b (the TW4 split/prune counterfactual BUILD, measured under the
  identical protocol); R6 census tables.
- **L3 spike lab** — four committed scratch projects under `spike/`
  (pinned manifests; no node_modules/dist committed):
  - `spike/minimal` — Svelte5+Vite8+StyleX, no React. Records toolchain
    choice, dev injection behavior, prod output shape, TS types, and
    the VERSION PIN SET the whole D1 verdict is scoped to.
  - `spike/ssg` — SvelteKit adapter-static: ≥2 routes, one with
    dynamic/runtime-computed style values, theme (.dark) and density
    scope switching, hydration-mismatch watch, no-JS snapshot, per-page
    delivered CSS bytes.
  - `spike/coexist` — TW4 + StyleX; the FULL D2 fixture matrix (§4),
    every fixture a computed-style assertion with pinned expected
    values; dev/prod × TW-import-order variants.
  - `spike/corpus` — THE MANDATORY FIXED CORPUS (was "stretch",
    Gate-1 A9): 8 frozen families re-authored in StyleX — press-button
    (variant table + density + press-physics), range (law mount +
    container-query geometry — folder-css boundary proof), dialog or
    popover (floating-surface kernel), icon usage (inline + mask
    carrier), code-card (print + scroll hooks), prose (typography
    context vars), switch (state-machine carve-out), separator
    (subtraction ink law). Records: files rewritten, LOC before/after,
    dynamic-style branches, expressibility failures. This corpus is
    FROZEN at design time — no result-conditional additions/removals.
- **L4 synthesis** (main agent) — decision matrix, GO/NO-GO, blueprint.

## §4 Decision framework (pre-registered, r2)

### Hard gates

**D1 feasibility — the committed fixture manifest
(research/fixtures/d1-fixture-manifest.md) is the contract**: 13 rows
(D1-01..D1-13), each with setup / probe / PASS criterion / media
state / mode; FOUC is numerically decided at D1-03 (probe element's
computed background at the FCP entry timestamp MUST equal the
authored value — styled first paint, gap recorded either way); the
version pin set is frozen in the manifest (svelte 5.57.0,
@sveltejs/kit 2.70.3, vite 8.3.0, @stylexjs/stylex+unplugin+
babel-plugin 0.19.0, tailwindcss+@tailwindcss/vite 4.3.3 — npm
registry 2026-09-13); the verdict is scoped to EXACTLY that set, any
bump re-opens D1 via the amendment ledger. Any mandatory row failing
⇒ D1 FAIL; unavailable browser runtimes are LIMITATION rows feeding
the missing-data flags, never silent passes.

**D2 override law — the committed fixture manifest
(research/fixtures/d2-fixture-manifest.md) is the contract**: 15 rows
(D2-01..D2-15), each pinning markup essence, the selector under test,
the property, and the EXPECTED outcome; run on build O1 (stylex
layers after `utilities` — lawful) and, where marked O2-INV, on build
O2 (layers before utilities — the EXPECTED INVERSION is the
assertion, proving misconfiguration is detectable). Core rows (i–iv)
plus the surface-kernel rows are hard: (xiv) the `.jx-tip.jx-surface
::after` notch-mask override with NATURAL specificity (the
:where-sensitivity micro-fixture asserts the same rule under
:where() LOSES — the specificity math is load-bearing), (xv) the
terminal-header `.jx-nav .jx-pop.jx-subpanel*` enumerated
foreign-surface override. Tier-2 fixtures copy the REAL `.jx-input`
Part A block byte-referenced, not a replica. The floating-surface
corpus family is FROZEN to popover (the css-architecture enumerated
case); dialog defers to the follow-up change.

**D3 distribution — quantified dimensions and TOLERANCE VECTORS**
(per architecture A/B/C, measured on the real clean consumer; the
TW4-today column is the baseline; Gate-1 r3 makes the pass rule
mechanical):

| vector | TW4 today (baseline) | pass tolerance (vs baseline) |
|---|---|---|
| consumer install-closure packages | 2 (tailwindcss, @tailwindcss/vite) | Δ ≤ +2 |
| installed bytes (lockfile dry-run) | measured | Δ ≤ +5MB |
| config files touched | 1 (vite.config) | Δ = 0 (stylex wiring rides the SAME vite.config) |
| config lines added | 1 plugin line + 1 css import | Δ ≤ +6 lines |
| boilerplate beyond config (dev-HMR snippet etc.) | 0 | ≤ 10 lines, generated BY the tooling not hand-copied |
| build time cold/warm p50/p95 | measured | p95 Δ ≤ +15% |

- Architecture B's plugin dependency closure COUNTS in the consumer
  install vector (nothing "absorbed" out of existence — Gate-1 r3
  ruling); what B may legitimately shave is config/boilerplate, by
  generating them.
- **D3 PASSES for an architecture iff EVERY vector is within
  tolerance.** No aggregation, no trade-offs between vectors.
- Blast-radius enumeration stays qualitative (failure modes listed
  with symptom severity) — it informs the report, never the pass
  rule.

### Scored dimensions (0/3/5 anchors, pre-registered)

- **D4 measured perf (w×3)** — 0: no improvement or regression vs
  baseline AND counterfactual; 3: beats baseline on ≥2 of
  {per-page critical CSS bytes, total CSS bytes, dev-loop time} but
  not the counterfactual everywhere; 5: beats BOTH by ≥20% on
  critical-path bytes with no regression on the others.
- **D5 authoring ergonomics (w×2)** — 0: >30% of kernel idioms
  inexpressible or unacceptable workarounds; 3: all expressible
  (pseudos/keyframes/media/variants hand-rolled; container queries
  lawfully in folder css) with LOC delta ≤ +50%; 5: all expressible +
  token-typo compile failures materialize + LOC delta ≤ +30%.
- **D6 ecosystem & owned debt (w×2, split per Gate-1 B3)** — D6a
  ecosystem: 0 = EOL/unmaintained; 3 = healthy but 0.x single-vendor;
  5 = stable semver, multi-vendor. D6b owned debt: 0 = we fork/patch
  StyleX; 3 = we own glue only (config wrapper, boilerplate generator,
  Svelte-chain watch); 5 = zero owned surface. D6 = mean(a,b).
- **D7 migration cost (w×1)** — 0: >60 files or any high-risk family
  (surface kernel, print, density, press-physics) has no proven path;
  3: ≤40 files, high-risk families proven on corpus; 5: ≤20 files,
  all families routine.

**Total**: max 40 (5×[3+2+2+1]). GO additionally requires D4 ≥ 3.
**Weight sensitivity**: verdict recomputed with each weight ±1
(one-at-a-time); any flip is REPORTED, not hidden.
**Missing-data rule**: an unevidenced dimension scores 0 AND is
flagged; ≥2 flagged ⇒ verdict PROVISIONAL (Owner decides).
Amendments after evidence lands: logged reason required (§6).

## §5 Orchestration & independence controls (Gate-1 B4)

```
Main (ZCode)         L0 receipts       L1 intel(✓)   L2+R2b baseline   L3 spikes
  │ ◀─ Gate 1 r2 (this revision) ─────────────────────────────────────▶ Codex
  ├─ launch L0 (running), then L2 ∥ L3 (serialized heavy builds)
  ├─ freeze corpus & fixtures BEFORE measurements; commit immutable
  │  raw receipts (append-only; corrections as new sections, never
  │  silent edits)
  ├─ cross-check subagent claims vs artifacts; friction write-back
  │ ◀─ Gate 2: dossier review; Codex re-runs ≥2 spot-check numbers
  └─ iterate to stable verdict → decision → archive/blueprint/commit
```

Independence: fixtures and corpus are frozen in THIS commit (design
time) — before any measurement runs; receipts are immutable once
committed; no result-conditional scope changes to corpus/fixtures;
failures and 未查到 are preserved in all reports; Gate-2 reviewer
independently re-derives spot-check numbers.

## §6 Risks & biases (declared upfront)

- React-shaped evidence: re-ground every claim in OUR Svelte spike.
- Hype asymmetry: atomic-CSS marketing vs our sheet composition —
  R0 attribution decides how big the movable slice actually is.
- Sunk-cost drift: §4 binds; amendments logged.
- Spike naivety: the corpus prices D5/D7 — but corpus ≠ 106 items;
  D7 anchors carry the extrapolation risk explicitly.
- Owner-preference bias: R2b counterfactual measured identically; the
  decision table shows both columns to the Owner.
- Risk table (RQ8): browser matrix, CSP/no-JS, RTL, sourcemap DX,
  upgrade/rollback, license, Svelte-chain ownership — each researched
  and reported even if it cannot flip the verdict.

## §7 Evidence standard

1. External facts: URL + quote ≤ 2 lines, dated.
2. Repo numbers: command + raw output, reproducible from a stated
   HEAD; the R0 receipts are the template.
3. Spike results: computed-style assertions with pinned expected
   values; screenshots secondary, non-triviality-checked first
   (black-image law).
4. Unknowns written as unknowns; inference chains labeled.
5. Receipts immutable once committed; corrections append.
