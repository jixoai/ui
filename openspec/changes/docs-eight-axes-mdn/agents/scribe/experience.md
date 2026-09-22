# scribe — experience log

## Techniques (mine)
- SSR-as-ground-truth for axis work: after editing an axis demo, curl the
  dev page once and grep the family root's attrs — `data-density="sm"`,
  `class="… dark"`, inline `--jx-*-effective` carriers. Proves "code shown
  = code running" per rail without any visual judgement (1-anchor).
- The consumed-vs-supplied split: on a no-own family, the per-axis table is
  honest only when it separates axes the family's paint CONSUMES (anchor:
  density via the rung scope + coefficient; theme via the .dark bridge)
  from stamp-and-supply-only axes (anchor: size/shape/radius/color/
  elevation/motion). Write the absence as a callout with the real var that
  is NOT read (1-anchor).
- TokenTable defaults: never copy px literals forward from an old page —
  the density rung values are calc equations over --jx-unit; the honest
  default cell is "rung scale × coefficient" (1-anchor).
- One SSR curl + a marker checklist (universal ×1, install, see-also, the
  CLI copy line) doubles as the dev-smoke AND the skeleton lint preview
  before any build (1-anchor).
- The consumed-vs-supply split grows a THIRD state when the family composes
  consumers: stamped-on-the-root-but-landed-in-a-composed-part (breadcrumb:
  density → the dropdown menu's `--jx-hit`/`--jx-line` items; shape/radius →
  the menu panel's concentric calc). Name WHERE the supply lands and make
  the demo say "open the node" — the trail looking unchanged IS the truth
  being documented (2-breadcrumb).
- A kernel comment describes the RAW prop; the family root stamps the
  RESOLVED record. `densityRungOf`'s "query() never carries a rung" is true
  of the raw lane, false of `densityRungOf(d.density)` after
  `BreadcrumbDefaults.resolve` unwraps the base at SSR — curl the page and
  write the caption from the markup, not from the comment (2-breadcrumb).
- CORRECTION (5-fix-anchor) to my 1-anchor "consumed-vs-supplied split"
  above: the theme half was FALSE — "theme via the .dark bridge" was a
  vocabulary analogy, not a measured consumption. `.dark` stamps the nav
  and flips the RAW token layer there, but the rail's ink reads the
  root-anchored `--jx-*` aliases (declared only at :root + stylex theme
  scopes), which plain `.dark` never re-substitutes — link computed color
  byte-identical on/off the class (`oklch(0.3211 0 0)`, probed twice: by
  my reviewers and by my fix probe). My own best idea needed the
  two-review law to catch it. The honest consumed-axis count on anchor is
  density ONLY; theme is supply-side until the semantic-ink protocol pass
  (family-comment-drift.md W-next #1).
- The bare `query({…}, base)` form is ALSO a call-site type error, not
  just the single-arg generic form: the bare object literal widens the
  case value → `QueryResult<string>`, which the lane-typed prop rejects
  (svelte-check caught it on my anchor demo; accordion's comment names the
  mechanism). The §6 law's BOTH-args form (`query<{ lg: DensityLane },
  DensityLane>({…}, 'small')`) is the only clean call shape — apply it in
  all three places that must stay identical: running code, the shown
  snippet, and the panel caption (5-fix-anchor).
- SSR text-node greps must expect HTML escaping: the typed demo renders as
  `query&lt;{…}&gt;` in captions/CodeBlocks — a raw `<` grep reads 0 hits
  and can look like a regression. Grep the escaped form or count the type
  name (`DensityLane`) instead (5-fix-anchor).
- svelte-check IS reachable: `npx svelte-check --workspace apps/www` from
  the REPO ROOT (4.7.6). The full run is noise (1646 pre-existing errors in
  fixtures/mirrors) — capture `--output machine` to a file and grep your
  page's path for the true scoped delta. It catches real idiom debt the
  dev-server smoke cannot (2-breadcrumb).

## Highlights found in others' pages
- (vellum, 4-fix-alert) THREE-LAYER evidence for a css-law claim: source
  read + live computed probe + COMPILED-DIST grep (which selector block
  actually ships) — the third layer catches dev-pipeline inference that
  the first two can't distinguish. Their THEME-SPLIT re-probe also shows
  the fix-grade move: a wrong claim ("full repaint") re-measured into a
  SHARPER law (two halves, named) instead of a minimal retraction.
  Adopted for my remaining pages: any theme-row edit gets the dist grep.
- (my 7-review-alert, campaign review-side technique) Cross-round oklch
  comparisons must diff STRUCTURE, not absolute values: --brand-hue is a
  runtime documentElement stamp (hue-runtime.svelte.ts:146), so two
  rounds legitimately log different hues (vellum 146, me 124) with the
  identical L/C flip + −4° dark drift. Diffing absolute hue would
  false-flag a regression.
- (vellum, 2-review-anchor) The REBUTTAL discipline done right: quill's
  letter-spacing NIT ("em-based tracking micro-scales under size") looked
  correct from the CSS source, but vellum's exact-mechanism probe — stamp
  what `stampCarriers` actually pushes (nav-level `--jx-size-effective` +
  `font-size: var(…)`) and watch the LABEL, not the document root —
  falsified it (label 13px / spacing 1.04px UNMOVED). Their r6 first
  mis-emulated by moving the DOCUMENT root (labels 13 → 19.5px, the
  rem-anchored channels following the site root) — the calibration is the
  lesson: emulate the REAL carrier path, then measure the consumer.
  Scribe's original size-row wording stood because vellum measured, not
  because I argued (5-fix-anchor).
- (vellum, 2-review-anchor) Scroll-geometry honesty: they proved the a11y
  table's claims under a REAL user wheel-scroll of the demo band
  (`jx-shell-body` is the scroller, not the window) — all four rails
  marked `aria-current` correctly, focus never moved. A11y claims measured
  as user events, not read as code. Adopt for my remaining a11y tables.
- (marginalia, 1-accordion) The per-axis honesty protocol AS A DERIVATION
  TABLE: every axisRow states the STAMP (carrier + attr/class bridges,
  from stampCarriersForLanes) and the family's own (non-)consumption in
  one cell, derived separately before writing. Measured receipt: every
  number in the table survived live probing (11/12/13/15px rungs TRUE,
  radius 20→6px receipt TRUE, query flip both directions TRUE). COMMIT:
  restructure my anchor + breadcrumb axisRows to the stamp-then-consume
  shape at batch close.
- (marginalia, 1-accordion) Custom-property SUBSTITUTION TIMING as the
  density-lane discriminator: var() inside a custom property substitutes
  at the DECLARING element, so a bare coefficient stamp matches no scope
  block on a family that declares no channels (invisible), while a named
  rung's attr makes the scope block match the root (visible). Sharper
  than my consumed-vs-supplied split — it explains WHY a lane is
  invisible. Commit: fold this clause into my breadcrumb density caption.
- (marginalia, 1-accordion) Demo selection by visibility: only demo lanes
  whose effect is CSS-provable on the family — accordion demos exactly
  density/theme/radius/query and refuses the other four. Same principle
  my breadcrumb followed; now a stated law.
- (NEW LAW from my 4-accordion review, extends the protocol above) A
  BROADCAST CLAIM NEEDS A NAMED-CONSUMER GREP RECEIPT: marginalia's
  protocol greps the FAMILY's css for what it consumes (step b) but the
  rows' broadcast clauses also assert things about NESTED CONSUMERS —
  elevation ("a Card at level2 lifts"), motion ("intensity broadcasts"),
  size ("a Card or PressButton … sizes in em off it") — and ALL THREE are
  false (zero `var(--jx-elevation-effective)`/`var(--jx-motion-effective)`
  readers in the tree; Card/PressButton voices token-anchored, measured:
  frame 16→24px moved nothing inside the item anatomy). Step (b2): before
  writing any broadcast clause, grep the claimed consumer for the carrier;
  no reader → document the absence (alert/blockquote wording is the
  model). COMMIT: re-audit MY anchor/breadcrumb broadcast clauses with
  the named-consumer receipt at batch close (anchor's "nested components
  read the supply" needs this proof).
- (from 4-accordion) The toc lives in +page.ts, a DIFFERENT file than the
  page — marginalia (like quill before the fix) restructured the DOM and
  never touched the toc: dead `theming` row, axes section unreachable.
  COMMIT: "+page.ts toc vs page DOM diff" is now a standing item on my
  page/review checklist, not a memory.
- (from 4-accordion) `query<T>({…}, base)` with an EXPLICIT generic list
  disables inference for B (TS rule: explicit type args → defaults for
  the rest) — B defaults to `undefined`, so `base='small'` is a type
  ERROR at the call site while the demo still RUNS. The concept page's
  typing note (single generic) is the bug source; alert:75 and
  accordion:256 both shipped it. Correct form:
  `query<{ sm: DensityLane }, DensityLane>({…}, 'small')`. Svelte-check
  catches it; the vite build does not.
- (quill, 1-blockquote) The docs-curation file over the GENERATED meta with
  header-evidenced corrections (blockquote.docs.ts): type/default come from
  the registry interface, curation carries only prose + evidenced display
  overrides, and the header cites the source line — the stale-default drift
  class becomes structurally impossible. COMMIT: migrate my anchor +
  breadcrumb family-level prop rows to this lane at batch close (part
  tables stay hand-written only where meta doesn't cover the part).
- (quill, 1-blockquote) Drawer-stays-runnable: in-canvas compound
  expressions (`size={query({ md: 16 }, 14)}` — extractor guard) with the
  import carried by the usageFile imports record (binding clause `'{
  query }'` as key). Use for any future runtime-bearing canvas demo on my
  pages.
- (quill, 1-blockquote) Canvas surgery respecting snapshot pins: swap a
  canvas's id/children while keeping drawer count + order
  (rungs[0]/rule[1]) → canvas-same-source stays green with zero test edits.
  Count drawers FIRST, then edit.
- (quill, 1-blockquote — negative lesson) Density row reached for
  --jx-stack/--jx-gap by vocabulary analogy; the blockquote family reads
  NEITHER (grep = zero hits; its only gap is the fixed --jx-space-8).
  Consumption claims are per-family grep results, not vocabulary analogies —
  extends my raw-prop-vs-resolved-record law. Global scopes
  ([data-density] in jixoai.css) re-declare kernel channels at the STAMPING
  root, so the honest third state for blockquote density is
  supply-to-composed-children, not "consumed inside the quote".

## Techniques (mine, task 8 — checkbox)
- The in-app browser is UNAVAILABLE in subagents ("Browser is not available
  in subagent") — the working measured-probe path is vellum's: a /tmp
  script driving `node_modules/playwright-core` + system Chrome headless
  against the dev page. Build it around named specimens
  (`input[name="…"]`) + `closest('.jx-check-lane')`, read computed styles
  in ONE evaluate per cross-instant claim, move the real viewport for
  query() flips. My 8-checkbox probe went 16/16 with this shape.
- THE DECLARING-ELEMENT LAW BITES IN THE WILD (my 4-accordion finding,
  now measured on checkbox): a source read saying "every channel composes
  the coefficient" (the calc IS in every scope block) predicts the NUMBER
  lane paints — it does NOT. Custom-property substitution runs at the
  DECLARING element; the channels declare at :root + the rung scopes, so
  a wrapper-local `--jx-density-coefficient` re-declares nothing. Probe:
  stamp the exact carrier string on the real root, read before/during/
  after — box/lane/label byte-unmoved. NEW WRITE ORDER for density rows:
  name the stamp's declaring element FIRST, then ask what re-declares AT
  that element; only then claim paint. (Same class as alert's finding 2 —
  the drift is fleet-wide and my own queued law did not stop me from
  writing "both lanes paint" on first pass; the probe caught it.)
- Scoped density floors: `--jx-hit-floor` is 28px at :root but the 2xs
  scope LOWERS it to 24px (jixoai.css:2768, the WCAG 2.5.8 AA pointer-
  dense note) — floors are per-scope facts; never assume a uniform clamp.
  The honest --jx-hit ladder (2xs→lg) is 24/28/32/40/48, measured.
- `{...rest}` (any brace) inside a template ATTRIBUTE string is a Svelte
  PARSE error (dev 500, js_parse_error) — the `{'{...rest}'}` dodge works
  only in text children; in attributes, reword ("rides the rest object").
  Script-side strings (axisRows, drawer files) are safe.
- SSR bare-branch receipt: a `bare` demo with an explicit lane renders an
  input whose attrs are byte-identical to the plain bare input — the
  unstamped proof lives in the raw HTML, no browser needed
  (`grep -o '<input[^>]*name="bare-inert"[^>]*>'`).
- Concurrent-agent PILOTS drift: the same-source PILOTS list changed
  between my Read and my Edit (badge landed mid-task). Re-read shared
  test files at edit time; after editing, `git diff` the file and confirm
  every +/- line is yours.
- The dist grep receipts after build (marker ×1 per page, demo specimen
  names, section phrases) close the loop dev-SSR only samples — the
  built HTML is what verify:docs and the world see.

## Highlights found in others' pages (task 8 additions)
- (vellum, 5-review-badge + badge page itself) The badge axes canvas
  labels carry measured numbers ("2xs rung — 10px label, 14.5px box
  (measured)") — captions that state the receipt instead of adjectives.
  Adopted: my rung labels name the mechanism ("the floor lowers to 24px").
- (marginalia, 4-badge) Their size row's grep-receipt phrasing ("zero
  var(--jx-size-effective) readers") is the exact sentence shape that
  let my size row state a non-consumer without hedging.

## Techniques (mine, task 9 — badge review)
- Reviewing a COMPONENT fix, not just a page: the receipt chain that
  worked — (1) read the extractor's return statement (from-meta.ts:116
  `[...rows, ...(docs.extra ?? [])]` — reference spread, no clone),
  (2) reason the Set-membership edges from object construction sites
  (meta rows are fresh literals → no false positives), (3) parse raw
  SSR per-table row NAMES across every extra-bearing page (chip/badge/
  popover/text/component-canvas) for the regression, (4) run the
  component's own specs solo. Content tests alone could NOT see the
  original bug (a dropped row renders green elsewhere) — row-count
  assertions on the affected tables are the honest gate.
- A "measured" claim can still hide an off-by-one-scope reading: I
  computed the secondary-line ladder from the scope blocks and got a
  different answer than the page, but the probe (clone-stamp all five
  rungs, one evaluate) matched the page 5/5. Lesson: my grep-derived
  block-boundary map was the artifact, not the page — when a hand
  computation disagrees with a "measured" claim, the probe arbitrates
  BETWEEN them; it is not a rubber stamp for either.
- The 0.14em tracking probe trap (vellum hit it first, I dodged it by
  not probing letter-spacing): em-relative values resolve against the
  ELEMENT's own font-size — verify the token declaration, not the
  computed px.
- Duplicate-keyed each rows (`{#each rows (row.name)}`) + a docs.extra
  lane: an extra whose name survives alongside a non-axis meta twin
  makes duplicate keys. Fleet extras today are all axis-named or unique
  — safe, unguarded. Reviewers: check docs curations' extra names
  against the family's meta prop names.

## Highlights found in others' pages (task 9 additions)
- (vellum, 5-review-badge) Their two-layer @supports wording pattern
  ("0px; 8px where corner-shape is supported; 8px measured here") is
  the honest form for environment-dependent values — adopt for any
  @supports-dependent claim on my pages.
- (marginalia, badge.docs.ts) The curation header pinning the
  EXTRACTOR'S CEILINGS as documented law (why variant degrades to an
  opaque alias, why style/rest stay visible) — the header is teaching
  material, not boilerplate.
- (vellum, 5-review-badge highlights 1-6, cross-read) All six stand;
  my additive items: the reference-identity contract needs a test pin
  (MINOR-1), and reviewers should re-derive "measured" numbers via
  probe even when the page says "(measured)" — my scope-map
  disagreement with the page resolved only by arbitration.

## Techniques (mine, task 10 — hardening test + breadcrumb fix)
- THE TRANSITION-FRAME ARTIFACT (new probe law, resolves the ledger's
  finding 8): reading getComputedStyle SYNCHRONOUSLY after a class flip
  returns the TRANSITION's interpolated start value, not the target —
  `.jx-menu-item` transitions background-color/color 100ms, so a
  "frozen at the light value" verdict was wrong in BOTH marginalia's
  probe and my first pass. Law: after any cascade flip on an element
  with a transition, await > duration before reading; and run a
  light-again pass — a value set that round-trips is measured, one that
  doesn't is an artifact.
- Mutation-testing my own pins: wrote the identity test, then
  temporarily cloned extras in propsFromMeta — 5 loud FAILs — then
  restored. A pin that has never seen its failure is a hypothesis.
- The F4 self-containment guard as a DESIGN tool, not an obstacle: bare
  identifiers in canvas stages (page consts like `items={peerPages}`,
  `{#each folded as href}`) get rejected — inlining the literals made
  the drawers copy-paste-runnable AND deleted the page consts. When a
  canvas joins the same-source lane, budget for de-const-ing its stage.
- python heredocs MANGLE backtick escapes: my '''...''' block with \\
  escapes shipped literal backslash-backtick pairs into the spec and
  broke the parse (three fix rounds). Backtick templates go through the
  Edit tool or chr(92)/chr(96) construction — never shell heredoc
  escaping.
- svelte-check delta accounting needs a PRISTINE log to diff against:
  keeping /tmp/<agent>-<task>-svelte-check.log per task turned "is this
  error mine?" into a two-grep diff (baseline 8 errors on my touched
  files → 8 after, columns shifted).

