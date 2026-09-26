# Report 6 — FIX `badge` (marginalia, 2026-09-22)

Coder: marginalia. Input: vellum's NEEDS-WORK review
(agents/vellum/reports/5-review-badge.md). All four findings fixed, the
flagged task-4 omission (canvas-same-source PILOTS) closed, plus ONE
component-level discovery the review's fix prescription surfaced: **the
extra-lane rescue never actually rendered on chip either** — the shared
split filters `extra` rows by name too, so the curation-only move was
necessary but not sufficient. Fixed in the component (3-line filter
exemption); verified by SSR row-parse AND chip's page.

## Per-finding fixes

### 1. BLOCKER — the family `shape` row (two-layer fix)

**Layer 1 — the curation move (as prescribed):**
`apps/www/src/lib/ui/props-table/docs/badge.docs.ts` — the `shape`
override deleted from `overrides`; the row now rides
`extra: [{ name: 'shape', type: "'square' | 'pill'", default:
"'square'", ambient: 'own', description: <the corner-law prose + chip's
"Rendered from extra" clause> }]`. The header comment re-pinned: variant
stays the only override; `shape` documented as the collision casualty
per the chip precedent.

**Layer 2 — the component fix (NOT in the review; forced by the verify
gate):** the prescribed move alone does NOT make the row render.
`props-table.svelte:169` filters `rows` — which is `propsFromMeta(meta,
docs)`, i.e. the meta rows AND the extra lane appended — by
`UNIVERSAL_AXIS_NAMES.has(row.name)`. `'shape'` is an axis name, so the
extra row was eaten exactly like the override was. My first probe run
(after the curation move, before the component fix) proved it: family
rows = style, variant, slotStart, slotEnd, class, children, rest — still
no `shape`; and chip's page had **0 hits** for "Rendered from extra" —
**quill's chip rescue (1783878f) has been dead since birth**; no
previous gate SSR-parsed the row. Fix in
`apps/www/src/lib/ui/props-table/props-table.svelte`:

```svelte
let extraRows = $derived(new Set(docs?.extra ?? []));
let mainRows = $derived(
  showUniversal
    ? rows.filter((row) => !UNIVERSAL_AXIS_NAMES.has(row.name) || extraRows.has(row))
    : rows,
);
```

