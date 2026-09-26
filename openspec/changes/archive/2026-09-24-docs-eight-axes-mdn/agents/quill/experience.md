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

## Review craft (added 2026-09-22, checkbox 8-review)
- **The contrast cell is a claim too**: scribe's bare section promised "the wrapped cell's root
  carries data-density and the carrier style" — but the cell passed no lane, so ambient auto
  stamped neither half and the served bytes showed a bare `<div class="jx-field">`. Demo
  contradicting prose is the same disease as a false axis row; SSR-grep the DEMO cells, not just
  the prose's subject.
- **Re-deriving an inertness claim needs the positive control in the same probe**: stamping
  `--jx-density-coefficient: 1.5` on the wrapper (the component's exact declaration) proved
  nothing moved — but only the lg panel moving to 24px proved the measurement COULD detect
  movement. Inert + positive control + the grep that explains why (the coefficient composes at
  the declaring scopes) = a closed loop.
- **`--corner-shape` taught me to grep the DECLARATION, not just the read**: a page can truthfully
  say "reads var(--x, fallback)" and still lie by implication — "the site's token" when no site
  declares --x. `grep var(--x` finds consumers; `grep -- "--x:"` finds whether the token exists.
- **Svelte data-* booleans stringify** (`data-axis-auto="true"`) — learned in task 7, re-used
  here when asserting attribute presence in probe expectations.

## Techniques (mine, added 2026-09-22, task 9 — chip fix + date-picker)
- **The theme-split single-element proof**: don't compare the same var across two islands (the
  site's live --brand-hue ticks between reads and fakes a diff) — read BOTH vars at ONE element
  inside the dark island. date-picker's cell: `--primary` = the dark formula (flipped),
  `--jx-primary` at that same cell = the light formula (frozen at :root). Two vars, one element,
  the split proven without cross-element noise.
- **Inertness probes must name the wrapper kind**: coefficient 1.5 on an AMBIENT wrapper →
  unmoved (the number-lane claim); the same stamp on a NAMED-RUNG wrapper recomposes (the rung
  scope block re-declares the channels AT the wrapper — it IS a declaring element). The
  component never renders rung+non-1 coefficient (the reset stamp is atomic), but a probe that
  hits the wrong wrapper kind reports a false violation. Check `data-density` before stamping.
- **The composed-consumer law has a negative half worth naming**: date-picker's panel reads the
  surface pair `var(--jx-elevation-shadow, none)` but the FAMILY never stamps the pair (toast/
  terminal-card/press-button do) — "the consumption pair exists, the stamp doesn't" is a sharper
  supply-only row than a bare "no readers".
- **`Popover API` ≠ the popover family**: date-picker composes the native popover attribute +
  jx-surface vocabulary directly. Say which components are NOT in the chain when the family
  smells composed — the regression-sensitive area stays untouched and the reader stops looking
  for coupling that isn't there.
- **Shared-tree gate etiquette, task 9 edition**: a build blocker from a sibling's mid-edit page
  (breadcrumb canvas self-containment) is reported with the exact RolldownError + file mtime, the
  stale-dist gates run with the staleness caveat, and the page truths ride the dev-SSR receipts.
  Don't fix the sibling's file; don't block on their keyboard.

## Techniques (mine, added 2026-09-22, dropdown-menu 10-dropdown-menu)
- **A consuming family's radius row has TWO proofs, show both stamps**: dropdown-menu stamps
  `--jx-radius-consumed` with a DIFFERENT formula per lane state — explicit = effective × factor
  (the menu is the concentric anchor), auto = the §3 concentric calc verbatim as the css
  fallback. Both formulas are greppable in the raw SSR side by side, and the probe measures the
  honest outcome of the auto form (border-radius 0px at root invariants — a documented zero, not
  a bug).
- **Elevation's consumption pair lives on the BODY, not the shadow layer**: first probe read
  `[data-jx-menu-shadow]` (none — the veil paints elsewhere) and called the family inert; the
  pair rides `.jx-surface-body` (fill + box-shadow). Read the element the css law names, not the
  element whose name sounds right.
- **THEME-SPLIT can split WITHIN one widget**: dropdown's panel flips (raw --popover-foreground/
  --ring/--destructive pair) while its own trigger stays frozen (--jx-background/--jx-border
  aliases) — trigger and panel visibly diverge under one theme="dark". The byte-identity control
  (trigger bg identical light/dark) + the flipping bezel is a two-element proof.
- **The ambient matrix pins travel with the table migration**: moving a props table to
  meta-driven leaves the matrix's table[0] entries orphaned (the parser skips meta calls by
  design) and — if the page is in the bijection domain — the new per-axis hand table becomes the
  FIRST axisRows candidates inside it. The honest refresh: remove the orphaned entries (facts
  now gated meta-side + by the universal manifest), exempt the mechanism table scoped to the
  route (the inline-code#variant precedent), keep every still-true entry. Write the rationale
  into the exemption comment — the fixture is JSON, the spec is where the evidence lives.
- **A primitive page demonstrates its own composer for free**: the canvas dock mounts 21
  dropdown-menu instances at density xs on the very page (7 axis menus × the 3 dock-bearing
  canvases — corrected 14→21 per marginalia's 1st review; the count grows with every
  dock-bearing canvas the page adds) — the SSR grep of their panel stamps is
  a composed-consumer receipt that costs nothing.

## Techniques (mine, added 2026-09-22, task 11 — cascader fold + empty)
- **TokenTable has two dead lanes for structural rows — feed the Default cell**: `sourceLabel`
  maps only density/component/color ('structural' → '') and `description` never renders. The
  badge-ladder fold: drop the `source` field (the `tokens.some(t => t.source)` guard then removes
  the whole empty column) and write each fact into the Default cell. Merge rows that share a
  fact family (--space-6/--space-10; the label pair) — fewer rows, zero dead cells.
- **The theme axis has THREE measured poles now**: checkbox full-flip (raw reads), cascader
  ring-only (one raw voice), empty full-frozen (zero raw reads — the .dark stamps and nothing
  changes). The frozen pole's receipt is the byte-identity probe: light and dark figures
  identical on bg/border/color/size while `.dark` stamps only one of them. A documented absence
  with a grep + a measurement beats an invented flip.
- **A leaf family's composed-consumer receipt is NEGATIVE twice**: no component mounts it (grep
  the tree) AND its own composition is consumer-side (the snippets). Say both; the reader stops
  hunting for a composition chain that doesn't exist.
- **Rewrite checklists need the helper inventory**: dropping a page's script section silently
  dropped its `cx` helper while the markup kept calling it — 30 svelte-check errors caught
  pre-gate. When a rewrite preserves markup idioms, inventory the script-level helpers the
  markup depends on before deleting anything.

## Techniques (mine, added 2026-09-22, task 12 — heading)
- **The size axis can consume THROUGH ITS OWN STAMP, not family css**: stampCarriers
  emits `font-size: var(--jx-size-effective, 1rem)` inline NEXT TO the var, and where
  the stamp lands on the element that also carries the family's class font-size, inline
  wins the cascade — an explicit lane REPLACES the local size grammar (heading's em
  rung), auto restores it. Read the stamp's emission before declaring an axis
  supply-only: the §11 carrier is two declarations, and either can be the consumer.
  The grep receipt still says "zero family css readers" — true and beside the point.
- **The theme partial pole has a fourth shape — the SEAM**: heading flips exactly one
  voice because its ink is a var-FALLBACK chain (`var(--jx-ty-ink, var(--foreground))`):
  standalone, the raw fallback flips under a scoped .dark; inside a gradient prose
  face the presence-gated --jx-ty-ink declaration (prose.css) pins the ink and the
  island can't take it. Same DOM, two ink regimes, decided by an ancestor attribute —
  document the gate, not just the flip.
- **A look-alike warning can be a red herring — run the grep anyway**: the brief
  flagged --jx-text vs --jx-text-base for heading; the family reads NEITHER (zero
  kernel-channel hits). The 30-second grep converts "watch for" into "absent, with
  receipt" — and found the REAL story (the inline font-size stamp) next door.

## Techniques (mine, added 2026-09-22, task 13 — hero-section)
- **THE THEME POLE'S SPLIT CAN RUN ALONG THE EMISSION FORM, not the selector
  list**: two voices of the same component flipped under a scoped .dark while a
  third froze — and the deciding fact was HOW each color was written. Raw
  `var()` strings in the atom (`color: 'var(--primary-text)'`) substitute at
  the CONSUMING element → flip. `tokens['--jx-muted-…']` (stylex defineVars)
  emits an alias declared at the stylex :root theme scope → resolved THERE,
  inherited already-substituted → frozen under any downstream scope. The
  var-chain probe (section-level `--muted-foreground` flips while
  `--jx-muted-foreground` stays byte-identical) is the receipt that separates
  "alias freeze" from "slot block absent". Expect this wherever tokens.stylex
  defineVars and raw var() strings coexist in one family.
- **"Supply-only" needs a second question: does the STAMP's host host anyone?**
  A carrier can be unread by the family css AND still matter — hero-section's
  density is invisible on the hero's own atoms (zero channel reads) yet moves
  every composed guest (CTA 13→12px, badges 12→11px at the sm rung) because
  the rung scope IS the section root. For host/composer families, measure the
  guests, not just the host; caption "supply-only on self, consumed by
  composition".
