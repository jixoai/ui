# Report 2 — REVIEW of quill's blockquote (task 2)

- agent: marginalia · round 2 · 2026-09-22
- reviewed: `apps/www/src/routes/docs/components/blockquote.html/+page.svelte`
  + `apps/www/src/lib/ui/props-table/docs/blockquote.docs.ts` (integrated at
  3c83db5d) against the family source `apps/www/src/lib/ui/blockquote/`
  (all five files), the kernel `apps/www/src/lib/defaults.svelte.ts` +
  `jixoai.css`, and the schema/census. Code reviewed, not claims.
- verdict: **NEEDS-WORK** — infrastructure tier-2 work is excellent, but the
  eight-axes section's flagship lane (size) documents a mechanism that does
  not exist and ships a false rendered number twice.

## Tier judgment (§5.1): tier 2 — RIGHT

Verified against `git show 3c83db5d^`: the old page had a 300-word hero wall,
no Overview, no per-axis table, no query() case, a hand-written props array
whose ruleSize default was the stale `'1'` (old line 305) against the family
source's own `defineLiteralSlot([1, 4, 8], 4)` (blockquote-defaults.svelte.ts:80),
and a hand-universal demo. Bones (canvas lane, a11y table, see-also) were
good. Repair-not-rewrite is the correct call; every real information asset
survived (rule-channel history, forced-colors behavior, inset precedents).

## Archetype (§5.2): conforms

hero → install → overview (3 short paras + concept-page link) → usage →
rungs/rule/icon-lane canvases → API (generated meta + curation) → eight axes
(per-axis table + grouped live canvas + one query() case) → accessibility →
see-also. query() shown exactly once, media key `md` = 48rem verified
(universal-props-query.svelte.ts:43). See-also renders from the docs-route
model (data-doc-see-also present in served HTML, links present).

## Per-axis table (§5.3): five rows true, one false, one overstated

- size CONSUMED — **FALSE mechanism** (finding 1, BLOCKER).
- density SCOPE — stamp real, consumption claim overstated (finding 2, MAJOR).
- theme CONSUMED — TRUE (`class:dark={d.theme === 'dark'}`; system/light ride
  tree inheritance — resolveAxisLane leaves 'system' unresolved).
- radius SUPPLY ONLY — TRUE (tonalGround keeps `--jx-radius` = `var(--radius)`,
  tokens.stylex.ts:109; no family css reads --jx-radius-effective).
- shape / color / elevation / motion SUPPLY ONLY — TRUE (no family css reads
  any of those carriers; the only shadow is the rule channel's inset; hue
  rides the jx-hue-* injection of --jx-tonal/--jx-outline).
- steps/units vs universal-props.schema.ts: ALL match (size px · density
  coefficient · radius px · color hue + rawLane passthrough · elevation dp ·
  motion coefficient; shape/radius/color/elevation/motion named-step lists
  verbatim; density alias claim matches DENSITY_ALIAS_LOOKUP small→sm ·
  medium→default · large→lg).
- census citation: TRUE — migration-census.md line 334 is the §13 keep row
  ("blockquote `ruleSize` … keep | no collision").

## Findings

1. **BLOCKER — the size axis's "0.875em voice rescales" mechanism is false;
   the demo's 12.25px number is false.**
   `+page.svelte:105` (row), `:387` (canvas description), `:395` + `:398` +
   `:404` (three demos), `blockquote.docs.ts:56` (children override).
   Ground truth: the kernel stamps INLINE
   `--jx-size-effective: <v>; font-size: var(--jx-size-effective, 1rem)`
   (defaults.svelte.ts:575) — verified in the served SSR HTML on the size-14
   demo root. The style attribute beats the @layer-components
   `:where([data-jx-blockquote]) { font-size: 0.875em }`
   (blockquote.css:39-41, no !important). The body therefore renders 14px,
   NOT 12.25px; at `size="large"` 18px, NOT 15.75px; at the query case 14/16px
   verbatim. The em voice rides ONLY at auto (ambient rescaling). An explicit
   size REPLACES the voice — quill documented the old page's same falsehood
   (old line 281) into the new table + demos. Note the 14px demo can't
   falsify it visually (0.875 × 16px ambient = 14px coincidence) — which is
   likely how the claim survived; the large demo renders 18px and disproves
   the rescale reading on the page itself.
   Fix: rewrite the size row + the three demo texts + the curation children
   line to "explicit size REPLACES the em voice — the body renders the
   stamped size verbatim; the 0.875em voice applies only at auto". No pins
   break: canvas-same-source.spec.ts pins rungs/rule inline snapshots only;
   the axes canvas has no snapshot pin (41/41 green with it absent).

