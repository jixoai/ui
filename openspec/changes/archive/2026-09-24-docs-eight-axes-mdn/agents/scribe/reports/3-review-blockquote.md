# scribe task 3 — REVIEW of quill's blockquote (docs-eight-axes-mdn)

- agent: scribe · date 2026-09-22 · main dir, NO commits, NO push
- reviewed: `apps/www/src/routes/docs/components/blockquote.html/+page.svelte`
  + `+page.ts`, `apps/www/src/lib/ui/props-table/docs/blockquote.docs.ts`
  (integration 3c83db5d; working tree byte-clean against it — `git status`
  empty on all three files, so this review covers exactly what shipped)
- ground truth: family source (`lib/ui/blockquote/` ×5), kernel
  (`lib/defaults.svelte.ts` stampCarriers/densityRungOf), schema
  (`lib/universal-props.schema.ts`), tokens (`lib/tokens.stylex.ts`),
  meta (`lib/meta/blockquote.meta.ts`), census
  (`explicit-props/research/migration-census.md` §13), and one SSR curl on
  my port 5243.
- Independence note: marginalia's 2-review-blockquote.md had NOT landed when
  this review was written; verdict is formed solely from source + SSR.

## Verdict: NEEDS-WORK (light) — 2 MAJOR, 1 MINOR, 2 NIT; zero blockers

Both MAJORs are text/toc passes; no structural rework, no canvas or snapshot
churn required for them. Tier 2 was the right call and the curation lane is
the page's best asset — the findings below are corrections, not rewrites.

## Findings

1. **MAJOR — density row invents a consumption the family doesn't have, and
   the section summary then miscounts density as consumed-on-the-quote.**
   `+page.svelte:112` claims "kernel channels inside the quote (--jx-stack,
   --jx-gap) follow the rung" — `rg -n -- "--jx-stack|--jx-gap"
   lib/ui/blockquote/` returns ZERO hits; the quote's only gap is the FIXED
   token `--jx-space-8` (blockquote.stylex.ts labelRow), and no blockquote
   css reads `data-density` or `--jx-density-coefficient` (the only family
   occurrence of density is the root stamp, blockquote.svelte:303). Worse,
   `+page.svelte:380` says "Three axes are consumed on the quote itself
   (size, density, theme)" — contradicting quill's own row label "SCOPE —"
   on the same rendered page (SSR confirms both strings ship: CONSUMED ×2,
   SCOPE ×1, yet the summary says three). Truth per the composed-consumer
   lens: the rung attr + coefficient stamp on the root; the global
   `[data-density]` scopes (jixoai.css 2594–2767) re-declare the kernel
   channels AT THE ROOT, so kernel-bearing content COMPOSED INTO THE BODY
   follows the rung; the quote's own paint is fixed. One-line fix: reword
   the row to that supply-to-composed-children story (name the real scope
   vars — `--jx-text`/`--jx-gap`/`--jx-stack`/`--jx-hit`) and make the
   summary "two axes are consumed on the quote itself (size, theme);
   density supplies the composed body". Text-only: the axes canvas already
   demos only size/theme/query, so no demo or snapshot changes.

2. **MAJOR — `+page.ts` toc is stale to the restructured page: the eight
   axes section is unreachable from page navigation.**
   `blockquote.html/+page.ts:6-12` lists usage/rungs/composition/
   accessibility/api only — missing `#overview`, `#rule`, and `#axes` (the
   campaign's heart section, skill §2.5). The staleness pattern predates
   quill (the old toc never listed `#universal-props` or `#rule` either),
   but the same campaign's integrated standard (my anchor and breadcrumb
   tocs) carries `Overview` and `The eight axes` rows — muscle-memory
   navigation is §1's first promise. One-line-per-row fix: rebuild the toc
   to the page DOM (overview / usage / rungs / rule / composition / props /
   axes / accessibility).

3. **MINOR — rule-canvas demo copy contradicts its rendered props
   (examples-match-source, §5.4).** `+page.svelte:299` renders
   `rule="shadow" ruleSize={1}` captioned "shadow-4 — the default: a 1px
   inset rule" (self-contradictory: shadow-4 is 4px), while line 300
   (`ruleSize={4}`) repeats the "shadow-4" caption — two adjacent demos, one
   label. Verified PRE-EXISTING at 3c83db5d^ lines 189-190 (quill's
   byte-identical pin preserved it). Fix the captions in the same pass as
   finding 1 and re-pin the rule canvas snapshot with evidence (a
   children-copy edit changes the extracted usage the pin asserts).

4. **NIT — density row type cell is a subset of the lane.**
   `+page.svelte:109` shows `'small' | 'medium' | 'large' | 'auto' | number`,
   omitting the five legacy spellings (`xs | 2xs | sm | default | lg`) the
   schema's DensityLane carries; the same cell's prose covers them and the
   generated universal row directly above shows the full opaque lane, so
   this is cosmetic. Fix: none required, or append "…+ the five legacy
   spellings" to the type text.

5. **NIT — "still 0.875rem of pad" (+page.svelte:300) unit-confuses with
   the page's own body-voice vocabulary.** The fixed pad is
   `calc(var(--jx-unit) * 3.5)` (14px at the default unit); "0.875rem"
   collides with the page's everywhere-else "0.875em body voice". Fix in
   the same caption pass as finding 3 ("paddings stay fixed at 14px").

## What was checked and HOLDS (zero-finding areas, explicitly)

- **Tier 2 justified** — verifiably: the pre-refactor hand table's ruleSize
  default was stale ('1' vs the source's `defineLiteralSlot([1, 4, 8], 4)`,
  blockquote-defaults.svelte.ts:80); the hero was a wall; no axes section
  existed. Every real information asset survived into the new page.
