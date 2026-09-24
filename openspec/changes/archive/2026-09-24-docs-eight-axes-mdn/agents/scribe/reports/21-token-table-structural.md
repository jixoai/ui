# TASK 21 — FIX token-table structural arm (the W-next #3 component micro)

- **Scribe**: scribe · 2026-09-22
- **Scope**: `apps/www/src/lib/ui/token-table/token-table.svelte` (sourceLabel + the structural arm) · NEW pin `apps/www/test/token-table-source.spec.ts` · `apps/www/src/routes/docs/components/badge.html/+page.svelte` (one out-of-union row) · `openspec/changes/docs-eight-axes-mdn/BOARD.md` (ledger)
- **VERDICT: COMPLETE** — the structural arm landed; the fleet's blank Source cells heal; the description-field arm alone remains in W-next #3

## The fix

`sourceLabel` (token-table.svelte) mapped three of the four `TokenEntry` source union members — `source: 'structural'` was accepted by the type (the union at :42) and dropped at render. The fix adds the fourth arm ONE FOR ONE with the union, same casing/format as the existing arms, plus a comment naming the failure mode (an unmapped member = an empty Source cell, the task-21 fleet bug):

```ts
const sourceLabel = (s?: string) =>
  s === 'density' ? 'density' : s === 'component' ? 'component'
  : s === 'color' ? 'color' : s === 'structural' ? 'structural' : '';
```

## Scope discovery: the arm heals 27 pages, not 3

The fleet sweep found **27 docs pages** passing `source: 'structural'` (70+ rows: dropdown-menu ×10, date-picker ×10, component-canvas ×6, card-grid ×5, input-group ×5, button-group ×2, badge ×3, …) — every one rendering blank cells before the fix, every one healed after. The dispatch's three pages were the known instances; the sweep makes the fix's value exact.

## Verification 1 — the three named pages, from raw SSR

| Page | Before | After |
|---|---|---|
| input-group | 5 empty cells | **0 empty** — `--shadow-well / -hover=structural`, `--ring / --muted=structural`, `--border seams=structural`, bezel aliases `=structural`, `--jx-hairline=structural`; the four density rows unchanged |
| button-group | 2 empty cells | **0 empty** — `--shadow-xs=structural`, `--border=structural` (the task-15 rows) |
| descriptions | 0 (already mapped) | **0 — unchanged** (component/density rows undisturbed; regression-clean) |

## Verification 2 — regression

- **cascader** (the no-source guard posture): token table heads stay exactly **[Token, Default]**, 6 rows — the guard is untouched by the arm.
- **fold pages / heavy passers**: alert 6 rows and date-picker (5+9 rows) and dropdown-menu (5+9 rows) all render [Token, Default, Source] with the cells populated; descriptions confirmed above.
- **Fleet sweep**: 29 token-table pages probed post-fix — the only residual empty cell in the fleet was **badge**, whose `--jx-foreground` row passed an OUT-OF-UNION `source: 'theme'` (a page-side variant of the same disease). Fixed in place: `'theme'` → `'structural'` (the row's own description IS the :root-pole structural story). Badge now 0 empty. **Fleet empty-Source-cell count: 0.**

## Spec check — no pin existed; the hardening pattern applied

`grep test/` for sourceLabel/token-table pins: none existed (the only hit is docs-ambient-vocabulary's note that TokenTable rows are excluded from its AST — unrelated). NEW pin `apps/www/test/token-table-source.spec.ts`, 2 tests:
1. every union member renders its own label — no silent blanks (the four arms asserted through the DOM);
2. the no-source guard drops the column entirely (the cascader [Token, Default] posture pinned against regression).
**2/2 green.**

## W-next #3 ledger updated (BOARD.md)

- The ledger line now reads: "TokenTable dead text column two-arm (**STRUCTURAL ARM FIXED** — scribe task 21: sourceLabel +'structural', 27 pages' blank cells heal, render pin test/token-table-source.spec.ts; **the DESCRIPTION-FIELD arm remains open**)".
- The input-group closure row's rider records the fix landed. The description-field arm (the Description column never rendering from the curation files) stays in W-next.

## Gate receipts

| Gate | Result |
|---|---|
| NEW render pin | 2/2 (exit 0) |
| Spec battery (token-table-source + meta-drift 34 + ambient-vocab 283 + docs-structure + form-family-docs-pages 3 + table-pages 5) | **all green in isolation** — the first parallel run showed four 5s mount timeouts, all four green on isolated re-runs (the load-sensitive class; zero attribution to the fix — a one-arm string map cannot time out a mount) |
| `verify:docs-universal` | GREEN: 110/110 (exit 0) |
| `verify:tailwindless` | GREEN — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (exit 0) |
| `verify:docs` | skeleton lint staged scope green (exit 0) |
| SSR greps | input-group 9/9 sources rendered; button-group 5/5; descriptions 7/7; cascader 2-col unchanged; fleet empty-cell count 0 |

## Process evidence

- Port **5243**: lsof empty before; PID `91055` killed → lsof **empty**, no ps residue. **No commits, no pushes.**
- Touched: token-table.svelte (the arm), NEW token-table-source.spec.ts, badge.html (one out-of-union row), BOARD.md (ledger).
- Self-caught tooling lapses this task: one zero-width character in a glob (the AGENTS invisible-char law) and one `-rn` recurrence — both re-run clean; the sweep numbers above are from clean greps.
- Artifacts: `/tmp/scribe-21-{pin,solos,rerun-*,universal,twind,docs}.log`; SSR probes inline (python urllib over :5243).
