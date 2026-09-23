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

## Techniques (task 24 additions)
- Svelte `style={derived}` OWNS the whole style attribute: probe-set
  `el.style.flex`/`el.style.width` are silently overwritten on the next
  re-render — when a fix must change inline style, it must ride the
  derived string itself, not a probe-side mutation.
- The flex min-content floor has a precise anatomy: a stage arming
  children `flex: 1 1 100%` makes flex-basis override width entirely —
  container queries (container-type: inline-size) do NOT release that
  floor. The fix is `flex: 0 0 min(Wpx, 100%)`: the basis carries the
  width, grow/shrink zeroed. Read computedFlexBasis before blaming
  min-content.
- grep -c counts LINES, not occurrences: a ×5 replacement can read 4
  when two hits share a line. `grep -on pattern` gives the true
  occurrence count (task 24: 203×2 + 637/638/640).
- Boundary probes close caption claims exactly: set the viewport 1px
  either side of the media key (1024 vs 1023 at 64rem) — a flip that
  lands on the exact key proves both the mechanism and the number.

## Highlights (task 24)
- (link) The em-voices size story is the batch's subtlest consumption
  proof: the atom declares NO font-size, so the stamped 14px flows
  into two DIFFERENT voices — the 0.8em glyph scales (11.1875px live)
  while the 4px underline offset holds its optical calibration fixed.
  One stamp, two consumption laws, verified in one evaluate.
- (link) The frozen-pole contrast is grep-visible AND probe-visible:
  the atom reads `tokens['--jx-primary']` (frozen at :root) so dark
  islands keep byte-identical ink, while the SAME element's `--primary`
  chain recomputes live — co-resident specimens settle it without any
  theme toggling.

## Org contract confirmation (task 25, per orchestrator request)
- **BOARD.md is READ-ONLY for me.** Confirmed: across tasks 16-25 my
  authorized writes have ever been only (a) my numbered reports under
  agents/scribe/reports/, (b) agents/scribe/experience.md, (c) product
  files explicitly mandated by the dispatch. I have never written
  BOARD.md (reads only, for context). None of my task briefs implied
  write access to BOARD; if any teammate's brief suggests otherwise,
  that brief is the bug. The task-24-window clobber did not come from
  my session's write path.

## Techniques (task 25 additions)
- When a data field vanishes between source and DOM, grep the RENDERER
  first: TokenTable declares `description?: string` (token-table.svelte:41)
  and never reads it again — the theming table's descriptions are dead
  data. My consolidation append rendered nothing in SSR; I reverted it
  rather than ship a fix that only LOOKS fixed. Read-back-or-revert.
- `:where()` token re-declaration stacks arbitrate by source ORDER
  (zero specificity each): a wrap-move-restore probe (card → div.dark →
  div.dark.jx-light → restore) captures all three scopes in one
  evaluate — base, dark engagement, and the order-arbitrated hybrid.
- SSR string greps miss em-dash/apostrophe-escaped text: verify an edit
  landed by grepping the FILE first, then decide whether "absent in
  SSR" means not-rendered (renderer drops it) vs not-grepped (entity
  escaping). They have different remedies.
- The copied-state scope can ride the CONTROL ITSELF, not an ancestor:
  code-card sets `'jx-hue-success copied'` on the button (source :509) —
  an ancestor `closest('.jx-hue-success')` probe reads false while the
  mechanism works. Find the class in source before writing the probe.

## Highlights (task 25)
- The −4° drift receipt, captured by two reviewers at two wall-clock
  instants (calc(327 − 4) vs calc(337 − 4)): the hue base is the
  brand-hue clock, the −4 is the sheet's invariant — the cleanest
  demonstration yet of "cite the arithmetic, never the absolute hue".
