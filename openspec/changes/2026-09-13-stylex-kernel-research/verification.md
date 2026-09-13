# Verification: stylex-kernel-research

A research change verifies differently than a code change: the
deliverable is EVIDENCE INTEGRITY, verified per lane.

## Change-doc gate (Gate 1)

- The four docs exist and cross-agree (proposal ⊆ design ⊆ tasks).
- Decision criteria are PRE-registered (design §4 written before any
  R1–R6 result lands except the R0 census it builds on).
- openspec structural validation passes for the change folder.

## External intel (R1)

- Every claim carries a source URL; claims without sources are marked
  未查到/推测, never presented as fact.
- Version numbers quote the registry page seen on 2026-09-13, not
  memory.
- The Svelte-precedent section states plainly if the answer is "zero
  prior art".

## Baselines (R2)

- Every number reproducible: command + raw output line in the report.
- Sheet attribution sums to the real built CSS (± rounding, stated).
- Measurements taken on the repo at the research HEAD; dirty trees or
  local server processes named if they existed.
- Process-reclaim discipline: any dev/build server the lane starts is
  stopped, with PIDs listed in the report (the orphan-node law).

## Spikes (R3)

- Spikes are COMMITTED (manifests pinned; node_modules/dist excluded)
  and re-runnable from a clean checkout by the listed commands.
- Probes assert COMPUTED styles (getComputedStyle values), not
  screenshots; screenshots, if attached, pass a non-triviality check
  first (the black-image law).
- Prod CSS delivery claims (spike/ssg) reference actual dist output
  files with byte counts.
- A failing probe is recorded as FAILED with its actual value — never
  smoothed away; gate D2 reads the raw table.

## Decision (R6)

- The verdict answers every hard gate D1–D3 explicitly (pass/fail +
  evidence pointer) and scores D4–D7 with the pre-registered weights.
- The null hypothesis (TW4 + in-place fixes) is priced in the same
  table as StyleX — not argued away in prose.
- Any criterion AMENDED after evidence landed carries a logged reason
  (design §6 sunk-cost rule).
- If GO: the blueprint lists every spec law the follow-up change must
  touch (placement law, styling posture, prereq gate, boundary laws)
  — grep-verifiable names, not paraphrases.
- If NO-GO: fallback ranking + explicit revisit conditions.

## Review gates (R7)

- Gate 1 and Gate 2 each produce: blockers, verifiable fix
  suggestions, quality assessment, and a 0–10 score with reasons
  (Codex, via herdr; async callback pattern; workspace reclaimed
  after).
- Every Codex blocker is either fixed or rebutted in writing before
  the gate re-runs; "review happened" ≠ "review satisfied".
