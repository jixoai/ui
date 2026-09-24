# scribe review 2 — badge (task 9, docs-eight-axes-mdn)

Agent: scribe · 2026-09-22 · reviewer role, main dir, no commits.
Scope: `apps/www/src/routes/docs/components/badge.html/` (+page.svelte,
+page.ts), `apps/www/src/lib/ui/props-table/docs/badge.docs.ts`, and the
component-level fix in `apps/www/src/lib/ui/props-table/props-table.svelte`
(reference-identity exemption, 6900340b). Independence law honored: this
file was written BEFORE opening vellum/reports/5-review-badge.md; the
consolidation note is appended at the end.

## Verdict: PASS (page) · PASS with 1 MINOR + 3 NITs (the component fix)

The page needs no fix round. The component fix is sound engineering —
verified through the extractor's source, four extra-bearing tables' raw
SSR, and the fleet's props-table specs — and the MINOR below asks for a
pin so the law survives the next refactor, not for a behavior change.

## Layer 1 — the page

### Tier audit: 2 confirmed
Old page (64a4f3e9, pre-marginalia): 271 lines, hand-mirrored usage
literals + `const close` dodge, zero `resolveRawCode`, toc ids `types /
usage / accessibility / theming / api` (lowercase labels) while the DOM
carried `badge-composition`, `badge-law`, `universal-props` — three dead
toc rows and three unreachable sections. No overview, no per-axis table,
no query() case. The new page keeps every real fact (variant ladder, hue
injection, slot lanes, composition) and adds the archetype. Tier 2 was
the right call — the bones were real; only the shape was wrong.

### Archetype §2 conformance
hero → overview → Install → Usage (live, same-source drawers) → Props
(generated meta + curation, marker ×1 in SSR) → The eight axes →
Accessibility → See also. Toc vs DOM: all 6 toc ids resolve; no dead
rows (the checkbox-task law applied). ONE Usage H2; Title-Case title;
badge is OUTSIDE the skeleton inScope list (warn-only) yet ships
Install/Usage/API/SeeAlso anyway.

### Consumed-vs-supply — grep receipts re-derived
The atoms (badge.stylex.ts) read exactly FOUR density channels
(`--jx-text-secondary`, `--jx-line-secondary`, `--jx-inset`, `--jx-gap`)
plus the four hue slots + `--jx-foreground` (stylex tokens) +
`--jx-radius` / `--jx-hairline` / `--jx-font-nav` / `--track-14`. Zero
`--jx-color-effective` / `--jx-elevation-effective` / `--jx-motion-
effective` / `--jx-radius-effective` / `--jx-size-effective` readers in
the chain — the page's six supply-only/absent rows are all true
negatives, each with the var the paint reads instead.

### THEME-SPLIT — both halves named, one grep + compiled CSS + probe
- Flipping half: `--jx-fill` / `--jx-fill-ink` / `--jx-tonal` /
  `--jx-outline` declare on `:root, .jx-light, .dark` (jixoai.css:1497-
  1504, the substitution-re-runs law) → they re-resolve under the
  island. Probed same-instant: tonal ground/ink/border all flip (L
  0.6489→0.7044, the −4° drift).
