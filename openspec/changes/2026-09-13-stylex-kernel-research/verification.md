# Verification: stylex-kernel-research (r2, post Gate-1)

A research change verifies differently than a code change: the
deliverable is EVIDENCE INTEGRITY, verified per lane. r2 adds the
receipt-immutability and independence rules (Gate-1 A1/B4) and the
operability requirements for gates and anchors (A5–B3).

## Change-doc gate (Gate 1)

- The four docs cross-agree (proposal ⊆ design ⊆ tasks ⊆
  verification); the styling-surface inventory (design §1.2) is the
  single redundancy model everywhere.
- Decision criteria are PRE-REGISTERED: D1 fixture matrix, D2 fixture
  matrix, D3 dimension table, D4–D7 0/3/5 anchors + weights + the
  D4≥3 rule + sensitivity + missing-data rules — all frozen before
  R2/R3 measurement runs; the corpus and fixture lists are frozen at
  design time.
- The gate inventory (design §1.4) covers the full verify-all chain +
  law-probing suites, each classified research-evidence vs
  follow-up-apply.
- openspec structural validation passes for the change folder.

## External intel (R1)

- Every claim carries a source URL; unsourced claims marked 未查到/
  推测, never presented as fact.
- Version numbers quote the registry pages seen on 2026-09-13.
- The Svelte-support section states the official basis (PR #1454,
  example-sveltekit) AND the two blind spots (Vite 8, adapter-static)
  rather than extrapolating viability.

## Receipts (R0) — immutability (Gate-1 A1/B4)

- `r0-census.mjs` is the frozen grammar; every number in the docs
  traces to a raw command output in `r0-census.md`.
- Pinned HEADs stated; the 3477a6d0 ≡ 3c9097e0 equivalence for
  measured trees is diff-proven inside the receipt.
- Attribution heuristics carry their method AND error sources;
  "未取得 + 原因" is written where measurement failed.
- Once committed, receipts are APPEND-ONLY; corrections land as new
  dated sections, never silent edits (git history is the proof).
- Process-reclaim receipts: every build/dev server PID listed with
  its stop evidence (the orphan-node law).

## Baselines & counterfactual (R2/R2b)

- Frozen corpus, device, browser, cache protocol IDENTICAL for R2 and
  R2b; the counterfactual is a REAL build (route-family sheet split +
  prune), not an estimate.
- P4 labeled auxiliary in every table it appears in; it cannot flip
  the verdict alone.

## Spikes (R3)

- Spikes COMMITTED (manifests pinned; node_modules/dist excluded),
  re-runnable from a clean checkout by the listed commands.
- D1/D2 fixtures assert COMPUTED styles with pinned expected values;
  screenshots secondary, non-triviality-checked first (black-image
  law); a failing fixture is recorded FAILED with its actual value.
- `spike/corpus` runs the FROZEN 8-family list verbatim — additions/
  removals after results exist are logged amendments or violations.
- The D1 verdict states its version pin set; upstream bumps re-open D1.

## Decision (R6)

- Verdict answers D1/D2/D3 per fixture/dimension with evidence
  pointers; D4–D7 scored at the pre-registered anchors; total + D4≥3
  rule + weight-sensitivity recomputes + missing-data flags shown.
- The null hypothesis column appears beside StyleX in every table.
- Any criterion amended after evidence carries a logged reason.
- If GO: blueprint lists every spec law the follow-up change touches
  (grep-verifiable names). If NO-GO: fallback ranking + revisit
  conditions.

## Review gates (R7)

- Each gate produces blockers, verifiable fix suggestions, quality
  assessment, 0–10 score with reasons (Codex via herdr, async
  callback, workspace reclaimed after).
- Every blocker fixed or rebutted in writing before re-gate; round
  deltas vs previous score recorded (the algorithm-review law).
- Gate 2 includes ≥2 independent spot-check re-derivations of
  receipt numbers by the reviewer.