## Highlights found in others' pages (task 10 additions)
- (vellum, 5-review-badge — cross-read) The probe-toolkit upgrade they
  filed ("grep the RAW SSR HTML, not page.content()") is exactly the
  entity-escape receipt my own SSR checks needed this round
  (query&lt;...&gt; in the composed drawer).
- (quill, component-canvas eb66056b) The EXTRA rescue doubling
  (theme+density §13 seats) proved the identity fix generalizes beyond
  the shape collision — a fix reviewed by its second consumer, not its
  first.

## Techniques (mine, task 11 — checkbox fix round)
- THE TOKEN TABLE NEVER RENDERS ITS `description` FIELD: the component
  emits name/default/source only — every page's description texts
  (alert's, badge's, mine) are invisible. My receipt grep caught it
  ("re-pinned" 0 hits in SSR while the source line existed). Law: any
  wording that must be SEEN goes in the default cell; file the dead
  field as a component observation, don't fix component surfaces from
  a docs task.
- Drawer refactor wiring: when a hand demo const dies, grep the page
  for the old name BEFORE serving — the states canvas kept a stale
  `files={checkboxStatesDemo}` and 500'd. A curl after each structural
  edit catches it in seconds.
- "One mechanism both sides" for NON-extractable canvases (interactive
  state — page consts like onSubmit/{#if result} are F4-rejected): the
  honest fallback is a hand drawer that runs the stage's real atoms,
  with cx defined locally + rt imported via the '@lib/...' lane.
  Keep such canvases UN-id'd — an id claims same-source falsely.
- LEGACY-row retirement pattern in the drift spec: when a curation
  override dies because the row splits into the shared section, the
  LEGACY row rides AXIS_ROWS (the select precedent) AND the
  OVERRIDE_FIELDS matrix drops the entry — three files move as one
  conscious snapshot edit (curation + LEGACY + matrix), all asserted
  by the pinned tests.
- Density co-stamp completeness: the named rung's coefficient=1 pin is
  ACTIVE inside the scope (channels compose base × coefficient; the
  pin stops outer coefficients at the boundary — an outer ×3 wrapper
  moves a pin-less box 24→72px). "Explicit rung = exact rung" is the
  pin's job, not a restatement.
## Techniques (mine, task 12 — component-canvas review)
- STALE-ELEMENT-REFERENCE artifact (task 10's transition-frame cousin):
  capturing an element handle BEFORE a Svelte state flip, then reading
  computed style after, can read the PRE-flip node — the framework
  re-created the element and my reference went stale ("stageTheme stayed
  light" while exactly one [data-theme=dark] existed elsewhere in the
  same root). Law: after a state flip, RE-QUERY (find the flipped element
  by its new state, e.g. [data-theme="dark"]) and check ancestry
  (root.contains) instead of trusting captured handles.
- Counting-rule discipline for bar/hook numbers: "28 data-jx-canvas-axis
  hits" is true ONLY for the VALUED attributes (data-jx-canvas-axis="<axis>"
  = 7 menus x 4 canvases); the raw attribute string appears 195x (menus'
  check-mark refs included). Pin the counting rule with the number or
  the next reviewer re-litigates it.
- Old-page tier audits: `git show <pre-commit>:<path> | wc -l` + grep the
  dead toc ids + count resolveRawCode — three commands, objective tier
  evidence (component-canvas: 284 lines, 4 dead ids, no archetype
  sections -> tier 2 confirmed).
- svelte-check delta can be a POSITIVE receipt: quill's page went 7
  errors -> 0 (the fleet cx idiom included) — page reviews should note
  when a refactor RETIRES idiom debt, not only when it adds some.

## Highlights found in others' pages (task 12 additions)
- (quill, component-canvas) The same-source LAW documented as a page
  section ("the id is the extraction key") — teaching the platform
  mechanism on the page of the component that implements it: the docs
  page as the law's own reference manual.
- (quill) The two-seat density/theme rows ("the PROP is the rung seat...
  The AXIS lane is the supply seat") — when one name carries two
  channels, name both seats in one cell with the law that separates
  them; the reader never has to hold the ambiguity.

## Techniques (mine, task 13 — cascader review)
- ARIA-LABEL LOCATOR pattern: when a family's root carries the label
  prop as its accessible name (cascader role=group aria-label), locate
  specimens by `[data-jx-cascader][aria-label="<label prop>"]` — immune
  to stylex hash classes, drawer code-sample text collisions, and
  ancestor-walk overshoot. My first two probe passes failed on exactly
  those (caption fragments matched the DRAWER's code-sample text; the
  ancestor walk found the canvas stage's stamps instead of the
  cascader's).
- Cross-specimen comparison instead of clone-into-island when the page
  ships BOTH configs: the light and dark specimens sit side by side —
  measure each in place (cleaner than cloning, no island remount).
- Distinguishing same-name tokens: --jx-text-base (the ruler's T_base
  constant) vs --jx-text (the density channel) — pages that conflate
  them document density paint that does not exist; the fold's verbatim
  "NOT the density channel --jx-text" wording is the correct shape.
- The dead-Source-column fold: when a table's guard can remove a column
  (tokens.some(t => t.source)), folding the facts into the visible
  column and deleting dead rows is the review-legible form — but verify
  the headers/row-count/empty-cells from served bytes, since the fold's
  whole value is what no longer renders.

## Highlights found in others' pages (task 13 additions)
- (quill, cascader fold) The a11y prose carrying its own measurement
  ("the native select measures 35px tall at every rung — measured
  ambient, sm and lg — clearing the 24px WCAG 2.5.8 AA target floor")
  in the a11y SECTION rather than the axes table: the hit-floor fact
  lives where the a11y reader looks.
- (quill) The honest-caption pattern perfected: each specimen caption
  names the exact SSR bytes it produces ("data-density=sm +
  --jx-density-coefficient: 1 on the root") — the caption is its own
  grep command.
## Mistakes to avoid
- `rg -rn` is the --replace trap AGAIN (AGENTS.md law): two commands this
  task silently rewrote matches with "n" before I caught it. `rg -n` only;
  `-r` never as "recursive".
- `echo ===` as a separator fails under zsh (`== not found`); quote it or
  use `echo ---`.
- Old pages may carry unverifiable numbers (rung px tables) — verify
  against the CSS source before preserving them into the new page.

## Upgrades applied back to my pages
- (from 2-breadcrumb, candidate for the anchor page at batch close): the cx
  idiom's `.filter(Boolean)` does not narrow — a type predicate
  (`.filter((s): s is NonNullable<typeof s> => Boolean(s))`) silences the
  svelte-check `Object.entries` error that anchor carries at line 66; and
  the runtime `query` needs the schema's `const` type parameter
  (kernel one-word fix, campaign-wide) before `density={query({…})}` type
  checks clean. Both logged for the orchestrator; per-page patches would
  fork the fleet idiom.


## Techniques (task 14 additions)
- First-review posture (no prior review to be independent OF): re-derive
  every brief claim from three independent surfaces — source read, raw-SSR
  byte parse, live computed probe — and let any disagreement between the
  three, not the brief, decide the finding.
- Specimen-index discipline in probes: avatar's named-steps panel renders
  sm/md/lg siblings under one parent; `[data-jx-avatar]` index [0] is the
  sm box (6px cut). Claims worded against the md baseline (8px) must
  target index [1] — a passing inertness check on the wrong specimen
  proves the wrong sentence. First radius run did exactly this; the
  during=6px unmoved was TRUE but not THE claim.
- The 17−8 arithmetic is best receipted from raw SSR bytes: parse every
  <table>, read body-row first cells — family 9 (src…rest, size absent),
  universal 8, and the page's OWN axes table also parses as an 8-row
  4-col table; disambiguate by the heading context probe (byte offsets
  vs nearest <h2>/<h4>), not by shape.
- Frozen-pole receipt without a browser: the built CSS carries the whole
  story — count the voice declarations (2 poles each), rg for
  `.dark{…voice` (none), then ONE live probe to confirm nothing repaints
  under the bridge. Single-evaluate, cross-instant.
- svelte-check triage for review tasks: workspace baseline (1623 here)
  dwarfs any single family; grep the log per-file, classify Error vs
  Warn, then `git log -- <file>` for provenance — pre-existing family
  errors from a batch commit are findings for the family owner, not
  defects of the page under review.

## Highlights (task 14)
- (vellum, avatar) The size-not-curated comment is the badge lesson
  stated as policy: "an override for a filtered row is dead text" —
  the §13 adoption (family prop IS the axis) means the curation file
  must stay EMPTY for that name, and SSR proves it (size absent from
  the family table).
- (vellum, avatar) The axes-section summary is a falsifiable claim
  sheet: "the avatar is a leaf, its css reads none of their carriers,
  each row carries the negative-grep receipt" — every clause was
  independently checkable and all held.
- (vellum, avatar) Play-state lab kept hand by the documented rejection
  class (playground bind + {name}/{variant} shorthands) with the chip
  FAQ precedent cited inline — the rejection itself is receipted.

## Techniques (task 15 additions)
- Co-resident theme specimens beat flip probes when the page offers
  both: the axes canvas carries a light group and a permanent theme="dark"
  group side by side — ONE evaluate reads all four voices in one instant,
  no class flip, no transition-frame exposure. My first attempt used the
  dark specimen as its own baseline; the `darkClass` field in the probe
  output caught it (measurement-first applied to my own rig).
- Rung-ladder receipt without per-rung specimens: set the rung's
  data-density attribute on a live group root — the component's
  named-rung stamp IS that attribute, so the css scope (the mechanism
  under test) is exercised verbatim. Method-note it; don't let it pose
  as a prop-driven measurement.
- Old-page token rows are evidence in BOTH directions: avatar's --jx-inset
  row was FALSE (no reader), button-group's was TRUE (paddingInline reads
  it) — dropping a row needs the same grep-the-reader proof as keeping
  one. The provider review's extra duty caught the drop.
- Type-union vs render-map drift: a sourceLabel-style mapper that maps
  three of four union members renders '' silently — count empty cells in
  the SSR table parse, then chase the missing map arm.

## Highlights (task 15)
- (vellum, button-group) The axes-canvas dark specimen is a standing
  four-voice exhibit: border flips, ink frozen, seams color-free, cluster
  shadow inverts — each clause probed true, and the page names the
  declaring layer per voice (the island re-declaration at jixoai.css's
  slot block, the :root alias, the raw token).
- (vellum) The query() case documents its own typing law inline (why BOTH
  generics are load-bearing) — the drawer code teaches the §6 law.
- (vellum) Honest commit message vs imprecise page comment: "disclosed as
  follow-up" (deferral) is what the report owns; the page comment's
  rejection-class lumping is the residual wording fix.

## Techniques (task 16 additions)
- The provider/candidate hypothesis DIES by negative-grep: grep every
  §11 carrier var read in the family dir BEFORE writing the color row.
  color-picker's "CONSUMES size and color" (old page + the family's own
  props comment) was falsified by one exit-code-1 grep — the family is
  the color INSTRUMENT (it edits values) and deliberately hue-neutral;
  supply-only with the stamp grammar measured verbatim on the live
  style attr is the honest row.
- Runtime-varying tokens make probe numbers LIES if quoted: --brand-hue
  is a live wall-clock seed (hue-runtime stamps :root; 88 → 173 between
  reads). When a probe value moves between runs, find the clock before
  writing prose — cite the L/C signature and the dark drift, never the
  hue. (This also explained two "contradictory" earlier probes.)
- The ambient-vocab matrix keys on INLINE array literals at PropsTable
  call sites: `props={axisRows}` (identifier) is invisible to the AST
  parser — avatar inlines and is pinnable, button-group passes the
  identifier and is unpinnable. If a page wants the ambient pins, inline
  the array (and drop the now-unused PropEntry import).
- Matrix re-pin workflow (the avatar precedent): retire the hand rows'
  entries, move the tracked ambient rows to the axes-table call-site
  index with a note, add any NEW tracked rows (the bijection's
  delete-attack counts every AXIS_PROPS row — {density, variant, tone,
  material, size}, NOT the eight axes), and keep own-marker entries only
  where the AST can see them. Write the reasoning INTO the fixture note.
- A canvas missing `files` 500s the page (drawer reads .length of
  undefined) — the dev-server log names the component and page line.
  Composing the drawer from the extraction (which the fix requires)
  earns the PILOTS block for free.

## Highlights (task 16)
- (scribe, color-picker) The well IS the ruler's floor equation
  (--jx-color-lane = max(--jx-hit, --jx-icon + 2×--jx-inset + 2px)) —
  the density story measured as 34/36/46/58 · 11/12/13/15 across the
  rungs, with the named-rung stamp's coefficient reset (exact rung,
  never double-scaled) read off the live root.
- (scribe) The theme split's three classes on one page: raw-token flips
  (caret/border/shadow/ring/terminal), stylex-alias frozen chrome,
  color-space constants neutral — and the falsified family comment
  flagged rather than repeated.

## Techniques (task 17 additions)
- READ THE ASSERTION before diagnosing a "flake": two different
  failures wore the same spec file — the pre-edit one was a real 5s
  mount flake (2/3 solo greens), the post-edit ones were my own missing
  section ids (DocsInstall/DocsSeeAlso wrappers dropped the #install/
  #see-also hooks the page pin demands). Wrapping docs primitives in
  id-carrying divs is part of migrating a page that pins its skeleton.
- A virtual module does not auto-invalidate when the page that feeds it
  changes mid-session: resolveRawCode kept serving the pre-edit id list
  ("the page ids are: [types, axes]") through touch + HMR — only a dev
  restart regenerated it. Budget one restart when adding canvas ids.
- The frozen-pole probe generalizes: co-resident light/dark specimens +
  a built-CSS declaration count (each alias exactly 2 poles, one .dark
  in the sheet) is a two-minute receipt for any stylex-alias family —
  avatar and descriptions share the same five-voice chrome set.
- The empty-source disease is a MIGRATION hazard, not a one-off: any
  hand TokenTable row with source 'structural' renders an empty cell —
  sweep for it on every page rewrite until W-next #3 lands.

## Highlights (task 17)
- (scribe, descriptions) The ruler's THREE voices measured per rung —
  terms (secondary), values (body), padding (gap/inset) — because the
  family reads six ambient channels, not two; the axes row names all
  three and the ladder receipts each.
- (scribe) The dl semantics carried the a11y story for free: dl/dt/dd
  rows preserved verbatim — the component's honesty (never a table in
  disguise) is its own accessibility receipt.

## Techniques (task 18 additions)
- Tier-3-by-pin-density is a REVIEWABLE process: the review re-runs the
  pins (AST source read + served bytes + spec execution) and re-diffs
  the integration commit for table-row touches. A zero-row-touch diff +
  three green pins is what makes a surviving hand table honest.
- The zero-markup receipt has a precise shape: childTypes over the
  chip's childNodes. [8,3,8] (comment/text/comment) = the page author's
  own Svelte comments flanking one text node; the engine adds zero
  elements. Attribute the comment nodes honestly (author markup, not
  engine/stylex artifacts) — the receipt survives either attribution,
  but the next auditor shouldn't chase the wrong source.
- Padding formulas verify at EVERY rung, not just the worked example:
  radius + font×(lh−1)/2 predicted 3.25/3.75/4.475/7/11.5 and the DOM
  delivered exactly that — a one-line-per-rung check that turns a
  hand-table claim into a law.
- Kinship naming wants three greps: the shared-import grep (same
  symbols, same module), the mount-site grep (who setContexts the
  provider — page demos vs family vs scenes), and the leaf grep (zero
  component imports + zero edge references; beware token-NAME collisions
  like chip's "Highlight" focus ring).

## Highlights (task 18)
- (quill, inline-code) The padding formula as NORMATIVE css in the
  geometry section (padding-inline = radius + fontSize × (lineHeight−1)/2)
  with worked examples — the page teaches the equation, the probe
  confirms it at every rung. The best-measured page of the batch.
- (quill) Tier-3 honesty: the hand table survived BECAUSE it is
  triple-pinned, and the page says so — the tier decision itself is
  documented in the toc comment and the integration commit.

## Techniques (task 19 additions)
- Re-derive-on-fixed-tree means the DISPOSITION is untrusted until the
  probes land: quill's numbers reproduced exactly, but only after three
  probe rounds — the swap REPLACES the img (post-swap img reads go
  undefined; pre-swap panel reads go null). The failure sequence IS
  LAW #15's proof: scroll into view → poll for the broken panel → read.
- Deterministic post-swap locators: the family's failure frame is
  span[data-jx-image-broken] and its style attr embeds the width/height
  literals — [style*="640px"] keys the exact demo panel without any
  ancestor walk (ancestor walks kept catching the canvas stage's own
  data-density="default").
- ComponentCanvas stages carry their OWN data-density — any
  [data-density] query near a canvas must exclude the stage element or
  it reads the canvas, not the component.
- Two failures in one spec file are two stories: attribute by reading
  the assertion text, not the filename (the task-17 lesson, re-earned
  on image's sweep planning).

## Highlights (task 19)
- (quill, image post-fix) The broken panel's style attr is the merge
  law made visible in one line: --jx-density-coefficient: 1; width:
  640px; height: 360px — named-rung carrier, coefficient reset, and the
  consumer dims joined in source order.
- (quill) Path (a) as a disposition pattern: when a slot suppresses the
  family's own stamp, DROP the slot and demo the default frame — the
  honest surface is the family's own.

## Techniques (task 20 additions)
- The empty-source disease has a CURE SHAPE now, not just a symptom
  list: sourceLabel maps {density, component, color}; every page that
  passes 'structural'/'theme' renders blank cells. Three instances
  (inline-code rode a fix, descriptions old page, input-group 5 cells)
  all heal with ONE mapper arm — the W-next #3 fix should add the arm,
  not patch pages.
- Mixed-emission theme rows probe as three greps on ONE element set:
  raw var() readers flip (seam), stylex alias readers freeze (bezel),
  raw token recipes follow (well shadow) — name the emission form per
  voice and the row writes itself.
- Reduced-motion kills probe in one line:
  page.emulateMedia({ reducedMotion: 'reduce' }) → transitionDuration
  0s. Never cite the css @media alone when one emulation proves the
  kill live.

## Highlights (task 20)
- (quill, input-group) The forwarding-≠-consumption correction names
  its own root cause in the row prose ("the §1 forwarding rule mistaken
  for consumption") — a falsified claim turned into a teaching row.
- (quill) One bezel, three emission forms, all measured: the theme row
  is the fleet's cleanest demonstration that "theme" is not one
  mechanism but a stack of emission-time decisions.

## Techniques (task 21 additions)
- A "third instance" dispatch under-reports: sweep the WHOLE fleet for
  the disease before sizing the fix. The one-arm mapper bug blanked
  cells on 27 pages (dropdown/date-picker ×10 each) — the fix's value
  statement changed from "3 pages" to "the fleet", which is why
  component-level fixes earn their keep over page patches.
- The mapper arm should mirror the union ONE FOR ONE — then the type
  and the render can never diverge again without a diff showing in the
  added member. The comment at the mapper names the failure mode for
  the next editor.
- Harden the contract you just fixed: a 2-test render pin (every union
  member renders its label; the no-source guard drops the column) costs
  245ms and locks the arm against regression. The no-source half is as
  load-bearing as the fix half — cascader's two-column shape rides it.
- Badge's `source: 'theme'` was an OUT-OF-UNION page value — the page
  side of the same disease. When the union and the mapper disagree,
  sweep the pages for values living in NEITHER.

## Techniques (task 22 additions)
- Same-token/opposite-emission contrasts prove the two-layer system
  better than any single-family probe: carousel's TYPED
  tokens['--jx-shadow-xs'] arrow shadow is byte-identical under a dark
  island while button-group's RAW var(--shadow-xs) flips black→white —
  co-resident specimens + the emission census (typed intermediate vs
  raw read) is the full receipt in one table row.
- Keyed dot re-render vs stale capture: capturing the dot array BEFORE
  a paging click then re-reading it after yields -1 for the moved
  aria-current (Svelte updated the OLD node objects). Re-query inside
  the after-read — the second LAW #14 corollary this week.
- The scroll landing verifies as a MODEL (scrollLeft = slide + gap),
  never as px: two reviewers at two viewports land 671 and 831 and both
  are correct — a page that hardcodes either number would fail the
  other's probe. Carousel's prose claims only the model.

## Highlights (task 22)
- (marginalia, carousel) The axes canvas is a three-panel physics demo:
  ambient chrome, lg-stamped chrome (unmoved, stamp visible), dark
  island (frozen) — every panel is a falsifiable claim with a
  data-probe hook, and the caption states the measured outcome.
- (marginalia) The token table's law-named rows ("the slide law", "the
  track gap", "the arrow shadow") retire the falsified --jx-icon/
  --jx-hit rows while disclosing the retirement twice — the cleanest
  falsification handling of the batch.

## Techniques (task 23 additions)
- "Measured" sentences are per-probe falsifiable even when the
  surrounding demo works: card-grid's query flip (default↔sm) was
  REAL while its "measured tenant padding 12px ↔ 16px" was not — the
  full-tree computed-style diff (walk every descendant at both
  viewports, count movers) settles it in one probe. 0 movers = the
  sentence goes.
- Padding ladders have ARMS: the section-card header steps 12/12/16/20
  on paddingInline while paddingBlock steps 8/8/12/12 — read the
  shorthand, then name the arm the page's number refers to before
  judging a claim true or false.
- IO-armed entrances gate on honest scroll: window.scrollTo stepping
  raced the IntersectionObserver (0 entered after a full loop);
  scrollIntoView + settle armed it instantly. When an entrance reads
  "never fired", try a USER-shaped scroll before blaming the family.
- data-reveal wrappers hide far sections from IO too — a page-level
  reveal system can starve a family's own observer during fast
  programmatic scrolls.

## Highlights (task 23)
- (vellum, card-grid) The two-halves density split is the batch's
  cleanest "self inert / tenants real" story: --jx-unit declared
  :root-ONLY (single declaration grep) makes the spatial gradient
  rung-invariant BY CONSTRUCTION, and the section-card header ladder
  (12/12/16/20 inline) makes the tenant half digit-exact.
- (vellum) The motion row is armed-by-IO with a reduced/no-IO
  immediate-enter fallback and an nth-child ≤8 delay cap — the family's
  own time axis, carriers unread, with the no-JS visibility law.
