# scribe task 2 — breadcrumb (docs-eight-axes-mdn)

Agent: scribe · date 2026-09-22 · main dir, no commits, no push.
Scope: `apps/www/src/routes/docs/components/breadcrumb.html/+page.svelte`
and `+page.ts` ONLY. Family (`apps/www/src/lib/ui/breadcrumb/`) untouched.

## Tier: 2 优化重构 — justification

The old page's bones were docs-demo-standard, not the MDN archetype: hero +
demo came first, then a patchwork band (types / dropdown / usage /
accessibility / theming / universal-props / api) OUTSIDE the page shell, the
universal-props section carried a single uniform `size={18}` demo card (the
exact W3-era shape this change retires), no per-axis table, no query() case,
no install, no see-also, and a stale toc (`dropdown` and `universal-props`
sections existed but were absent from `+page.ts`). Tier 3 would discard real
information; tier 1 cannot reach the archetype. Tier 2: restructure to the
archetype order, keep every real usage fact (fold, custom separator, sibling
jump, the W3C-first semantics), write the axis surface from source.

## What changed

- **Archetype order** (§2): hero → install → overview → usage → live
  examples (trail + fold + sibling jump, pulled back inside one `rt.shell`)
  → props (the ONE generated universal section + four part tables) → the
  eight axes on breadcrumb → accessibility → see-also (new;
  `DocsSeeAlso name="breadcrumb"`).
- **The eight axes on breadcrumb** — the heart: per-axis table with real
  mechanisms (`data-density` rung + `--jx-density-coefficient`,
  `--jx-size-effective`, `--jx-shape-effective`/`--jx-radius-factor-effective`,
  `--jx-radius-effective`, `--jx-color-effective`, the `.dark` bridge,
  `--jx-elevation-effective`, `--jx-motion-effective`); steps/units per
  `universal-props.schema.ts`; the provider-snapshot kernel law stated
  verbatim in the section summary (the bridged `provideDensity` carries the
  density supply, the literal carries the other seven; all 8 parts on
  `densityRungOf` stamps); census citation for the D5 first-time no-own
  adoption.
- **Consumed-vs-supply honesty** (task-1 technique, pushed further): on this
  family the trail's own atoms pin FIXED tokens (`--jx-space-6` gap,
  `--jx-text-label-lg` label) — so density, size, radius, shape, color,
  elevation and motion are stamped-but-not-painted by the trail. Where the
  supply still LANDS is named precisely: density → the composed menu's items
  (`--jx-hit`/`--jx-line`/`--jx-inset`/`--jx-text` in dropdown-menu.css);
  shape/radius → the composed menu panel (concentric calc × factor,
  `corner-shape: var(--jx-shape-effective, round)`); size/color/elevation/
  motion → documented absences with the var that is NOT read. Only theme is
  live on the trail itself.
- **Demos earned, not forced** (5 panels + the query row, each a distinct
  mechanism story): ambient (stamps nothing) · density="small" and
  density="large" with a sibling-jump node in each (open the menu, watch the
  rung) · radius="large" (menu panel takes it) · theme="dark" (live) ·
  `density={query({ lg: 'large' }, 'small')}` — the one real query() case.
- **TokenTable**: the family's real paint receipts with source-verified
  values (`--jx-text-label-lg` 0.75rem/12px, `--jx-track-wide` 0.08em,
  `--jx-space-6` unit × 1.5, `--jx-font-nav`, the ink tokens, `--hairline +
  --ring` focus outline, `--motion-150`/`--motion-ease-out` fade).
- **Props**: universal generated section (marker intact) + part tables
  rewritten from source — Link's `child` replacement-element contract,
  Page's span form, Separator's glyph override (`data-glyph="custom"`),
  Collapse's derived href, Dropdown's legacy local `density` documented as
  the part's own opinion slot (not an axis rename).
- **+page.ts**: toc rebuilt to the page DOM (overview / usage / live demo /
  fold / sibling jump / props / the eight axes / accessibility).
- **Removed**: the W3-era uniform `universal-props` demo card, the empty
  `TokenTable tokens={[]}`, the DensityDemo scope-wrapper block (superseded
  by the root-supply story), the stale second `rt.shellFlush` shell.

## SSR ground truth (dev :5243, per-axis)

One curl of the rewritten page, grepped as per-axis evidence:

- 12 navs total: 7 ambient (no `data-density`, no style — auto stamps
  nothing) · 1 `class="dark"` (theme panel) · 1 `data-density="lg"` ·
  2 `data-density="sm"` + `style="--jx-density-coefficient: 1"` (the small
  panel AND the query panel — see the correction below) · 1
  `style="--jx-radius-effective: var(--jx-radius-large)"` (radius carrier
  verbatim; shape/factor absent because shape is auto).
