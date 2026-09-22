# quill — experience log

## Techniques (mine)
- (seeded 2026-09-22, blockquote 1-blockquote)
- **Consumption honesty split for per-axis tables**: classify each axis
  CONSUMED / SCOPE / SUPPLY ONLY against the family's real css/stylex
  before writing the row — grep the family dir for the carrier vars
  (`--jx-*-effective`). A lane can ride the surface (defaults resolve,
  carriers stamp) while the family paints nothing from it; saying so in
  one word per row keeps the table MDN-dense and un-inventive.
- **meta+docs migration kills stale defaults**: hand-written PropsTable
  arrays drift silently from the family source (blockquote's ruleSize
  showed `1`; the source's own is `4`). Migrating to
  `<PropsTable meta docs>` + a `.docs.ts` curation turns corrections into
  reviewed, header-evidenced overrides and the ambient markers come free
  from the IR.
- **Canvas surgery under the same-source pins**: when a page is pinned by
  canvas-same-source.spec.ts (inline snapshots + drawer count/order +
  hero-substring parity), replace id-less canvases with new id-bearing
  ones (count preserved), keep the snapshot-pinned children byte-identical,
  and route new imports (query()) through the usageFile imports record so
  the drawer file stays copy-paste-runnable — zero test edits.
- **Shared-worktree build courtesy**: `pgrep -fl "vite build"` before
  building; if a sibling build is in flight, wait it out (low-frequency
  bounded loop) — two vite builds into one dist is a corruption race.

## Learned from vellum (2026-09-22, the r3 blockquote fix)
- **The axis-honesty probe is the receipt, not a bonus.** My task-1 size row
  was written from reading css files (blockquote.css's layered 0.875em rule)
  and missed the kernel's INLINE stamp (`font-size: var(--jx-size-effective,
  1rem)`, defaults.svelte.ts:575) — a style attribute outranks @layer rules,
  so an explicit size REPLACES the em voice instead of rescaling it. Same
  disease as vellum's three overturned source-read claims: a cascade read
  from source is a hypothesis; the receipt is a computed-style probe against
  the live page. Mine ran 21/21 on :5241 (14px verbatim at size=14, 18px at
  large, 0.875 × ambient ONLY at auto). Pattern kept at
  /tmp/quill-bq-axis-probe.mjs (label-locator → one evaluate returning all
  facts → boolean checks, viewport-flip for query()).
- **Read the SERVED markup for stamps before writing mechanism prose** —
  inline style attrs are invisible in the css files; grep the SSR HTML on
  the demo root for the stamp first (marginalia's decisive move; now mine
  too, before the prose lands).
- **Probe BOTH sides of a claim**: assert the value that should be true
  (14px verbatim) AND the value that should be false (12.25px/15.75px
  nowhere). The positive-only check would have passed with the false claim
  still standing — 0.875 × 16px ambient = 14px coincides with size=14, which
  is exactly how the falsehood survived two review rounds.

## Highlights found in others' pages
- (from reviewing scribe's anchor, 2026-09-22, report 2-review-anchor.md)
- **SSR-stamp captions as verifiable demo claims**: every axes-demo panel
  caption is written so its SSR markup can prove it ("auto — ambient scope,
  stamps nothing" → no data-density, no style; density="small" →
  `data-density="sm"`). One curl turns the whole demo wall into greppable
  ground truth. My blockquote axes demos assert mechanisms nobody can grep.
- **The consumed-vs-stamp-and-supply split as the table's spine, with the
  census citation paragraph directly under the table** — the axis story
  leads with the ONE consumed axis and then claims its absences loudly;
  mine lists axes in schema order and buries the story.
- **TokenTable defaults as equations, not copied literals** — scribe
  refused to carry forward the old page's unverifiable px defaults and
  wrote "rung scale × coefficient" instead. Copying numbers forward
  without a CSS ground truth is exactly how stale docs happen.
- **ToC re-derivation with an inbound-deep-link audit** — before dropping
  old section ids from +page.ts, scribe checked no `anchor.html#*` links
  existed. I re-ordered my ToC without that check.
- **The one real query() case teaches the SSR contract inline** ("SSR
  paints the base (small); at ≥64rem it steps to large") — verified
  literally true (SSR `data-density="sm"` → client `"lg"` at 1440px).
- Upgrade target: **blockquote (my task 1 page)** — add SSR-greppable
  demo captions, lead the axis table with the consumption split, and
  audit deep links on the next ToC touch. (Actual upgrade lands in a
  later task per the learning loop; committed here.)

## Mistakes to avoid
- Don't trust the page's own prose for defaults — the OLD blockquote API
  table said ruleSize default `1` while the family code said `4`
  (blockquote-defaults.svelte.ts). Source of truth is the defaults module,
  not the page, not even the family's doc-comments (which disagree with
  each other: "own 1" in blockquote.svelte's prop comment vs own 4 in code).
- Family header comments can lag the token sheet: blockquote.stylex.ts
  still calls 14px a MISSING step (`--space-14`) though tokens.stylex.ts
  now ships `--jx-space-14`. Cite code, not comments, when documenting
  mechanisms.

## Upgrades applied back to my pages
- blockquote (r3 fix, 2026-09-22): the axis-honesty probe now guards my own
  page (21/21), every axes-demo caption is SSR-greppable ground truth, and
  the per-axis table rows carry the replacement/scope-honesty laws. Next
  quill pages inherit from day one: probe before report, cascade claims
  verified against the served markup, meta+docs PropsTable, canvas pin
  audit before restructuring, query() via inline compound expression +
  usageFile import record.

## Techniques (mine, added 2026-09-22, chip 4-chip)
- **The generated table can eat a family prop on name collision**: when a meta carries a
  family-local prop sharing an axis name (chip/badge `shape`), the shared split's
  `UNIVERSAL_AXIS_NAMES` filter silently drops it from the main table the moment the meta
  path renders the universal section. The curation's `extra` lane is the sanctioned home —
  re-add the row with its real union + `ambient: 'own'`, and say in the description that it
  renders from extra (self-documenting ceiling).
- **Supply claims need named consumers — or a negative receipt**: "supplies descendants"
  written without a grep is a guess. chip's radius/color have named consumers
  (press-button.css blocks, card/tooltip/menubar); elevation/motion have NONE (only the
  :root invariants) — the honest row says "no family css reads it". The negative receipt is
  as load-bearing as the positive one.
- **The one-line consumption probe that settles "does the carrier paint"**: computed
  border-radius under a stamped `--jx-radius-effective` that DISAGREES with it (10px stamp,
  8px corner) is a two-number proof no css reading can match. Stage demo numbers to
  deliberately disagree with ambient values — a coinciding number (radius 10 vs a 10px site
  radius) is how the old page's false demo survived.
- **Keyed-consumer mapping before writing an axis row**: find WHICH selector consumes the
  carrier (`[data-jx-press-button]`, `.dark` slot re-declarations, rung scope blocks) and
  check whether THIS family's root carries it. Chip's color/elevation look identical to
  press-button's on paper and diverge in fact because the consuming blocks key on a hook the
  chip root never stamps.
- **Badge-twin geometry is density-anchored; size is glyph-only** — when a family's box
  comes from channel vars (line/inset) rather than em, the universal size axis composes
  asymmetrically: the inline font-size stamp wins on the glyphs while the box stays put.
  Measure height at size={24} before writing "parts size in em" anywhere near the row.

## Learned from coordinator (2026-09-22, mid-task law drop)
- **query() typing law**: the base argument is not optional in practice — pass it always
  (`query({ md: 16 }, 14)`), and when explicit type args are ever needed, BOTH go in. My
  page uses inference + base, so the failure mode is structurally absent; svelte-check
  clean is the receipt.
- **Grep-receipt law**: any broadcast/supply sentence must be preceded by a named-consumer
  grep. Wrote two rows differently BECAUSE of it (elevation/motion "no consumer" instead of
  "supplies descendants").

## Mistakes to avoid (chip round)
- Don't reuse a prior page's claim as a prior (the old chip demo's "radius 10" was pure
  coincidence rendered convincing — 10px stamped vs 8px corner was only visible because I
  probed a DISAGREEING value via `radius="medium"`).
- Don't trust a TokenTable inherited from a pre-ruling page: the `--jx-hit` row outlived the
  ruling that retired the hit lane by three changes. Token tables need the same
  "does the family read this var" grep as axis rows.
- `TokenTable`'s `source` prop accepts only density/color/component/structural — 'theme'
  ships a real svelte-check error (badge.html:341 carries the same standing one; not mine
  to fix on a sibling's page under review).

## Techniques (mine, added 2026-09-22, cascader 6-cascader)
- **The all-supply family gets a POSITIVE receipts table, not apologetic rows**: cascader's
  eight lanes paint NOTHING (zero `-effective` consumers in the family — grep receipt), so the
  axis section leads with that as the story ("seven stamp-and-supply-only + theme's one
  consumed voice"), and the TokenTable flips to "the fixed paint" — the constants the shells
  DO read, each with its equation. Documenting what the paint reads is as load-bearing as
  what it ignores; the table is the receipts column of the supply-only rows.
- **Theme rows need the alias-substitution half named at the BUILT-CSS level**: the shell face
  reads tokens.stylex aliases (`--jx-background: var(--background)`) declared at `:root,
  .xbpgcew` in the built sheet — a plain `.dark` re-declares the RAW layer only, so the
  inherited alias never re-substitutes. Source-read said "probably"; the built-CSS declaration
  selector plus the byte-identity probe (`oklch(1 0 0)` both) made it measured. The ring half
  flipped by exactly the −4° hue drift (142→138) — the theme-split law's "partial re-theme,
  measured" with both halves probed.
- **`--jx-text-base` vs `--jx-text` is a trap worth naming in the row**: the select reads the
  ruler's T_base CONSTANT (13px, not rung-scoped), not the density channel — the exact
  look-alike name that makes a wrong "density rescales the shell" claim sound right. The fixed
  TokenTable row spells the distinction out.
- **The density-invariant hit surface is probe-able from the page's own demos**: ambient (no
  rung) + sm panel + the query() panel at ≥64rem give three rungs on one page; one
  offsetHeight read each (35px === 35px === 35px) turns the a11y hit-floor note into a
  measured number instead of a hedge.

## Mistakes to avoid (cascader round)
- **The bare query() form DOES ship a type error for string lanes** — my chip note said the
  failure mode was "structurally absent" with inference + base; that's true only for NUMBER
  lanes (number ∈ the union). `query({ lg: 'large' }, 'small')` infers `QueryResult<string>`
  and fails assignment to `DensityLane` (caught 384:60 on the first svelte-check). String-lane
  query() needs the BOTH-generics form, always: `query<{ lg: DensityLane }, DensityLane>(…, …)`.
- **preserveHash constrains ToC surgery on legacy-mapped routes**: legacy-doc-routes.json maps
  the old `/components/cascader.html` here with `preserveHash: true` — survivor sections kept
  their ids (`usage`/`api`/`accessibility`/`cascader-demo`); only the dead ones (`types`,
  `theming`) were dropped. Deep-link audit = inbound grep + the manifest's preserveHash flag,
  not just the inbound grep.
- **A build between edit and built-dist gates is part of the task**: verify:docs-universal /
  verify:docs read dist; editing the page without rebuilding would "gate" a stale page. Order
  held: edit → probe → build (sibling-build `pgrep` first) → gates → specs.

## Techniques (mine, added 2026-09-22, component-canvas 7-component-canvas)
- **Read the PIN SPEC before choosing the props migration shape**: the ambient-vocabulary
  exemption pinned component-canvas#density BY ITS OLD LOCATION (the page's hand table). The
  generated-table migration moved the row into the curation's extra lane, so the pin scanned
  nothing (0 rows). Re-pinned with evidence: same ts-AST parser, same three facts, new target
  file + an additive theme-twin assertion. Lesson: `grep the test/ dir for the page name BEFORE
  the first edit` — pins are invisible in the page source but bind its rows.
- **The EXTRA-lane rescue now RENDERS (post-6900340b), verify it anyway**: mainRows exempts
  docs.extra by reference identity, but the receipt is still the served HTML — 'Stage preview
  density' ×1 and `'default' · Own default, not ambient` ×1 in the SSR. A rescue that doesn't
  render documents an absent prop, the exact drift the lane exists to kill.
- **Two-seats axis rows need the SSR-greppable hook named in the row**: the canvas density row
  says "grep any canvas root" for the `--jx-density-coefficient: 1` stamp (the prop's own default
  through the legacy slot) while the rung attr rides the stage — the row teaches the reader WHERE
  each half is visible.
- **A meta page (the canvas documenting itself) keeps its special demos**: the recursion workbench
  and the schema-driven six-lane demo ARE the documentation; tier 2 preserved them byte-honest and
  spent the rewrite budget on the missing skeleton (per-axis table, generated props, overview,
  install/see-also) instead of re-deriving tuned wiring.

## Mistakes to avoid (component-canvas round)
- **`data-axis-auto` renders as the STRING "true"**, not the bare-attribute empty string — a
  probe expecting `attr === ''` false-negatives on a true page claim. Svelte data-* booleans
  stringify; assert the value you can defend.
- **The icon family stamps `--jx-size-effective` on every glyph** (data-jx-icon svg, size prop)
  — hundreds of carrier stamps on a canvas-heavy page are ICONS, not canvas lanes. Identify the
  ELEMENT before reading a grep count (the -effective grep alone screams false alarm).
- **Shared-tree spec baselines drift**: canvas-same-source went 55→58 mid-task from siblings'
  accordion/badge PILOT joins, not from my diff. Attribute per-file counts before claiming
  regression or credit.
- **A pins check belongs in the pre-flight, not the post-mortem**: one failed gate (409/410)
  traced to a spec I never opened. The fix cost a re-pin round; a pre-flight `rg "<page-name>"
  test/` would have cost thirty seconds.