2. **MAJOR — the density row overstates consumption.** `+page.svelte:112`:
   "kernel channels inside the quote (--jx-stack, --jx-gap) follow the rung" —
   nothing inside the quote consumes ANY density channel (family css reads
   only fixed tokens: `--jx-space-8` gap, `--jx-unit`/`--jx-space-12`
   paddings; zero hits for --jx-stack/--jx-gap/--jx-text). Also the number
   lane's bare `--jx-density-coefficient` stamp recomposes nothing on this
   family (channels are declared only at `:root` and the `[data-density]`
   rung scopes, jixoai.css:425-497 — the declaring-element law from my task
   1); only NAMED rungs make the scope block match the root and re-base the
   channels for descendants. Fix: supply-honesty wording — "stamps the
   coefficient + the data-density rung; descendants' kernel channels follow
   them; no blockquote css reads any channel — the quote paints nothing
   density-driven; own paddings ride --jx-unit/--jx-space-12 (fixed)."

3. **MINOR — pre-existing stale demo label ships twice**: the rule matrix
   demo `rule="shadow" ruleSize={1}` is labeled "shadow-4 — the default: a
   1px inset rule" (`+page.svelte:299`, canvas + drawer copies; byte-identical
   from the old page, old line 189). It contradicts the rendered
   `data-jx-blockquote-rule="shadow-1"` hook and the adjacent "the resolved
   default — 4 won the browser review" panel. Fix: retitle to
   "shadow-1 — the hairline" and re-pin the rule inline snapshot
   (canvas-same-source.spec.ts:155) — the re-pin is the one-line cost quill's
   byte-identical-children policy was avoiding; it should be paid.

Zero NITs: prose passes §1 (declarative, task-oriented headings, vocabulary
consistent with the campaign lane — "banner" matches the alert page's usage),
and no hand-copied enumerable facts remain outside the flagged rows.

## Hard laws (§4 / §5.6): all hold

- `npm run verify:tailwindless` — GREEN, receipt UNMOVED verbatim:
  "files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6}
  forms=42 — bound verbatim". Zero new class identities.
- `npm run verify:docs-universal` — GREEN: 110/110 pages, 110 markers; the
  served page carries EXACTLY 1 `data-jx-props-table-universal` (the axes
  table's `props=` lane correctly emits none).
- Generated universal section intact (meta-driven `universalRows(meta)`); the
  curation overrides touch only family props.
- English/en-US prose; no invented axis behavior beyond findings 1-2 (the
  five SUPPLY ONLY rows are source-verified true).

## Gates re-run by the reviewer

- `npx vitest run test/canvas-same-source.spec.ts` → 41/41 passed (matches
  quill's claim; the "close timed out" teardown nag is pre-existing).
- Dev smoke: `vite dev --port 5244 --strictPort`, PID 49329 → HTTP 200;
  served HTML (1.09 MB, non-trivial) greps: 1 universal marker · 5 SUPPLY
  ONLY rows · axes drawer carries `import { query } from
  '$lib/universal-props-query.svelte'` · inline `query({ md: 16 }, 14)` in
  the canvas · the size-14 root's inline stamp (finding-1 evidence) ·
  "12.25px here" ×2 (finding-1 falsehood) · stale "shadow-4" label ×2
  (finding 3). Dev log: only pre-existing boot-splash warnings, zero
  page-specific errors.
- The in-app browser is unavailable in this subagent, so no screenshot; the
  computed-size claim is carried by the CSS cascade chain (inline stamp in
  served HTML + layered css rule in source), which is decisive without one.

## Processes (receipt)

- vite dev PID 49329 (+ wrapper 49279) killed by PID;
  `lsof -ti :5244` → empty; `pgrep -f "vite dev --port 5244"` → none.
- No commits made; working tree untouched except this report +
  experience.md (Highlights + the cascade-weight law).

## Highlights (recorded in my experience.md, with commitments)

1. The meta+docs curation lane (generated meta + evidence-headered
   overrides) — kills the stale-default drift class structurally. Commit:
   migrate accordion's hand-written API props to `<PropsTable meta docs>`
   once the extractor covers accordion (no accordion.meta.ts yet).
2. The query() drawer discipline (inline compound expression + `'{ query }'`
   in usageFile's imports record → one source, copy-paste-runnable drawer).
   Commit: rehome my accordion query demo through resolveRawCode('query') +
   usageFile, deleting my hand-composed `queryDemo` literal.
3. The axes-summary honesty index (consumed/supply counts up front). Commit:
   add the same index sentence to my accordion axes summary.
