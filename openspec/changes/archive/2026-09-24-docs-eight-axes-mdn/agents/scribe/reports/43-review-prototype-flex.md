# Task 43 — FIRST REVIEW prototype-flex (1st of 2) · scribe · 2026-09-23

**Verdict: PASS.** Zero MAJOR, zero MINOR, zero LOW on the page — one NIT
(a rationale embodied but unstated) and four open-question adjudications.
Every headline claim verified by my own probes, including the query
boundary re-derived as a self-proving typecheck fixture. Independence
law kept: findings formed from my own source reads + probes BEFORE
opening vellum's report 35.

**Reviewed**: `apps/www/src/routes/docs/components/prototype-flex.html/`
(+page.svelte 493 lines, +page.ts 8-entry toc; clean vs HEAD 677fe2cb) +
`apps/www/src/lib/ui/prototype-flex/` (prototype-flex.svelte 139 — the
whole family; no css, no stylex, no tokens).

## The headline claims — verified by my own probing

### 1. THE RIG — VERIFIED-TRUE, byte-identical both directions, clean reverts

Five controls 1:1 bound. Initial state byte-identical to the bound props:
`row / nowrap / stretch / space-between / 12px` + the inline style attr
verbatim (`display: flex; flex-direction: row; …; gap: 12px;`). Driven
both directions: direction column → **column**, row-reverse →
**row-reverse**, back to row; wrap wrap → **wrap**, back; align center →
**center**, back; justify space-evenly → **space-evenly**, back; gap 30 →
**30px** (the number→px coercion), back to 12px. Every revert clean —
the final state equals the initial byte-for-byte.

### 2. PLAYGROUND-LAZINESS — VERIFIED-TRUE live, placement correct

The rig's playground-snippet help text ("five controls, five props") is
**absent from the DOM** on the loaded page — the snippet mounts lazily.
The five CONTROLS live in the stage body and are **always mounted** — my
entire P1 battery drove them without opening any drawer. The page's
placement IS the lesson (controls where they always live; the lazy zone
carries help text). NIT: the *rationale* is embodied but never stated in
copy — one sentence could name why (the bank is campaign-side; a reader
rebuilding the rig elsewhere would benefit).

### 3. AXES = FORWARDERS — VERIFIED-TRUE panel-by-panel

The universal-props census (all five panels, live style attrs):

- query seat: `--jx-size-effective: 18px; font-size:
  var(--jx-size-effective, 1rem)` + the layout declarations; density
  null (ambient).
- size 18 + density small: `data-density="sm"` +
  `--jx-density-coefficient: 1` + the echo.
- size medium + radius large: **named-step carriers**
  (`--jx-size-effective: var(--jx-size-medium)`,
  `--jx-radius-effective: var(--jx-radius-large)`) — stamped, and with
  zero readers the radius evaporates visually (the forwarder thesis in
  one attribute).
- density lg + theme dark: `data-density="lg"` + class contains
  **`dark`** (the bridge), no size stamp (auto stamps nothing).
- string gap + column + align end: `gap: 0.75rem` **verbatim**,
  `flex-direction: column`, `align-items: end`, and NO carrier text —
  the all-auto axes inject nothing (omission transparency).

Family source: 139 lines, one div, `{...rest}` first and the stamps
after (replace, never merge), verbatim style: directives, gap
number→px the one coercion, zero css/tokens/imports — the three alpha
laws are the file.

### 4. QUERY BOUNDARY — RE-DERIVED, typecheck-PROVEN by my own fixture

Source declares the boundary (`gap?: number | string` vs `size?: SizeLane
| QueryResult<SizeLane>`); I proved svelte-check ENFORCES it with a
temporary self-proving fixture (created, checked, deleted):

```ts
type P = ComponentProps<typeof PrototypeFlex>;
// @ts-expect-error the gap passthrough rejects QueryResult
const gapProbe: P['gap'] = query({ md: 12 }, 12);
const sizeProbe: P['size'] = query({ md: 18 }, 13);
```

