# The frozen pre-change baseline failure set (Gate-1 r7 close)

Captured on the UNTOUCHED tree (branch stylex-integration @ the
change's proposal-only state, 2026-09-16) — two independent runs
(the orchestrator's and the Gate reviewer's) produced IDENTICAL
numbers. This file is 5.2's comparison truth.

## apps/www full serial suite

Command: `pnpm -C apps/www exec vitest run test/ --maxWorkers=1`
Expected exit: **1** (the baseline is red — probe/timing/blueprint
suites that need browser/env fixtures this environment does not
provide pre-change).

FROZEN baseline summary (verbatim, at freeze):

```
Test Files  12 failed | 166 passed (178)
Tests  45 failed | 2709 passed | 1 skipped (2755)
```

POST-CHANGE comparison summary (Gate-2 r2 state, after the
docs-structure fix — an honest baseline improvement recorded per the
protocol below):

```
Test Files  11 failed | 169 passed (180)
Tests  44 failed | 2741 passed | 1 skipped (2786)
```

Failing suites (12 at freeze; 11 after the Gate-2 r1 close —
docs-structure FIXED in this change: the five W5 probe routes joined
the prerender expected set alongside /probe-timeline-progress, the
suite went 12/12 green, an honest baseline IMPROVEMENT recorded per
the protocol):

```
test/blueprints.spec.ts
test/cursor-probe.spec.ts
test/docs-ambient-vocabulary.spec.ts
test/docs-nav-filter.spec.ts
test/mouse-probe.spec.ts
test/osc-probe.spec.ts
test/props-table-render.spec.ts
test/scrollbar-probe.spec.ts
test/selection-probe.spec.ts
test/title-prop.spec.ts
test/title-timing.spec.ts
```

Per-suite failing counts live in the archived run log
(research/baseline-www-run.log — the × marks; 45 total across the 12
suites above).

## packages/vite-plugin serial battery

Command: `cd packages/vite-plugin && npm test -- --maxWorkers=1`
Expected exit: **1** — TWO failing suites, both attributed in the
2026-09-15 closure (raw log: research/baseline-plugin-run.log):

```
test/icons/library/example-hmos.test.ts
  # the proxy truncates the wasm payload — received 1006943 bytes,
  # pin expects 1006740 (CI-authoritative; local proxy artifact)
test/plugin.test.ts > jixoai() build > lib mode: emits the
content-addressed asset and a node-importable module
  # deterministic root-relative /assets/*.wasm emission breaking
  # new URL() (byte-proven outside this change's blast radius)
```

Summary: 1 failed / 498 passed / 6 skipped (2 failed FILES).

## 5.2's acceptance protocol

GREEN means: re-run both commands; each failing-suite SET is a
SUBSET of this file's sets and the totals satisfy `failed ≤ 45`
(www tests) and `failed ≤ 2` (plugin failed FILES). Any NEW failing
suite or higher count reds the closure. A strictly smaller set means
something got FIXED — update this file in the same commit with the
new truth (plugin: if the lib-mode case greens, the FILE may still
fail on other cases — compare at FILE granularity, the case name
above is the frozen expectation).
