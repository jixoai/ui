# Tasks: stylex-kernel-research (r2, post Gate-1)

> Status legend: [x] done · [~] in flight · [ ] todo. Research change —
> no production code tasks; every task's output lands in this folder.
> r2: R0 receipts task added (Gate-1 A1); R2b counterfactual build
> (A8); spike corpus mandatory + frozen (A9); browser matrix, real
> shadcn-add probe, scoring anchors (B1–B3); independence controls
> (B4) — see design §4/§5.

## R0 — receipts (Gate-1 A1)

- [x] `research/r0-census.mjs` — frozen token grammar, zero-dep.
- [x] `research/r0-census.md` — pinned HEADs, dependency table,
      recomputed census, sheet line counts, item counts. STATUS
      SEMANTICS: the SOURCE census is complete and current-HEAD-valid;
      the BUILT-sheet attribution inside it is a d17abd58 HISTORICAL
      artifact (amendment §h) — the current-HEAD build attribution is
      OWED and lands as R2's first act (disk-blocked).
- [~] Current-HEAD build attribution (blocked on disk space): rebuild
      www at the frozen HEAD, re-run r0-sheet-attribution.cjs, append
      the fresh attribution as a new receipt section.

## R1 — external intel (L1)

- [x] StyleX state-of-art dossier: versions/maintenance, non-React
      boundary, Vite path (unplugin, official Svelte support since
      2026-04), SSR/SSG extraction model, theming/vars (var() refs
      legal), cascade+layers (useCSSLayers, TW as canonical example),
      perf data, capability gaps (no container queries; no variants),
      adoption (Meta full-line; Figma/Snowflake/HubSpot); competitor
      scan (Panda/vanilla-extract/UnoCSS ranked; PigmentCSS excluded).
      Output: `research/external-stylex.md` (landed during Gate 1;
      explicitly excluded from that review's considerations).

## R2 — repo baseline (L2)

- [ ] P1 sheet attribution + per-page `<link>` analysis (from R0
      build receipt, extended if needed).
- [ ] P2 used-selector ratio on 3 FROZEN representative pages.
- [ ] P3 dev cold-start + HMR settle (median of ≥5).
- [ ] P4 auxiliary recalc heuristic (+ trace if budget allows).
- [ ] Output: `research/baseline.md` (numbers + repro commands).

## R2b — the null-hypothesis BUILD (Gate-1 A8)

- [ ] TW4 counterfactual variant: docs-route utility sheet split +
      prunable kernel-sheet content, built and measured under the
      IDENTICAL frozen protocol as R2.
- [ ] Output: `research/counterfactual.md` (what it changed, what it
      closed, what it could not).

## R3 — spike lab (L3)

- [ ] `spike/minimal`: Svelte5+Vite8+StyleX no-React — toolchain,
      dev injection, prod output, TS; records the D1 VERSION PIN SET.
- [ ] `spike/ssg`: adapter-static, ≥2 routes, dynamic values, theme/
      density switching, hydration watch, no-JS snapshot, per-page
      delivered bytes.
- [ ] `spike/coexist`: the FULL D2 matrix (core i–iv + extended v–
      xiii), computed-style assertions, dev/prod × TW import order.
- [ ] `spike/corpus`: the FROZEN 8-family re-authoring (press-button,
      range, dialog|popover, icon, code-card, prose, switch,
      separator) — files/LOC/dynamic-branches/expressibility ledger.
- [ ] Output: `research/spike-report.md`.

## R4 — theming/channel-fusion design (L4)

- [ ] §1.2 inventory → per-declaration true-duplication table with
      byte counts; before/after per architecture A/B/C.
- [ ] var()-reference + scope semantics settled by spike evidence.

## R5 — migration census (L2)

- [ ] Per-family effort table (variant tables, cn() sites,
      arbitrary-value carriers, forced-colors branches, kernel
      couplings); risk register; gates-touched mapping (design §1.4
      refined to per-gate verdicts).
- [ ] The class={expr} surface (Gate-1 r2 B): AST/controlled-string
      extraction of TW utilities inside cn()/template literals — the
      2340 figure is the literal-class LOWER BOUND; the ≥51-file
      cn()-string surface gets its own row (R5's grammar frozen in
      the R5 tooling, receipt-committed like r0).

## R6 — synthesis & decision (L4)

- [ ] D1/D2/D3 hard-gate verdicts (fixture tables, raw evidence
      pointers); D4–D7 scored at 0/3/5 anchors with weights, total,
      the D4 ≥ 3 rule, weight-sensitivity recompute, missing-data
      flags; GO/NO-GO + (GO) follow-up blueprint / (NO-GO) fallback
      ranking + revisit conditions. Output: `research/decision.md`.

## RQ8 — environment risk table

- [ ] Browser matrix (Chromium full; WebKit/Firefox smoke), CSP/no-JS,
      RTL/i18n, sourcemap/debug DX, upgrade/rollback, license scan
      (verified in spike install), Svelte-chain ownership debt.
      Output: section in `research/decision.md`.

## R7 — review gates (remix)

- [x] Gate 1 rounds 1–4 scores: 6.2 → 7.1 → 7.0 → 7.4 (all REVISE;
      each round's blockers addressed in r2/r3/r4/r5 docs; ledger
      F2–F5 record the freeze lineage).
- [x] Gate 1 rounds 5–6: 7.1 → **8.3 PASS** (round 6, HEAD
      c177569b + the F7 hygiene commit) — execution unblocked; the
      five round-6 B-items land in F7 or at receipt/decision stage
      per the verdict.
- [ ] Gate 2: dossier review; Codex re-runs ≥2 spot-check numbers;
      iterate to stable verdict; score + reasons recorded.

## R8 — closeout

- [ ] Cross-check subagent friction reports; write back fixes.
- [ ] Commit change folder (+spikes) on stylex-integration branch;
      archive only after Owner sees the decision.
