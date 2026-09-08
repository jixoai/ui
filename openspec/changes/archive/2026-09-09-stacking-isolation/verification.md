# Verification: stacking-isolation

## The incident (repro → fix)

- Reproduced on `/docs/components/scroll-run.html`: the demo chevron
  chip's box intersected the canvas dock; `elementFromPoint(946, 388)`
  returned `BUTTON[end]` — demo chrome above canvas chrome (the
  Owner's report confirmed live).
- After the isolation pair (scroll-run host + canvas stage-row/scroll
  layer): the same overlap point returns an element INSIDE the dock
  (`P`); computed `isolation: isolate` verified on all three
  boundaries.

## The sweep (audit → isolation points)

Research subagent inventory: every z-index / z-[n] in registry css +
markup utilities, classified (a leakable / b already-scoped /
c platform). Seven isolation points shipped (+ www mirrors, byte-equal):

`.jx-scroll-host` (covers scroll-run + tabs + button-group hosts) ·
`.jx-canvas-stage-row` + `.jx-canvas-scroll` · `[data-jx-timeline]`
(the ol — the cross-item ladder) · `.jx-table` frame (`isolate`
utility) · `.jx-shell-host` · spin wrap (`isolate`) · `.jx-nav`
(`isolate`).

## Hard gate assertions (new, permanent)

`scripts/verify-stacking-isolation.mjs` rides verify-all's managed
static server (after verify:km): computed isolation on every shipped
ladder owner across its live page + the incident regression
(chip-under-dock at the overlap, scroll-corrected) + the dock's z
rung. First run on the worktree: **10/10 PASS**. `verify-standards`
gains the B3 ADVISORY census (every static z assignment, file:line,
var-keyed z exempt).

## Print determinism (the debt this round surfaced, bisect chain)

verify:print failed 800×600 ≡ 1600×1200 on accordion (pages 2-3
fragmentation drift). Bisect: dist with all isolation stripped →
still diverged; HEAD a0a512e9 clean → still diverged (identical
signature); e96f55bb → EQ. Root cause: the grid-era dock's natural
height contributes to the stage-row (absolute era: zero) and its
30cqi width varies by viewport. Fix: the dock retires on paper —
kernel-print.css §5b (`[data-print-output] [data-jx-canvas-dock]`)
+ the component's own @media print twin. Standalone probe: **EQ**.
Gate rerun on the real dist: **PASS — identical across 7 pages**.

ENVIRONMENT: a Sep-3 `python3 http.server` residue on :4173 was
serving a six-day-old main-checkout dist; verify-print's
"use whoever answers" contract has no artifact-ownership check, so
print gates had tested stale product since Sep 3 (the post-fix gate
"failure" was this). Residue killed; the gate then self-served the
real dist and passed. Follow-up recorded: ownership validation (or
an ephemeral --url à la verify:km).

## Vision sweep (subagent, 9 checks)

8 PASS + 1 PARTIAL: dock-over-chips (chips terminate at the dock's
frosted edge, zero poke-through), acrylic translucency + head
chrome, collapse chip, timeline dots-over-lines (vertical +
horizontal), spin badge-over-scrim, terminal-header entries over
the indicator band, site toc/header chrome after 900px scroll, drag
−120px fully-inside round-trip. PARTIAL: table sticky stacking
verified statically; no horizontally-overflowing table demo exists
at 300-1280px to exercise scrolled sticky corners (demo coverage
gap, pre-existing). Anomalies logged (none blocking): table demo
never overflows; timeline slot-label crowding reads as authored;
tabs veils never activate (flex-wrap strips).

## www suites

`canvas-playground` 19 + `component-canvas` 8 + `component-canvas-floor`
16 = **43/43** on the touched-component suites (run separately —
verify:all does not own the www vitest suites).
