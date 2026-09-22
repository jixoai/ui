# Report 1 — blockquote (CODE)

- agent: quill · round 1 · task 1 · 2026-09-22
- target: `apps/www/src/routes/docs/components/blockquote.html/+page.svelte`
- new file: `apps/www/src/lib/ui/props-table/docs/blockquote.docs.ts`
- family source read, NOT touched: `apps/www/src/lib/ui/blockquote/` (all five files)

## Tier: 2 优化重构 — one-line justification

The bones are good (SectionCard/ComponentCanvas infra, same-source lane, a11y
table, see-also all present and pinned) but the page violated §1 and §2:
the hero summary was a 300-word wall, there was no Overview, no per-axis
table, no query() case, the API table was the legacy hand-written track with
a STALE default (ruleSize `1` vs the family source's own `4`,
blockquote-defaults.svelte.ts `defineLiteralSlot([1, 4, 8], 4)` — the R3
ruling), and the W3-era universal demo showed `color`/`radius` panels that
visually do nothing on this family. Repair-into-shape (tier 2), not rewrite
(tier 3): every real information asset survived.

## What changed

1. **Archetype order (§2)**: hero → install → NEW Overview (3 short
   paragraphs + a Link to the universal-props concept page) → usage → rungs
   canvas → rule canvas → icon-lane → API (meta PropsTable) → NEW eight-axes
   section → accessibility → see-also. Hero title keeps the
   `blockquote — the quote` prefix (canvas-same-source parity pin).
2. **Hero**: wall → one sentence (≤2 lines); pills kept; head meta
   description tightened.
3. **Props**: legacy hand-written `props` array → `<PropsTable
   meta={blockquoteMeta} docs={BLOCKQUOTE_DOCS} />` (the docs-demo-standard
   4.2 lane; meta auto-splits the eight axis rows into the GENERATED
   universal section — exactly one `data-jx-props-table-universal`). New
   curation file carries: union-text corrections for the three opaque
   aliases (popover precedent), display defaults ('outline' / 'shadow' /
   **'4'** — the stale `1` fixed to the source truth with evidence in the
   curation header), honest descriptions, `style`/`rest` hidden.
4. **The eight axes on THIS component (§2.5)**: per-axis table
   (PropsTable `props={axisRows}`, the universal-props page idiom) naming
   each axis's REAL mechanism on this family —
   - CONSUMED: `size` (--jx-size-effective + root font-size → the 0.875em
     body voice), `density` (--jx-density-coefficient + data-density rung;
     own paddings ride --jx-unit/--jx-space-12 and stay fixed), `theme`
     (.dark class bridge);
   - SUPPLY ONLY (documented absences, source-verified — no blockquote css
     reads them): `radius` (--jx-radius-effective supply; the tonal box
     keeps `var(--radius)`), `shape` (--jx-shape-effective +
     --jx-radius-factor-effective), `color` (--jx-color-effective; hue here
     rides the jx-hue-* injection of --jx-tonal/--jx-outline),
     `elevation` (--jx-elevation-effective; the only shadow is the rule
     inset), `motion` (--jx-motion-effective);
   - census citation in place: ruleSize stays outside the eight —
     migration-census.md §13 keep row, "no collision" (explicit-props/
     research/migration-census.md line 334).
5. **query() shown ONCE, real and working**: new `id="axes"` canvas (same
   source via `resolveRawCode('axes')`) with `size={query({ md: 16 }, 14)}`
   — media key, live through the runtime engine; the composed drawer usage
   file carries `import { query } from '$lib/universal-props-query.svelte'`
   so it stays copy-paste-runnable. Replaces the W3-era id-less universal
   demo (whose color/radius panels showed nothing) — canvas count stays 4.
6. **Redundancy cut**: the hand-written `iconUsage` CodeBlock (drift-risk
   duplicate of the canvas content) — the icon-lane drawer carries the
   runnable source.
7. **Accessibility**: summary tightened; added the earned forced-colors
   note (tonal → Canvas/CanvasText; shadow rule re-materializes as an Npx
   CanvasText border) — real consequences, cited from blockquote.css.

Untouched by design (byte-identical, snapshot-pinned): rungs + rule canvas
children, both playground snippets, icon-lane canvas children, hero title
prefix, `#usage` composition.

## Learnings (also appended to experience.md)

- The census's per-family rows are the citation anchor for *lane*
  deviations (§13 keeps); *consumption* honesty (supply-only axes) is
  sourced from the family css/stylex itself — cite files, not the census,
  for "what the axis drives here".
- meta+docs migration is the stale-default killer: the hand table's
  ruleSize `1` had silently drifted from the source's `4`; the generated
  meta + a header-evidenced curation override makes that drift class
  structurally impossible.
- A new canvas must keep the canvas-same-source drawer-count/order pins in
  mind: replacing the id-less universal canvas with `id="axes"` kept 4
  drawers with rungs[0]/rule[1] — zero test edits needed.
- In-canvas expressions must be self-contained (the extractor's guard):
  inline `query({ md: 16 }, 14)` works (compound expression); a page-level
  `const` would fail the guard — the import instead rides the usageFile
  imports record.
- Family doc-comment drift noticed (NOT mine to fix, flagged for the
  orchestrator): blockquote.stylex.ts header says px-3.5/ps 14px "has NO
  step — reported as a MISSING step (--space-14)", but tokens.stylex.ts now
  ships `--jx-space-14` (Wave 1 scale extension); the family still uses the
  calc equation. Also the family's own header comment says ruleSize "own 1"
  in one place and "own 4" in another (the svelte comment vs the defaults
  code — the CODE is own 4; the Props doc-comment line 145 says "own 1").

## Gates (tails)

- dev-smoke: `npx vite dev --port 5241 --strictPort`, PID 8181 →
  `/docs/components/blockquote.html` 200 (1s); page markers verified in
  served HTML (axes section, SUPPLY ONLY rows, 1 universal marker); zero
  page-specific errors in the dev log; **killed 8181, `lsof -ti :5241` = 0**.
- `npx vitest run test/canvas-same-source.spec.ts` → **Tests 41 passed
  (41)** (rungs/rule inline snapshots + drawer parity GREEN, zero edits).
- `npx vitest run test/docs-ambient-vocabulary.spec.ts
  test/section-numbering.spec.ts` → **Tests 299 passed (299)** — no re-pins.
- `npm run verify:tailwindless` → GREEN: "receipt: files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound
  verbatim" — UNMOVED, zero new class identities.
- `npm run build` (apps/www) → EXIT:0; `npm run verify:docs-universal` →
  "GREEN: 110/110 component pages render the shared universal section
  (110 markers)"; built blockquote.html carries exactly 1 marker + the
  axes/query content.
- svelte-check: 1646 standing errors codebase-wide (pre-existing noise);
  my two files report 2 hits, BOTH on byte-identical pre-existing
  fragments (the page-local cx helper — same error class on press-button's
  identical copy; `icon={warningGlyph}` — unchanged markup, HEAD line 243).
  **Delta: zero new errors.** `npm run test:types` deferred to batch close
  (orchestrator) per the brief.

## Processes

- dev server: PID 8181 (vite dev --port 5241 --strictPort) — killed by PID,
  `lsof -ti :5241` returned empty afterwards.
- Shared-worktree courtesy: a sibling `vite build` (PID 10090) was in
  flight when I reached the build gate; I waited for its exit (~45s,
  low-frequency bounded wait) before building — no dist race.
