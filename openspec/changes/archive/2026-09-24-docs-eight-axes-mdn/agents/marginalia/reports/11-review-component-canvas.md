# Report 11 — REVIEW `component-canvas` (marginalia, 2026-09-22)

Reviewer: marginalia (1st of 2; quill's page, integrated at eb66056b).
Evidence: source read (page + component-canvas.docs.ts + the re-pinned
ambient spec + component-canvas.css / surface/component-canvas.stylex.ts),
raw SSR bytes on :5244 (1,091,876 B, HTTP 200), live probes
(single-evaluate; theme-flip scoping; query flip across 48rem), old-page
audit at eb66056b~1, solo spec run.

## Verdict: PASS (1 NIT + 1 component-debt NIT + observations)

The W7 bar narration survives re-derivation on the current tree number
for number, the doubled EXTRA rescue renders with exact table
arithmetic, the ambient re-pin is evidence-honest and solos green, and
the press-shadow fix matches the family css. Nothing blocking.

## The extra duties

### 1. W7 bar honesty — RE-DERIVED, ALL TRUE (avatar/breadcrumb work landed since; numbers unmoved)

- **The bar on every canvas**: 28 `data-jx-canvas-axis` attribute hits
  across the page's 4 canvases (workbench + inner press-button + the
  six-lane demo + the query demo — 7 axis menus each), and
  **`data-axis-auto="true"` ×28 at rest** — exactly 7 menus × 4
  canvases, the all-auto seed the prose describes.
- **query base 14→18px at ≥48rem, em caption following**: measured on
  the real query canvas — stage font-size **18px** at 1280px (80rem),
  **14px** at 700px (< 48rem), back to 18px; the em-keyed caption rides
  it exactly (**15.75px** = 0.875 × 18, **12.25px** = 0.875 × 14). The
  caption's "SSR paints the base (14px)" matches the bare-with-base
  resolution.
- **Chrome title fixed 13px**: the workbench head title computes 13px —
  the `--jx-text` rung channel at the canvas's own default-run scope,
  unmoved by the size lane (whose stage font-size went 14→18px on the
  very same page — the fixed-voice/seat contrast is real).
- **Theme flip stage-scoped, root clean**: clicking the dock's theme
  button projects `data-theme` + the theme sheet's token-scope classes
  (`jx-light` observed) onto the STAGE element only — the canvas root,
  the page shell, `body`, and sibling canvases all stay clean
  (measured false-dark everywhere outside the stage). At rest the stage
  carries no theme projection at all (ambient).
- **`data-axis-auto="true"` at rest**: ×28, see above.

### 2. EXTRA rescue DOUBLED — VERIFIED (bytes + arithmetic)

- Both §13 seats render in the family table from the extra lane:
  `theme` — type `'light' | 'dark'`, default `'light'`, bindable, the
  stage-preview prose naming the extra lane and the census D-fold; and
  `density` — type `'xs' | 'sm' | 'default' | 'lg'`, default
  `'default' · Own default, not ambient`, bindable, the rung-seat prose.
  The theme/density rows also carry `bind` markers.
- **Arithmetic exact**: the meta carries 27 props; the 6 axis lanes
  (size/shape/radius/color/elevation/motion) split to the shared
  section; `theme` + `density` are name-filtered by the split and
  re-added by the extra lane → family table = 27 − 6 − 2 + 2 =
  **21 rows** (parsed: exactly 21, ending "theme bind, density bind").
  The shared section carries all 8 axis rows (infrastructure, the chip
  precedent). The Props summary says precisely this ("the generated
  filter would drop them, so they render from the extra lane") —
  策展覆盖=渲染, self-documenting.

### 3. The ambient re-pin — HONEST

The moved exemption (`test/docs-ambient-vocabulary.spec.ts:438-451`)
now reads the curation's EXTRA lane (`extraRowsOf(CANVAS_DOCS_PATH)`)
and keeps every pinned fact: count 1, default `"'default'"`, default
not containing 'ambient', description containing 'page-owned bindable'
— and ADDS the theme-twin assertion (the extra lane also carries
`theme`). Zero pinned intent deleted; the evidence moved with the row.
**Solo run: 284/284, exit 0** (the orchestrator's 288 was quill's run —
the suite count drifts with the fleet's meta surface; the re-pinned
test is in the file and passed within the 284).

### 4. The copied-literal press-shadow claim — CONFIRMED FIXED

Old page (`#theming`): a hand TokenTable listing
`--jx-press-shadow: '0 1px 2px rgb(0 0 0 / 0.08)'` + "grown shadow" /
"anchored press" literals the family css contradicts. New table:
`'--jx-press-shadow', default 'per-element tuning'` — and the family
css declares exactly the per-element poses the (component-side) prose
names: `component-canvas.css:376-378` none/none/none (install/copy)
and `:382-384` `--shadow-2xs` / `--shadow-xs` / `--shadow-xs-press`
(source anchor + code toggle). Table matches source; the copied
literal is gone. Caveat: the pose detail rides the TokenTable's dead
description column (below) — the RENDERED cell ("per-element tuning")
is honest at its granularity.

## Findings

1. **NIT — the theme extra row lacks the own-default marker its twin
   carries.** The density extra row sets `ambient: 'own'` → the Default
   column renders "'default' · Own default, not ambient"; the theme
   extra row carries only `bindable: true` → renders "'light'" plain.
   The theme seat's default is equally family-owned ('light' is the
   stage-preview seed, not an ambient lane value) — one field
   (`ambient: 'own'`) makes the doubled rescue symmetric.