- 68 spans live vs 0 in 1.2 MB of raw SSR: the client-highlight medium
  named on both sides — and the single style="color:" hit in the SSR
  bytes was escaped sample prose (sugar-high's var(--sh-<type>)),
  not a span.

## Techniques (task 26 additions)
- Node-identity proof for "no re-mount": mark the live element
  (`el.__probeMark = n`) BEFORE the state flip, then re-query and
  compare reference + marker after — Svelte LAW #14 makes re-creation
  the default suspicion, so "it still works" is not evidence; the
  surviving marker is.
- Nearest-wins scope semantics need a shadowing probe: html.dark under
  a nearer .jx-light stage must NOT flip the region — resolving the
  root-most scope instead of the nearest one would. One flip proves
  the walk order, not just the walk.
- Reduced-motion rules have REACH tiers: a zero-specificity :where
  block inside @media lose to ANY class declaration even under reduce,
  and scroll-behavior is non-inherited (an html-level smooth never
  leaks). Discriminate with a consumer class in both media before
  crediting the rule with "forcing" anything — then read the rule's
  own comment, which usually already states its tier.
- Count prop rows, not <tr> bytes: a folded universal directive can
  render a SECOND table with its own header — raw counts read +2.
  Enumerate the row names (python re.split on <tr>) for a receipt
  that stays comparable across pages.

## Highlights (task 26)
- (native-scroll-area) The fifth theme mechanism is the first where
  the CONSUMER of the theme signal is the platform scrollbar itself:
  color-scheme follows a JS-resolved stage scope (not a css class
  cascade), so the bar re-schemes in place — proven with a surviving
  DOM marker through the flip.
- The incident disclosure is now a four-record verification pattern:
  page comment ↔ integration commit message ↔ served SSR (marker +
  restored rows) ↔ my own green gate run. The LAST-WRITE write-then-
  verify incident turned into the fleet's model for honest disclosure.

## Techniques (task 27 additions)
- "Consumed one promotion away" probes open REAL popovers: click the
  trigger, await `getAnimations().finished` + settle (TRANSITION-FRAME
  law), measure computed paint, then `hidePopover()` — never measure a
  panel that is mid-WAAPI or still closed.
- Family hooks beat generic selectors: my first battery read wrapper
  panels (`[data-probe]` divs) and got 16px/transparent/0-width — the
  family's real hooks were `nav[data-jx-navmenu]`,
  `[data-jx-navmenu-trigger]`, `.jx-surface-body` (the FILL rides the
  surface body, not `.jx-pop`). Read the component's element markup
  BEFORE writing probe selectors.
- The `universal` directive on PropsTable LIFTS axis-named rows into
  the shared table: a 13-row authored hand table serves as 5 + 8
  (shared) + parts. Count by enumerating ROW NAMES across all tables,
  never `<tr>` bytes — headers and folds corrupt byte counts.
- Async fits and roving trims need settle discipline: the indicator's
  hug-box is written by fonts.ready/ResizeObserver (early read w=0),
  and the roving trim's empty-state law renders ALL triggers tabbable
  until trim — read both on a fresh, settled load.
- Receipt discipline: quill's "tabIndex -1 (probe-asserted)" did not
  reproduce — the served span has aria-hidden only. When a receipt
  names an ATTRIBUTE, verify the attribute; "the intent holds" (no tab
  stop) is not the same as the attribute existing.

## Highlights (task 27)
- (navigation-menu) The promotion-away radius channel is the cleanest
  consumption story in the fleet: the nav root always stamps
  --jx-radius-consumed and the TOP-LAYER panel reads it through the
  DOM inheritance a popover promotion keeps — measured 0px → 10px on
  real open menus, paint moving without DOM movement.
- The theme split's clean signal discipline: the per-panel hue
  injection drifts on the wall-clock, so the split lives or dies on
  the IDLE NEUTRAL token — oklch(0.3211) in both scopes (typed alias,
  frozen at :root) against the raw underneath 0.3211 → 0.8452, with
  the panel flipping 0.96 → 0.185. Two channels, opposite answers,
  one element tree apart.

## Techniques (task 28 additions)
- Enumerate SERVED rows by name before any rest-row/EXTRA claim: the
  badge-indicator api section serves exactly 14 rows (6 family + 8
  universal), no class row, no rest row — "meta 15 − 1 IS class" only
  reproduces as an enumeration, never as an arithmetic quote.
- The typed-alias freeze has a one-line mechanism: a stylex token
  declared `'--jx-destructive': 'var(--destructive)'` substitutes at
  its DECLARING element (:root), so descendants inherit the computed
  token and a scoped .dark re-declaration of the RAW token never
  re-enters the chain. The injected-island probe (move-measure-restore
  around a div.dark) shows flip and freeze in six lines of output.
- Explicit-rung demos are scope-driven, not media-driven: receipt them
  at TWO far-apart viewports (900 and 1280) to prove viewport
  independence directly — one viewport proves nothing about the scope
  channel.
- One non-reproducing read (a 16px that two fresh dumps refute) is
  recorded as a transient, never averaged in: settled truth needs
  independent re-reads, and the report says which read failed and why
  that does not shake the claim.

## Highlights (task 28)
- (badge-indicator) The frozen-pole pair is the campaign's cleanest
  raw-vs-typed receipt: raw --destructive oklch(0) → oklch(1) across
  the island while typed --jx-destructive and the chip's black/white
  paint do not move — the declaring-element law in six numbers.
- The posture-split size echo completes the §11 grammar: same stamp,
  three answers — inline mirror outruns the atom standalone (18px),
  the wrap absorbs it riding (chip 10px), and the chip stamped
  directly moves nothing. Posture, not the axis, decides the answer.

## Techniques (task 29 additions — the injected-island law, hardened)
- Injected `.dark` islands MUST WRAP IN PLACE at the field's own
  position (insert the island before the element, move the element in).
  A body-appended island SEVERS the stylex tokenScope/theme-class
  ancestry: every `--jx-*` read goes guaranteed-invalid (transparent
  backgrounds, currentColor fallback borders) — artifacts that
  masquerade as a refutation of the frozen pole. My first two
  contradiction reads were this artifact; the in-place craft
  reproduced the claim exactly.
- Read islands only on a SETTLED page: one dump ran mid-HMR-recompile
  with the stylex theme chunk unloaded and every `--jx-*` getProperty
  returned EMPTY. After a restart, wait for compile to fully settle
  (6s) before the first read; if a read looks impossible (empty vars),
  suspect the pipeline before the page.
- Synthetic (untrusted) KeyboardEvent/InputEvent dispatches do NOT
  reach Svelte 5's delegated handlers — focus opens nothing, filters
  filter nothing. Interactive claims need REAL Playwright input:
  locator.click/focus + page.keyboard. Static attributes (controls,
  owns, multiselectable, chips) survive synthetic reads; behavior
  does not.
- emulateMedia({ colorScheme }) is the probe for media-keyed bases:
  flip light→dark→light and read the computed property — a clean
  three-point receipt that a class-scoped island cannot produce.
- An empty file glob handed to vitest runs the WHOLE suite. Not fatal
  — it doubles as a campaign-wide smoke — but attribute any reds
  before quoting: contention flakes (pass solo) are the known class.

## Highlights (task 29)
- (combobox) The first fully-independent review of a self-reviewed
  page reproduced EVERY number: the floor ladder digit-exact in both
  directions (40/40/40/48), the two-time-bases pair verbatim (border
  frozen oklch(0 0 0) while the well flips white-inset; raw
  --terminal-foreground 1 0 0 vs typed 0 0 0), and the hovered row
  landing the dark ground oklab(0.312 0 0) beside the active row's
  light pole — one listbox, two time-bases, now measured by two
  independent probes.
- The third time base (colorScheme on prefers-color-scheme) is the
  fleet's first MEDIA-keyed theme channel: emulateMedia flips it while
  a .dark class does not — three channels, one shell, each proven by a
  different probe shape.

## Techniques (task 30 additions)
- Canvas-painted families need PIXEL probes, not computed styles: the
  terminal's ground lives in a 2D canvas — read it via an offscreen
  drawImage + getImageData(3,3,1,1). A "ground holds light" claim is
  not checkable against CSS at all.
- Demo terminals may carry EXPLICIT theme objects (the workbench
  preset pair #161616/#ffffff): the shadowed knob wins by design and
  the token fallback never engages. Measure the shadow claim on a
  NO-theme instance (the density demos), or you will misread the
  shadow working as the token freezing.
- JS-resolved token reads (getComputedStyle inside $effect) are LIVE
  but UNOBSERVED: the effect's dependency list is the truth about
  what re-triggers resolution. ghostty's shell-color effect tracks
  only the theme-object prop fields — scope flips never re-resolve,
  but any prop-driven re-run re-probes the current scope. "Boot-time
  snapshot" overstates; "no-observer live-read cache" is the precise
  attribution. Read the deps array, then name the channel.
- A family can be typed-frozen on one LAYER (the css root atoms) and
  raw-cached on another (the canvas above it) with the same visible
  outcome — attribute per layer or the wording will be half wrong
  even when the measurement is right.

## Highlights (task 30)
- (ghostty-term) The shadowed slot demonstrated on BOTH branches in
  one probe battery: the explicit-theme terminal paints #161616 in
  both scopes (the knob shadows the sheet), while the no-theme
  terminal holds the last-probed pole across a scope flip (the sheet
  owns it, unobserved). Two terminals, one contract.
- The independent-attribution protocol paid out exactly as designed:
  my no-observer derivation and quill's boot-time-snapshot agree on
  every observable and diverge only on the counterfactual (prop-driven
  re-runs re-probe live) — the source deps array settled it without a
  second probe round.

## Techniques (task 31 additions)
- Dev-server warm/cold discipline is now a measured law of this
  campaign: three separate probe rounds on input-otp produced
  contradictory state-border reads (empty --jx-* vars, missing
  complete/filled/invalid rules) that ALL traced to cold-compile
  reads. The settled-page rule: double-200 with a 10s+ settle before
  the first read, a window flag to prove no HMR reload mid-probe, and
  a sanity token read before trusting any negative.
- The a11y-announcement law (measure announced text, not
  textContent) DOWNGRADED a cross-reviewer LOW: the error line's "!"
  is aria-hidden, so the announced text is the message alone.
  textContent reads over-count; filter aria-hidden subtrees.
- OTP behavior chains need REAL input events: programmatic focus +
  page.keyboard for typing/advance; real clipboard
  (grantPermissions + writeText + ControlOrMeta+V) for paste
  distribution. Synthetic ClipboardEvent was ignored (the handler is
  native-bound); synthetic keydowns never reached Svelte 5's
  delegated handlers (task 29's lesson, re-earned).
- Re-entry probes: Tab-after-blur navigates FORWARD from the blur
  point (past the group). To test entry redirection, focus an element
  BEFORE the group and Tab until focus enters it, then read the
  landed index.
- max() lane claims have TIE zones: when both legs of a max() are
  equal at some rungs, the winner narration must claim only the
  strict-wins rungs — input-otp's row does (line×2 wins xs/sm only;
  default/lg are ties). Verify the phrasing against the leg
  arithmetic, not against a "the winner is X" summary.

## Highlights (task 31)
- (input-otp) The complete-state brand border painted live
  (oklch(0.6489 0.237 …)) while the invalid dashed rule was absent
  from the served document entirely — conditional stylex atoms are
  selective in dev emission: same file, same create() call, different
  injection outcomes. The plugin suspicion is routed; the a11y state
  (aria-invalid/describedby) flows regardless.
- The measured-must-reproduce class now has a sibling: the
  announced-text-vs-textContent class. Both are "the page teaches X,
  the DOM serves Y" checks — one for CSS, one for the accessibility
  tree. The "!" mark is the fleet's first announced-text receipt.

## Techniques (task 32 additions)
- The cold-server trap re-bitten on my own probes: a fresh vite start
  needs FIRST-200 + 10-15s settle before the first read — three
  contradictory negative reads (empty --jx-* vars, 16px fallbacks,
  missing rules) were all one cold compile. A sanity token read before
  the battery, and a window flag to prove no mid-probe reload, are now
  standard pre-flight.
- Re-verify reviews read the FIX first (vocabulary sweep + served
  enumeration), then re-derive the STANDING claims fresh — the fix
  verification and the regression sweep are different passes with
  different receipts, and both belong in the report.
- max()/calc() lane claims: read the leg arithmetic at the element
  (computed custom props) before reading the computed result — the
  computed value cannot tell you WHICH leg won; the legs can.
- A "root == glyph" family (standalone Kbd) makes "the stamp moves the
  root but the voice stays put" incoherent at the rendered-size frame;
  the coherent frames are the kernel channel value (constant) vs the
  rendered size (follows the inline mirror). Name the frame before
  judging the sentence.

## Highlights (task 32)
- (kbd) The typed-REDECLARED vs typed-ROOT-ONCE taxonomy verified live
  on my own probe: --jx-tonal inside a .dark island reads
  oklch(0.7044 0.1872 calc(118 - 4)) — the re-declared stream with the
  -4° drift arithmetic in the calc — the exact counter-example to
  combobox's frozen --jx-border. Declaration coverage, not emission
  form, is the flip determinant.
- (kbd) The stamped-but-ignored receipt in its cleanest form: carriers
  8px/squircle stamped inline on the SAME element whose computed corner
  is 2px via var(--kbd-radius, 2px) — supply and seam on one element,
  zero ambiguity.

## Techniques (task 33 additions)
- **Glide precondition probe (menubar)**: the bar-glide vs panel-walker
  split is focus-state-dependent — from an Enter-open (focus INSIDE the
  panel), arrows are panel-scoped and dead; the glide requires
  trigger focus (click-open keeps focus on the trigger). When a
  keyboard chain has two key owners (bar walker / menu walker), probe
  BOTH entry states before declaring a chain dead.
- **Two-pass glide receipt**: pass 1 (Enter path) taught the scoping;
  pass 2 (click path) captured the actual claim. The failed-looking
  pass 1 became evidence FOR quill's open-question-2 adjudication
  (receipt over comment).
- **Dead-seat check before agreeing to a consolidation item**: when a
  reviewer proposes "one sentence in the <Component> row", grep the
  component for the field first — ui/token-table's `description?:`
  is declared but never rendered (second dead-API instance after
  code-card task 25). An agreed item with a dead seat is not shippable.
- **Content-identity check at review start**: `git diff <page-commit>
  HEAD --stat -- <page> <family>` — proves the bytes you reviewed are
  the bytes the author shipped, independent of how far HEAD has moved.
- **Rung census from source, not prose**: the density system's named
  set is FIVE ('lg'|'default'|'sm'|'xs'|'2xs', density.svelte.ts :23);
  a reviewer's "all four rungs" was imprecise in both directions.
  Count the union in the type, then count what the page serves.
- **Baseline classification of svelte-check noise**: page-scoped gate
  = 0 diagnostics ON THE PAGE; family-file diagnostics get classified
  by (a) identical pattern in an untouched sibling family
  (list-item/index.ts duplicate-identifier ×4), (b) workspace-dominant
  warning class (state_referenced_locally ×1018), (c) green runtime
  gates, (d) zero working-tree changes to the family.
- **Source-anchor alpha reads**: acrylic alpha from a color-mix recipe
  (jixoai.css :939 72% mix) — my settled-frame 0.732174 matches the
  source; the other reviewer's 0.83 didn't. The recipe, not either
  measurement, is the anchor.

## Highlights (task 33)
- (menubar) The in-place top-layer promotion verified end-to-end:
  DIV[role=menu] ← SPAN[slot] ← LI ← UL#bar live walk + the source
  chain — paint moves, DOM stays, inheritance carries the stamps.
- (menubar) The glide one-hop captured digit-for-digit on real clicks:
  File expanded=false / Edit=true / focus "Undo" inside, dead ×2,
  Escape restores to the Edit trigger — and the Enter-path counter-
  probe proving the trigger-focus precondition.
- (menubar) triggerOpen frozen-light band CONFIRMED at the exact line
  (menubar.stylex.ts :58-59 `tokens['--jx-muted']` — stylex atom
  freezes; menubar.css raw `var(--muted)` hover re-derives): the
  split-voice exemplar for the declaration-coverage taxonomy.
- (menubar) Consolidation item (a) with mechanism: authored hand array
  3 entries (label, density, variant), served 2 — density is
  axis-named and folds into the universal 8. The kbd class, third
  instance.

## Techniques (task 34 additions)
- **The attribution triangle (sibling noise in a moving tree)**: when a
  shared gate fails on a key that isn't yours — (1) unfiltered
  `git status --porcelain` at CLOSURE time (recon-time filtered greps
  miss work that enters the tree mid-session); (2) `git diff HEAD` +
  grep for the failing test's marker string; (3) `git log -S <marker>`
  — empty means never committed, i.e. in-flight; (4) timeline anchor:
  your own prior green log's mtime vs the HEAD commits'. All four legs
  landed in task 34 (sheet rework: +282/−108 uncommitted, lawTable
  never committed, my 08:16 green predates the drift).
- **The ink/paint-pair read as the standard dark-check**: for every
  frozen-surface claim, read BOTH the surface color AND the ink color of
  every text-bearing child in dark — a split-voice composite can freeze
  the paint while the ink re-derives (number-input's cell ink rode the
  standard lane, not the cell atom) → white-on-white at contrast 1:1.
  A screenshot of the dark specimen is the receipt; the computed pair is
  the mechanism.
- **Isolate shared-binding artifacts with a bind-only twin**: to prove a
  demo-seat bounce is the playground's and not the component's, repeat
  the exact interaction on a specimen with bind:value but no range
  attached (number-input's RTL seat) — stable empty proves the
  component's undefined commit is spec-true.
- **Recount discipline on meta censuses**: count raw keys, then LIST
  the quoted-duplicate keys before subtracting (number-input: 24 raw −
  'data-density'/'aria-invalid'/'aria-describedby' = 20 distinct named
  + rest = 21). My first dedup subtraction was off by one and briefly
  contradicted the other reviewer — recount by ENUMERATION, not
  arithmetic.
- **Registry-mirror pre-check on any family-file fix**: `diff -q
  registry/files/<family>/<file> apps/www/src/lib/ui/<family>/<file>`
  before proposing the fix — byte-identical today means a one-sided fix
  CREATES the divergence; the fix must land mirrored.

## Highlights (task 34)
- (number-input) The five-rung ladder digit-exact with the 2xs WCAG
  floor live (24×24/10), and the hold clock captured at ~99ms steady
  cadence with the off-button release and orphanStep false.
- (number-input) The frozen-ink seam's FOURTH instance found and
  screenshot-proven: the dark field's value is white-on-white
  (contrast 1:1, invisible) — frozen shell atoms + standard-lane ink
  that re-derives; the page's "cell ink likewise frozen" clause is
  false-as-served. Attached to W-next #7.
- (number-input) The PlayRange bounce caught live AND isolated to the
  playground via the RTL bind-only twin (stable "" = the component's
  undefined commit is spec-true).
- (process) The attribution triangle's first full rehearsal: 2 ambient
  failures keyed to sheet, proven sibling noise on all four legs, zero
  touches.

## Techniques (task 35 additions)
- **The warm-reload law (the cold-server trap's hydration face)**: a
  cold first visit can leave the app UNHYDRATED while vite compiles —
  no resolution, no degradation, no warns, everything frozen at the SSR
  shape. For any hydration-dependent machine (settle criteria, clocks,
  registrations), visit once to warm the module graph, RELOAD, then
  measure. My probe1's all-frozen matrix was this artifact, not the
  page's.
- **SSR registration order census**: same-pass registration is
  synchronous at component init, so an SSR byte census of two-state
  components splits by MARKUP ORDER — targets earlier in the pass
  render RESOLVED in SSR, later/missing ones render the fallback form.
  Count both forms before trusting a single "prerendered N" number
  (reference: 11 edge claims = 5 ??-fallbacks + 6 resolved-in-SSR).
- **The demo-lane test for posture demos**: a specimen NAMED for a
  posture must RENDER that posture — if the surrounding domain changes
  what it renders (the numbered-domain join), the lane is unserved;
  prefer moving the target outside the influencing scope (safe when the
  registry is route-page-wide) over rewording the label.
- **Comment-tolerant SSR regexes**: Svelte hydration comments
  (`<!--[-1-->`) sit INSIDE rendered elements — `[^<]*` patterns fail
  on them; match `(?:<!--[^>]*-->|\s)*` or locate the enclosing tag by
  rfind + </tag> containment.

## Highlights (task 35)
- (reference) The inheritance pole digit-exact in both contexts:
  13.5px-in-13.5px with the style attribute ABSENT at byte level vs
  18px-in-16px with the §11 stamp verbatim — the kbd contrast's other
  pole, measured.
- (reference) The theme bridge NOTHING-DECLARES verified by real .dark
  injection (on-root + ancestor island, restored): nothing moved — the
  fleet's only family with no css to activate.
- (reference) The edge machine end-to-end: Eq (1.1)/§ 1.1 resolved, the
  loud span with edge released, both settle warns once per episode —
  and the SSR duality refined: 11 edge claims = 5 fallbacks + 6
  resolved-in-SSR (same-pass-earlier registration), correcting the
  "0 resolved labels in SSR" half of the record.
- (process) The warm-reload lesson banked after my own frozen first
  visit; the sheet sibling noise re-attributed fresh on all four legs.

## Techniques (task 36 additions)
- **Multi-capture clocks for animationend machines**: single-run
  absolutes drift with fonts.ready/compile latency (797 vs my 779-844);
  run the mode 3× at an 8ms sampler and quote the RANGE + the
  decomposition (floor + exit + latency). The structural decomposition
  is the receipt; the absolute is instrument output.
- **The live no-cap proof**: a "no timeout cap" source read becomes a
  receipt when you hold PAST the cap (manual mode present at 4600ms
  with timeoutMs=4000) — behavioral proof of an uncapped lane.
- **Sub-frame timing**: rAF-poll resolution (first check at the next
  frame) reads "0ms" for instant unmounts — quote it as sub-frame
  instant, the honest form of ~27ms-class claims.
- **The stamp-lands-no-rule-hears read**: for descendant-bridge theme
  machines, read the layer's classList DIRECTLY (does the class land?)
  alongside the computed paint (does anything hear it?) — the pair
  proves BOTH halves of LAW #16's stamp-only attribution without
  closest()-chain ambiguity (the author's own probe-bug class).
- **Head-block presence reasoning**: a svelte:head style block inside a
  component renders whenever the COMPONENT mounts, independent of any
  {#if} gate on the styled element — the vocabulary ships even when
  the surface is closed (boot-splash's zero-css law rides this).

## Highlights (task 36)
- (boot-splash) The dead-replay fix verified end-to-end with the chip
  bind-back (open=false after internal dismissal) and multi-run clocks:
  fonts ≈700-720ms window (floor+exit+latency), manual uncapped past
  the 4s cap (live-proven), dismiss ≈350+latency, exit=none ≈ the bare
  floor, RM split = manual instant (sub-frame 0ms) vs auto floor-kept.
- (boot-splash) The LAW #16 theme pair digit-exact: the prop's dark
  class lands in the layer's classList while the paint stays light
  (descendant-only bridge), and the ancestor .dark host flips
  oklch(0.145)/oklch(0.9551) with no prop.
- (boot-splash) The campaign's first bit-exact meta arithmetic:
  21 props = 11 family + 8 axes + style + rest — "21 − 8 = 13 family
  seats (11 served + rest/style)" matches the file key-for-key.
- (boot-splash) W-next candidate: no family spec locks the
  dead-replay fix — a boot-splash.spec would pin the machine.

## Techniques (task 41 additions)
- **The closure-verification battery (reviewer #2's job)**: for each
  landed clause — (1) mirror integrity by diff -q across EVERY family
  file, not a spot file; (2) the new wording greped in both copies +
  the old wording's ZERO-REMnant check; (3) the caveat's cited source
  read (does jixoai.css :32-45 actually say that?); (4) the LIVE
  re-measurement of the claim the wording replaced.
- **The third-sample wall-clock receipt**: a hue-rotation caveat gains
  force from independent re-observation — 129 (1st pass) → 125
  (closure) → 137 (this review) with L/C (0.7044, 0.1872) invariant.
  One sample is a number, two is a correction, three is the law.
- **The ?raw module endpoint receipt**: when a drawer's content renders
  client-side (absent from SSR), verify its data path via the vite
  transform endpoint — `curl /src/.../file.svelte?raw` returns the
  exact bytes the bundler inlines. The build-time import is the
  guarantee; the endpoint is its receipt.
- **L/C extraction across color spaces**: Chromium serializes some
  computed colors as oklab — convert C = hypot(a, b) before comparing
  signatures; and read BOTH sides at the same instant to expose the
  drift calc (dark hue − light hue ≈ −4° live).
- **The native-invoker probe**: to prove attribute forwarding without a
  specimen, inject the attribute on the rendered root + a synthetic
  popover target, then click twice — :popover-open true→false is the
  zero-listener contract, end to end.

## Highlights (task 41)
- (press-button) All four closure clauses verified landed: the 42px
  drift fixed MIRRORED (7 files byte-identical, zero remnants, the
  ?raw module endpoint carries "40.0px measured at"), the theme row
  quoting the L/C signature + an accurate hue-runtime cite, the
  fill-ink seam named at the loudest rung (oklch(0 0 0) both sides,
  measured), and the popovertarget contract re-proven post-closure
  (open + toggle, zero listeners).
- (press-button) The hue wall-clock extended to a third runtime sample
  (125 → 137 post-closure) — the signature form is now empirically the
  only reproducible receipt, with dark − light ≈ −4° at one instant.
- (press-button) The api census by name: 15 authored → 14 served
  (density folds), the universal 8 intact; toc 12/12; page 0
  diagnostics; ambient 284/284 clean — the re-pinned matrix holds.

## Techniques (task 43 additions)
- **The self-proving typecheck fixture**: to verify a type BOUNDARY
  (not just a declaration), write a temp file where the REJECTED
  assignment carries @ts-expect-error and the ACCEPTED one carries
  nothing — zero diagnostics proves both halves at once (a false
  accept flips the directive to "Unused", a false reject surfaces a
  real error). Delete the file after the run.
- **Two fixture traps banked**: `Component['props']` does not type in
  svelte-check's emitted shape — use svelte's `ComponentProps<typeof
  Component>`; and a PROSE comment containing the literal directive
  text registers as a directive applied to the next line ("Unused"
  noise) — never write the marker in explanatory copy.
- **Visual-vs-DOM order receipt**: for direction-reverse claims, sort
  children by getBoundingClientRect().x descending and compare against
  DOM order — the flip shows as the descending list EQUALING the DOM
  order (the left-to-right sequence is its inverse).
- **Omission transparency read**: an all-auto axis set leaves the style
  attr carrying ONLY the consumer's layout declarations — the absence
  of carrier text IS the receipt (undefined stamps nothing, byte-level).
- **The rig-drive protocol**: enumerate the canvas's real select/input
  elements positionally (PlayRow wrappers don't expose label-text
  locators), drive each BOTH directions with settle waits, and diff the
  final computed state against the initial — byte-identity closes the
  clean-revert claim.

## Highlights (task 43)
- (prototype-flex) The rig verified byte-identical in both directions
  with clean reverts; the playground-snippet laziness live-proven (the
  snippet's help text absent from the DOM while the stage-body controls
  are always mounted).
- (prototype-flex) The query boundary TYPECHECK-PROVEN by my own
  self-proving fixture: gap rejects QueryResult (directive consumed),
  the size lane accepts (clean) — "lanes take query(); passthroughs
  don't" is now enforcement-backed, not just declared.
- (prototype-flex) The forwarder census panel-by-panel: named-step
  carriers, the sm/lg rungs, the dark bridge, string-gap verbatim, and
  the all-auto panel's carrier-free style attr — omission transparency
  at the byte level.
- (process) A fourth in-flight sibling edit (system-dialog) entered the
  tree mid-session; the 4 ambient failures keyed exactly to it and were
  attributed on the same protocol — zero prototype-flex keys.

## Techniques (task 45 additions)
- **The modal wheel-frozen finding (three instruments converge)**: with
  a modal dialog in the top layer, the docs scroller (.jx-shell-body) is
  wheel-frozen at EVERY hit target — bare backdrop, non-scrollable cell,
  genuinely-scrollable cell wheeled past its boundary, dialog padding —
  while the same wheel with the dialog closed scrolls fine. Chaining
  into inert scrollers is blocked, so "the document's own scroll is not
  locked" is true about LOCK and false about WHEEL. The honest disclosure
  names the wheel-user behavior, not the lock.
- **Find the real scroller before any wheel claim**: window.scrollY is
  the wrong instrument on this site — the scroller is .jx-shell-body
  (scrollHeight 9790 / clientHeight 720; documentElement fits the
  viewport). Walk the tree for scrollHeight > clientHeight + overflow,
  target it by CLASS (a generic find matches stray inline anchors), and
  sanity-prove the instrument by scrolling the page with the component
  CLOSED before measuring the open state.
- **Boundary test rigor**: a "scroll cell at its overscroll boundary"
  claim requires the cell to be GENUINELY scrollable first (inject tall
  content until scrollHeight > clientHeight), wheel to its own max, then
  keep wheeling and read the ANCESTOR scroller — a content-fits cell
  never reaches a boundary and proves nothing.
- **Programmatic clicks cannot test focus restore**: el.click() never
  moves focus, so the restore target reads BODY — an artifact of the
  probe, not the page. Real trusted clicks (Playwright locator.click())
  focus the trigger; only then does Escape's restore verify.
- **rAF single-evaluate timing beats interval sampling**: arm a
  requestAnimationFrame sampler inside ONE evaluate, dispatch the
  trigger inside it, and read the whole (t, x, open, .closing) trace —
  every intermediate frame lands (1050/986/947/911/903/899) and the
  claimed waypoints fall inside.

## Highlights (task 45)
- (sheet) The wheel clause falsified at its second half by the
  scrollable-cell boundary test — the shell pinned at every hit target
  while the sheet is open (backdrop, cell, boundary, padding); the
  first half (backdrop swallowed) reproduced. The honest wheel-user
  sentence rides closure.
- (sheet) The full timing battery digit-exact: entry waypoints
  1051/947/911/899/896 settled ~182ms, .closing inside the open window,
  Escape gone at 225ms, focus restored to the trigger on a real click,
  RM docked immediately and gone in 19ms.
- (sheet) The four-lane stamps on one top-layered root (sm/dark/12px/
  18px), the width workaround live (384@896, 288@992), 47 ids zero
  duplicates, meta 16 named, ambient 284/284 clean.
- (process) Three sibling edits cycled through the tree during this
  task (system-dialog ×2, the matrix fixture); each ambient state was
  attributed fresh and the final gate ran clean.

## Techniques (task 47 additions)
- **rem-vs-element-root falsification**: a claim that a size STAMP
  "re-scales a REM-based length" is testable twice — (a) the stamped
  element at 18px must compute the length × 18 if the claim held; (b)
  the DOCUMENT root font moved (html.style.fontSize 16→20px) must move
  the length if rem semantics hold. Run both: the length followed (b)
  and not (a) — the floor reads html's font-size, the stamp moves only
  em-relative copy. One experiment each direction beats any argument.
- **Falsified-mechanism seat census**: when a nuance sentence is
  falsified, grep EVERY seat that repeats it (the waterfall nuance sat
  in 5 places: axis row, overview, axes summary, query caption,
  receipts paragraph) — a partial purge is the drift-ledger's raw
  material.
- **Laid-out column count**: read columnCount (computed) AND count the
  distinct offsetLeft clusters of the children — the computed form can
  say "auto" while the layout answers the real question.
- **Frame-boundary phrasing**: Svelte's flush lands reactive style
  updates at the microtask/frame boundary — a same-task computed read
  after dispatching change is stale by design. Phrase settle claims as
  "by the first animation frame", and read after a rAF.

## Highlights (task 47)
- (prototype-waterfall) The 14rem floor measured end-to-end: 224px
  column-width, 3 laid out @1400 → 2 @760 — width floored, count
  follows, digit-exact.
- (prototype-waterfall) The size-stamp REM nuance FALSIFIED with the
  two-direction experiment: the stamp at 18px left the floor at 224px;
  the document root at 20px moved it to 280px. Both forms are
  §11-stamp-scale-blind; rem reads html. The MINOR rides closure with
  the corrected sentence for all 5 seats.
- (prototype-waterfall) The trio's see-also loop verified resolving
  (each page links the other two, renders itself as a span); LAW #18
  receipts on all 8 roots (41 mounted children); 64 ids zero
  duplicates; ambient 284/284 clean.

## Techniques (task 49 additions)
- **The pulse-envelope sampler**: rAF-collect opacity over > one full
  cycle and quote min/max against the keyframes' trough/peak (0.450/
  1.000 exact) — plus the background-image:none negative to separate a
  brightness pulse from a shimmer sweep (a sweep needs a gradient to
  move; none means the whole effect is the opacity channel).
- **The merge-law read in one attribute**: co-existence is proven by
  BOTH declarations appearing in the style attr (carrier + consumer)
  and the computed property naming the winner — one element read,
  two laws.
- **The dead-selector honesty scan**: query the live DOM for the
  RETIRED utility classes over an expanded selector list; zero hits
  against a counted live-block population is the re-hosting receipt —
  SSR text hits are escaped drawer code, not rendered classes.

## Highlights (task 49)
- (skeleton) The pulse verified as the third converging instrument:
  91 rAF samples/1.5s, opacity min 0.450 / max 1.000, background-image
  none — brightness oscillation, never a shimmer.
- (skeleton) The merge law visible in one attribute (--jx-radius-
  effective: 12px + border-radius: 3px, computed 3px) and the
  never-manufactures law pixel-exact (128×12 and 40×40 unchanged under
  an 18px voice).
- (skeleton) The RM freeze pixel-still (animation none, one constant
  opacity across a 1s watch); zero dead-utility elements vs 40 live
  blocks; 62 ids zero duplicates; ambient 284/284 clean.

## Techniques (task 50 additions)
- **The kit-boundary grep triangle**: for a "shared kit" claim — (1)
  grep the kit dir for every axis-carrier var (zero reads = behavior
  only); (2) grep the CONSUMER names of each kit part (adapter vs
  capability styles vs core) — disjoint consumption proves the
  split-by-concern law; (3) grep the named mechanism (resolveThemeScope)
  across the fleet — its consumer set IS the boundary receipt.
- **The verdict-gated chrome**: auto-hide chrome gated by a verdict
  attr (start-closed) is INVISIBLE to naive at-top probes — scroll the
  region to open the verdict before reading the thumb, and dump the
  FULL attribute sets (the verdict/liveness attrs live on the family
  HOLDER, not the thumb or track).
- **The pins armed-watcher**: arm a rAF watcher for the attribute,
  engage the pin (focus/hover/drag), read the appearance time, HOLD
  past the idle timer, disengage, read the disappearance — plus the
  opacity pair (track → 0, thumb's own stays 1) for the fades-never-
  the-thumb receipt.
- **Instance-finder discipline**: multi-instance pages anchor probes on
  aria-label or data-testid, never copy text — 'line one' matched a
  static size={18} panel and cost two runs before the aria-label-anchored
  'sync' seat verified the query claim (13@600 ↔ 18@1280, live both
  directions).
- **The substring gate trap**: grep -c 'scroll-area.html' counts
  native-scroll-area.html too — quote the full path in page-scoped
  gate receipts.

## Highlights (task 50)
- (scroll-area) The thumb contract at invariant form: aria-valuenow 50
  at mid-travel, thumb fraction == client/scroll digit-exact at my own
  geometry (0.180), the verdict vocabulary dumped (start-closed/none +
  data-chrome/data-width on the holder).
- (scroll-area) The pins timeline armed-watcher receipt: data-thumb-live
  on the family holder at 52ms after focus, held past 1.3s, gone 716ms
  after blur, the TRACK fading to 0 while the thumb's own opacity stays 1.
- (scroll-area) The radius owned-name collision digit-exact: the px lane
  double-stamps (--jx-radius-effective: 20px + --jx-scroll-thumb-radius:
  20px) and the auto Card computes 6px; the 'full' capsule serializes
  3.35544e+07px.
- (scroll-area) The frozen-ink watch NEGATIVE with the positive direction
  instrumented: bare .dark moves nothing; the stage text re-theme moves
  the chrome (and restores).
- (scroll-area) The query seat LIVE both directions (13@600 fresh +
  reload ↔ 18@1280 live), the fresh +page.ts matching the served DOM
  14/14.

## Task 54 — scroll-virtual (2nd review, PASS 0M/0m/1L + 2 carried LOWs)

### Banked lessons
- **parseInt stops at the `e` of `4e+06px`**: the CSSOM exponential serialization of
  large px defeats numeric parses of inline styles — parseInt('4e+06px') is 4, only
  parseFloat survives. Read the raw style string (or the rect) when a receipt depends on
  a length. Bit my own windowing instrument twice before the raw dump settled it; the
  same serialization the 1st review filed as a cosmetic LOW.
- **PlaySegmented locator**: the count switch is a role=group of class-less buttons in
  `.jx-play-seg` — selectOption cannot drive it; scope by container class and match
  trimmed text.
- **Engine-wrapper stamp walk-up**: anchor the composed root via `.jx-scroll-area`
  (the holder) — the role=region element is the kit's viewport one level down with an
  empty style attribute; reading stamps off the wrong level reads clean negatives.
- **The page's own PlayFields output is a cross-check instrument**: the scroll-virtual
  demo prints "dom window: N rows" — it settled the 110-vs-14 divergence between the
  1st review's receipt and my census without any new instrument.
- **Vitest reporter flag**: `--reporter=basic` is not a valid reporter in vitest 4.x
  (startup error); `dot` works. Tests live in `apps/www/test/*.spec.ts`, not src/tests.

### Receipts (task 54)
- Windowing digit-exact: 14 wrappers (0-13) @10k with spacer exactly 400000px;
  jump-4999 → 4993-5012 with 20 wrappers; @100k spacer raw `4e+06px` with the window
  still 14/20 (viewport-bound: 288px stage = 8 visible + 6 overscan).
- Stamps on the composed root only: data-density="sm" + dark + `--jx-scroll-thumb-radius:
  8px` (+ radius-effective, density-coefficient) on `.jx-scroll-area`; viewport/spacer/
  rows all clean. Radius seam source :219 (number-lane-only ternary).
- query seat live both directions: 14px@600 fresh ↔ 18px@1280 ↔ 14px@600, stamp tracks.
- Reserved keys land last (:154-161 spread order); region role/tabindex/label live on a
  second instance ("forwarding stamps").
- LAW #18: page zero eaches; family's single each keys on item.key; zero console
  errors across all sessions. LAW #19: 48 ids, zero duplicates.
- Toc baseline re-receipted: 8 data.toc ids ×2 rail surfaces served, all live, skip-link
  the only extra; payload 947,074 bytes.
- Gates: ambient 284/284 rc0; docs-universal 110/110 GREEN; svelte-check page 0
  diagnostics (5 family errors = carried unchanged-file debt).
- Record correction filed (LOW): the 1st review's "110 wrappers @100k" superseded by
  14/20 — author's original 14→20 stands; three instruments agree.

## Task 56 — prototype-grid (2nd review, PASS 0M/0m/0 new + carried LOW settled)

### Banked lessons
- **Injection placement decides overflow**: a wide min-width chip auto-placed into
  column 1 of a 745px container NEVER overflows (600 < 745) — place it in the LAST
  column explicitly (grid-column: 3) or the blowout's overflow half can't fire.
- **scrollWidth lies on overflow:visible grid children**: two runs read 745 == 745
  while the boolean flip-flopped between reads — the decisive instrument is rect
  geometry (chip right edge vs container right edge), not scrollWidth.
- **stylex hashes defeat class selectors — again**: `.panel` found zero elements
  inside #universal-props (rt.panel compiles to a hash); anchor component probes on
  data attributes ([data-jx-prototype-grid]) or aria/testid, disambiguate by chip text.
- **CSSOM normalizes minmax(0, 1fr) → minmax(0px, 1fr)** on the first setProperty
  write — the authored attr string and the CSSOM form are both valid reads; the
  readout's named declaration is the CSSOM form (style.getPropertyValue).
- **Named-seat receipts verify AT the named widths**: the landed width-naming clause
  (831fbadb) is falsifiable exactly as written — re-measure at 1400/760 and the
  numbers land to the rounding; at other widths they legitimately differ (the clause
  converts viewport-conditional receipts from a defect into a contract).

### Receipts (task 56)
- Named seats reproduced: 240.328×3 @1400 (named 240), 228.328 under gap 30 (named
  228), 180.25/360.5/180.25 (named 180/361/180 — exact 1:2:1), 145.25×4 @760 (named
  145, floor 140 engaged); clean reverts.
- NO-BLOWOUT: 600px chip in col 3 → tracks unchanged, chip right 1435 > grid right
  1075. Auto-fit re-count ladder: 4→3→2 tracks @760/600/460, shares 145→149→160.5,
  floor never breached.
- rows=2 declaration repeat(2, minmax(0px, 1fr)); areas computed `"head head" "side
  main"` with head spanning 711px top row, side/main row 2.
- Stamps: sm/lg rungs, .dark bridge with --foreground flip oklch(1 0 0), size carrier
  verbatim + computed 18px, named-step var forms; all-auto specimen stamps NOTHING;
  rig (no axes) layout-only.
- query seat 13@600 fresh ↔ 18@1280 ↔ 13 back. LAW #18: 12-flip stress, 6 chips, zero
  console noise. LAW #19: 66 ids 0 twins. SSR: toc 8 ×2 surfaces, api 6 + axes 8 rows
  by name; 4 SSR data-theme hits = canvas-stage chrome, not family vocabulary.
- Gates: ambient 284/284 rc0; universal 110/110; svelte-check page 0 (family :115
  8 warnings pre-existing). 831fbadb = the +5/−3 readout edit, verified.

## Task 59 — stack (2nd review, PASS 0M/0m/0 new + carried LOW settled, NIT record note)

### Banked lessons
- **Baseline posture ≠ box-bottom equality**: align-items: baseline aligns TEXT
  baselines — box bottoms/tops differ by design; the receipt is the computed
  align-items + differing box tops, not bottom equality.
- **The universal marker's honest query**: data-jx-props-table-universal (the
  PropsTable's own marker element, per verify-docs-universal-manifest.mjs) — guessed
  names like [data-universal-section] read false zero.
- **Read each clauses VERBATIM before calling them keyed**: `{#each [...] as x}` is
  unkeyed; only `as x (key)` keys. "Keyed-each clean" and "keyed each" are different
  claims — the safety conclusion (no each_key_duplicate surface) holds trivially for
  unkeyed static literals, but the label goes in the record accurately.
- **Token-chain receipts read across three files**: gap atom → tokens['--jx-space-N']
  → var(--space-N) → calc(var(--jx-unit) * N/4) with --jx-unit: 0.25rem
  (jixoai.css :1233) — one source read beats guessing the calc form.

### Receipts (task 59)
- Mutation proof both directions (the landed LOW-1 sentence, 6a330296): root
  16→32px moves gap 8→16px and back; the stamped 18px voice never moves; root
  restored exactly.
- Bare census: class="x78zum5" + data-jx-stack ONLY; gap/align-items normal.
- Ladder 4/12/24/48px distinct; closed vocabulary via real selects (column/48/
  baseline/space-between and column/2/center/flex-start); 3 pills stable.
- Merge law: `--jx-radius-effective: 12px; border-radius: 3px` co-exist, corner 3px;
  rest-replace order [class, data-probe-inner, data-jx-stack, style].
- Universal marker ×1 at #api (appendix placement); never-ambient basis:
  StackDefaults 8 paint slots, zero structural entries.
- LAW #18: zero keyed eaches (verbatim grep), mounted 4/14/3, zero console noise.
  LAW #19: 80 ids 0 twins. SSR: toc 9 ×2 surfaces, marker ×1, sm rung served,
  data-jx-stack ×17 attributes.
- Gates: ambient 284/284 rc0; universal 110/110; svelte-check page 0 (family :179
  8 warnings pre-existing).

## Task 60 — table (1st review, PASS 1 MINOR — the stale radius row)

### Banked lessons
- **When a family fix lands AFTER the CODE receipts, re-audit the PAGE TEXT too**:
  quill's radius row still taught the defect ("currently paints 8px") after d3ff3f11
  fixed the atom — the served behavior (12px) contradicted the row one section above
  the measurement panels. The probe-carry flips the family; every doc surface quoting
  the defect needs the same flip (row text, ledger entry, open questions).
- **Playground control element map**: PlayToggle → ONE input[role=switch] (the Toggle's
  native input IS the control, no button wrapper); the Checkbox family →
  input[type=checkbox]; identical demo buttons across canvases need canvas-scoped
  locators (strict mode catches the second "sort by title").
- **Baseline alignment redux**: align-items: baseline ≠ box-bottom equality (tops
  differ by font size by design) — same lesson as task 59's, now on table cells.
- **scrollWidth is real on overflow-x:auto frames** (646>558 digit-stable across runs)
  — the task-56 ambiguity was overflow:VISIBLE children; scroll containers are honest.
- **The rowId uid collision signature**: a module-level `++uid.seq` counter restarts
  per lazily-mounted subtree — cross-canvas id twins minted as `jx-play-row-1-label`
  in two canvases. Salt with the canvas/section identity (the owner fix), and page
  LAW #19 censuses will keep catching it until then.

### Receipts (task 60)
- THE RADIUS FIX FLIP: r12 → corner 12px (consumed stamped, factor 1); named large →
  10px via var(--jx-radius-large); auto → 8px site fallback with NO stamp. Both halves
  live; quill's 8px defect superseded.
- MINOR filed: the page's radius axis row still teaches the fixed defect — one-row edit
  owed, ledger flip ready.
- Frame-width law both ends: 646>558 wide (sticky z3), 240 narrow (thead none,
  ::before "Consumer", head surface first cell); stack=off keeps the table form
  (data-stack=off) with pins container-gated ≥30rem.
- A11y: aria-sort asc→desc via button only (th text inert; third press clears; column
  move); live region 0→1→2→6→0 of 6; header indeterminate law full walk; 14/14 captions.
- Density own sm (figure+table) / lg override; size voice split 18px frame / 12px cells.
- W-next #10 dense-no-op-at-sm reproduced (gap==inset 8px); #11 rowId twins reproduced
  and PAIRED (workbench "frame width" vs tasks "page size", both jx-play-row-1-label).
- Theme split at the token layer: dark panel locals re-voice (surface 0 0 0, head
  0.2178) vs light (1 0 0 / 0.9551).
- LAW #18 clean (zero console noise through sorts/toggles); LAW #19: 195 ids, the one
  dup is #11's pair. Page 0 diagnostics; family :181 7 warns (density absent — kernel
  law visible) + :80/:213 errors pre-existing. Gates: ambient 284/284, universal
  110/110. d3ff3f11 verified as the fix commit.

## Task 62 — spin (1st review, PASS 0M/0m/1L — hydration noise, family lane)

### Banked lessons
- **Brand-hue wall-clock discipline, third application**: assert the oklch L/C
  invariants, never the literal hue — her 154 / my 178 are the same ink sampled at
  different clock ticks (the +24 drift matches my press-button samples). Any receipt
  quoting a hue digit needs the wall-clock caveat or the L/C form.
- **stylex hashes defeat .panel selectors AGAIN** (task 56's lesson, re-bitten): anchor
  posture probes on data attributes or parentElement walks, never hashed class names.
- **emulateMedia reduced-motion is LIVE**: the matchMedia listener fires on flip —
  both RM channels (CSS animation-name + SMIL animationsPaused()) verify in one page
  session without reloading.
- **SSR text mentions masquerade as element counts**: grep hits for
  `data-jx-spin-frames` in the payload were the drawer's css COMMENT and the receipts
  prose, not a style element — print raw contexts before counting elements.
- **{@html} + module counter = hydration_html_changed**: a module-level instance seq
  (svgInstanceSeq) diverges between SSR order and lazy client mounts; Svelte keeps the
  server nodes (benign visually, noisy in console). Same salt-the-counter shape as
  table's W-next #11.

### Receipts (task 62)
- Opacity-only: 85 rAF samples min 0 max 1 (15 nonzero, the 'both' shape), transform
  none / bg transparent / transition 0s on the same element.
- Flat engine: ONE style[data-jx-spin-frames], 12 rules (grow + dots among them),
  10 frames, delays −1200→−120ms over 1200ms, name jx-spin-f10-i120-l120-both, 1.2s,
  linear, infinite; cursor white-space: pre.
- RM both channels live: animation-name none + frame-0 face + svg animationsPaused()
  true under reduce; both restored on un-reduce.
- Root-pinned alias: scoped .dark island re-derived --primary (0.7044 0.1872) while
  ink HELD 0.6489/0.237/178; root dark flipped ink; restored exactly.
- Query seat: density lg@1280 → sm@600 live; size hybrid rejects query (source).
- Census: bare inline = [data-jx-spin-inline, class, role, aria-label]; ruler
  var(--jx-icon) inline; pinned width attr; §1 carrier on number size; zero
  effective-readers (6 files).
- Drift #12: spin-defaults comment fixed + 4 mirrors byte-identical (diff).
- SSR: 230 prerendered frame spans, keyframes style client-only, toc 11 ×2, marker ×1.
- LAW #18: gallery 11/11 keyed; LAW #19: 81 ids 0 dups. Page 0 diagnostics; family
  warns/errors pre-existing. Gates: ambient 284/284, universal 110/110.

## Task 64 — system-dialog (2nd review, PASS 0M/0m/0L/0N + a COMMITTED foreign gate break)

### Banked lessons
- **Assert state on BOTH sides of a scoping probe**: my first outside-Escape sequence
  pressed Escape and moved on without re-reading open state — the panel HAD stayed open
  (scoping held) but my transcript couldn't prove it. Every "X does not close Y" receipt
  needs the open-state read after the attempt, not just the next step's success.
- **Trigger-only-opens vs toggling triggers**: a dialog Trigger that calls
  setOpen(true) (no toggle) makes click-based reopen a no-op when already open — probe
  sequences must not infer close-events from later successful opens; read the state.
- **Strict leftover censuses need load-time baselines**: a body>div with
  display:contents holding the COMPOSED demo dialog exists from first load — any
  "leftover host" count must subtract the load-time baseline or it counts composition
  wrappers as orphans (marginalia's canvas-layer lesson, re-applied).
- **The sibling parse error can be COMMITTED**: the rotating ambient failures were
  "uncommitted sibling file" twice (tags-input, then toast-class), but 7f1b78ff landed a
  separator.html apostrophe inside a single-quoted law sentence — js_parse_error, 6
  ambient failures corpus-wide, COMMITTED. Attribution protocol is the same (zero
  my-page keys in the failures) but the fix is an orchestrator dispatch, not a wait.
- **1-based notes vs 0-based tableIndex**: the matrix re-pin note says "root=1/
  Trigger=2/Content=3/Action=4 (axes 5)" while the fixture stores tableIndex 3/4 —
  the page gained the law table ahead of the parts, shifting every ordinal by one.
  Reconcile notes and indexes against the SERVED table order before calling a re-pin
  wrong.

### Receipts (task 64)
- Landed MINOR both halves verified: token row "AUTHORED, NOT SERVED" + overview
  disclosure sentence; my paint: 544.5px / max-width none; my stylesheet walk: ZERO
  max-width rules corpus-wide (the atom never ships).
- Anchored rise: --s2 (uid), block-end, 12px gap, center-x delta 0, top layer.
- Mechanics: no light dismiss; Escape scoped both sides (outside-Escape asserted
  open-state both sides); Tab exits; Cancel landing; seam → deleted yes + invoker
  restore.
- Trio: exactly one panel per call, dead-center (700/450 at 1400×900), no anchor chain;
  confirm true/false, prompt value/null, alert acknowledged; zero trio-minted leftovers.
- Stamps: sm + dark + 12px consumed + --jx-corner calc(12px*1) published + own level3
  (effective 6 + level3 shadow); auto stamps nothing. Read site named (the promoted
  panel element).
- Matrix re-pin: Content table[3] / Action table[4] verified in fixture AND served order.
- LAW #19: 51 ids 0 dups; no eaches (composition family). Page 0 diagnostics; family
  LAW #20 residue (trigger 5 errors, content 8× :144 warns) pre-existing.
- Gates: ambient 278/284 — 6 failures all separator.html :505 js_parse_error (committed
  foreign law-text apostrophe; zero system-dialog keys; re-pin rows PASS); universal
  110/110. 2a26eb96-era MINOR fix 38560e22 verified served.

## Task 66 — tags-input (1st review, PASS 0M/0m/0L/0N)

### Banked lessons
- **Measure the LANE and the BOX separately**: the density claim "hit 48→32" is true of
  the --jx-hit lane (equations resolving 0.25rem×12/×8), while the input's computed
  min-height is 46/30 (hit − 2px border pair). Receipt both, or the 2px reads as drift.
- **Shell rect ≠ hit lane**: the tags shell wraps the chips area + input — the hit lane
  lives on the input; rect-measuring the wrapper over-measures (80 vs 48).
- **Duplicates-off filtering shows up IN the combobox rows**: typing 's' led with
  typescript because svelte was already committed — the filter's hides-present behavior
  is observable in the row order, a free extra receipt.
- **Flash-class receipts need inside-AND-after samples**: sample the flash class at
  ~80ms (inside the 200ms window) and again at +450ms (expired) in the same run —
  one sample proves nothing about the decay.
- **The separator :505 parse break was fixed** — the ambient suite is back to 284/284
  corpus-wide (task 64's foreign-commit red is closed).

### Receipts (task 66)
- LAW #18 double weight: composite value#index chip keys (source :495) + the live
  mutation census (Enter +1, duplicate +0 with the flash on the existing chip inside
  the window and gone after, Backspace-on-empty −1, paste deno,bun +2), fully
  interactive, zero console noise.
- Combobox: expanded true, autocomplete list, activedescendant s2-sug-0 resolving to a
  real row, ArrowDown roving, Enter commits the highlight; × labels "remove (label)";
  shell horizontal listbox, chips options selected.
- Error wiring: invalid true → describedby → existing id + dashed shell.
- Density consumed: data-density lg↔sm across 48rem; --jx-hit 48/32 lanes; input box
  46/30 (hit − 2).
- Alias at the paint: chip ground 0.9551 HELD under the scoped island (--muted scope
  flipped to 0.2178), root dark flipped, restored.
- Drift #13 confirmed latent: suggestion rows value-alone keys (:583), unique catalogs,
  one-word hardening owed family-side.
- Structure: toc 10 == DOM == SSR ×2; payload 1,103,869 bytes; LAW #19: 101 ids 0 dups.
- Gates: ambient 284/284 rc0 (separator break fixed); universal 110/110; svelte-check
  page 0 (family overload/chrome-type errors + fleet warns pre-existing).

## Task 68 — tabs (1st review, PASS 0M/0m/0L/0N — the sixth mechanism adjudicated PAINT-TRUE)

### Banked lessons
- **The root-pinned alias hold/flip line is the var-read vs physics line**: separator
  HELD (ghost ink = backdrop-filter physics), tags-input FLIPPED (chip ground = var-chain
  read), tabs FLIPPED (trigger ink = var-chain read). Mechanism: --jx-* is declared at
  :root and html IS :root — html.dark re-declares the inner var, the substitution at the
  root re-derives, and every element's paint follows. A hold at root-dark means the ink
  is NOT a var-chain read (or the inner var is unpinned at html.dark).
- **The canvas light-pin is a fleet posture**: ComponentCanvas stages pin
  data-theme="light" — axis receipts measured inside canvases describe the light ground.
  Ride full-width grounds outside canvases for theme seats (T40/T41/T42 convention).
- **rAF transform sampling needs a sweep, not a capture** (T34/T42 lesson held): 20
  samples caught 15 distinct mid-travel transforms over the authored 240ms; a single
  mid-read measures nothing. Under RM the same sweep shows 1 distinct transform + 0s.
- **Element-presence ≠ innerHTML length**: Svelte's <!----> anchors make innerHTML
  nonempty on unmounted panels — count querySelectorAll('*').

### Receipts (task 68)
- ARIA chain on real keys: ArrowRight flips focus + aria-selected + roving (exactly one
  true); End w/ disabled last → lands on the last ENABLED (audit skipped, APG); Home →
  preview; list tabindex -1; 29 tablists / 129 tabs / 22 panels.
- Panels: inactive hidden + 0 child elements (unmounted); labelledby deterministic and
  resolving; tabindex 0.
- Indicator: 0.24s×3 computed (transform/width/height, cubic-bezier(.2,.8,.2,1)); 20
  rAF samples / 15 distinct transforms over the 240ms travel; RM → 0s + 1 distinct
  position (the bar jumps).
- Density digit-exact: trigger min-height/height 48px lg → 32px sm across 48rem.
- Sixth mechanism adjudicated: trigger ink oklch(0 0 0) HELD under the scoped island
  (--foreground flipped 1 0 0, --jx-foreground held) and FLIPPED at html.dark —
  paint-true; canvas stage ground oklab(0.981142 0 0) held under root dark.
- Structure: toc 13 == DOM == SSR ×2; payload 1,286,078 bytes; LAW #19: 241 ids 0 dups;
  the two rt-atom fixes verified (page 0). Gates: ambient 284/284, universal 110/110.

## Task 70 — separator (2nd review of my own page, PASS 0M/0m/0L/0N)

### Banked lessons
- **A repair can REWORD, not just escape**: my 1st-pass seat substrings read FALSE after
  c4ef8428 because the apostrophe fix restructured the sentence ("the html var read is
  not the paint" survived, "re-derives at html" became "html's var flips"). Verify seats
  against the SERVED wording (grab the context around the anchor phrase), never against
  your own prior quote.
- **Two-read protocol is the frozen-everywhere proof**: read the var at html AND the
  element's paint in the same evaluate — html --jx-border flipped 0 0 0 → 1 0 0 while the
  ghost strip's computed paint (transparent + contrast(0.5)) held across all three theme
  states. One read without the other proves nothing.
- **Token-table counts are moving numbers**: 113 (my 1st) / 116 (hers) / 117 (now)
  --jx-* alias entries — the table grows with the fleet. Cite such counts as "at read
  time"; variance is commit skew unless the counting pattern differs.
- **Internal consistency across seats**: the axis row teaches the SOLID variant's token
  ride (island-frozen, root-dark re-derives) while the overview/theming teach the SERVED
  ghost's physics hold — both true, different variants. Read the full sentence before
  calling a contradiction.

### Receipts (task 70)
- Page 200 (c4ef8428 holds); three seats serve frozen-everywhere + var-vs-paint (quoted
  from served text).
- Two-read protocol: html --jx-border 0 0 0 → 1 0 0 at root dark while the strip paint
  held across light/island/dark/restored; ghost seven-sample delta-0 (distinct 1).
- Ladder 7/7 variants served, 57 separators; omission census: separator element class
  only; SELF-STAMP roots 8; LAW #19: 74 ids 0 dups.
- Census reconciled: 117 alias entries now (moving table).
- Gates: ambient 284/284 rc0; universal 110/110; svelte-check page 0. lsof empty/empty
  (PID 4019 + wrapper 3991).

## Task 71 — toast (1st review, PASS 0M/0m/1L — the seventh voice measured 1.17:1)

### Banked lessons
- **Measure timing at DISPATCH, not at click-promise resolution**: Playwright's click
  resolves ~500ms late under headless load — my auto-dismiss reads were 4660ms by
  click-clock and 5245ms by the in-page capture-phase mark (the claim family 5224).
  Every latency-sensitive battery needs the in-page event mark.
- **Sibling churn poisons dev-server timings**: the mirror sync + vite page-reload
  trains (four navigations in one run) void absolute timings. The deterministic escape:
  fresh build + vite preview. Also the dispatch's build requirement doubles as the
  contamination escape.
- **Hover-expand before depth-card clicks**: a collapsed toast stack front-intercepts
  the back cards' buttons — hover the stack first, then click (the same front-intercept
  lesson as the tabs depth cards).
- **Synthetic visibility instrument**: stub document.hidden (defineProperty) + dispatch
  the REAL visibilitychange — the component's listener runs the true pause/resume path;
  name the stub in the receipt.
- **The corrected oklch contrast math**: OKLab L,a,b → l_/m_/s_ → cube → the linear-sRGB
  matrix → Y = 0.2126r+0.7152g+0.0722b. The % forms need the /100 guard (my muted-fg
  parse exploded — own the bug, recompute by hand).
- **Frozen-ink seats differ by PAIR and VINTAGE**: the billed 2.81:1 vs my 1.17:1
  (popover-fg black over the re-derived dark ground) — both red; reconcile the pair at
  consolidation rather than forcing the billed digit.

### Receipts (task 71)
- Portal: card chain → jx-float-slot (adopted); body-direct cards 0.
- Live regions: pre-armed MutationObserver caught role=status ("Deployed build a011",
  23 chars) and role=alert ("Build failed") AT insertion; exactly one alert; +1 queued
  chip aria-hidden.
- Timings (preview): auto 4660/4690/4660 click-clock, 5245 push-exact (claim family ✓);
  exit ghost present-then-gone; RM × 1-9ms no ghost; RM auto ~4510 click-clock.
- FIFO: burst ×5 → 4 visible #2-#5 + "+1 queued" hidden; front dismiss promoted #1
  ([#1,#3,#4,#5]).
- Theme: surface chain 0.94→0.205 with the mid-tween sampled (0.5806/0.2603); popover
  chain 1.0→0.3211 at html; island split — ground 0.205 + tonal ink 0.7044 re-derived,
  --jx-popover frozen 100% at card AND html.
- Seventh voice: frozen popover-fg black over the re-derived dark ground = 1.17:1
  (corrected math); tonal ink 6.21:1; muted-fg 1.42:1. Her 2.81 flagged.
- Density: --jx-text 15px lg / 12px sm / 13px default base; seat description 15px
  computed at lg.
- Swipe: hover-expand + 120px drag dismissed (−1); slow 30px sprang back; judgeSwipe
  48px/0.11px·ms/0.2 verified from source.
- Known red confirmed: verify:docs rc=1 — "toast: skeleton: Examples renders before
  Usage (the six keep their order)", THE only failing page; H2 order quoted from dist
  AND live (identical).
- LAW #18: each keys item.id (monotonic counter); LAW #19: 62 ids 0 dups. Page 0
  diagnostics; family 2 errors + fleet warns (twins counted separately). Gates: ambient
  284/284, universal 110/110.

## T112 — dialog CODE round (2026-09-22)

- **CODE-round shape (the toast/tour pattern)**: the consolidation lands the reviewer's findings; the CODE round lands the TIER-2 list + the family gate. My round: overview/law + axes table + query() seat + install/see-also markers, 4 family type errors, 1 stale family comment, 1 MISSED claim seat.
- **The missed-seat census is a CODE-round duty**: marginalia's MAJOR-1 was corrected at three named seats — but the Basic-demo summary still taught the falsified absolute ("focus stays inside"). The 2nd reviewer would have caught it; better the code round does. Greppable form: after a claims-fix, re-grep the page for the OLD claim phrases ("focus stays inside", "inert" unqualified), not just the named seats.
- **unmapped routes vs inScope**: verify-docs-structure hard-fails inScope routes only; dialog was unmapped (warning-only) — that's why a page missing install/see-also passed. Staging it would hard-fail `usage < examples` (Usage H2 sits after six demo canvases). Recorded as the owner's call; markers landed anyway.
- **PropsTable call-site indices are load-bearing**: adding an axes-table PropsTable BEFORE the api table shifts the ambient matrix's 0-based tableIndex (dialog variant row 0→1). Any section insert that adds a PropsTable must re-run the ambient solo and expect the matrix bijection to catch the shift (it did — two failures pointing at exactly the moved row).
- **Probe craft (re-learned + new)**: (1) `dlg.querySelector('button')` grabs the × close, not the claim's element — text-scoped locators for named seats; (2) /tmp ESM probes cannot resolve workspace packages — import by absolute node_modules path (playwright-core at repo root; pin the existing headless-shell executable — cache had -1243, the package wanted -1234); (3) `--reporter=basic` is invalid in vitest 4 (dot) — SECOND hit of my own banked lesson; the first hit was T66.
- **Family gate receipts**: svelte-check "family 0" means 0 ERRORS; the standing `state_referenced_locally` warnings (provideUniversalLanes' eight lane reads) are the fleet cosmetic class — receipt, don't chase. The four dialog errors mapped to four fix shapes: `?? {}` (narrowing), ternary (false-union), `as unknown as Snippet` (the dual svelte-copy identity split — canvas-playground carries 8 of the same; NOT per-seat-fixable at fleet scale), and gating the render on the snippet itself rather than a $derived (TS can't narrow through derived).
- **Mirror cadence worked**: edit → cp → diff both trees → verify:mirror; two sibling consolidations (43da0d99, 97f5b6cc) landed mid-round and the twins were re-diffed clean at teardown. The mirror manifest regeneration is part of the round, not an afterthought.
- Receipts: report 112-code-dialog.md (gates: build/docs/universal/mirror/scheck 0+0/ambient 284×2/nav 34; probes: 742,734-byte SSR, 106 ids 0 dups, rail 14/14, trap leak shape re-measured, level4 zero-paint + stamp, query seat 8→20px with child 0→6px digit-exact, warm-reload byte-identical).

## T118 — website-scaffold 2nd review (2026-09-23)

- **2nd-review protocol worked as designed**: open the 1st's report first, verify the landed four at FOUR layers (source / registry twin / served bytes / live DOM), re-derive headline receipts with own instruments. All four of marginalia's items verified true; two of her headline digits reproduced exactly (256/1104/240 at 1600; immersive −74.74).
- **THE −74.74 MECHANISM PINNED**: the header's immersive leave is css `translateY(-101%)` — a PERCENTAGE OF THE BAND'S OWN BOX (74 × 1.01 = 74.74), NOT the --jx-header-h var (which stays 74px at the hidden state). The .74 in every reviewer's digits is the 1%. Lesson: when a transform digit ≠ the var it allegedly derives from, read the computed var AT THE STATE before crediting a calc chain — percentage-of-own-box transforms carry the element's sub-pixel height into every receipt.
- **Read computed props on the element that OWNS them**: scroll-padding lives on the scroll CONTAINER (.jx-shell-body → 106px), not the grid (.jx-shell → "auto"); named areas live on the top-LAYER, not the shell (whose "none" is itself the line-placement receipt). Two wrong-element reads caught by the landing measurement contradicting the token — the real receipt is the landing (targetTop 106 both states).
- **The immersive-static scroll-padding is reveal-safe by construction**: reservation 106 unchanged with the header hidden; landed head never covered by a scroll-up reveal (measured: header re-appears 0-74, target head 166). Positive fresh axis — a reservation that "outlives" its chrome can be a feature when the chrome returns on the opposite scroll direction.
- **Cross-page pick-line concordance**: toc.html lands #overview at 74; website-scaffold lands #theming at 106 — same var name, two scopes, both reproduced with one instrument on one preview. The toc-line two-scope story (LOW-2) is now a TWO-PAGE measured law.
- **Scope-JSON vs dispatch premise**: docs-skeleton-scope.json inScope has 11 pages — website-scaffold NOT among them (unmapped/warning-only like dialog), despite the dispatch saying "IS in scope". Verify against the committed JSON, not the brief. AND: website-scaffold shares dialog's examples-before-Usage shape (stage@26602 < usage@111676 served bytes) — the successor global-gate flip needs a fleet reorder or scope ruling; my T112 dialog adjudication generalizes to ~99 unmapped routes.
- **The pagedjs print-sim overlay is an intermittent probe hazard**: intercepted pointer clicks once ("purpose":"sim", 14 pages), never reproduced in bisecting; restorative in-probe removal + clear-at-click-steps is the armor. Owned as probe environment; the trigger remains unpinned.
- Receipts: report 118-review-website-scaffold.md (gates: build rc=0 @ f4a36087, docs rc=0, universal 110/110, page scheck 0 + family 0E/8 standing; LAW #19 55 ids 0 dups; toc channel 10→10; SSR 200 @ 440,502 B).

## T121 — pseudo-class-pair SPEC audit (2026-09-24)

- **The audit's one violation is a SURVIVOR, not a new pattern**: jx-pure.css :1503/:1530 still carry the exact radio :indeterminate pair T94 (e3a9c0db) killed in jixoai.css — the dash ::before + the solid-blob composite fire on every resting radio group under .jx-pure (SHIPPED via app.css @import). Root cause receipted: jx-pure's form-control laws are GENERATED from packages/css-laws, radio.ts never carried :indeterminate (git -S empty) — the arms are stale generation residue the T94 fix never reached.
- **Fix shape for generated sheets: regenerate, never hand-edit** (`npx tsx packages/css-laws/src/build.ts`), then diff both mirrors; the regeneration diff may surface drift beyond radio. NEW LAW for the ledger: a spec fix isn't landed until the single declaration source carries it AND the projection is regenerated — face-authored fixes leave stale projections serving the violation forever.
- **The adjudication cut that keeps the audit honest**: (1) :has()-surfaced state is judged by the state's OWNER (label:has(input:checked) is clean — the group-lane idiom fleet-wide); (2) a state pseudo on a non-input subject is clean iff the platform defines it (progress:indeterminate is the fleet's one positive; :placeholder-shown on non-inputs is zero-hit); (3) cross-element hover/focus pairs are clean when the subject genuinely holds the state (tr:hover td — the cascade idiom); (4) dual-channel done right: tree-view's real-checkbox :checked + authored [data-mixed] for the third state — platform state for platform semantics, authored attrs for family semantics.
- **The Expected-clean families held**: checkbox tri-state legit in both theme sheets, switches author no indeterminate anywhere, radio jixoai face carries the T94 spec comment verbatim.
- Process: source-read only (no server/build/port); svelte-check NOT run at all (no TS seats — the Owner's one-run rule met trivially). Third hit of my rg -rn trap caught before any conclusion — the census was re-run with rg -n.
- Receipts: report 121-pseudo-pair-audit.md (census table ~30 seats, 1 violation pair, 4 laws named, clean-family list of 78).

## T125 — 1st-review batch: theme-toggle · icon-button · list-item (2026-09-24)

- **THE TAXONOMY RULING**: SEVEN control adapters (ItemToggle/Checkbox/Radio/Select/Input/Segmented/Stepper — index.ts is the ground truth); ItemField is the escape hatch they compose, never a member of the set. "Five" was stale on BOTH pages (list-item's own hero pill AND list's hero). Canonical: "ItemField + the seven control adapters". Lesson: when a count word is claimed in a hero, count the exports before probing anything else — index.ts settled in one read what two pages' copy obscured.
- **Batch-gate economy under the one-run rule**: ONE svelte-check saved to /tmp/g125-scheck.txt served all three page gates + three family lanes via grep. The batch came back red everywhere — all three pages carry the page-side cx overload (the ?? {} one-liner), plus theme-toggle's false-union (:227), list-item's Snippet dual-copy (:1030, the T112 cast shape), and list-item family's 9 errors (3× an `inset` prop the inner Props lack, item-input's labelMode extends collision, index.ts ItemVariant/ItemTone exported TWICE).
- **The popover-open instrument beats node-existence**: icon-button's tooltip law (hover-now/100ms-grace/focus/Escape) read "always open" until I tested `:popover-open` — closed popovers persist in the DOM. Any tooltip/popover lifecycle claim gets the pseudo-class state, never element presence.
- **Painted-surface identity**: list-item's concentric row read 0px on the group's `li` and 20px on the `.jx-item` face — the li is not the painted surface. Walk the section for DISTINCT computed border-radii before declaring a radius claim dead. (The auto-consumed calc is stamped verbatim and resolves R−0=20 — the family supplies --jx-inset-effective: 0px, so the §3 subtraction is engaged but unobservable; the claim survives as written.)
- **Density-ladder receipts at the token layer**: rows wrap at stage width (rect heights lie — 80px); computed --jx-row-min/--jx-text/--jx-line per rung reproduce all twelve digits (11/12/13/15 text, 16/18/20/24 lines, 28/32/40/48 rows) as literal 4px-ruler calc chains.
- **Stale-literal class, third instance**: icon-button's law section teaches "42px band (size-10.5)"; press-button's own doc says "rides the density hit channel (40.0px measured at default — not a literal)"; measured 40. The TokenTable row (28/32/40/48) was the honest seat. The fleet's "not a literal" annotations are the anti-drift device — pages should quote them, not the number.
- **toc drift, tabs-class**: list-item's rail ships 6 entries under 16 DOM sections with the usage/types pair inverted. Also icon-button carries TWO id="usage" divs (LAW #19 live) — the second unrailable.
- Receipts: reports 125-review-{theme-toggle,icon-button,list-item}.md — theme-toggle 0M/1m/1L/1N, icon-button 0M/2m/1L/1N, list-item 0M/2m/0L/1N; all Tier 2; build rc=0 @ 79d7adde, docs rc=0, universal 110/110, port 5243 clean.
