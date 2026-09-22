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