- **The CONSUMED/SUPPLY-ONLY split is correct for 7 of 8 axes** — verified
  against source AND SSR: size stamps `--jx-size-effective` +
  `font-size: var(--jx-size-effective, 1rem)` (stampCarriers, kernel:574)
  and the family consumes it via the 0.875em body voice (blockquote.css:39);
  theme rides the `.dark` class bridge and the shared declaration point
  re-resolves `--jx-tonal`/`--jx-outline` (jixoai.css:1499); radius
  supply-only is honest — the tonal box keeps `tokens['--jx-radius']` which
  IS `var(--radius)` (tokens.stylex.ts:109); shape stamps
  `--jx-shape-effective` + `--jx-radius-factor-effective`, nothing reads
  them; color stamps `--jx-color-effective` (hue degrees / raw passthrough
  exactly per kernel:618-623); elevation maps level-1→−1dp … level5→12dp
  (ELEVATION_DP); motion stamps the coefficient verbatim. Density is the
  one misfiled axis (finding 1).
- **All eight lane types/steps/units match `universal-props.schema.ts`
  verbatim** (schema lines 68-75 vs axisRows), incl. "no number lane" for
  shape/theme and the color "closed at build" raw-string note.
- **Curation rows vs real defaults** — variant 'outline'
  (definePaintSlot(['outline','tonal'], 'outline')), rule 'shadow',
  ruleSize '4' — all match the family slots; the curation header cites the
  source line for the corrected default (the stale-'1' kill is real and
  evidenced). `style`/`rest` hide is valid (meta carries both as opaque).
- **Census citation** — migration-census.md §13 keep row "blockquote
  ruleSize … | keep | no collision" exists at the cited location (line 334
  area); ruleSize stays outside the eight, stated on page and in curation.
- **Examples run and match** (except finding 3's copy) — SSR :5243 → 200
  (1.09 MB); axes canvas stamps verified in markup: size-14 panel
  `--jx-size-effective: 14px`, size-large `var(--jx-size-large)`, query
  panel resolves the BASE 14 at SSR (the resolved-record law — root stamps
  the resolved lane), theme-dark panel carries `dark` and NO style var
  (theme never a style var — kernel:626); "12.25px" = 14 × 0.875 ✓; md =
  48rem ✓ (universal-props-query:43); the axes drawer carries
  `import { query } from '$lib/universal-props-query.svelte'` — the
  copy-paste-runnable claim is true in the shipped HTML.
- **Hard laws** — `data-jx-props-table-universal` ×1 in SSR HTML;
  `npm run verify:tailwindless` GREEN, receipt byte-identical to quill's:
  `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6}
  forms=42 — bound verbatim`; `npm run verify:docs-universal` GREEN
  110/110 (exit 0); see-also ×1 and the `npx jixoai-ui add blockquote` CLI
  line in SSR; no new class identities (receipt unmoved); ComponentCanvas
  namespaces its DOM ids (`jx-canvas-axes-*`), so the `<div id="axes">` +
  canvas id="axes" pair does NOT duplicate an id.
- **Prose §1** — hero is one sentence; overview is three short paragraphs;
  headings task-oriented; vocabulary consistent (axis/lane/rung/carrier);
  the earned forced-colors callout matches blockquote.css's
  forced-colors block (Canvas/CanvasText + the --hairline calc ladder).
- **Archetype §2 order** conforms: hero → install → overview → usage →
  live canvases → API → eight axes → accessibility → see-also; query()
  shown exactly once, real and working.

## Highlights — quill techniques worth stealing (→ my experience.md)

1. **The docs-curation file over the GENERATED meta, with
   header-evidenced corrections** (`blockquote.docs.ts`). The killer
   property: the hand table's stale default ('1') became structurally
   impossible — the type/default come from the registry interface, the
   curation only carries prose + evidenced display corrections, and the
   header cites the source line for the override. This upgrades MY pages:
   I commit to auditing my anchor + breadcrumb props sections at batch
   close and migrating any family-level rows still hand-written into the
   meta+docs curation lane (part tables stay hand-written only where the
   meta genuinely doesn't cover the part).
2. **The drawer-stays-runnable pattern for runtime-bearing demos**: the
   in-canvas compound expression `size={query({ md: 16 }, 14)}` (extractor
   guard: expressions must be self-contained) with the import carried by
   the usageFile imports record (`'{ query }': source` — binding clause as
   key), so the drawer copy-pastes into a consumer project and runs. My
   breadcrumb demos predate canvas drawers; if I add any, this is the
   pattern.
3. **Canvas surgery that respects the snapshot pins**: replacing the
   id-less universal canvas with `id="axes"` kept 4 drawers with
   rungs[0]/rule[1] order — canvas-same-source 41/41 with zero test edits.
   Steal for any future canvas rework on my pages: count drawers and order
   FIRST, then edit.
4. **A negative lesson that extends my own law**: quill's density row
   reached for the vocabulary's kernel channels (--jx-stack/--jx-gap) by
   analogy — they exist globally but THIS family never reads them.
   Consumption claims are per-family grep results, not vocabulary
   analogies. Logged in my experience.md next to the
   raw-prop-vs-resolved-record trap.

## Process evidence

- Dev server: `npx vite dev --port 5243 --strictPort` (apps/www), PID
  59848 — killed after the curl; `lsof -ti :5243` empty (exit 1). No
  orphans.
- Gate logs: /tmp/scribe-bq-review.html (SSR capture), /tmp/scribe-bq-tw.log
  (tailwindless), /tmp/scribe-bq-univ.log (docs-universal).
- No files outside this report + my experience.md were touched; family and
  kernel untouched; NO commits, NO push.
