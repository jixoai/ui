# Report 4 — CODE `badge` (marginalia, 2026-09-22)

## Tier: 2 — 优化重构 (the bones were good; the structure was W3-era)

The page kept its real wealth — the variant-grammar story, the hue-injection
recipes, the same-source canvas — but violated the archetype: no Overview, the
axes story split across a `types` card and a W3-era `universal-props` card
whose demo conflated size with density (`size={14} density="small"` in ONE
badge), a hand-copied API table, a toc with no Overview/axes/see-also, and no
per-axis table. Tier 3 was never in play: every old section's information
survives into the new structure.

## What changed

- `apps/www/src/routes/docs/components/badge.html/+page.svelte` — full
  archetype restructure: H1 → Overview → Live example (Usage, with
  `<DocsInstall name="badge" />` before it) → Props → The eight axes on badge
  → Accessibility → See also (`<DocsSeeAlso name="badge" />`).
- **Props section now renders from the GENERATED meta**:
  `<PropsTable meta={badgeMeta} docs={BADGE_DOCS} />` — new curation file
  `apps/www/src/lib/ui/props-table/docs/badge.docs.ts` (the blockquote.docs.ts
  pattern). The stale hand table is gone; variant/shape union text + display
  defaults live in the curation with evidence in its header. This discharges
  my review-2 commitment ("when the extractor covers it, migrate the hand
  table") — badge.meta.ts exists, so the migration landed with the page.
- **Same-source discipline**: all hand-authored demo mirror files and the
  `const close` dodge are deleted. Both canvases compose drawers from
  `resolveRawCode(id)` + `usageFile(...)` (the quill lane); the usage drawer
  imports Badge AND Icon so the `{#snippet slotStart()}` sample runs
  standalone; the axes drawer carries `{ query }` + `type { DensityLane }`.
- **Per-axis table** (`PropsTable props={axisRows} title=""`, vellum's
  zero-machinery idiom): 8 rows, every mechanism named from the family's real
  carriers, every number live-measured (probe receipts below), the summary
  carries quill's honesty-index sentence (consumed / re-typing / supply-only
  counts up front).
- **The shape absence, with the census citation** (the skill's own named
  example): the §2 shape axis is deliberately absent — the family-local
  `shape` ('square' | 'pill') owns the name and `pill` is outside ShapeLane;
  §13 rules no mapping, so the lane is left out (forwarding ambient) rather
  than renamed — `migration-census.md` batch B LANDED row, flagged for the W6
  Owner dossier. It has its own row in the per-axis table AND the corner law
  lives in the shape prop's curation row.
- **ONE real query() case**: responsive density —
  `density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}`
  inline in the canvas children (compound-expression law; BOTH generic args
  per the scribe-review law — the single-arg form ships a real svelte-check
  error). Measured live: attr flips lg ↔ sm ↔ lg across the 40rem viewport
  and back.
- **Grep receipts before supply claims** (the second scribe-review law):
  `rg` over `lib/ui/badge/` finds ZERO readers of `--jx-radius-effective`,
  `--jx-color-effective`, `--jx-elevation-effective`, `--jx-motion-effective`
  — radius/color/elevation/motion are documented supply-only. The consumed
  side is receipted too: badge.stylex.ts/badge.css read exactly
  `--jx-gap`, `--jx-inset`, `--jx-text-secondary`, `--jx-line-secondary`
  (density's channels), `--jx-radius` (the theme radius, the square
  corner-law) and the four hue slots.
- **toc** (`+page.ts`): overview / usage / Props / The eight axes /
  accessibility / see-also — all six verified reachable in the probe.
- **Skeleton contract adopted**: DocsInstall + DocsSeeAlso mount (the lint's
  markers verified in SSR), and `scripts/docs-skeleton-scope.json` drops
  badge's backlog entry — the evidence-based re-pin (install + see-also +
  Usage-order all verified); `badge` no longer prints backlog lines.

## Measurement-first receipts (probe pass 1 pre-coding, pass 2 post-coding)

The probes live in /tmp (`marginalia-4-badge-probe1{,b,c}.mjs`,
`marginalia-4-badge-probe2.mjs`). Headlines:

