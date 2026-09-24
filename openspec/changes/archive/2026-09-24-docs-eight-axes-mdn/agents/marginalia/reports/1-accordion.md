# Report 1 — accordion (CODE, round 1)

agent: marginalia · date 2026-09-22 · page
`apps/www/src/routes/docs/components/accordion.html/+page.svelte` · family
`apps/www/src/lib/ui/accordion/` · reviewers vellum + scribe

## Tier

**Tier 2 (优化重构)** — the bones already fit the archetype (hero H1 → live
demo → sections → a11y → props table), but the page had real gaps against
§2.5 (no per-axis table, no `query()` case, no see-also) and real redundancy
(the usage CodeBlock appeared twice; the W3-era universal card asserted a
size-axis behavior the family CSS does not deliver). Not tier 3: every piece
of real information survived into the new structure.

## What changed

1. **Archetype order landed**: H1 hero → Overview (platform-gives/adds
   columns) → Usage (the ONE CodeBlock) → live example (FAQ canvas +
   playground, unchanged) → Postures (the old variants matrix, retitled) →
   Props (the two PropsTables moved up from the bottom; the group table
   keeps `universal` — exactly one `data-jx-props-table-universal`) → **The
   eight axes on the accordion** → Accessibility → See also
   (`DocsSeeAlso name="accordion"` — the page had none).
2. **The per-axis table** (§2.5), every mechanism a real name from the
   family source:
   - carriers as stamped by `stampCarriersForLanes` at the group root:
     `--jx-size-effective` (+ frame font-size), `--jx-shape-effective` +
     `--jx-radius-factor-effective`, `--jx-radius-effective`,
     `--jx-density-coefficient`, `--jx-color-effective`,
     `--jx-elevation-effective`, `--jx-motion-effective`; theme rides the
     `.dark` class bridge (`class:dark={d.theme === 'dark'}` in
     accordion.svelte), density's rung half rides the `data-density` attr.
   - consumption facts from the family CSS: density + theme are the ONLY
     lanes that repaint the disclosure itself (summary/body read
     `var(--jx-text)`/`var(--jx-line)`; dark re-themes in place). The other
     five are broadcast-only (the family consumes none of their carriers),
     and radius is anchor-only (the frame's corners keep the ambient
     `var(--radius)` — `tokens['--jx-radius']` → `var(--radius)`).
   - steps/units per `universal-props.schema.ts`; density's alias law
     (small/medium/large → sm/default/lg via `normalizeDensityLane`) and
     the rem-fixed paddings (`calc(var(--jx-unit) * 3.5)`) documented.
3. **Deviations cited** to `openspec/changes/explicit-props/research/migration-census.md`
   (W3-CLOSE/D5 rows): first-time all-no-own contract; IN-FLOW no-portal
   supply chain; the radius 20 → auto Card 6px receipt.