- Frozen half: `--jx-foreground` (the outline rung's ink) declares ONLY
  on `:root, .xbpgcew` + the `.x13ei35y.x13ei35y` theme classes in the
  BUILT css (0.DRQtofFE.css) — never plain `.dark`. Probed: an outline
  badge cloned into a `.dark` island keeps the light black ink. The
  page's caveat is exactly the W-next #1 law, stated per-voice.

### Numbers — measurement-first, all verified TRUE (probe 14/14 + 1)
- Text ladder 10/11/12/14px with the {2xs–xs} bucket — TRUE, and the
  bucket is load-bearing: `--jx-density-secondary-text-*` carries a
  max(0.625rem, …) floor that makes 2xs and xs BOTH 10px (jixoai.css:
  1346-1350). The per-scope-floor honesty my checkbox task learned,
  applied correctly here.
- Line ladder 12.5/13.5/15.95/18/21px (2xs→lg) — TRUE, measured all
  five rungs via clone stamps in one evaluate.
- Box = line + 2 hairlines (14.5 → 23px) — TRUE; insets {2xs–sm}=8 /
  default=12 / lg=16 — TRUE.
- size row's two-winners cascade: the inline `font-size: var(--jx-size-
  effective, 1rem)` stamp out-ranks the stylex class voice — label
  re-typed 14→24px while the box stayed 20px through the real carrier
  path (probed both endpoints).
- Density row's declaring-element clause (the number lane inert, the
  named rung resets the coefficient) — matches my task-8 measurement
  law; same kernel, verified there 2026-09-22.
- Radius row "8px measured here" — TRUE: `--radius` is 0px base / 8px
  under `@supports (corner-shape: bevel)` (jixoai.css:103-106), and
  this Chrome computes 8px on the chip.
- query() §6 form: `query<{ sm: DensityLane }, DensityLane>({ sm:
  'small' }, 'large')` — the two-generic law verbatim, both in the
  stage and the composed drawer (usageFile carries the imports).
- color/elevation/motion inertness — probed same-instant: the stamped
  carriers repaint nothing (background unchanged, box-shadow none,
  transition 0s).

## Layer 2 — the component fix (reference-identity exemption)

### (a) Does propsFromMeta really spread docs.extra by reference? YES.
`from-meta.ts:116` — `return [...rows, ...(docs.extra ?? [])]`: the
extra row objects are appended as-is; no map, no clone, no
normalization. props-table.svelte:173-177 builds `extraRows = new
Set(docs?.extra ?? [])` and keeps rows where
`!UNIVERSAL_AXIS_NAMES.has(row.name) || extraRows.has(row)` — for an
extra row, identity holds, so even axis-named extras (badge's and
chip's `shape`, component-canvas's `theme` + `density`) survive the
split. Meta-derived rows are FRESH object literals (from-meta.ts:
106-114), so they can never false-positive the Set: badge's meta
`shape` row (the collision casualty) is dropped while the extra
`shape` row renders — no duplicate.

### (b) Edge analysis — no sneaking in either direction on current data
- Non-extra row sneaking INTO the kept set: requires identity between
  a fresh meta literal and a docs.extra member — impossible by
  construction.
- Extra row sneaking OUT (dropped): requires the identity to break
  between propsFromMeta and the filter — nothing does today (the
  filter is the only consumer of `rows`).
- Duplicate-key edge (residual, NIT-1): `{#each mainRows as prop
  (prop.name)}` keys by name; a future extra whose name collides with
  a NON-axis meta row (both survive the filter) would produce
  duplicate each-keys. Current extras (shape ×2, theme, density,
  bind:this, Raw exports) are all either axis-named (meta twin
  dropped) or unique — no live collision, but nothing guards it.
- Legacy-path edge (residual, NIT-2): on the hand-`props` path extras
  never join (docs is only consulted through propsFromMeta), so a
  hand table + `universal` carrying an axis-named row would still be
  dropped silently. No current page does this (alert's hand table has
  no axis names); recording the edge for the dossier.

### (c) Regression — four extra-bearing tables, raw SSR (:5243, 200s)
- chip: main table 12 rows — `shape` AND `{@attach …} (component tag)`
  both render; the 11→12 revival claim TRUE.
- badge: main table 8 rows — `shape` (extra) present, meta's `shape`
  twin ABSENT (no duplicate), universal section 8 axis rows separate.
- popover: 11 rows with `bind:this` ✓.
- text: 5 rows with `Raw exports` ✓.
- component-canvas (quill's doubled rescue): 21 rows with BOTH `theme`
  and `density` §13 seats rendering ✓.
Universal marker ×1 per page; props-table specs solo: meta-drift +
render + composition = 36/36 green.

### The fix's soundness verdict
The mechanism is the right one — reference identity is the minimal
change that expresses the curation's intent ("these rows are
deliberate docs, not axis collisions"), it composes with the §13
seats (component-canvas proves it generalizes beyond the shape case),
and it is invisible to tables without extras (the filter's left
disjunct is a no-op for them). **MINOR-1: the contract is enforced by
comment only.** `props-table-meta-drift.spec.ts` pins other
components' rendered content but has NO test asserting (i) extras
render under the universal split, or (ii) propsFromMeta preserves
extra references. That is exactly the gap that let the original bug
ship and survive: a future propsFromMeta refactor that maps/clones
rows (a plausible normalization "improvement") would re-kill the lane
with every content test still green. Ask: one test —
`propsFromMeta(meta, docs).slice(-1)[0] === docs.extra[0]` plus a
render-count assertion on chip's 12 rows. Behavior change: none.

### NIT-2 (wording, badge.docs.ts shape row)
The extra row's description ends "Rendered from extra: the shared
split filters this name from the generated rows" — backwards as
written (the split filters the META row; the extra row is what
SURVIVES). One-clause reword at next touch; not worth a round.

### NIT-3 (observation, no action this round)
`metaHasUniversalSurface` counts axis-NAMED local props toward the ≥5
threshold — a hypothetical family with ≥5 collided local names but no
real adoption would render the shared section wrongly. The fleet is
115/115 migrated and the 5.1 lint classifies surfaces, so this is a
dossier note, not a bug.

## Findings summary

| # | severity | finding | ask |
|---|---|---|---|
| 1 | PASS | page archetype/toc/mechanisms/numbers | none — 15 probe checks all TRUE |
| 2 | PASS | fix mechanism (a)+(b)+(c) | sound; verified source + SSR ×5 + specs 36/36 |
| 3 | MINOR | extra-lane law is comment-pinned only | one identity + render-count test (props-table territory) |
| 4 | NIT | badge.docs.ts shape row's last sentence reads backwards | reword at next touch |
| 5 | NIT | duplicate each-key edge (future extra × non-axis meta name) | guard or document in from-meta |
| 6 | NIT | metaHasUniversalSurface ≥5 counts collided names | dossier note only |

## Process evidence

- Dev server `node scripts/dev.mjs --port 5243` (background); reclaim:
  listener + wrapper killed by PID; `listeners=0 wrappers=0` receipt.
  lsof was empty before start.
- Probes: /tmp/scribe-9-probe.mjs (14/14) + the size-24 one-off (PASS),
  log /tmp/scribe-9-probe.log; playwright-core + system Chrome
  headless; clone-stamp single-evaluate patterns; SSR fetched to
  /tmp/scribe-9-{badge,chip,popover,text,component-canvas}.html and
  parsed for exact per-table row names.
- Independence: vellum/reports/5-review-badge.md NOT opened until this
  file was complete; consolidation note appended below.
- No repo writes beyond this report + experience.md append.

---

## Consolidation note (appended after cross-reading vellum's 5-review-badge.md)

Cross-read complete — NEEDS-WORK at 5bb2e22d, and the fix commit carries
all four of their findings. Causal chain, now exact: vellum's BLOCKER was
badge's `shape` override being dead curation (the split dropped the row;
the page contradicted its own headline deviation) with the chip-documented
`extra` rescue prescribed as the fix — and marginalia's fix round then
discovered the rescue itself was dead fleet-wide (props-table.svelte
name-filtered docs.extra too; chip's rescue had never rendered), which is
the reference-identity exemption 6900340b landed. Their MINOR (density
union) and both NITs (the {2xs–xs} ladder bracket; the children reword)
are all in the current tree exactly as prescribed — I verified each from
the current files before opening their report.

My independent verification adds the layer only this review could own:
(a) the extractor source (`from-meta.ts:116` spreads extras by reference),
(b) the Set-membership edges (meta rows are fresh literals — no false
positives; identity is the only thing keeping axis-named extras alive),
(c) five-table raw-SSR regression (chip 12 rows, badge 8 with no
duplicate, popover, text, component-canvas's theme+density seats). The
two reviews measured the page's numbers independently and agree on every
value (10/11/12/14 text with the {2xs,xs} floor bucket; 12.5/13.5/15.95/
18/21 line; boxes 14.5/23; 8px radius; the theme split per voice; size
vs box). My MINOR-1 (pin the reference-identity contract in a test) and
NIT-5/NIT-6 are additive — neither duplicates nor contradicts a vellum
finding; their "Verified TRUE" section independently corroborates the
page claims my probe re-measured. Standing verdict unchanged: PASS, no
fix round owed on the page; the MINOR belongs to props-table territory
and can ride the next component touch.