2. **NIT (component debt, already ruled W-next #3) — the fixedTokens
   descriptions are unreachable prose.** The press-shadow poses detail,
   the chrome-voice receipts ("--jx-text-small 12.5px — the description
   line"), and the hit-band arithmetic all sit in the TokenTable's
   description field, which never renders (SSR: empty third cells; the
   Source column renders blank for all-structural rows). The RENDERED
   default cells are honest and the axis rows carry the load-bearing
   facts; noting the debt instance per the Owner's ruling, no page-side
   action demanded beyond what quill already owes.
3. **Observation — the query case is the bare-with-base form**
   (`query({ md: 18 }, 14)`, stage + drawer): number lanes infer
   cleanly (no DensityLane pinning needed), so per the §6
   inference-rule adjudication (chip round, vellum's type-check
   receipt) this is compliant — recorded as optional consistency
   polish like chip's.

## Verified TRUE (receipts)

- **Tier 2 justified (old-page audit)**: the W7-era page (496 lines)
  already carried the recursion workbench, the schema-driven lanes
  demo, the motion seat, the same-source section and the a11y rows —
  all preserved in the rewrite (the recursion demo, six-lane schema
  demo, motion gauge and same-source law are in the new page; the a11y
  rows carried over and extended). The rewrite added: DocsInstall +
  DocsSeeAlso (old page had neither — grep 0), the GENERATED meta +
  docs curation (no component-canvas.docs.ts existed), the per-axis
  table, archetype order (old ran workbench → canvas-law → same-source
  → types → usage → a11y → theming → universal-props → api). Repair-
  and-fill, not re-derivation — but over a page whose theming table
  carried a copied press-shadow literal, so the fill was load-bearing.
- **Survivor ids** (canvas-workbench / usage / accessibility / api /
  same-source) all in DOM; dropped ids (canvas-law / types / theming /
  universal-props) have zero inbound links (grep src +
  legacy-doc-routes.json).
- **Consumed-vs-supply, correctly scoped**: the family's OWN paint
  (component-canvas.css + surface/component-canvas.stylex.ts) reads
  fixed kernel voices only — `--jx-text` (title), `--jx-text-small`
  12.5px, `--jx-text-label` 11px, `--jx-text-micro` 10px,
  `calc(var(--jx-hit) + 2px)` chrome band, the `--jx-press-shadow*`
  poses — and NO `-effective` carrier in the shell paint (the page
  READS carriers as the documenting consumer — the specimen seats and
  the §3 anchor pins — which is the family's purpose, not a
  consumption claim). The axis rows' "no canvas css reads it" receipts
  hold for the shell.
- **The density row's dual-seat story**: the stage carries the
  page-owned rung seat (data-density from the 'default'-default
  bindable — "permanently hot"), the workbench roots carry the
  `--jx-density-coefficient: 1` stamp (SSR: 283 hits — "grep any
  canvas root" is literal), and the bar's density AXIS supplies the
  root resolution beside the other six — the W7 directive's
  separate-channels claim coherent in source and bytes.
- **The specimen-scope re-stamp note** (W6-r3): the schema demo's
  wrapper carries `axisRestamp` (stampCarriersForLanes element-level
  below the island) — source-verified against the color row's
  island-caveat; the §3 anchor pins (`--jx-radius-effective: 20px;
  --jx-inset-effective: 0.875rem`) ride the panels exactly as the
  radius row says.
- **吃也供 glossed** — "(吃也供, supply-and-consume)" in the axes
  summary, first mention glossed.
- **test/ pins**: component-canvas pinned in docs-structure,
  docs-ambient-vocabulary (the re-pin), canvas-floor/schema specs + the
  component-canvas-floor lab pin the playground output rows.

## Gates

Reviewer-side. Dev smoke HTTP 200, bytes 1,091,876. SSR checks 13/14 —
the one "fail" was my own needle (the press-shadow pose text lives in
the dead description column; see finding 2 — the css itself verifies).
Ambient spec solo 284/284 exit 0.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; `lsof -i :5244
  -sTCP:LISTEN` → 0 lines BEFORE. Kill-by-PID: listener PID **74822**
  killed; post-kill lsof → 0 lines; pgrep → empty; wrapper exit 143
  (my SIGTERM).
- Probe/scratch: /tmp only (`marginalia-11-ssr-probe.mjs` inline python,
  `marginalia-11-live-probe.mjs`, `marginalia-11-probe3.mjs` (unused
  variant), `marginalia-11-cc-ssr.html`, `marginalia-11-dev.log`,
  `marginalia-11-ambient.log`). Repo-side writes: this report +
  experience.md. NO commits, NO push.