Result: **zero diagnostics** — the expect-error was CONSUMED (gap
REJECTS QueryResult; had it accepted, the directive would flip to
"Unused '@ts-expect-error'") and the size lane assignment is clean.
"lanes take query(); passthroughs don't" is typecheck-proven, not just
declared. Two probe-craft ledger notes: `PrototypeFlex['props']` does
NOT type in svelte-check (use svelte's `ComponentProps`), and a prose
comment containing the literal directive text registers as a directive
applied to the next line — both burned one run each.

### 5. The a11y row-reverse trade — VERIFIED-TRUE live

Rig at direction=row-reverse: DOM order [alpha, beta, gamma]; visual
left-to-right [gamma, beta, alpha] (the x-order flips) — screen readers
follow the DOM, exactly the WCAG 1.3.2 trade the a11y table teaches.

## Standard battery

- **KEYED-EACH (LAW #18's birthplace trio)**: the types gallery keys
  each row by the union member `(j)` — all **six rows mounted**, all six
  labels present, no duplicate-key hydration abort. The rig's each is
  unkeyed over a static three-element array (no reorder surface).
- **LAW #19 id landscape**: post-hydration scan — **70 ids, ZERO
  duplicates**.
- **EXTRA-lane by name**: api hand rows served = **[direction, wrap,
  align, justify, gap, class, …rest]** (7; no density authored — the
  axes table is the family's measured layer) + the universal 8
  (size…motion) via the fold. No served-row count claims to falsify.
- **SSR/post-settle + warm-reload**: first visit warms, reload measures.
- **Vocabulary-grep**: zero `--jx-size-effective`/`--jx-motion-effective`
  readers; the family has no css file to read them (dir receipt).
- **No timing claims** on the page (no TRANSITION-FRAME seat).

## Findings

1. **[NIT — the one note]** The playground-laziness rationale is
   embodied in the placement (controls in the stage body, help text in
   the snippet) but never stated in copy. One sentence in the rig's
   playground help or a page comment would carry the lesson to the next
   builder. Non-blocking; the structure already teaches by example.
2. **[INFO — vellum's four open questions, adjudicated]** (1)
   Playground-snippet laziness BOARD note: **YES** — it is a real
   footgun (her own first rig measured as nonexistent) and the trio +
   every future rig-style page inherits it. (2) The query boundary as
   doctrine ("lanes take query(); passthroughs don't") on the
   universal-props page: **YES, doctrine candidate** — the boundary is
   real, per-family typecheck-enforced, and my fixture pattern is a
   reusable proof. (3) The trio harness copy-adaptable: **concur** —
   flag for the grid/waterfall reviewers. (4) No matrix pins for the
   trio: **concur, deliberate** — a zero-paint alpha lane has nothing
   for the matrix to pin; revisit at graduation.

## Cross-check against vellum's report 35 (read AFTER findings formed)

Full concordance: her rig baseline and end-to-end receipts (column-
reverse, space-evenly, 30px, clean reverts) match my battery; her stamps
census matches my panel read; her query-boundary typecheck is confirmed
by my independent fixture (a different access path — ComponentProps —
and a self-proving directive); her laziness discovery is live-proven by
my absent-help-text check; toc == DOM and the duplicate-id scan
reproduce (70 ids, zero dups). No divergences.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **280/284** — the 4 failures are **system-dialog-keyed sibling noise, attributed**: a new uncommitted `system-dialog.html` edit (+page.svelte/+page.ts) entered the tree mid-session and moved its variant rows (`table[2]`/`table[3]` + the bijection/multiset reds); its last commit is ancient (4f1cd484), the edits are uncommitted, and **zero prototype-flex keys** appear. The named siblings (quill's stack, vellum's scroll-area) trip nothing today |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | prototype-flex.html page: **0 diagnostics** (fleet run with my probe file present — the probe itself contributed zero); family files carry no diagnostics beyond the fleet's baseline classes |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |
| Tree | my temp probe file deleted; prototype-flex paths clean vs HEAD |

## Closure

prototype-flex passes review #1 — disposition: no page changes required;
the NIT and the four adjudications are recorded for the orchestrator
(the BOARD laziness note and the doctrine candidate being the two worth
acting on). Reviewer #2 inherits a clean page and a self-proving
typecheck fixture pattern.

No commits made. Report file:
`agents/scribe/reports/43-review-prototype-flex.md`.