- The density panels' PARTS re-stamp the ambient rung (ol/li/a/span carry
  `data-density="sm"`/`"lg"` without any prop of their own) — the 吃也供
  supply story verifiable in markup.
- `data-jx-props-table-universal` ×1; all eight toc ids present ×1;
  `data-doc-see-also` ×1.

**Self-caught correction**: my first query()-case caption claimed "SSR
renders the trail ambient — a query() carrier never carries the legacy
rung". The curl proved otherwise: the ROOT nav stamps `data-density="sm"`
at SSR because `densityRungOf(d.density)` reads the RESOLVED record —
`BreadcrumbDefaults.resolve` unwraps the query's base lane through the
engine — while the parts of that panel stay ambient (the `densityRungOf`
never-carries-rung comment applies to the raw prop, which the root never
passes). Caption rewritten to the observed behavior; that asymmetry
(root resolves, parts stay ambient until resolution) is now on the page.

## Gates (log-file + $? discipline)

| gate | baseline (pre-change tree) | after | evidence |
|---|---|---|---|
| dev-smoke :5243 | — | PASS | vite started on 5243, `GET /docs/components/breadcrumb.html` → 200 (1.08 MB SSR); markers probed: universal ×1, see-also ×1, per-axis stamps as above; no vite-error-overlay; killed by PID, `lsof -ti:5243` → empty (exit 1) |
| `verify:docs-universal` | GREEN 110/110 | GREEN 110/110 | re-run AFTER the full build on fresh dist artifacts; exit 0 |
| `verify:tailwindless` | GREEN, receipt verbatim | GREEN, receipt UNMOVED | `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` byte-identical before/after (/tmp/scribe-bc-*.log) |
| affected specs solo-run | `openspec validate docs-eight-axes-mdn --strict` → valid | valid, exit 0 | no spec edits, zero deletions, no re-pins needed |
| scoped svelte-check | task 1: not installed in apps/www | **available via `npx svelte-check --workspace apps/www` from the REPO ROOT (4.7.6)** — full run is noise-heavy (1646 pre-existing errors across 643 files, fixtures + registry mirrors); my page: **2 errors, 0 warnings**, and BOTH are the same two error classes the integrated anchor page carries (cx `Object.entries` narrowing; `query({lg:'large'},'small')` → `QueryResult<string>`) | zero new deltas vs the campaign baseline |
| `npm run build` | — | exit 0 | full-site build green; dist/docs/components/breadcrumb.html carries universal ×1, sm stamps ×20, axes section |
| `verify:docs` | green | green | skeleton lint staged scope green (see-also slice holds) |

**Two campaign findings from the new gate coverage** (not breadcrumb-specific,
both present on the integrated anchor page — orchestrator may want a batch
idiom fix):

1. The page idiom `cx` errors under svelte-check everywhere it is copied
   (`Object.entries(style)` with `style` possibly undefined —
   `.filter(Boolean)` does not narrow). Exact fix shape: a type predicate
   `.filter((s): s is NonNullable<typeof s> => Boolean(s))`.
2. The runtime `query` (`$lib/universal-props-query.svelte.ts:120`) lacks
   the `const` type-parameter modifier the schema's declared `query` has, so
   `query({ lg: 'large' }, 'small')` infers `QueryResult<string>` and fails
   assignment to `DensityLane | QueryResult<DensityLane>`. One-word kernel
   fix (`const T`), kernel file — out of doc-page scope.

Processes: vite dev on :5243 started scoped to apps/www, killed by its PID;
`lsof -ti:5243` → empty (exit 1) after kill; no orphans.

Working-tree footprint: exactly the two breadcrumb page files (verified via
`git status --short` filtered against the known sibling in-flight files —
accordion/alert/blockquote pages, BOARD.md, assignment.json, untracked
blockquote.docs.ts are sibling work, untouched).

## Learnings

- The consumed-vs-supply split needs a THIRD state when the family composes
  consumers: stamped-on-the-trail-but-landed-in-a-composed-part (density →
  menu items; shape/radius → menu panel). Writing only "consumes/doesn't"
  would have hidden the page's best story — the supply is real, it lands in
  the menu, and the demo tells you to open the node.
- `densityRungOf`'s "a query() carrier NEVER carries a legacy rung" comment
  describes the RAW prop, not what a family root stamps: the root stamps the
  RESOLVED record, and the engine unwraps the query base at SSR. Curl before
  you caption.
- svelte-check IS reachable from the repo root via npx with
  `--workspace apps/www` (task 1's "not installed" was a bin-lookup in the
  wrong prefix). The full run is unusable as a gate (1646 pre-existing
  errors), but a filtered read of the machine output gives a true scoped
  delta — it caught both idiom debts above.