1. **Color-axis paint-inertness required a same-instant re-test.** The docs
   site runs a wall-clock `--brand-hue` rotation (jixoai.css:32-44: "the
   wall-clock rotation is ui.jixoai.com's site-local hue-runtime script").
   Probe 1's cross-instant comparison "caught" color="error" moving the paint
   — pass 1b re-read both badges inside ONE evaluate: byte-identical. A
   same-badge hue read drifted 136° → 128° between sections of one probe run.
   Any page claiming paint equality here must compare same-instant.
2. **The theme row is a measured split, not a happy path.** The four hue
   slots re-declare on the `.dark` scope (jixoai.css `:root, .jx-light,
   .dark { --jx-fill: … }` selector list) — tonal/fill grounds, inks and
   borders DO flip under `theme="dark"` (probe: ground changes when the class
   is removed/re-added). BUT the outline rung's ink reads `--jx-foreground`,
   a `:root` stylex token (tokens.stylex.ts:57) that does NOT re-substitute
   under a scoped `.dark` — measured: the ink stays the light black. The row
   documents both halves and names the W-next semantic-ink gap.
3. **Size has cascade weight; the box does not follow.** The §11 stamp emits
   `font-size` INLINE, which beats the class voice (`fontSize:
   var(--jx-text-secondary)`) — the label re-types verbatim (12px → 14px →
   24px measured), while the kbd-law box stays 20px (height/line ride
   density's `--jx-line-secondary`). The old page's demo conflated size with
   density (`size={14} density="small"`), which is exactly why this was
   invisible before; my first B3 probe check FAILED on that confound and the
   page now demos them separated.
4. **The declaring-element law holds on badge's channels.** A bare
   `--jx-density-coefficient: 3` on a probe element recomposes nothing (the
   channels declare at :root/[data-density] scopes; measured inert); the
   `data-density` attr makes the element the declarer (channels re-declare,
   measured move). The density row says exactly this, plus the "explicit rung
   = exact rung" coefficient reset (kernel defaults.svelte.ts:599-607).
5. **My own measured-ladder caption lie, self-caught.** I first wrote
   "2xs … 18px box" by wrongly adding the default rung's height. Probe 2
   measured the 2xs box at 14.5px (line 12.5 + the two 1px hairlines). The
   caption, the density row and the axes description all now say 14.5px —
   the "(measured)" annotations are a contract (the vellum lesson), and the
   probe enforces it.
6. **Measured ladders now in the TokenTable**: text-secondary 10 / 11 / 12 /
   14px, line-secondary 12.5 / 13.5 / 15.95 / 18 / 21px, insets 8→12→16px
   (2xs–sm / default / lg); size named steps 14/16/18px and radius named
   steps 6/8/10px (probe-element var substitution); pill corner computed
   3.35544e+07px (`calc(infinity * 1px)`); square corner 8px (the theme
   `--radius` inside `@supports (corner-shape: bevel)`; 0px base).
7. **Elevation/motion are supply-only with CSS + grep proof** (no
   box-shadow, transition-duration 0s, zero carrier readers) — documented in
   rows, deliberately NOT demoed (nothing to see; §2's "where they earn
   their keep").

## Gates

- dev-smoke (final state): `HTTP:200 bytes:942520` on :5244; SSR markers
  `data-jx-props-table-universal` ×1, `data-doc-install` ×1,
  `data-doc-see-also` ×1, `npx jixoai-ui add badge` present, 11
  `data-jx-badge` chips SSR-rendered, all six H2 sections present.
- probe pass 2: **26/26** (structure ×8, density ladder ×3, size honesty ×2,
  theme split ×3, query() both directions ×3, same-source drawer ×1, supply
  claims ×2, drawer imports ×1, toc reachability ×6 — after fixing the two
  findings above).
- `npm run build` (apps/www): `BUILD_EXIT:0` (the scoped svelte-check
  substitute per the quill/vellum precedent; full `test:types` left for
  batch close).
- `npm run verify:docs-universal`: `GREEN: 110/110 component pages render
  the shared universal section (110 markers)`.
- `npm run verify:tailwindless`: `receipt: files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound
  verbatim` — UNMOVED from the pre-change baseline I took before editing.
- affected specs solo-run: `openspec validate docs-eight-axes-mdn --strict`
  → `Change 'docs-eight-axes-mdn' is valid` (exit 0).
- `npm run verify:docs`: `✓ all docs pages pass the skeleton lint (staged
  scope green)`, exit 0 — badge's backlog entry re-pinned out (only
  badge-indicator, not my page, prints).
- scoped specs: `vitest run test/docs-structure.spec.ts
  test/canvas-same-source.spec.ts test/docs-ambient-vocabulary.spec.ts
  test/docs-nav-filter.spec.ts` → `Tests 364 passed (364)` (baseline was
  361 at my task 1; +3 from parallel agents' landed work, zero failures,
  zero deletions).

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244` (wrapper PID **85425**;
  vite listener PID **85428**, log /tmp/marginalia-badge-dev.log). Killed
  85425, then killed the listening PID by name via `lsof -i :5244 -sTCP:LISTEN
  -t`. Receipts: `lsof -i :5244 -sTCP:LISTEN` → 0 lines; `pgrep -f "vite.js
  dev --port 5244"` → empty; `ps -p 85425` → gone.
- Probe/scratch files in /tmp only (`marginalia-badge-*.html`,
  `marginalia-4-badge-probe*.mjs`, `dupids*.mjs`,
  `marginalia-badge-build.log`) — nothing repo-side beyond the page files,
  the curation file, and the scope re-pin.

## Working-tree note for the integrator

My paths, in full:
- `apps/www/src/routes/docs/components/badge.html/+page.svelte`
- `apps/www/src/routes/docs/components/badge.html/+page.ts`
- `apps/www/src/lib/ui/props-table/docs/badge.docs.ts` (new)
- `scripts/docs-skeleton-scope.json` (badge backlog entry removed — the
  evidence-based re-pin)
- campaign bookkeeping under `openspec/changes/docs-eight-axes-mdn/`

The tree also carries parallel agents' edits (blockquote/alert/breadcrumb
pages, BOARD.md, assignment.json) — not mine, do not stage with mine.
NO commits, NO push (per assignment).

## Honest deviations & vocabulary

- The shape axis absence is documented twice (per-axis row + shape prop
  curation) with the batch-B census citation and the W6 dossier flag —
  never invented behavior.
- The 吃也供 gloss ruling: my page never names the broadcast protocol (the
  supply story is told per-axis), so there is no first mention to gloss. The
  one 吃也供 hit in the page's SSR HTML is an inlined CSS comment from
  jixoai.css, not page prose.
- Family comments checked against code: none contradict measurement (the
  "radius 0" header comment describes the `--radius` base; the live 8px is
  the corner-shape `@supports` upgrade — the same wording alert uses). No
  new drift-ledger entry.