4. **Grouped examples** (each canvas's shown source mirrors its stage):
   density (the DensityDemo rung row + explicit `density="large"` /
   `density="small"` panels), theme (`<Accordion theme="dark">`), concentric
   radius (`radius={20}` + nested `<Card radius="auto">` = 6px, the census
   receipt live), and **the ONE `query()` case**:
   `density={query({ sm: 'default' }, 'small')}` — a media-key density
   ladder (compact below 40rem, default above), typed with the
   `query<{ sm: DensityLane }>(…)` generic pin per the concept page's note.
5. **Corrections of false claims** (the W3-era card):
   - removed `<Accordion size={18}>` "the whole disclosure set scales —
     summary and body, one number". FALSE on this family: the summary/body
     read `var(--jx-text)` (rem-based density channel), the paddings are
     rem equations — an explicit size lane repaints nothing here. The size
     row now says supply-only, honestly.
   - removed the duplicate usage CodeBlock (was in accordion-base AND
     #usage).
6. **Skeleton lint conformance** (existing infrastructure, zero new
   machinery): added `DocsInstall name="accordion"`, a dedicated Usage H2
   (the lint's hard rule: exactly one `Usage` H2 per page), ordered
   Usage before the examples surface (the staged skeleton's order law and
   the fleet convention) — the page now has ZERO backlog lines in
   verify:docs (was: "no Install section"; the old page also tripped
   nothing else).

## Learnings (full log in ../experience.md)

- **Read the family CSS before trusting any demo copy.** The W3-era demo
  claimed size scales the disclosure; the CSS (rem-based `--jx-text`,
  rem-fixed `--jx-unit`) says it cannot. Per the W6 receipt discipline
  (AXIS-NOT-VISIBLE is a failure class) the demo had to go, not be kept.
- **Custom-property substitution timing decides density's two lanes.**
  `--jx-text` substitutes `var(--jx-density-coefficient, 1)` AT THE
  DECLARING element (the `:root`/`[data-density]` scope blocks). A named
  rung attr makes the scope block match the frame → recomposes there
  (visible). A bare coefficient stamp matches no block on this family →
  nothing recomposes. I documented what each lane STAMPS (true) and what
  the rung does (visible), and did not demo the coefficient alone.
- **The `rg -rn` trap bit me twice in one session** (my own context law):
  `-r` is `--replace`; mangled output once made me re-read a function name
  wrong. Use `rg -n` always.
- **`svelte-check` is not installed here** — the practical scoped compile
  gate is the vite build (exit 0 = the page compiles) plus the scoped
  vitest run; `test:types` only checks test/*.spec-d.ts fixtures
  (ignoreSourceErrors). Reported as-is for the orchestrator.

## Gate tails

- dev-smoke (final state): `HTTP:200 bytes:1155371` on :5244; markers
  `data-jx-props-table-universal` + `data-doc-see-also` + `data-doc-install`
  all present in SSR HTML; `npx jixoai-ui add accordion` present.
- `npm run build` (apps/www): `BUILD_EXIT:0`.
- `npm run verify:docs-universal`: `GREEN: 110/110 component pages render
  the shared universal section (110 markers)`.
- `npm run verify:tailwindless`: `receipt: files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound
  verbatim` — UNMOVED, zero new class identities.
- affected specs solo-run: `openspec validate docs-eight-axes-mdn --strict`
  → `Change 'docs-eight-axes-mdn' is valid` (exit 0).
- `npm run verify:docs` (docs-structure lint): accordion has ZERO backlog
  lines and no hard findings. The gate still exits 1 on
  `alert: no \`Usage\` H2 section` — that is vellum's IN-FLIGHT page (board:
  alert = vellum CODE task), not this change; attribution evidence: git
  status shows alert.html modified in tree by the concurrent task.
- scoped specs: `vitest run test/docs-structure.spec.ts
  test/canvas-same-source.spec.ts test/docs-ambient-vocabulary.spec.ts
  test/docs-nav-filter.spec.ts` → `Tests 361 passed (361)`.
- `test:types` NOT run full-suite here (batch-close gate per skill §4);
  scoped compile evidence = the two clean builds.

## Processes (the recycle law)

- smoke 1: `npm run dev -- --port 5244 --strictPort` → PID **3479**
  (logged in /tmp/accordion-dev-5244.pid); killed `kill 3479`;
  `lsof -i :5244 -sTCP:LISTEN` → 0 lines; `ps -p 3479` → not alive;
  orphan sweep `pgrep -f "vite dev"` → empty.
- smoke 2 (final): PID **23295** (/tmp/accordion-dev-5244-final.pid);
  killed; port 5244 → 0 listeners; PID gone.
- One-off dev-log noise, recorded for attribution: the first cold request
  of the session logged `(ssr) Error when evaluating SSR module
  virtual:jixoai-icons.css?inline` exactly once (the icons plugin's
  warmup; the page returned 200 with full content, and the error never
  recurred across subsequent loads of this and other pages). Also
  pre-existing svelte warnings from `play-timing.svelte` and
  `token-table.svelte` (not this page's files).

## Follow-ups for the orchestrator / reviewers

1. **Family-source prose bug (flag only, not fixed — family files are
   outside my task)**: `accordion-defaults.svelte.ts` and the
   `size?` prop comment in `accordion.svelte` both claim the size axis
   "scales the whole set (ONE number moves summary + body)". The family
   CSS contradicts this (see above). Either the CSS should consume
   `--jx-size-effective` (an em-based voice) or the prose should say
   supply-only. My page documents the CSS reality.
2. **Archetype §2 vs the staged skeleton**: the MDN archetype's
   live-example-early slot trips the old demo-standard order law if Usage
   comes after examples. I resolved Usage BEFORE examples (fleet
   convention, zero backlog). If a future page wants examples-then-usage,
   the successor gate flip will need an explicit ruling.
3. The `virtual:jixoai-icons.css` warmup error is environmental
   (pre-existing), worth one line in the round-1 integration notes.