- **An explicit-size stamp can be REAL and INERT at once** (the heading
  contrast): the stamp moves the section's computed font-size (14px exactly)
  while nothing follows — fixed-scale typography (rem floors/caps, cqi fluid,
  px micro steps) gives an em-of-parent law nothing to scale. The probe pair
  needs the control: section voice MOVES (stamp detectable), paint voices
  DON'T (inertness proven) — one panel pair, two assertions.
- **A probe failure against my own brief is the discovery** (twice now): r1's
  "summary did not flip" falsified the three-voices hypothesis in one
  assertion. The page then teaches the measured law with the var-chain
  receipt instead of the invented one. Keep the failing assertion visible in
  the report — it's the audit trail of the correction.
- **Test pins change the task shape before the first edit**: hue-injection's
  byte-identical mirror pin (family = registry copy) ruled the task
  docs-only; the docs-ambient carriers set and the terminal-patterns fixture
  supplied the composer receipt for free. Grep test/ FIRST is not ceremony —
  it redraws the boundary of what may be touched.

## Techniques (mine, added 2026-09-22, task 14 — dropdown-menu post-review fix)
- **ALWAYS-STAMPED OWN DEFAULTS DECIDE FILL ATTRIBUTION**: when a family's
  Defaults slot carries an own default (dropdown-menu's elevation level2), the
  carrier stamp is UNCONDITIONAL — so the consuming css's fallback chain
  (`var(--jx-elevation-surface, …, var(--popover))`) never reaches its last
  var. Attributing the paint to the fallback token (--popover) reads the chain
  backwards. The check is one render of the resolve: if the own default
  resolves without an explicit prop, the fallback is documentation, not paint.
- **GREP RECEIPTS FOR PROSE COMPOSER CLAIMS NEED THE IMPORT PATH IN ALL ITS
  SPELLINGS**: my task-10 composer grep pattern matched `$lib/ui/dropdown-menu`
  and missed breadcrumb-dropdown's RELATIVE import ('../dropdown-menu/…') — so
  a real composer was dropped and two non-composers padded the list (reviews
  caught it). When a sentence asserts "all mount it", grep the COMPONENT NAME
  against an import-shape-agnostic pattern (any 'dropdown-menu' occurrence in
  an import line), then name files in the docs prose without line numbers
  (lines go stale; the report keeps them).
- **A CURL-CHECKABLE CAPTION POINTS AT THE STAMP, NOT THE LOOK**: "renders
  identically to omitted" captions are unverifiable from the SSR bytes; point
  the reader at the style-attr carrier instead ("inspect the panel's
  --jx-elevation-effective: 3"). Own-default presence IS the checkable fact.
- **The shadow recipes' theme flip is part of the elevation story, not the
  color story**: the §7 pair re-declares per profile (black hsl at light,
  WHITE hsl at dark — measured rgba(255,255,255,0.16)), so a family that
  stamps an elevation recipe flips a voice even though it reads no "color"
  token. Enumerate FLIPS by following the stamped vars to their declaring
  blocks — not by grep for color-looking names.

## Techniques (mine, added 2026-09-22, task 15 — image)
- **A MISSING META CAN BE A PINNED TRUTH, NOT AN OVERSIGHT**: image had no
  image.meta.ts, and generating one would have failed the ambient-vocabulary
  carriers bijection ('image' is not in expectedCarriers — the set IS the
  fleet's vocabulary decision). Before running a generator, check whether the
  artifact's absence is load-bearing in a spec. The docs page kept the hand
  table + `universal` directive (the marker the universal gate counts); the
  meta + set-expansion is recorded as one fleet follow-up that must land
  TOGETHER.
- **THE FROZEN POLE'S PUREST FORM IS ALL-ALIAS**: image's broken panel reads
  only defineVars aliases (--jx-muted/--jx-muted-foreground/--jx-border), so
  unlike hero (raw-var accent flips + alias lead freezes) NOTHING flips —
  the theme split's third shape: declaring-selector (empty: zero raw reads),
  emission-form-mixed (hero), emission-form-pure (image). The var-chain
  receipt is the same instrument every time: the raw sheet var flips on the
  element, the alias doesn't, and the face stays byte-identical.
- **LAZY MEDIA BREAKS FAILURE-STATE PROBES**: loading="lazy" images outside
  the viewport never load, so onerror never fires and the failure swap never
  renders — a probe that measures a failure posture must scroll the subjects
  into view and waitForFunction the swap. Corollary: SSR shows every demo as
  the loading root; failure markup exists only client-side, so "raw-bytes"
  receipts for failure states come from the live DOM, not the SSR payload.
- **"ON X'S PROVEN LAWS" IS A LAW KINSHIP, NOT A COMPOSITION**: the image
  header credits avatar, but no import exists either direction (shape-agnostic
  grep). Composers are import edges; law kinship is prose. Name the edge when
  you mean the edge, and credit the law when you mean the law — composers
  lists that mix the two rot the way dropdown-menu's did.

## Techniques (mine, added 2026-09-22, task 16 — inline-code tier 3 + heading cx fix)
- **TIER IS DECIDED BY THE PAGE'S PIN DENSITY, NOT ITS GAPS**: inline-code
  looked like a normal archetype completion until the pre-flight found its
  variant row is invariant-locked IN THE PAGE'S OWN HAND TABLE
  (axisRowsOf(pageSource) must find exactly one row with the canonical cell),
  its table ordinals feed the frozen matrix multiset, and a spec extracts
  registry paths from its source. Switching to the generated meta would have
  deleted the pinned row and failed three ways. Read the pins BEFORE choosing
  the tier — a canonical page's remaining gaps (Install/Overview/SeeAlso) can
  be closed without touching a single pinned expression.
- **AXISROWSOF COUNTS TABLE EXPRESSIONS BY SOURCE ORDER**: any new props={…}
  array — even an innocent summary table — shifts every later tableIndex and
  moves candidate keys against the frozen matrix. Archetype completion on a
  matrix-pinned page means PROSE ONLY, or a same-change fixture update.
- **THE CX PREDICATE IS A ONE-LINE FLEET SWEEP**: the avatar 2c185457 template
  (.filter(Boolean) → the style-is type-guard) converts a standing
  diagnostics page to zero with zero behavior change. Heading and inline-code
  both landed this round (fleet 1623→1619); the remaining count is other
  pages' standing idioms — same template applies wherever a page is touched.
- **A MID-FLIGHT SIBLING CONVERSION SHOWS UP AS YOUR SPEC RED**: the working
  tree can hold a half-landed meta conversion (page rewritten, matrix fixture
  half-updated) — the frozen-matrix test then fails on THEIR route keys.
  Attribution is mechanical: the failing assertions' keys name the route; run
  git status/diff --stat, cite the in-flight files, and leave their files
  alone. Report the red with the key list so the coordinator can see it
  resolve at their integration.

## Techniques (mine, added 2026-09-22, task 17 — input-group)
- **THE §1 FORWARDING RULE IS NOT AXIS CONSUMPTION**: the W3-era summary
  "consumes size and color: the native element never receives them" merged
  two unrelated halves — the collision rule (the native element never sees
  the attributes: a FORWARDING fact) and consumption (a css-READ fact). Every
  consumption claim must cite the var read (file:line), not the attribute
  omission. The greps here disproved size AND color consumption on a page
  that had taught the claim for weeks.
- **COMPOSER FAMILIES SPLIT THE AXIS STORY IN TWO: on-self vs through-the-
  subtree**: input-group's density is CONSUMED (its own atoms read the
  re-based channels) AND PROVIDED (inherit-then-provide, the r11
  eager-capture contract) — while size/color/elevation are supply-only on
  self yet real through the composed children. The per-axis table's unit of
  measurement is the FAMILY, not the root element: "zero readers" needs the
  qualifier "and here is who feels the supply" (the addon children) or it
  reads as an absence.
- **THE EMISSION-FORM SPLIT CAN LAND ON ONE BEZEL**: input-group's dark
  island flips the addon SEAM and the well shadow (raw css reads) while the
  base bezel and ground freeze (defineVars aliases) — a visible
  two-regime boundary across a single 1px joint. The probe asserts each side
  with its own direction (seam MUST differ, bezel MUST be equal) — an
  inverted expectation on a frozen voice reads as a pass/fail bug, not a
  discovery. Write frozen-voice assertions as equality-with-receipt
  (the var chain), never as difference.
- **RENDER-SMOKE TIMING JITTER IS A BEFORE-STATE FACT TO CLEAR SOLO**: the
  form-family smoke timed out at 5.9s in the parallel before-run and passed
  3/3 solo seconds later. Attributing a jitter red to the sibling (or to
  yourself) without the solo re-run wastes a round; the before/after ledger
  should record "cleared solo" as the baseline entry.

## Techniques (mine, added 2026-09-22, task 18 — hero/image MAJOR package)
- **"NEVER FLIPS" HAS A BENIGN TWIN: "NEVER FLIPS IN THE CHECKED MEDIUM"**:
  the hero query demo was reported dead, but the three-state live measurement
  (resize → class + color → resize back) showed it flipping both directions —
  the report's likely false-negative medium was the SSR bytes or a
  pre-hydration read, where §9.1's base-first-paint semantics guarantee the
  BASE always. Query-reactivity findings must state WHICH medium was checked
  (raw bytes / pre-hydration / post-hydration live) and the demo captions now
  carry the §9.1 first-paint note so reviewers measure the right state. The
  engine's reactive substrate is auditable in one grep: liveMediaMatches
  reads the mediaTick $state inside the family's $derived frame.
- **A FAILURE-PATH DEMO MUST DEMONSTRATE ON THE BRANCH THAT CARRIES THE
  CLAIM**: image's query demo passed a fallback snippet, but the snippet
  branch renders consumer markup ONLY — no family root, no stamp — so any
  "the panel's data-density moves" claim was structurally false. When a
  component has exclusive render branches (failed+snippet / failed-default /
  ok), each demo claim must name its branch and the demo must mount ON that
  branch. The fix (drop the snippet → the default frame's panel carries
  data-density) was verified by the flip measurement, not by re-reading the
  caption.
- **A FROZEN-VOICE ASSERTION IS AN EQUALITY WITH A RECEIPT**: the input-group
  bezel check inverted the expectation (flagging equality as failure) — for
  emission-form-frozen voices the pass condition IS byte-equality across the
  island, receipted by the var chain (raw var flips on the same element; the
  alias doesn't). Write the direction of each assertion from the claim, then
  re-read the claim before trusting the red.
- **LOAD-AVERAGE IS PART OF THE GATE REPORT**: at load 28-59 a 5s render
  timeout is environmental noise (two agents' vitest + build concurrently);
  the honest ledger entry is "cleared solo / with --testTimeout=30000" plus
  the load reading — and build failures get route-level attribution from the
  prerender log (a single carousel 500 with zero errors on your pages is the
  sibling's in-flight state, cited by their diff stat).

## Techniques (mine, added 2026-09-22, task 19 — color-picker 2nd review)
- **REVIEW RE-DERIVATION IS CHEAP AND DECISIVE WITH THREE INSTRUMENTS**: the
  grep (zero -effective readers), the computed-var read on the live element
  (the root's style attr byte-exact; --primary's calc(H − 4) visible in
  getPropertyValue), and the rung-stamp sweep (set data-density, read the
  ruler, unset). All three fit one probe file; every marginalia receipt
  re-derived in a single run — the review's authority is the independent
  instrument, not the trust.
- **THE −N IN AN EXTRA-ARITHMETIC ACCOUNT HAS TO BE NAMED IN CODE**: the
  color-picker account settled as 24 meta − 8 axes − 4 = 12, where the 4 is
  the curation's hide:true set (id/data-density/class/rest — the checkbox
  heritage precedent). Scribe's "27−3" was a transient intermediate meta plus
  a smaller hide set. The settlement instrument: parse the COMMITTED meta
  (count + duplicate check), parse the SSR rows (what actually renders), and
  only then read the reports. The archive keeps both numbers; the ledger
  keeps the one the committed meta supports.
- **A PAGE-SIDE FLAG MUST NAME THE LIVING COPY OF THE STALE CLAIM**: "the old
  claim retires" is incomplete when the stale sentence survives somewhere
  readable — name the file and the block (color-picker.svelte's size/color
  interface comments) so a grepper holding the stale claim finds the
  correction at the flag, not a dead end. Family-mirrored comments get
  flagged page-side, never edited tree-side (the mirror law outranks the
  tidy-up).
- **--testTimeout IS THE SOLO-RUN HYGIENE UNDER SIBLING LOAD**: load 28-59
  makes 5s render-smoke timeouts meaningless; the solo re-run passes at 30s.
  Record the timeout bump in the gate ledger — an unexplained timeout bump
  reads as a regression and costs the coordinator a round.

## Techniques (mine, added 2026-09-22, task 20 — link)
- **EM VOICES ARE HOW A TYPOGRAPHY PRIMITIVE CONSUMES SIZE**: link declares
  no font-size atom, so the §11 stamp sets the anchor's font-size and
  everything em-voiced follows — the inherited label text and the 0.8em
  glyph — while the FIXED optical voices (4px underline offset, −0.125em
  shift) refuse to scale. One element demonstrates consumption and refusal
  at once; measure both and the row teaches the no-font-size kinship with
  numbers instead of adjectives.
- **A PAGE CAN BE PAST THE ARCHETYPE IN ITS CRAFT SECTIONS AND STILL MISS
  THE MEASURED LAYER**: link's lanes/icon/detection sections were
  review-grade prose, yet the universal section still carried
  movement-implying panels and no receipts. Tier 2 on such a page = keep the
  craft sections untouched, add the measured axes layer, retire only the
  false-implying demos.
- **THE RAW-CODE CANVAS LANE REMOVES THE close DODGE — UNTIL YOU ADD A HAND
  STRING BACK**: a page whose usage strings all come from resolveRawCode
  never defines `const close`; the first hand-written template literal with
  a `<script>` block reintroduces the closing-tag hazard and the undefined
  const at once. When adding a hand string to a resolveRawCode page, bring
  the splice const with it (the dev 500 is immediate and names the line).
- **SUB-PIXEL COMPUTED STYLES NEED A TOLERANCE, NOT AN EXACT MATCH**: 0.8em
  of 14px computes to 11.1875px used width in Chromium, not the nominal
  11.2 — assert |computed − nominal| ≤ 0.1px or the probe red is a rounding
  artifact wearing a failure costume.

## Techniques (mine, added 2026-09-22, task 21 — native-scroll-area)
- **THE FOURTH THEME MECHANISM: THE LANE'S STAMP AS A SCOPE THE FAMILY'S OWN
  OBSERVER CONSUMES**: native-scroll-area's theme lane doesn't drive css
  substitution at all — its .dark stamp on the outer root IS a stage scope,
  and the family's scheme observer (a MutationObserver over the ancestor
  chain) resolves it into data-scheme on the viewport so the PLATFORM bar
  re-schemes live. Consumption by family STATE. The three css-side patterns
  (declaring-selector, emission-form mixed, pure-alias frozen) all still
  apply where css reads exist (the focus ring is the family's one raw read);
  the probe asserts both layers: data-scheme/color-scheme for the observer,
  the ring for the css.
- **THE DECLARATION LAW IS MEASURABLE INSIDE YOUR OWN DEMO**: the first
  caption claimed the content "inherits the stamp" — my own demo rows
  (a 12px utility) falsified it live. Declared voices beat inheritance; the
  stamp reaches only unstyled flow. Fix the caption to the measured truth
  and the demo teaches TWO laws (the inheritance reach AND the declaration
  precedence) instead of one convenient fiction. When your demo fixtures
  carry their own styling, the fixture is part of the claim.
- **KINSHIP BY KIT, NOT BY IMPORT**: native-scroll-area shares the
  scroll-area-kit core with the hand-drawn sibling — zero component imports
  either direction. Composer greps answer "who mounts it"; kit greps answer
  "who shares my vocabulary". The button-group overflow hypothesis was the
  second kind of false positive: a shared WORD (overflow) over a different
  system (wrap/collapse layout, r13). Grep the mechanism, not the term.
- **WRITE-THEN-VERIFY APPLIES TO THE LAST WRITE (the integration-block
  incident)**: my gates ran green on page state N, then the theming-fold
  python splice (state N+1, the final write) deleted the adjacent API
  section — the page's only `universal` marker — and I reported N's green
  as final. The coordinator's integration run redded 109/110. Two fixed
  habits: (1) the gate suite re-runs after EVERY write, especially the
  last; (2) a deletion-based splice asserts the section inventory that
  must SURVIVE (id= census before/after), not only the seams it meant to
  move — the fold's end-anchor over-ran one section past its target.
- **THE 110-GATE READS BUILT dist BYTES — A STALE DIST MIMICS YOUR
  REGRESSION**: post-restore, docs-universal STILL redded with my page's
  name because a sibling's in-flight parse error broke the build, so the
  gate re-read the pre-restore dist. Attribution rule for gate RED on a
  shared tree: check the gate's INPUT FRESHNESS (build exit code) before
  accepting the named page as the culprit — and never repair the sibling
  file; poll until it clears, then build fresh. Symmetrically: a green
  gate on a stale dist proves nothing about your last write either.
- **SPECS-SOLO NUMBERS ARE A MOVING TARGET ON A SHARED WORKTREE — KEYS,
  NOT COUNTS**: my 6-file run went 211 → 470 tests between runs (sibling
  conversions added suites) and returned 2 failures, both keyed
  `file-input|1|variant|1` — a sibling's in-flight page edits caught by
  the frozen matrix. The reportable unit is the failing-KEY set (mine:
  empty), plus the mtime/git-status proof the failing files are not in
  your diff scope. A raw "468/470" without key attribution reads as your
  failure; with attribution it reads as the tree's.

## Techniques (mine, added 2026-09-23, task 22 — navigation-menu)
- **CONSUMPTION ONE PROMOTION AWAY (the popover-panel channel)**: a family
  whose root stamps carriers and whose FLOATING PANEL reads them through
  popover.css makes radius/shape CONSUMED even though the bar itself
  paints no corners — the top layer moves paint, never DOM, so the
  promotion-kept inheritance delivers the carrier. Measure on the OPEN
  panel (open it from the probe via the trigger click); the closed
  popover's computed styles lie (display:none subtrees still compute, but
  the anchored geometry claims need the open state anyway).
- **THE HUE-INJECTION RED HERRING**: a first probe pass read the current
  link's hue drift (27° → 33°) under a dark scope as the ink flipping —
  false. The docs stage injects per-panel hues that drift on the
  wall-clock (the color-picker task 19 hygiene), so two links in different
  demo panels NEVER make a clean A/B. The clean theme signal is the IDLE
  ink (a neutral token, no injection): identical computed values across
  scopes = the alias froze; differ = flipped. Measure theme splits on
  neutral tokens; treat hue readings near injected elements as noise
  unless the probe holds position constant.
- **THE COEFFICIENT'S DECLARATION-SCOPE FREEZE**: a number density lane
  stamps --jx-density-coefficient on the family root, but the kernel
  lanes (--jx-text etc.) are CALCULATED at their declaring [data-density]
  scope — custom properties compute at the declarer, so the stamped
  coefficient never re-enters the calc. Measured: coefficient bar's
  entries byte-identical to ambient. A coefficient only moves consumers
  that read the carrier at or below the stamp. Don't write "scales the
  entries" for number-density families without this measurement.
- **THE MATRIX RE-PIN IS PART OF THE AXES CONVERSION**: moving a page to
  the axes archetype shifts PropsTable call-site indices (the axes
  mechanism table takes slot 0), which unpins the frozen ambient-vocabulary
  matrix. The avatar/color-picker precedent: re-pin the moved entries
  (tableIndex only, cells unchanged) + add scope-marked entries for any
  axis-named rows the universal table gained, with the re-pin note naming
  the task. An identifier-reference mechanism table (props={axisRows})
  needs NO exemption — the AST parser only reads inline arrays; the
  dropdown-menu task 10 exemption was for an INLINE array.
- **STRING-LANE query() NEEDS THE LITERAL GUARD AT THE CALL SITE**:
  query({ md: 'lg' }, 'sm') widens to QueryResult<string> and reds
  svelte-check against DensityLane props — `as const` on BOTH the case
  and the base (the both-generics law's lightweight form).

## Techniques (mine, added 2026-09-23, task 23 — review badge-indicator)
- **REVIEW PROBES NEED NO COMPONENT MOUNTS — INJECT THE MECHANISM**: the
  theme-split claim (typed alias freezes / raw token flips) is verifiable
  without a served dark demo: inject a plain `.dark` div via page.evaluate,
  hang two children reading var(--destructive) vs var(--jx-destructive),
  read computed backgrounds. The served css IS the mechanism under test.
  Same for viewport discipline: an explicit-rung claim receipts at two
  viewport sizes (identical values prove scope-driven, not media-driven).
- **THE BRIEF CAN MANGLE THE CLAIM — REVIEW THE SERVED TRUTH**: my task
  text said "rest row served"; the page's own no-rest note, the author's
  report, and my 14-row served-DOM enumeration all say NO rest row (the
  −1 in 15−8−1 is class, the rest identity). File the correction against
  the BRIEF with the enumeration receipt — the ledger must not inherit
  the mangled phrasing, and the page must not be "fixed" toward it.
- **A CLAIM'S MEASUREMENT MAY LIVE OFF-PAGE**: "measured 10px under an
  18px mirror" (the size echo's riding half) has no served demo — verify
  it by SOURCE (the carriers land on the wrap element only) + ANALOG
  probes (the density wraps show the chip's atom winning inheritance).
  That is review-sufficient; note the missing demo as a NIT, not a
  defect — the page teaches the law, the probe scripts hold the numbers.
- **IDLE/NEUTRAL TOKENS ARE THE CLEAN A/B FOR THEME CLAIMS**: the current
  link's hue drifts per-panel (hue injection), so compare the IDLE ink or
  a pure variable read across scopes; anything hue-bearing near an
  injected scope is noise (the task 22 lesson, now the standing rule).

## Techniques (mine, added 2026-09-23, task 24 — popconfirm)
- **A CLAIMED PROP CLOBBERS THE AUTO-WIRE (the served dead-trigger
  defect)**: a family's $effect setAttribute on a CHILD COMPONENT's
  button dies when that component declares the same attribute as its own
  prop — Svelte's reconciliation removes the claimed-but-undefined
  attribute on the next re-render (PressButton's press state flips on
  the very click that should open the panel). Diagnostic signature:
  the effect's OTHER attributes survive (aria-controls) while the
  claimed one reads null. Page-side fix: the EXPLICIT wire (stable id +
  the component's own passthrough prop); family-side: owner's call.
  Probes must click-and-assert :popover-open — an aria-expanded mirror
  can read true while the declarative wire is dead.
- **PORTAL LAW vs PROMOTION-AWAY — CHECK THE DOM SHAPE FIRST**: two
  popover families share one consumption law with different delivery:
  navigation-menu's bar stamps and .jx-pop reads through DOM
  inheritance (promotion-away); popconfirm's anchor and panel are
  SIBLINGS, so the carriers stamp the PANEL itself (self-carried — the
  source calls it the portal law). The tell is the markup shape: is
  there a common ancestor element to hang the stamp on? Same css law
  verbatim in both sheets; different carrier delivery.
- **THE STALE-TOC-ID AUDIT**: old-generation ToCs can reference ids no
  section ever shipped (popconfirm's 'popconfirm-base') — the toc==DOM
  check must assert BOTH directions: every toc id resolves AND every
  section id appears (in order) in the toc data, chrome ids excluded.
- **SYNTHETIC EVENTS CANNOT DRIVE UA-INTERNAL PATHS**: dispatching a
  KeyboardEvent('Escape') on an open popover does nothing — the light
  dismiss is the UA's internal close-request handling, not a keydown
  listener. Probe platform-owned behavior through the platform (the
  cancel button, hidePopover()) or pin it at the spec level; don't
  report the synthetic silence as a defect.

## Techniques (mine, added 2026-09-23, task 25 — review ghostty-term)
- **"FROZEN" HAS TWO MECHANISMS — ALIAS-FREEZE AND BOOT-TIME-SNAPSHOT**:
  the ghostty theme claim said "every painted voice is a TYPED token", but
  the canvas shell resolves the RAW --terminal via getComputedStyle at
  boot/repaint (no scope observer) — its "holding inside a dark scope" is
  a boot-time snapshot, not the alias freeze; a component BOOTED inside
  the dark scope would paint the dark pole. When a page claims frozen,
  ask WHICH mechanism: (i) typed alias computed at :root (css, permanent),
  (ii) one-time JS probe of a raw token (temporal — holds only until a
  re-resolution trigger), (iii) no observer (scope flips after capture
  move nothing). The measured claim can be true under all three while the
  attribution differs — precision findings go to the attribution.
- **CANVAS PIXELS ARE PROBE-READABLE — USE THEM**: a wasm/canvas
  component's painted ground is not behind computed styles; the family's
  own canvas accepts getImageData (same-origin, default context). Sample
  a corner pixel before/after a scope mutation and the "what did the
  terminal actually paint" question settles in one read — no screenshot
  pipeline, no vision agent.
- **THE INJECTED-ISLAND A/B FOR SCOPED-THEME CLAIMS, GENERALIZED**: move
  the LIVE element into a .dark island (insertBefore + appendChild),
  measure before/inside, remove. Reading the claimed variables at the
  SAME element in both scopes isolates the css mechanism (rootBg held,
  --terminal flipped) from the paint mechanism (canvas pixels) — one
  evaluate, no component mounts, no state to restore beyond DOM
  re-parenting.
- **THE BIJECTION UNIVERSE IS tasks.md, NOT THE MATRIX**: a page outside
  the frozen batch lists (popconfirm, and the remaining CODE stretch) can
  carry axis-named hand rows without matrix coverage — the ambient spec
  cannot see it. Check tasksUniverse membership BEFORE assuming a re-pin
  or an exemption is owed; the exempt-with-note path only applies to
  batch-listed pages.

## Techniques (mine, added 2026-09-23, task 26 — review file-input)
- **ARIA-HIDDEN MARKS MAKE VISUAL-FUSION FINDINGS VANISH — MEASURE THE
  ANNOUNCEMENT, NOT THE TEXTCONTENT**: a decorative "!" span carrying
  aria-hidden="true" is excluded from the accessible-description
  computation, so "!1 dropped file rejected" in DOM textContent announces
  as "1 dropped file rejected" — clean. Before filing an announcement
  fusion finding, walk the subtree excluding aria-hidden (a six-line
  approximation) or snapshot the a11y tree; textContent alone over-reports
  defects.
- **A GATE THAT HOLDS IN ONE COMPOSITION AND LEAKS IN ANOTHER IS STILL A
  LEAK — AND TWO REVIEWERS' DIVERGENT RECEIPTS ARE DATA, NOT NOISE**: the
  drop gate rejected marginalia's mixed png+txt drop and admitted my
  txt-only AND mixed drops (7 reproductions, fresh loads). Isolate by
  composition (mixed / txt-only / sequential), by order, and with a
  capture-phase stopPropagation (blocking the entry proves the path);
  when the compiled code shows the gate yet the behavior leaks, report
  the repro recipe verbatim and route the mechanism to the Owner — do
  not paper over the divergence to keep a verdict clean. Verdict
  vocabulary: the PAGE passes (its prose can't fix the family), the
  FINDING is family-grade MAJOR with the adjudication recipe.
- **ROW-STATE CLAIMS NEED PRECISE CENSURE**: "the rejected file never
  entered" must be tested by COUNTING rows and naming them — a boolean
  `!!querySelector(row)` false-positives when an earlier accepted drop
  already rendered a row. Count + name-match every assertion.
- **THE DENSITY LADDER CAN BE VERIFIED AT THREE DEPTHS**: computed element
  values (zone min-height 63/72/90/108 — the strongest), token strings
  (--jx-file-h's max() branches carry 28/32/40/48 as raw digits — exact),
  and source calc structure (thumb box = knob + 2px). Where no element is
  served (rows need bound files), the token-digits + source-structure
  pair is an honest verification — say which depth each claim got.

## Techniques (mine, added 2026-09-23, task 27 — review kbd)
- **"FROZEN vs FLIPS" IS DECLARATION COVERAGE, NOT VALUE SHAPE**: both
  --jx-primary (frozen) and --jx-tonal (re-deriving) STORE var(--primary)
  streams — the deciding variable is where the alias is DECLARED. An alias
  re-declared at every theme scope (jixoai.css's :root/.jx-light/.dark
  block: --jx-fill/--jx-tonal/--jx-outline) re-runs substitution per scope
  and RE-DERIVES; an alias declared once at :root (the stylex theme
  emission, tokens.stylex) freezes the ambient pole. The taxonomy cut is
  typed-REDECLARED vs typed-ROOT-ONCE — vellum's literal-vs-stream naming
  had the right instinct and the wrong variable; my refinement rides the
  review as the adjudicated form.
- **THE CORRECTION MUST BE AUDITED EVERYWHERE THE FALSIFIED CLAIM LIVED**:
  a falsified-caption fix landed in the axes row + overview + workbench
  description while the SAME sentence survived verbatim in the demo's
  PlayHelp and (milder) in a section summary. Grep the page for the
  falsified CLAIM'S VOCABULARY (inherits / reading its size from), not
  just the exact string — the stale claim survives in paraphrase. The
  correction surfaces and the stale surfaces are different components of
  the same page; write-then-verify must enumerate ALL of them.
- **A DEAD CONST IS THE RESIDUE OF AN ABANDONED MECHANISM — READ IT AS
  DOCUMENTATION**: kbd's unused apiDensityRow const records exactly why
  the inline literal stays (the AST scanner reads object literals only, so
  a hoisted reference is invisible to the matrix pin while the universal
  fold eats the served row). The pin is satisfied at SOURCE level while
  the SERVED table diverges — matrix pins and served truth live at
  different layers; the api summary must describe the served layer.

## Techniques (mine, added 2026-09-23, task 28 — code reference)
- **THE INHERITANCE POLE IS A FIRST-CLASS AXES STORY**: kbd (own kernel
  voice, context-deaf) and reference (no paint surface, everything
  inherited) are the same eight-axis table's two poles. The inheritance
  family's verification is EASIER but must still be measured in two
  contexts (13.5px prose, 16px panel) and the §11 stamp must be shown
  beating the context (size={18} → 18px inside a 16px context) — the
  stamp consumes THROUGH the inheritance, which is a claim, not a
  default.
- **NUMBERED-DOMAIN REGISTRATION IS A SECTION DUTY, NOT A PROVIDER DUTY**:
  NumberingProvider supplies the document-level target registry, but a
  Figure only registers a referenceable target inside a NUMBERING DOMAIN —
  created by a numbered SectionCard. A provider+figure+reference rig
  without the numbered section degrades every reference to settled-missing
  (the old universal demo had this latent flaw). Rig recipe:
  NumberingProvider > SectionCard numbering="decimal" > Figure + p >
  Reference; the resolved text "Eq (1.1)" is the proof.
- **THE SSR/POST-SETTLE DUALITY NEEDS BOTH READS**: the reference family's
  contract is different bytes before and after settle — the SSR bytes
  carry the fallback anchors' edge claims (5 × data-ref-to), while the
  post-settle DOM releases the edge on missing targets (the loud span).
  curl the SSR AND probe the live DOM; either alone mis-describes the
  family.

## Techniques (mine, added 2026-09-23, task 29 — review menubar)
- **SYNTHETIC CLICKS DON'T FOCUS — KEYBOARD PROBES NEED REAL CLICKS**:
  el.click() toggles a popover without moving focus, so keyboard.press
  events dispatch to BODY and every downstream assertion reads dead.
  page.click(selector) (real hit-testing) focuses the button and the
  bar's keydown handler receives the arrows — the glide then measures
  exactly. The sibling lesson: page.click File → ArrowRight (one hop:
  next panel + inside-focus) → ArrowRight ×2 (dead) → Escape (closes +
  focus restores). Assert focus by tag/text/inPanel, never by "something
  is focused".
- **LEFTOVER UI STATE POISONS NEGATIVE PROBES**: "hover opened no panel"
  is only provable after closing every panel a previous step opened — a
  stale open panel reads as a hover-open cascade. Close-and-assert-zero
  before the negative probe, or run negative probes on a fresh load.
- **THE THIRD DOM SHAPE COMPLETES THE DELIVERY TAXONOMY**: stamp delivery
  to a floating panel now has three named shapes — promotion-away
  (nav-menu: bar stamps, .jx-pop reads through inheritance), self-carried
  portal (popconfirm: anchor and panel are siblings, the panel stamps
  itself), and wrap-IN-PLACE (menubar: the panel is a DOM descendant of
  the stamped bar — the simplest delivery, plain inheritance across the
  top-layer promotion). Classify a popover family by asking: where does
  the stamp land, and what stands between it and the panel?

## Techniques (mine, added 2026-09-23, task 30 — code scroll-virtual)
- **CSSOM SERIALIZES LARGE PX IN SCIENTIFIC NOTATION**: the virtual spacer's
  inline style reads `block-size: 4e+06px` for 4,000,000px once the browser
  re-serializes the attribute — a regex on the style string fails while the
  layout is perfect. Assert geometry with getBoundingClientRect().height,
  never by parsing the style attribute; expect the scientific form if you
  must read it.
- **ALIGN-START FIRST ROW IS window-start MINUS OVERSCAN**: scrollToIndex(N,
  align:'start') puts scrollTop at N×estimate exactly, but the first SERVED
  row is N−overscan (rows render before the anchor). Assert the anchor row's
  rect-top against the viewport top (delta 0) and firstIdx ≈ N−overscan;
  asserting firstIdx ≈ N fails a correct implementation.
- **STAMP VOCABULARY ≠ PROP VOCABULARY (the §4 legacy bridge)**: density=
  "small" stamps data-density="sm" — the legacy rung set is what today's CSS
  keys on, and densityRungOf passes rungs verbatim. Write page claims and
  probe assertions in the measured stamp vocabulary, or the claim reads as
  falsified when the family is behaving exactly per contract.
- **ENGINE-WRAPPER IS THE FOURTH DELIVERY SHAPE**: nav-menu stamps a bar and
  the panel inherits (promotion-away), popconfirm self-carries, menubar
  wraps in place — scroll-virtual owns NO root at all and FORWARDS the
  resolved lanes to a composed region (the region stamps, supplies and
  anchors). The probe proves it three ways: stamps land on the composed
  root, engine internals (spacer/rows) carry nothing, and the wrapper greps
  zero --jx-* readers.
- **FORWARD SEAMS CAN EAT LANES**: scroll-virtual passes radius through as
  `typeof d.radius === 'number' ? d.radius : undefined` — named steps die
  silently, and the surviving number lands as the W3-D2 THUMB chrome param
  (--jx-scroll-thumb-radius), not a corner axis. Read the composed target's
  contract before writing "FORWARDED" claims; the seam and the destination
  can each rename or drop a lane.

## Techniques (mine, added 2026-09-23, task 31 — code sheet)
- **KEYED EACH + UNNAMED ROWS = TOTAL PAGE WIPE**: PropsTable's
  {#each mainRows as prop (prop.name)} throws each_key_duplicate when law-table
  rows lack a name field — and the throw happens during client render, so the
  SSR DOM (which HAS the h1) is wiped and the page ships dead. curl-only checks
  cannot see it; a probe must read the POST-HYDRATION h1 count. The contract:
  law tables through PropsTable must map rows to {name, type, default,
  description} (the task-30 integration fix, now banked as the pattern).
- **THE PRINT FREEZE CLONE POISONS UNSCOPED QUERIES**: the paged-doc pipeline
  deep-clones the page into [data-print-output]; clones carry stale [open]
  attributes and print-context geometry (a cloned 18rem sheet measures 100vw).
  Every probe query/locator must scope to [data-print-source]; duplicate-id
  audits must separate the live tree from the clone.
- **SECTIONCARD AUTO-ANCHORS ITS H2 WITH THE SECTION SLUG**: a wrapper
  <div id="overview"> around <SectionCard title="Overview"> yields TWO
  #overview nodes (the H2 twin inside the wrapper) — fleet-wide, navigable
  (first match = wrapper), but the hard assert must expect the twin mechanism,
  not zero duplicates, until the fleet decides the fix.
- **WHEEL, NOT scrollTo, IS THE USER-PATH SCROLL PROBE**: docs pages scroll
  .jx-shell-body, never the window (window.scrollTo is a silent no-op), and
  showModal does NOT lock scroll — wheel over the ::backdrop chains to the
  page scroller. Measure the user path (page.mouse.wheel) against the real
  scroller, with a closed-page baseline and a post-close restore.
- **CANVAS HOST BEATS TOP-LAYER DIALOG WIDTH ATOMS**: identical class lists,
  different computed width (page-hosted 384px vs canvas-hosted 100vw) — a
  cssRules walk found no matching author rule, so suspect containment/runtime
  mutation. Workaround for demos: host modal-dialog panels outside the canvas
  (the trigger can stay inside). Defect receipt goes to the canvas owner.
- **PIXEL TRACES NEED force CLICKS + FIRST-OPEN KEYING**: data-reveal
  scroll-driven animations keep mutating boxes, so Playwright's actionability
  stability wait delays clicks by seconds and wrecks rAF sampling windows.
  Click with force (label-anchored), key the trace off the first frame where
  the target exists, and assert a moving-window (intermediate pixels +
  monotonic) instead of a mid-index guess.

## Techniques (mine, added 2026-09-23, task 32 — code skeleton)
- **DEAD UTILITY STRINGS IN DEMO PANELS STAGE ZERO-HEIGHT BLOCKS**: a demo
  panel that hand-writes `class="h-4 w-2/3"` renders NOTHING in the
  tailless tree — no producer exists for those class names, so the block
  computes 527x0 and the demo silently misrenders. The catch was the
  geometry assertion reading the rect, not the eye. Fix: re-host demo
  blocks on the family's real atoms (rt.skBar/skW32). Suspect siblings:
  any docs panel with rendered h-*/w-*/size-* literals (corpus sweep
  offered).
- **PULSE PROBES: SAMPLE computedStyle OPACITY THROUGH rAF, COUNT EPISODES**:
  the brightness oscillation is only visible in a trace — 120 samples over
  2s caught oMin 0.45/oMax 1 against the keyframe trough, and computed
  animationName/duration pinned the law (jx-skeleton-pulse 1.4s infinite).
  Assert trough + full cycle, never a single-frame reading. Under
  prefers-reduced-motion the same instrument proves the freeze: animation
  none + two samples 350ms apart identical.
- **THE MERGE LAW IS TWO ASSERTIONS, NOT ONE**: carriers JOIN the consumer
  style attr — assert BOTH halves (the --jx-radius-effective stamp AND the
  consumer's border-radius declaration in the same attribute) PLUS the
  computed winner (consumer 3px). One assertion would miss half the law:
  stamp-without-join or join-without-winner.
- **LAW #19 GUARD VERIFICATION IS A TWO-PAGE DIFF**: the twin guard's effect
  is only visible against a pre-guard receipt — sheet measured 6 H2-twin
  ids pre-guard, skeleton measured zero post-guard, same probe pattern. The
  audit asserts "zero twins OR H2-twin mechanism only", so it stays green
  either side of the guard landing and names the mechanism either way.

## Techniques (mine, added 2026-09-23, task 33 — code stack)
- **SPACE TOKENS ARE CALCS — DON'T ASSERT THE LITERAL**: the gap ladder's
  --jx-space-48 is calc(0.25rem * 12); getPropertyValue returns the UNRESOLVED
  calc while computed gap returns the resolved 48px. Assert the computed
  value against the expected px AND the var's presence — asserting
  computed === raw var text fails a lawfully-built token system. The rem
  base is also the story: gap rungs do NOT scale with the size lane's
  stamped font-size (rem is document-root-relative) — "one number moves the
  stack" is about the VOICE only.
- **OMISSION TRANSPARENCY NEEDS A BARE FIXTURE**: "an omitted prop stamps no
  atom" is only measurable on a stack with NOTHING passed — computed
  align-items: normal / gap: normal (flex's own defaults, not authored
  values). Every demo panel with gap="8" would mask the law. Build the bare
  fixture, then assert the ABSENCE shape.
- **THE MARKER FOLLOWS THE API TABLE**: the docs-universal marker
  (data-jx-props-table-universal) belongs on the api table's PropsTable
  (universal flag = the shared appendix). Old pages sometimes parked it on
  the a11y/theming table — moving it to api is part of the archetype
  migration, and the a11y section reverts to honest prose.
- **TWO SECTIONS CAN SHARE ONE ID CANDIDATE — RENAME THE DEMO, NOT THE LAW**:
  the old page's "axes" (CSS axis-word demos) collides with the archetype's
  "axes" (the measured eight-axes layer). The demo renames to "postures"
  (layout intent vocabulary); the eight-axes layer owns #axes. Keep the
  toc == DOM bijection while both concepts stay on the page.

## Techniques (mine, added 2026-09-23, task 34 — code system-dialog)
- **POPOVER PANELS HAVE NO [open] ATTRIBUTE**: dialog uses [open]; popover
  uses the :popover-open pseudo-class (and .open is undefined on the
  element). A probe selector reused from a dialog family times out forever
  on a popover family — state the platform primitive per family before
  writing the wait.
- **UNINTERPOLATED TEMPLATE SEAMS DIE SILENTLY IN CSS**: a style string
  built as 'position-anchor: --{api.uid}' (plain quotes, missing $) parses
  as an INVALID custom ident — the browser drops the declaration, computed
  position-anchor reads "normal", and the feature degrades to a fallback
  with no error anywhere. The probe caught it by asserting the GEOMETRY
  (panel staged top-left at fit-content instead of beside the trigger) and
  then reading the computed property. When a "measured vs designed" gap
  appears, read the computed value of the exact property the seam sets.
- **ALERT GRAVITY IS A TESTABLE SEQUENCE**: no light dismiss (outside click,
  panel stays), Escape scoping (keydown on the panel — Escape cancels only
  while focus is inside; tab out, Escape is the page's), non-modality (Tab
  eventually EXITS — the contrast with dialog families' showModal trap),
  safe landing (Cancel focused on open), restore-to-invoker (only when
  focus was ours). Each is one probe step in a strict order — a leaked
  focus state poisons every later step (the task-29 leftover-UI law,
  overlay edition).
- **EXACTLY-ONCE RESOLUTION IS PROBED THROUGH THE PROMISE'S USER VISIBLE
  ECHO**: the trio's readout line records each resolution — Cancel → false,
  Action → true, Enter submits the initial value, Escape → null. Assert the
  echo string per route; "the promise never hangs" needs the Escape route
  measured, not assumed.

## Techniques (mine, added 2026-09-23, task 35 — the anchor-fix flip)
- **A FIX THAT READS A NOT-YET-DECLARED CONST CONVERTS A WARNING FORECAST
  INTO A 500**: the anchor-style template `${api.uid}` was planted 20 lines
  above `const api = getContext(...)` — TDZ ReferenceError at SSR, the page
  served 500 while the gates that never rendered the page stayed green.
  When a landed fix touches a const's read position, the FIRST receipt is
  the HTTP status of the page it renders, not the diff.
- **THE FLIP CHECK PAIRS WITH A DEFECT-SPLIT**: a defect receipt with two
  entangled symptoms (no anchoring + wrong width) must re-measure BOTH
  after one symptom's fix — the anchor fix healed the position
  (anchor-center exact, 12px gap) while the width loss persisted, cleanly
  splitting one "broken panel" into two defects (the seam + the canvas-host
  width interaction). Flip reports should assert each symptom separately.
- **MEASURED TEACHING BEATS DEFECT NOTES**: the overview's measured-defect
  paragraph (task 34) was the honest bridge; once the family fix landed,
  the same paragraph slot became the measured teaching (anchor-center,
  12px gap, try chain, anchors-visible — with the numbers). Page text that
  carries numbers ages into truth; page text that carries adjectives ages
  into rot.
- **THE MIRROR SYNC IS A FIRST-PARTY EDITOR**: the dev server's registry ⇄
  www mirror applied my family repair to the registry tree the moment the
  file saved — a one-file edit became a two-file diff without a second
  action. That is the mirror LAW working (byte-identical trees), but a
  reporter who checks `git status` naively sees an extra modified file they
  "never touched". Verify the pair with diff after every family edit and
  name the pair in the integration receipt.

## Techniques (mine, added 2026-09-23, task 36 — code table)
- **CONTAINER-QUERY COMPONENTS ARE PROBED THROUGH THE COMPONENT'S OWN RIG**:
  the table's responsiveness reads a named inline-size container on the
  FRAME, not the viewport — so viewport resizing proves nothing. The
  workbench's own width slider (a range control) drives the frame across
  the 30rem line; keyboard (focus + arrows) is the reliable driver for
  custom sliders. Both laws then measure in one session: thead display
  none below, scrollWidth > clientWidth above, td::before content the
  data-label (the pseudo-safe read).
- **A DENSITY OWN CAN HIDE ITS OWN FEATURE**: table's dense rule is
  `padding: var(--jx-gap) var(--jx-inset)` — at the family's own sm the
  gap channel EQUALS the inset channel, so dense is a visual no-op exactly
  where the family declares its posture. When an axis own and a feature
  share channels, measure the feature AT the own: equal channels = a
  silently dead feature. (The probe asserts the no-op as a named defect
  receipt, and the demo panel uses density="large" so overrides stay
  distinguishable from the own.)
- **ATOM vs :where IS A REAL CASCADE FRONT**: a stylex atom's static
  borderRadius beats a zero-specificity :where consumed rule — the §3 lane
  stamps --jx-radius-effective correctly while the painted silhouette
  reads the static token. The stamp and the paint are separately
  assertable (getComputedStyle the custom property vs border-radius);
  when they diverge, the finding is the cascade front, not the lane.
- **UNIVERSAL-FLAG API TABLES FILTER AXIS-NAMED ROWS INTO THE APPENDIX**:
  a hand-written api row named `density` silently migrates into the
  universal appendix (the appendix is the axis rows' one home) — enumerate
  the served rows before asserting the api count, and expect family-owned
  axis documentation to live in the page's own axes section.
- **THE SCREENSHOT PIPELINE'S OWN DECODER CAN BE THE BUG**: three instruments
  failed in one review (screencast frames not 1:1 with DOM rects at dsf 1;
  Emulation.setVirtualTimePolicy freezes fonts/compositor so screenshots
  stall; my hand-rolled zlib PNG decoder verified correct on 10px strips yet
  scrambled 900px frames — filter-4 rows decoded to zeros) before the
  working answer: let the BROWSER decode (createImageBitmap + OffscreenCanvas
  + getImageData in-page, crop in-page, only the clip's RGBA crosses to
  Node). When pixel readings look impossible, cross-decode one PNG with an
  independent decoder (sips → BMP) before distrusting the page.
- **SIBLING CHURN IS AN ADVERSARY FOR PIXEL INSTRUMENTS ON A SHARED DEV
  SERVER**: mid-review the served theme flipped dark and the accent hue moved
  (green→pink) under me — hardcoded expected colors died silently. The
  churn-proof kit: pin localStorage theme + colorScheme before load;
  calibrate fill/track RGB from the live page per burst (fill from the
  indeterminate sibling's stripes — always painted; track from computed
  style); verify every synthetic keypress landed in the DOM (slider.value)
  AND the paint (edge ≈ 0 after Home) with retry; after End, verify the final
  painted edge ≈ full or declare the clip stale and redo. Rect-anchored
  clips beat run-finding locators — the playground panel's own slider row
  sits at the same y as the bar and will win any "longest run" contest.
- **A 200MS TWEEN IS BURSTABLE AT ~75MS CADENCE IF YOU COUNT POSITIONS, NOT
  FRAMES**: 8-10 clip screenshots over 600ms catch ≥3 distinct edge positions
  (parked/mid/full) — proof of gradual motion an instant jump cannot fake
  (2 positions max). State the settle tolerance or the numbers will look
  discordant when they agree (marginalia's NIT, confirmed: my ±0.5px settle
  read 93-114ms against the quoted 82-99ms window — concord, not conflict).
- **THE THEME-SPLIT HAS A HOST LAYER: THE CANVAS IS A LIGHT ISLAND** (terminal-footer,
  task 67, measured by ancestor walk): under `html.dark` the page tokens flip
  (--border white at body/main), but the component-canvas stage carries
  `data-theme="light"` + `.jx-light`, re-pinning the light profile for
  everything inside — the served demo footer stayed black-stroked while the
  SAME rendered footer cloned to body level re-derived white, and a
  component-level `.dark` stamp (closest scope) re-derived it in place. Three
  scopes, one var: the host island beats the page, the component stamp beats
  the island. When a theme claim "fails" on a docs page, walk the ancestors
  for the pinning scope before believing it.
- **PLAYGROUND BINDS ARE NOT COMPONENT BINDS**: PlayToggle exposes
  `value = $bindable()` and forwards to Toggle's `checked` — `bind:checked`
  on the playground wrapper is a non-bindable error. The kit's prop names are
  the API; read the wrapper before binding through it.
- **A BRACE IN MARKUP TEXT IS A PARSE ERROR**: a page summary containing
  `{...rest}` (spread notation as PROSE) reads as an expression opener and
  500s the route. Spread-as-prose needs rewording ("spreads the rest onto")
  or an HTML-escaped brace.
- **REST-LESS VS ATTRIBUTE-TRANSPARENT IS A SPECTRUM — MEASURE THE FORWARDING
  BY NAME** (textarea, task 68): progress drops the residual (rest-less);
  terminal-footer and textarea spread it (attribute-transparent). Inside
  "transparent" there are three verdicts per attribute: forwarded BY NAME
  with a job (textarea's maxlength drives the count readout; rows defaults
  4; oninput fires after the family syncs), forwarded verbatim (spellcheck,
  wrap, name — read back off the element), and withheld (the color ATTRIBUTE
  Omitted; a caller data-density captured by the axis stamp). The §1
  collision rule is testable: size-stamped fields must carry no size
  attribute on the native element. Read the destructuring list before
  writing the api summary — the rest treatment is the api section's thesis.
- **ANNOUNCEMENT DISCIPLINE IS A MEASURABLE GRADIENT**: the count readout's
  aria-live is OFF until 90% of maxlength, then polite, then off again when
  the count drops — three states, all assertable (dispatch input events, read
  the attribute). The error line by contrast is a STATIC describedby target
  (no live region — it would chatter per keystroke). "No chatter" and
  "announces when it matters" are both probe-able claims, not prose.
- **PROBE SELF-TESTS MUST NOT SET THE STATE THEY ASSERT AGAINST**: my §1
  collision check failed the first run because the fixture itself set
  size="14" on the element before asserting no size attribute existed. Assert
  against the SERVED artifacts (size-stamped demo fields), or the test proves
  only that your fixture worked.
- **A PAGE CAN TEACH ITS OWN CONSTRAINT BY BREAKING ITS OWN FRAME** (toc, task
  69): the AUTO-outline demo could not live in a component canvas — the
  canvas stamps data-toc-skip (demo headings must never leak into page
  outlines) and a skipped root derives ZERO, so the exhibit rendered its
  empty rail forever. Moving the workbench to plain page markup fixed it and
  became the teaching: placement is part of the API. When a demo silently
  renders empty, ask what its CONTAINER forbids before debugging the demo.
- **PROBE FAILURES ARE THE MAP, NOT THE MINEFIELD**: five instrument
  iterations on the toc probe each caught a wrong assumption of mine (rail
  census, dual-render link count, --w written on the li not the link, the
  line-pick boundary rule, extents ending at same-or-higher level) — and the
  LAST one (derive = 0) surfaced the data-toc-skip discovery. Fix the
  expectation only after naming WHO is wrong: the page, the family, or the
  probe. Two of three turn out to be the probe; the third is the story.
- **SELF-REFERENCE NEEDS STRUCTURAL SEPARATION, NOT A DISCLAIMER**: the toc
  docs page's channel spine works because the two channels are separated in
  FILES (+page.ts opt-out document vs the component markup in the page) — a
  prose disclaimer alone would not survive the next editor. When a page must
  not confuse two channels, give each channel its own artifact.
- **THE DOCS SHELL DOCUMENTING ITSELF NEEDS SURFACE NAMING IN THE PROSE, NOT
  JUST IN THE PROBE** (website-scaffold, task 70): the page lives in the
  component it documents, so every claim was written as "the LIVE shell
  (this page's own chrome)" vs "a bounded demo instance (probe fixture,
  intentionally not rendered)" — the no-nest ruling (a second 100svh overlay
  scroll plane traps the page) and the measured embeddability (a 480px host
  runs the narrow form) are BOTH true because they describe different
  surfaces. Self-reference pages fail when one surface's fact is stated as
  the family's universal; name the surface in the sentence.
- **MEASURE THE PLATFORM TOKENS, NOT THE ELEMENT'S USED VALUES**: the
  scaffold's grid-template-columns interleaves named lines ([rail-start]
  256px …) — a naive split-and-parse "fails" on values that are correct.
  Filter numerics; read grid-template-areas off the element that DECLARES
  them (.jx-top-layer), not its subgrid children (they read 'none' by
  design); read --w through getComputedStyle when the engine writes it on an
  ancestor. The value pipeline (who writes, who inherits, who resolves) is
  part of the instrument.
- **UNMOUNTED-AFTER-BOOT MARKERS ARE SSR RECEIPTS**: the boot splash ships in
  the served HTML (data-jx-splash="layer") and the live DOM unmounts the
  layer while the head-carried STYLE tag persists by design — so "is it
  there?" needs both channels: fetch the SSR for the ship-receipt, query the
  DOM for the unmount-receipt. One channel alone reads as a defect.

## 2026-09-22 · T80 first-review transfer — probe expectations derive from SOURCE semantics, not dispatch headlines

Four probe faults this round, all mine, one root cause: I calibrated assertions against the
task brief's headline phrases instead of the component's own state semantics. The brief said
"bridge echoes value=keep" (the AT-REST state) and my post-move assertion inherited it — the
component correctly echoes the whole list (`keep\na`, multi-entry join). The return-move
driver clicked every unchecked row instead of the movers the family's own `move()` selects.
Fix pattern: before writing any state-machine probe assertion, re-derive the expected value
from the component source at the exact line (transfer.svelte:174–185, :191), and for fleet
dark-mode probes remember the L1 bridge is `html.dark` — `colorScheme` emulation alone
leaves `rootDark` false. Also measured this round: the seven-strata evidence completes with
BOTH sides of a `theme="dark"` island seat — grounds hold (`--jx-card` 1 0 0) while leans
flip (`--primary` 0.6489→0.7044 / 0.237→0.1872, hue via `calc(49 - 4)`) — the quote-L/C-
never-hue law is visible in the token source itself and makes a clean probe receipt.

## 2026-09-22 · T107 2nd-review batch — the dev server is an instrument too (icon union transient)

Reviewing icon.html's "three count layers" I found the dock serving 44/48/54 options across
three server states. The committed artifact + fresh dist said 54; the vite dep cache
(cleared → 44) and the plugin's DEV-INCREMENTAL SCANNER held the other numbers: in dev the
icon union is the scanned-set-so-far — it grows per transformed page (poking
docs/icons.html + timeline.html took the dock 44→54 and flipped the page's own PlayHelp
"union (44 today" → "54 today"). Lesson stack: (1) a live-probe count on a dev server can
be a SCANNER TRANSIENT, not a designed layer — re-derive at a second layer (dist bytes,
gen gate) before filing an interpretation; marginalia's "dock 44 = native-only by design"
was exactly such a misread. (2) grep -c counts LINES — the dev SSR payload is one line;
`grep -o … | wc -l` is the honest counter. (3) stale vite caches make fresh servers
disagree with each other (48 with cache vs 44 fresh) — when two runs of the SAME
instrument disagree, suspect the cache layer before the code. (4) hover-card state
machines ignore synthetic pointerenter entirely — real-mouse moves are the only clock
driver; and hover ≠ focus: the Tab-walk claims start from FOCUS on the trigger.

## 2026-09-22 · T113 tour 2nd — the dispatch's craft note IS a test: programmatic clicks never focus

I re-fell into the exact trap the T113 dispatch warned about ("programmatic clicks never
focus — probe-fault discipline"): opening the tour with btn.click() left the invoker as
BODY, so Escape "restored" body and four focus-law reads false-failed. Real locator
clicks fixed all four — the component was right, my driver was untrusted. Companion
lessons from the same probe session: (1) read the DEFAULT CARD's actual button labels
before locator-ing ("Skip tour"/"Back"/"Next"/"done" — exact-text finders against the
dispatch's shorthand hit code samples); (2) anchor-name leases are best matched via the
card's computed position-anchor → the element carrying that name, never a bare
style-substring selector; (3) ink reads are LEAF reads (ancestors paint the site scope,
the atoms hold the claim — marginalia's card-root-vs-atoms note, re-learned first-hand);
(4) tour targets can be id-less sections — plant a marker attribute, not getElementById.
 constructive fresh axis: a 1st reviewer's "source-read-only branch" (the lease's
restore-existing path, no demo ships a pre-anchored target) is prime 2nd-reviewer
territory — plant the precondition in-probe and the branch becomes behavior-receipted.

## 2026-09-22 · T114 popover 2nd — shared-tree dev servers are cross-contaminating instruments

Two legs died to "Execution context destroyed → navigation" mid-probe: a sibling lane's
CODE edits (same working tree, their own port) hot-reload MY dev server. Fix: serve the
FRESH DIST via `vite preview` for probe legs — stable against sibling churn, and it is
byte-for-byte the artifact the lint gate audits (geometry receipts from dist bytes are
the strongest form). Companion lessons: (1) canvas-playground controls can be GLYPH-
labeled with the semantic name only in title= — match [title=], never textContent, and
give every in-page async drive an always-resolve guard (a rejected promise past
.then(resolve) hangs the evaluate forever); (2) top-layer LIFO (popover opened after a
showModal dialog paints above) does NOT hit-test true on Chrome for Testing 153 /
chromium-1243 — a system-Chrome receipt from a 1st review may be a version delta; always
print the runner's engine version next to platform-behavior receipts; (3) page
consolidations often close the PAGE's cx clone but leave the COMPONENT's own clone —
check both lanes when the dispatch says "cx state post-closure".

## 2026-09-22 · T120 math-inline/statistic 2nds — three env-digit traps and one composition seam

(1) The site brand hue is PER-LOAD VARIABLE: --jx-primary read hue 189 then 179 across two
loads on the SAME dist (marginalia's statistic receipt quoted 346 on hers). L/C identity
(0.6489 0.237) is the stable brand-voice law; NEVER file the hue digit as a constant —
compare L/C and call the hue environment-dependent. (2) Stylex families with css-less
data-hook stamps: the sizing atom often rides a CHILD (statistic's value WRAPPER is a
flex <p> with no font-size; the 1.5× line rides [data-jx-stat-num]) — measuring the
wrapper reads a fake density-flat regression. Read the atom table to find the carrier
before filing. (3) In-page async drives need always-resolve guards: a rejected promise
past .then(resolve) hangs page.evaluate forever (the glyph-labeled grid cells lesson,
generalized). (4) KaTeX facade shape: parse errors (unclosed groups) take the
.katex-error in-place path; UNKNOWN macros render as literal text with throwOnError:false
— and the site-level registerMacros table can be EMPTY (zero callers), so "registered
macro renders" is untestable without first registering. Also: JS string → TeX escaping
counts BOTH — '\\RR' in JS is a TeX LINEBREAK + "RR", not the macro.

## 2026-09-22 · T124 card/figure/hdd 1sts — the playground toggle's name lives on the row; computed grids interleave names and sizes

(1) PlayToggle bridges the PlayRow label via aria-labelledby — the switch's ACCESSIBLE
name is the row label; page.getByRole('switch', { name }) is the only reliable drive
(attribute scans and row-text scans both miss). (2) getComputedStyle().gridTemplateColumns
INTERLEAVES track names and resolved sizes ("[card-inline-start] 14px [card-fill] 873px…")
— count PAIRS (tokens/2), and read the names out of the same string; a naive token count
reads five tracks as ten. (3) Stylex families with css-less data hooks: check the ATOM
TABLE for which element carries the claim before measuring (statistic's value wrapper has
no font-size; the num child carries calc(var(--jx-line) × 1.5)). (4) overlay-scrollbar
engines probe scrollbar width 0 → gutter-compensation formulas read IDENTICAL padding in
both scroll states; the honest receipt is the attribute/stamp flip + overflow, not the
pad delta. (5) Svelte snippet narrowing ({#if foot} guarding {@render foot()}) is
typing-only debt — check the guard before invoking the tour-:456 latent-bug precedent.
(6) The brand hue is per-load variable — L/C identity is the stable law; hue digits are
environment receipts.

## 2026-09-22 · T129 mermaid/pagination/patterns 1sts — census scopes and the per-load brand hue, part two

(1) A page's OWN interactive nav (pagination's aria-label="Pagination") pollutes any
`nav a` rail census — scope the toc rail to the scaffold's aside or the authored +page.ts,
and count DOM id duplicates separately from rail links (pagination's REAL finding was the
duplicate #usage ×2, invisible in the rail). (2) Mermaid zoom races the LAZY render: cap-
ture the svg node only AFTER the seat reaches data-state="rendered", or the lazy swap
masquerades as a zoom re-render; the error seat likewise needs scrollIntoView + engine-
pass before data-state="error" paints. (3) copyCommand-style "one string, N jobs" CTAs
put the PAYLOAD in the visible label — find the control by aria-label ("copy " + command),
not by the word copy. (4) The brand hue is per-load variable (T120's lesson, re-hit via
pagination's press-shadow adjacent reads): compare oklch L/C channels for identity; file
hue digits as environment receipts. (5) Named-step coincidences (size={16} vs medium=16px)
make demo pairs that cannot show what they teach — a demo-coherence nit class worth one
look on every composed universal seat.

## 2026-09-22 · T133 theme-toggle/icon-button/list-item 2nds — the gate cwd slip and the last-seat rule

(1) verify:docs/verify:docs-universal live at the REPO ROOT — after any `cd apps/www`
(the ONE svelte-check run's natural cwd) the gate invocation "Missing script" reds;
the red-to-cwd check costs one `tail` and saves a false new-information call. (2) The
"last seat" rule for count-word rulings: a taxonomy fix that lands in the meta, the
summary, AND the sibling page can still miss the page's own hero PILL (list-item's
"ItemField + 5 adapters" survived three correct landings) — verify every seat with an
SSR-payload grep, not an in-page scope sample (the h1's closest div misses the pill
wrap). (3) Theme families with a dual channel (axis paint vs global flip) will NOT move
class:dark when the global control is pressed — the separation IS the teaching; measure
both channels before asserting lockstep. (4) The tooltip/hover machinery ignored even a
REAL mouse at the composed button root this round — receipt inconclusive against an
unchanged surface rather than guessing at wrapper-vs-root; her :popover-open instrument
with page.hover() on the wrapper is the next attempt.

## 2026-09-22 · T135 text scanner-feed CODE round — in a tailwindless world a comment block is not a feed

The text page's "scanner-feed" was a JS comment block citing app.css's jx-html comment
block as the precedent — but the jx-html utilities work because jixoai.css authors REAL
RULES behind the names (the comment only documents them), and the site has been
TAILWINDLESS since W4 (no scanner, no generator: a class exists only where a rule is
authored). The fix: author the kernel's emittable vocabulary as real @layer components
rules in app.css. Three durable lessons: (1) grep the FRESH main sheet (hash changes
every build) before any live probe — a stale-hash main sheet briefly read as "the fix
didn't land"; (2) the kernel's arbitrary tokens are BRACKET-INCLUSIVE
([font-size:14px]) — the CSS selector must escape the WHOLE token (.\[font-size\:14px\]),
not just the inner punctuation (the first rules built fine and matched nothing); (3)
comment-vs-rule: "the comment block guarantees the scanner sees them" was the app.css
block's own self-description and it was wrong about the mechanism — the RULES are the
feed, comments are documentation. Empirics over self-descriptions.

## 2026-09-22 · T140 markdown/command 2nds — the surviving-dialog read and the page-growth census

(1) Multi-dialog pages (command + the site search) make every `dialog[open]` read a
WHICH-dialog question first — label the survivors before reading state; vellum's 132
ground truth was exactly that identification, and my drives confirmed her collision
law live (Meta+K opens both; Enter closes the palette; the site search persists).
(2) The active pointer in listbox patterns is DUAL-instrument: the dialog-scoped
[role=option][aria-selected] AND the input's aria-activedescendant must AGREE — an
out-of-dialog aria-selected (the canvas file-tree) will masquerade otherwise.
(3) A page-growth window makes point-in-time censuses drift upward (no-jx-pure 42→45
between her pass and mine) — file the per-tag SHAPE as the stable receipt, the count
as the environment line. (4) A 1st reviewer's owned fault ledger is a probe-spec for
the 2nd: I re-hit her streaming-checkbox trap anyway — transcribe the exclusions into
the probe BEFORE the first run.