The extra lane is explicit curation ("non-prop API rows appended after
the meta rows" per from-meta.ts) — dropping its rows by name documents
an absent prop, the exact drift chip.docs.ts:19-21 says the lane exists
to kill. Reference identity is safe: `propsFromMeta` spreads
`docs.extra` as-is. Side effects audited: the only extra rows in the
repo are badge `shape`, chip `shape` + `{@attach}`, popover `bind:this`,
text `Raw exports`, and the in-flight component-canvas.docs.ts (whose
header says "the extra lane re-adds them" — this fix is what makes that
curation work too). Only the two `shape` rows changed rendering; both
changed from hidden to rendered, which is the documented intent of both
curations. Hand-written tables (`props={axisRows}`) have no `docs`, so
`extraRows` is empty and behavior is unchanged.

**SSR row receipt (the row RENDERS):** the #api family table in the
rendered DOM now reads `style, variant, slotStart, slotEnd, class,
children, rest, shape` — with `type = 'square' | 'pill'`, `default =
'square' · Own default, not ambient`, the extra-lane clause and the
batch-B census citation in the Description cell. The universal section
still renders its own §2 `shape` row (meta.universal infrastructure —
untouched per the review's scope note). The page no longer contradicts
itself: the per-axis row says "Deliberately ABSENT as an axis … paints
through the shape prop's row above" and that row now exists. Cross-page:
chip's family table went 11 → 12 rows, `shape | 'square' | 'pill'`
between `children` and `{@attach}` — quill's documented rescue revived.

### 2. MINOR — density Type column

`badge.html/+page.svelte` axisRows density row: type widened from
`'small' | 'medium' | 'large' | 'auto' | number` to the full
DensityLane, schema order verbatim: `'small' | 'medium' | 'large' | 'xs'
| '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`
(universal-props.schema.ts:71). The canvas demos `density="2xs"` and
`density="lg"` no longer type outside the shown union. SSR-verified in
the per-axis Type cell.

### 3. NIT — TokenTable 5-rung grouping

Source math first (jixoai.css:1234-1350, 16px root, U=4px, T=13px;
secondary = max(10px, rung − 1px)): 2xs→10, xs→10, sm→11, default→12,
lg→14 — the four values are real; 2xs and xs share 10. Then live-measured
all five rungs on :5244 with probe spans binding
`font-size: var(--jx-text-secondary)` inline inside a `[data-density]`
scope (one evaluate): **2xs 10px / xs 10px / sm 11px / default 12px /
lg 14px** (lines 12.5 / 13.5 / 15.95 / 18 / 21 — the sibling row's five
values re-confirmed). TokenTable cell rewritten in the inset row's
grouping idiom: `'10 / 11 / 12 / 14px (2xs–xs / sm / default / lg)'`.
Real-chip corroboration: the axes canvas's query chip resolved to the sm
rung at the probe viewport (11px label, 17.95px box = 15.95 + 2×1px
hairlines).

### 4. NIT — children curation antecedent

`badge.docs.ts` children row reworded: "The label text — the chip's
entire content; the chip renders it as bare span content (the chip
itself is a plain `<span>`), composing anywhere one does: headings,
table cells, terminal cards." — "the whole point of" (§1 personality)
gone; the chip is the span, the label is its content.

## The flagged omission — canvas-same-source PILOTS

`apps/www/test/canvas-same-source.spec.ts`: `'components/badge.html'`
joined PILOTS (after accordion), with two inline-snapshot blocks —
`badge.html :: usage` and `badge.html :: axes` — written by one
`vitest -u` pass, then green without it. The extractor handled both
canvases cleanly: the axes stage's `query<{ sm: DensityLane },
DensityLane>(…)` compound expression passes the F4 guard (call
expression, not a sole identifier — the accordion :: query precedent),
and the usage canvas's `{#snippet playground()}` is direct-child canvas
chrome (excluded by construction) while the nested
`{#snippet slotStart()}` inside `<Badge>` is demo content (kept). The
badge page's drawers are now drift-gated; my task-5 commitment to the
orchestrator discharged.

## Gate tails (my run, at 61e3561d + my working-tree edits)

- `npm run verify:docs-universal` → exit 0, `GREEN: 110/110 component
  pages render the shared universal section (110 markers)`.
- `npm run verify:tailwindless` → exit 0, `receipt: files=2
  identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6}
  forms=42 — bound verbatim` — UNMOVED from the task-4 baseline. First
  run went RED on `checkbox.html/+page.svelte: Unexpected token` — a
  parallel agent's mid-write (their file, 420 insertions in flight);
  clean GREEN on retry 45s later. Not my file; no action taken on it.
- `canvas-same-source.spec.ts` solo → **55/55 green** (exit 0) at the
  moment my snapshot write landed; the `-u` pass itself showed the
  blockquote parity render at the 5s timeout — the documented
  load-sensitive class, green on the isolated re-run.
- `verify:docs` → exit 0, `✓ all docs pages pass the skeleton lint
  (staged scope green)`.
- Scoped batch (props-table render/meta-drift/print-hook +
  docs-structure + canvas-same-source + docs-ambient-vocabulary +
  docs-nav-filter): **409/411 passed**. My slice fully green (all three
  props-table specs, docs-structure, docs-nav-filter, every badge
  block). The 2 failures are parallel agents' in-flight files, named
  precisely: (a) `checkbox.html :: axes` — their PLACEHOLDER snapshot
  awaiting their own `-u` (they added checkbox to PILOTS mid-flight; I
  did not run `-u` again — it would pin their unfinished stage);
  (b) `docs-ambient-vocabulary > component-canvas#density stays
  page-owned` — reads component-canvas.html, which another agent is
  migrating right now (new component-canvas.docs.ts untracked in the
  tree). Both fail on pages I never touched; both were passing states of
  OTHER agents' tasks, not regressions from my diff.
- Dev smoke :5244 (final state, post all fixes): `HTTP:200
  bytes:943460` (task-4 baseline 942520; the delta is the revived shape
  row + the widened union), `data-jx-props-table-universal` ×1, six H2
  ids present, hero + install + see-also markers ×1 each.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244` (background task;
  vite listener PID **74996**, log /tmp/marginalia-6-dev.log). Killed
  the listener by PID; wrapper exited 143 (my SIGTERM). Receipts:
  `lsof -i :5244 -sTCP:LISTEN` → 0 lines; `pgrep -f "dev.mjs --port
  5244"` → empty. One observation for the orchestrator: a `vite dev
  --port 5242` process (PID 80179, started 23:53) is alive in the shared
  tree — vellum's report says theirs was killed with a 0-line receipt,
  so this is likely another agent's live server; not mine, not touched.
- Probe/scratch: /tmp only (`marginalia-6-badge-probe.mjs`,
  `marginalia-6-badge-probe2.mjs`, `marginalia-6-parse-tables.mjs`,
  `marginalia-6-badge-ssr*.html`, `marginalia-6-*.log`). Repo-side
  writes: badge.docs.ts, props-table.svelte, badge.html/+page.svelte,
  canvas-same-source.spec.ts (my badge blocks only), this report +
  experience.md. NO commits, NO push.

## For the orchestrator / W6 dossier

1. **chip's rescue was dead for one full integration cycle** — "the row
   rides extra back into the table" was true in curation source and
   false in SSR. The class of miss: verifying a fix by reading the
   curation + trusting the adjacent module's filter, instead of
   SSR-parsing the rendered row. Vellum's review made the same gap for
   badge (right diagnosis, incomplete prescription) — the SSR-verify
   requirement in my task text is what caught it. Law proposal: any
   "row renders/doesn't render" claim in a review or fix report must
   carry an SSR table-parse receipt.
2. **UNIVERSAL_AXIS_NAMES vs the extra lane is now a documented
   contract in the component** (comment in props-table.svelte) —
   future curations can rely on extra rows surviving the split.
3. The wall of parallel activity this round (checkbox, component-canvas
   mid-migration, cascader, vellum report 6 in flight) made
   whole-suite gates noisy; every red I saw was attributable by
   `git status` + the failing test's own file reads. Attribution beats
   retry-until-green.
