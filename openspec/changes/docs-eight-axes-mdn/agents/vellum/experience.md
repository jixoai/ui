# vellum — experience log

## Techniques (mine)
- **Axis-honesty probe (keep for every page):** after coding a page's
  per-axis table, run a Playwright computed-style probe against the
  dev server that asserts EACH row's claim — carrier strings in the
  style attr, computed font-size/corner/hit values, attr stamps
  (data-density, .dark class), query() resolution across a viewport
  flip and back, and the marker/row counts. 17/17 beat "looks right".
  Scratch script: /tmp/vellum-alert-axis-probe.mjs (pattern: locator
  by title text → one evaluate returning all facts → boolean checks).
- **Measure the token ladders, don't trust old tables:** the old page
  quoted `--jx-hit` as "28/32/40/48" — measured truth is
  24/28/32/40/48 (2xs→lg). Any number a page quotes, measure once and
  annotate "(measured rungs)".
- **Custom reference tables via `PropsTable props={rows}` with
  `title=""`:** the concept page's idiom for per-axis/lane tables —
  zero new machinery, and title="" suppresses the h4 so the page
  keeps exactly ONE data-jx-props-table-universal marker.
- **query() doc pattern:** `query<{ sm: DensityLane }>({ sm: 'small' },
  'large')` — the explicit generic pins case values to the lane (the
  bare literal infers plain strings and fails assignment).

## Highlights found in others' pages (from reviewing scribe's anchor)
- **SSR-stamp captions as verifiable demo claims:** every demo panel's
  caption IS the exact attr/value stamp a curl can check (ambient: no
  attrs; small→data-density="sm" + coefficient 1; dark→.dark) — six rails
  verified in one grep. Upgrade alert: recaption my demo panels with
  their exact stamps.
- (badge review, marginalia — task 5)
  **Curation headers that pin the extractor's ceilings as law**
  (badge.docs.ts: WHY variant/shape degrade to opaque aliases, WHY
  style/rest stay visible on purpose) — alert's curation gets the same
  header discipline.
  **Two-layer @supports wording** ("0px; 8px where corner-shape is
  supported; 8px measured here") — base + upgrade + measurement in one
  clause; alert's radius row says only the measured number.
  **Supply-side grep receipts cited at the claim site** (zero-readers
  grep as provenance for supply-only rows) — my independent re-grep
  confirmed; alert's supply rows should cite theirs the same way.
  **Same-source deletion of hand mirrors** (resolveRawCode composes both
  drawers; hand mirror files deleted) — alert still carries one
  hand-mirrored usage path to convert.
  **Declaring-element mechanics per lane** (named rung → data-density
  makes the chip the declarer; bare coefficient → matches no
  :root/[data-density] block, inert) — owed to alert's density row since
  the accordion review; badge's row is the model to copy.
  **THEME-SPLIT executed to my own law:** marginalia's theme row names
  both halves and my one-evaluate probe confirmed them exactly (tonal
  trio flips, hue drift −4° exact, outline ink + --jx-foreground
  frozen) — the law transfers; alert's theme row already carries it.
- (accordion review, marginalia — upgrades queued with my alert micro-fix)
  **Named lane groups in the census-citation paragraph** (five
  broadcast-only · anchor-only radius · the repainters) — sharper than a
  flat citation; alert's deviation paragraph gets the same grouping (theme
  corrected to "partial re-theme").
  **Page-number-equals-census-number receipts:** accordion's concentric
  demo renders the D5 census receipt live (20 → measured 6px) — put a live
  numeric receipt in one of alert's axes demos instead of prose-only.
  **Declaring-element mechanics per lane:** density's row explains WHY a
  rung repaints (attr → scope block re-declares --jx-text AT the frame)
  and a bare coefficient doesn't (matches no block) — adopt in alert's
  density row.
  **Drift-ledger discipline:** route family-comment-vs-code contradictions
  to research/family-comment-drift.md as a ledger line instead of silently
  documenting around them.
  **Route +page.ts toc must be refactored WITH the page** — marginalia
  refactored the page but not the toc array: dead `theming` anchor, the
  eight-axes section missing, stale labels. My alert toc is already
  archetype-shaped; audit it on every future page task before reporting.
- (breadcrumb review, scribe — task 6)
  **The third consumed-vs-supply state: "stamped but landed in a composed
  part"** — density/shape/radius rows name WHERE the supply lands (the
  menu's --jx-hit/--jx-line/--jx-inset/--jx-text; the panel's concentric
  calc) and the demos instruct "open the node"; I measured the menu ride
  live (32px→48px min-block-size across rungs) and the claim held exactly.
  **The root-resolves SSR receipt inline on the query demo** ("inspect the
  markup: data-density='sm' on this nav") — a self-caught correction turned
  into a curl-checkable caption. **The census paragraph disposes the
  non-deviations** ("No §13 renames apply: label is a family prop… not an
  axis rename"). **Per-part-group props tables** (5 scannable tables) vs my
  single flat alert table. **Provider-snapshot quoted verbatim at the claim
  site** (grep-verified vs breadcrumb.svelte:123-127), not paraphrased.
  **Gate discipline**: verify:docs-universal re-run on FRESH dist after the
  full build — my stale-dist lesson applied unprompted by another agent.
- **TokenTable defaults as equations** ("rung scale × coefficient") not
  px literals — the anti-rot form; measured channels confirmed it and
  proved the old px table wrong. Upgrade alert's token rows.
- **Census citation paragraph directly under the axis table** — the
  deviation receipt attached to the claims it licenses. Upgrade alert's
  axes section to the same shape.
- **query() demo teaching the SSR contract inline** ("SSR paints the base
  (small); at ≥64rem it steps to large"). Upgrade alert's query demo.
- **Inbound deep-link audit before dropping ToC ids** — adopt for my
  remaining page tasks.

## Mistakes to avoid (review round added)
- **THEME DEMO EXPECTED VALUES (measured on accordion, applies to alert's
  dark re-probe):** under a component-root `.dark`, RAW-token voices flip
  (summary ink --foreground, seam --border, chevron currentColor, focus
  --ring) but SEMANTIC stylex voices stay :root-frozen (card ground
  --jx-card, frame border --jx-border, body ink --jx-muted-foreground).
  Accordion's theme demo measures white summary ink on the still-white
  card ground — invisible text — while captioning "re-themes in place".
  Alert's dark demo will show the same split; the honest row is "partial
  re-theme (raw voices only) — the semantic-ink re-scope gap, W-next #1",
  per the drift ledger's "document theme as supply-side until the
  protocol pass".
- **REFINEMENT (alert re-probe, 11/11, task 4 — supersedes the "same
  split" prediction for slot-painted families):** the gap is not uniform.
  The variant-grammar slots (--jx-tonal/--jx-outline/--jx-fill) ARE
  theme-scoped in the sheet (`:root,.jx-light,.dark`, jixoai.css:1497 —
  the Owner canvas-bug law), so a family whose paint rides them (alert's
  entire tonal recipe: ground, border, title AND body inks) measurably
  FLIPS under a plain .dark island — while its stylex-token voices
  (--jx-foreground/--jx-muted-foreground/--jx-ring/--jx-shadow-2xs) stay
  :root-frozen (the raw --shadow-2xs flips to white ink; the frozen token
  keeps the banner's shadow black on dark). "Raw voices only" is true for
  accordion/anchor and incomplete as a fleet law: ask WHICH layer each
  visible voice reads before predicting the dark-island outcome. Probed
  live + corroborated in the built dist (the defineVars emission is
  `:root, .xbpgcew` + theme classes only, never plain .dark).
- **Hand-mirrored demo snippets drift within one commit** (accordion:
  4 snippet/stage divergences, incl. the canvas drawer's usage file vs
  stage). Copy check every mirror against its stage markup before
  reporting; prefer one source over two hand copies.
- **`data-density` can live on a DensityDemo WRAPPER, not the accordion
  root** — sweep `[data-density]` ancestors, not `.jx-accordion[attr]`
  only, or you'll report a rendered rung (xs) as missing.
- **A probe FAIL can be the probe's own string bug** — accordion's
  "paddings moved" FAIL was paddingTop/paddingLeft compared across
  different string formats; re-measure with structured fields before
  filing a finding against the page.
- **The `.dark` island does NOT flip `--jx-*` paint** (anchor review
  MAJOR, converged with quill): the stylex ink atoms consume
  `var(--jx-muted-foreground)` etc., declared only on `:root, .xbpgcew` +
  the stylex dark-scope class — plain `.dark` flips the RAW tokens
  (--muted-foreground at the link) but the `--jx-*` indirection was
  already substituted at :root (the sheet's own canvas-bug law; only
  fill/tonal/outline got re-scoped). MY alert demo claims "stamps the
  .dark class bridge on this banner only" — the banner's ink almost
  certainly does not flip either. COMMIT: re-probe alert's dark demo
  when its review turn comes, expect the same honest-rewrite fix, and
  escalate the semantic-alias re-scope gap (`:root, .jx-light, .dark`
  precedent at jixoai.css ~1490) to the Owner.
- **Emulate the exact stamp mechanism, not the neighboring one.** My r6
  probe moved the DOCUMENT root font-size and "proved" labels follow
  size (13→19.5px, rem channels!) — wrong element; the size axis stamps
  the NAV's font-size, and the labels stay 13px (r7). Also: em in
  letter-spacing resolves against the element's OWN font-size, so quill's
  "0.08em tracking micro-scales with size" was rebutted by measurement
  (1.04px UNMOVED under the exact stamp).
- **The docs shell never window-scrolls** (`jx-shell-body` is the
  scroller, smooth) and demo bands have their own `jx-canvas-scroll` —
  window.scrollTo/scrollIntoView measures nothing; drive the spy with
  mouse.wheel over the band and allow ~900ms for the rAF pick. Programmatic
  scrollTop on the band can silently not stick; the user path is the test.
- **Dev and build CSS pipelines can diverge** (stylex dev injects via
  CSSOM — SSR HTML greps see neither atoms nor token declarations). For
  any claim about compiled paint, grep the BUILT dist assets AND probe
  live; never conclude from the SSR HTML alone.
- **The archetype has no Usage slot, but the docs-site SPEC hard-
  requires exactly one `Usage` H2 on every page** (verify:docs FAILS,
  not warns, on 0 or 2). The live-example section must be titled
  "Usage". Cost me one red gate + one rebuild.
- **Source comments lie about behavior.** alert.svelte claims size
  "moves the whole notice: title, body and the × affordance scale" —
  the atoms are rem-anchored; only the root font-size moves. Never
  transcribe family comments into doc prose without a computed-style
  check.
- **query() media keys are MIN-WIDTH.** `{ sm: X }` applies AT ≥40rem;
  the base applies below. My first demo had the ladder inverted and
  only the viewport-flip probe caught it.
- **`rg -rn` is the replace trap** — I did it to myself once this
  task; matched text turned into "n" and looked like `var(n, 0px)`
  css. `rg -n` only.
- **Dev-server wrapper PIDs orphan their vite grandchild**: killing
  the dev.mjs PID left vite listening on :5242. Always
  `lsof -i :<port> -sTCP:LISTEN` after the kill, and kill whatever
  still holds the port by its own PID.
- **A stale dist makes gate baselines meaningless** — the dev server
  refreshed apps/www/dist mid-session, so my "baseline" verify:docs
  actually linted my own intermediate draft. Run the fresh
  `npm run build` before believing any dist-based gate number.

## Upgrades applied back to my pages
- (task 4, alert micro-fix — the checklist round) measured token ladders
  (kept), Usage-H2 law (kept), query() min-width direction (kept, plus
  the two-generic form: `query<Cases, B>` — the one-generic call makes B
  infer undefined and the base argument fails assignment, scribe finding
  5, proved by revert-probe before fixing), axis probe before report
  (kept — the dark re-probe is the probe discipline pointed at my own
  committed claim), plus:
- **The same-source lane is the fix for birth-drift, not vigilance:**
  `id` on the canvas + `usageFile(imports, resolveRawCode('id'))`
  deletes the second source (the stage becomes THE source); comments
  moved INTO the stage children ride the extraction for free. Joining
  the lane = one PILOTS entry + one inline snapshot in
  test/canvas-same-source.spec.ts (`vitest -u` pins, re-run green).
  F4 self-containment only rejects BARE identifier expressions —
  `cx(rt.…)` attribute calls pass; a stage carrying the page's own
  const (my query() demo) cannot join, and that's the honest boundary.
- **Probe string FAILs are probe bugs until proven page bugs** —
  re-affirmed: my smoke's "2xs rung" FAIL was a 700-char slice cutoff;
  full-text re-measure flipped it to PASS before any page edit.
- **THE SHARED UNIVERSAL SPLIT EATS SAME-NAMED FAMILY PROPS**
  (badge review BLOCKER): props-table.svelte:169 filters
  UNIVERSAL_AXIS_NAMES out of the main rows whenever the shared section
  renders — a family prop that happens to carry an axis NAME (badge/chip's
  `shape`) is silently dropped, and its curation override becomes dead
  text. The rescue is the `docs.extra` lane (chip.docs.ts:72); when I
  code pages with collided names, the family row rides `extra`, and when
  I review, the check is: parse the SSR table rows, don't trust the
  curation file — an override that never renders looks identical to one
  that does.
- **page.content() vs raw SSR HTML for payload greps:** Playwright's
  content() re-serializes entities, so `query&lt;…&gt;` in the payload
  won't match either the escaped or the plain needle. Grep the RAW
  curl/SSR bytes for same-source drawer claims.
- **0.14em ≠ '0.14em':** em tracking resolves against the element's OWN
  font-size (12px chip → 1.68px computed). Assert tracking as
  computed px ÷ own font-size, never as the literal — third time this
  family of em-lessons has bitten; the declared var value and the
  computed value are different claims.
- **THE THEME-SPLIT LAW FIRES ON COMPOSED FAMILIES TOO (breadcrumb review,
  MAJOR 1):** the trail's ink atoms read the frozen stylex voices, so the
  theme="dark" demo looked near-identical to ambient on the light page —
  the row claimed "flips every semantic token the trail AND the composed
  menu read" and measurement killed both halves (link/page ink byte-identical;
  menu ink is the same frozen --jx-foreground, only its current-entry recipe
  rides raw tokens). The grep-the-declaring-selector step + one evaluate is
  now a fixed review sequence for EVERY theme row and theme demo, composed
  family or not.
- **A sample/stage pair can split within one commit even under the same-
  source drawer** (breadcrumb: foldDemo sample says class="text-muted-
  foreground", the stage runs cx(rt.inkMuted)) — the drawer law pins the
  CANVAS files, not the inline CodeBlock snippets. Review check added:
  diff every inline CodeBlock string against its stage markup, class token
  by class token; the shown class must be a registered identity (grep the
  repo before believing it renders).
- **scribe's "kernel-only debt" mis-filing caught by sibling diff:** the
  zero-arg query() call looked like un-fixable kernel debt until I grepped
  the three integrated pages — all use the two-generic form. Before
  accepting a "needs a kernel fix" framing, diff the sibling pages for the
  local fix shape (the §6 both-args ruling exists precisely for this).
- **Probe locator law, again:** a caption-text search hits the CODE SAMPLE
  string before the live caption (the sample contains the same call text);
  pick the first match whose container actually holds the target element,
  and prove a FAIL is a page bug only after the locator disambiguation.
- **The query() caption mechanism trap:** "the parts keep their ambient
  read until the engine resolves" — measured: parts NEVER re-stamp (1
  data-density element at both viewports); what steps is the nav's
  scope-block channel set, which the subtree (menu included — native
  popover stays a DOM descendant, inheritance follows the DOM tree) reads.
  When a caption says "until X resolves", measure the thing at both sides
  of X before believing the sequel ever happens.
- (accordion re-verify, task 7)
  **Cold dev-load race: never measure on a fixed sleep.** A fresh dev page
  mid-chunk-load computes UA fallbacks (summaries read 16px, borders
  default) and shows pre-hydration attrs (query rung stuck at the SSR base)
  — my first re-run "found" a broken engine that was just my own premature
  read. Readiness waits before ANY measurement: computed font-size ≠ UA
  default (CSS applied), then the engine-resolved attr (hydration done).
  Fixed sleeps are probe bugs waiting to happen.
  **Canvas drawer contents are component props, not SSR bytes** — the raw
  SSR grep CANNOT see a drawer's extracted file (closed drawer renders
  nothing server-side). Same-source correctness for extracted usage files
  is pinned by the canvas-same-source inline snapshots, not by HTML greps;
  don't write SSR-byte assertions for drawer payloads.
  **ComponentCanvas `id` is namespaced** (jx-canvas-<page>-*), so
  `id="theme"` never exists as a DOM id — locate canvases by their section
  id + structural class (e.g. `#universal-props .dark`), not by the canvas
  prop.
  **Grep receipts go stale as siblings land:** the size row's "the kernel's
  emitter is the only other hit" was written before badge's prose quoted
  the same string. A receipt pinned to another file's absence needs a
  re-grep at every re-verify, and the wording should survive new hits
  ("zero component readers — textual hits listed").
  **Solo gate runs see the whole working tree:** canvas-same-source solo
  failed on checkbox's stale PLACEHOLDER snapshot (scribe's in-flight task)
  while all five accordion snapshots passed — attribute out-of-scope
  failures to their BOARD owner before counting a gate red or green.
- (chip review, task 8)
  **Readiness gates must assert the SUBSYSTEM under test.** My chip probe
  waited on the base atom's font-size (≠16px) — necessary but NOT
  sufficient: the dev CSSOM injects stylex chunks per-chunk, so the variant
  atoms landed a beat later and every ground read transparent ("fill chip
  unpainted", "supply-only violated"). The hue chip DID read tint, which
  made the race look like a mechanism difference. Wait on the paint being
  judged: `backgroundColor !== transparent` on a variant-painted chip.
  **Wall-clock hue AND alpha drift can fake carrier flow.** The primary
  token rotates hue and breathes alpha (0.74↔1.0) — a before/after pair
  read 0.089→0.12 alpha + hue drift inside one evaluate and looked like
  `--jx-color-effective` flowing into the tonal ground. Drift-immune
  form: inject an EXTREME carrier (oklch(0.9 0.4 200)) on a clone, keep a
  no-carrier twin in the same tick, assert Δ-hue(cloneYes, cloneNo) ≈ 0 —
  chip's color supply-only proved at Δ0.0°.
  **Provenance-by-content-identity**: to prove a rendered row comes from
  the extra lane, don't trust the machinery — parse the raw SSR cells and
  match them to the lane's exact type/default/description, AND confirm the
  competing source's signature (the meta's opaque `ChipShape`) appears
  NOWHERE. Row arithmetic (meta props − axis-named − hidden + extras)
  catches silent drops before the eyes do.
  **Kernel arithmetic beats probe trust**: the lg label dispute (13 vs 14)
  settled by deriving `--jx-density-secondary-text-lg = max(0.625rem,
  text-lg − unit/4) = 14px` from the sheet — a measured number that
  contradicts a page claim should be re-derived from the kernel before it
  is filed, and the derivation cited in the finding.
- (avatar CODE task, task 9)
  **The ambient-vocabulary matrix pins the page SOURCE, not the curation**
  (my grep-first law caught the pins but I initially misread their shape):
  AXIS_PROPS tracks only density/variant/tone/material/size; the checker
  parses only INLINE `props={[...]}` array literals (an identifier
  `props={axisRows}` is invisible — the meta table holds an index slot so
  later tables keep their identity). For a matrix-governed route: inline
  the axes table, default cells 'ambient scope' (the only truthful
  expressible cell for a no-own axis), re-pin matrix entries at the new
  tableIndex with an evidence note, and expect reviewer questions on the
  one-cell convention divergence from the fleet's "'auto'" axes tables —
  the route's frozen governance wins.
  **Dev CSSOM injection is transiently WRONG about theme tokens**: mid-
  injection the dev pipeline inlined raw token chains (a .dark island
  flipped a --jx-* border) and later stabilized to the built frozen
  semantics. A dark-island theme probe can PASS and FAIL on the same page
  in the same server session depending on injection state. Theme claims:
  cite the dist emission as the receipt, measure live only after a settle
  gap, and double-read across a gap before believing either direction.
  **Replaced-element clamp gotcha**: an <img>-rooted component inside a
  narrow flex host measures clamped (max-width:100% preflight) — the md
  avatar read 19.2px until I re-located to a wide context. Box-ladder
  probes must assert their measuring context is wide enough, or read the
  atom's own width var resolution instead of the laid-out box.
  **Build isolation without stashing siblings**: a tree-wide build failure
  with commingled in-flight work is isolable by backing out ONLY my files
  (cp to /tmp, git checkout -- mine, mv untracked mine, build, restore) —
  a same-shape failure without my files proves pre-existence in one 15s
  build, no stash, no sibling files touched.
- (date-picker review, task 10)
  **Polar invariants beat string equality on rotating tokens**: the site
  primary's HUE rotates wall-clock (and the dark formula's hue is
  `calc(H - 4)` — a calc() inside the oklch hue!). Naive oklch regexes
  return null and byte-equal double-reads always "fail". The stable claim
  is the L/C pair — parse tolerantly (hue may be a number OR calc()),
  assert L/C within tolerance, and treat hue only as a live-rotation
  signature. Third time the rotation has bitten (chip grounds, badge
  probes, now date-picker) — make the polar parser a library function.
  **Component ids land on the TRIGGER in form families**: date-picker's
  `id` prop flows to the trigger button (label[for] wiring), not a
  wrapper div — locator by `#id` on the wrapper times out. Diagnose the
  id landing site before writing locators (or read the family source
  first — measurement-first applies to probes too).
  **min-height lanes vs rendered boxes**: a min-height-driven claim
  (`--jx-hit` floors) measures on computed minHeight, NOT
  getBoundingClientRect — content and leading legitimately overshoot the
  floor at big rungs (58px over a 48px floor at lg). Quote the lane the
  page claims, assert that lane, and log the rendered box separately.
  **The popover-family exclusion check is an import grep**: "family X is
  not in the composition chain" = grep the family's imports for X's
  module path (attribute/keyword matches like `:popover-open` don't
  count) — one grep, a named receipt in the report.
- (dropdown-menu review, task 11)
  **The component `id` lands on the PANEL in promoted-root families** (the
  portal law — "the promoted root is self-carried"): the page-authored id
  is the popover panel's id, and the TRIGGER is `[popovertarget="<id>"]`.
  Clicking `#<id>` times out on a hidden panel. Read the page's own words
  ("the carriers stamp the PANEL") and wire locators to the portal law.
  **Closed popovers still resolve computed styles** — min-block-size,
  surface vars, even box-shadow recipes read fine on a
  `display:none` panel; only PAINT (the visible bezel) needs the open
  state. Measure the closed panel for stamps, open it only for paint.
  **The elevation §7 pair resolves to VALUES, not var names**: the
  matrix-expressible receipt (`level2-surface`) is the theme table's
  spelling, but computed style yields the COMPOSED forms (`--jx-
  elevation-effective: 3`, surface `oklch(0.96 0 0)`, the 3dp shadow
  recipe) — assert the composed values' DIFFERENCE (own vs explicit),
  which is the claim, not the var spelling.
  **Re-pin audits read the diff, then re-run the number**: quill's t0
  orphan removals + t2 exemption matched the checker's construction
  (meta tables hold index slots; the per-axis table is mechanism, not
  ambient), and the named replacement gates (verify:meta + the universal
  manifest) both exist — "every removed pin's fact has a named new gate"
  is checkable in one package.json grep.
  **Dock-instance counts drift as canvases join**: "14 instances in SSR"
  became 21 when the query canvas's dock landed. Instance-count receipts
  should name their slicer (which docks, which axes) or carry the
  arithmetic (docks × axes) so a later canvas updates the number instead
  of silently falsifying it.

## Upgrade commitments (from the breadcrumb review)
- Alert's density row gets the landed-where clause pattern (and any future
  composed family gets landing site + "open the node" demo instruction).
- Alert's query demo caption points at its checkable SSR stamp, with the
  corrected mechanism wording (scope block, not part re-stamp).
- Alert's census paragraph gains the no-rename dispositions and the
  verbatim provider-snapshot quote with source line.
- Alert's single props table splits into per-part-group tables.
- MY OWN alert theme demo re-probe (already committed) now has the
  breadcrumb receipt as precedent: partial re-theme, both halves named,
  composed-consumer voices checked per voice.

## Task 12 (button-group CODE) — lessons
- **The raw `</script>` inside an inline template literal is a
  svelte-check parse-signature error class, not a svelte error**: the
  svelte compiler compiled the page fine (COMPILE OK), but svelte2tsx
  produced "Cannot find name 'script'" + "'>' expected" at the page's
  own `<script lang="ts">` line + "Cannot find module" for EVERY import
  — ~15 errors that all pointed at the wrong lines. The actual culprit
  was ONE literal `</script>` in an inline `code={\`...\`}` template
  500 lines below. Diagnose by: (1) compile with the svelte compiler
  directly — if OK, the failure is svelte2tsx's scan; (2) grep the page
  for `</script` — every in-string occurrence must ride the `${close}`
  splice. The signature is distinctive: errors at the script tag +
  cannot-find-module for all imports = scan corruption, not real
  diagnostics.
- **A page joins the canvas same-source gate the moment it authors one
  id-bearing canvas + one resolveRawCode call** — the per-pilot gate
  demands `called.length > 0`, so "joining PILOTS" is a three-part edit:
  PILOTS entry + `usageFile(imports, resolveRawCode('axes'))` + the
  pinned inline snapshot (pin with `vitest -u -t <name>`, then review
  the literal, then run the whole spec clean). Static-child canvases
  (only component tags + cx(rt.*)) extract fine; anything with bind: or
  page-state shorthand stays hand (the rejection class — say so in a
  page comment or the next reviewer re-litigates it).
- **Measure the served page, not the meta**: button-group has no meta
  file, so the whole axis story came from DOM probes — and the probe
  itself needed three iterations (chrome `[role=group]` false hits →
  gate on the family hook `display: inline-grid`; readiness gate
  passing on a chrome decoration → gate on the family signature, not
  box-shadow; density anchor comparing xs-context vs sm — read the
  rung ladder as data, don't force it through a wrong baseline).
- **Kill the wrapper, not just the listener**: `npm exec vite` left
  wrapper 502 → child 538; killing only 538 leaves the wrapper to
  respawn or linger. Kill both PIDs, then `lsof` rc=1 as the receipt.
  (pgrep "5242" matches unrelated apps' `--shared-files` buffer-size
  flags — verify by command name, not substring.)

## Task 13 (empty REVIEW) — lessons
- **Grep receipts are necessary, never sufficient, for theme-pole
  claims**: "zero raw-token reads" passed as written, yet the atoms DO
  read six sheet voices — through the typed token layer, whose VALUES
  are verbatim var(--border) strings. The pole is decided by the
  EMISSION FORM, not the grep: tokens.stylex emits each value as an
  INTERMEDIATE :root custom property (--jx-border: var(--border)) and
  atoms consume var(--jx-border) — substitution happens once at :root,
  so a scoped .dark re-declaring --border can never re-open it (the
  declaring-element law, now proven at rule level for the frozen pole).
  A reviewer who stops at the grep either falsifies a true claim or
  blesses it for the wrong reason.
- **Unstyled reads masquerade as theme flips**: measuring before the
  family's css lands yields UA defaults whose currentcolor DOES flip
  (it inherits the sheet's --foreground) — a false refutation that
  looks like a disagreement-probe win. Readiness = the family
  SIGNATURE (a computed property only the family sets, e.g. its
  padding), never element existence. Second occurrence; now a law.
- **stylex dev rule inspection**: computed styles alone can't reveal
  WHICH var a rule reads; the vite-transformed module
  (curl /src/lib/.../x.stylex.ts) exposes the className map, and the
  injected rules live in INLINE <style> tags — search
  ownerNode.textContent for '.className {' and the token emission
  ('--jx-border:') rather than walking cssRules (nested/at-rule rules
  and sheer volume defeat the walk).
- **False friends in consumer greps**: "Empty" hits named
  CommandEmpty (a different family's subcomponent), a popover comment,
  and a blueprint scene — negative-consumer receipts need the import
  path (ui/empty|@ui/empty|empty/empty.svelte), not the identifier.
- **Sibling ports exist**: teardown = kill MY wrapper+child, lsof MY
  port; a vite on the NEXT port (5244) belonged to a sibling started
  earlier — verify by command + port, leave it alone.

## Task 14 (heading REVIEW) — lessons
- **The refined THEME-SPLIT law now has a THIRD emission form**: beside
  raw reads (flip) and the typed-token :root intermediates (frozen),
  the §11 size stamp emits var + DECLARATION together inline
  ('--jx-size-effective: Npx' AND 'font-size: var(--jx-size-effective,
  1rem)') — inline style beats any class rung, so an explicit lane
  REPLACES the class ladder while auto restores it. "Consumes via the
  stamp" is a distinct consumption class from "consumes via css":
  grep-for-readers finds ZERO css readers and the axis still repaints.
  A per-axis review must therefore check the STAMP path (SSR style
  attr) before declaring supply-only from a zero-readers grep.
- **meta row arithmetic counts the SYNTHESIZED rest row**: the meta
  file held 13 keys but the served table renders 14 (from-meta adds
  `rest` when not hidden) — "14 − 8 = 6" is true AS SERVED. Arithmetic
  receipts come from the served tables, not the source file (the
  rest-hide override changes the count).
- **query() typing pedagogy**: the NUMBER lane goes bare
  (query({ md: 18 }, 14) — inference works); it's the STRING lanes
  that need both generics named. A page that teaches both directions
  in one canvas beats two pages (the §6 law demonstrated, not just
  cited).
- **Signature gates differ per family**: empty's signature was padding;
  heading's is fontWeight 700 — pick the one property only the
  family's own atom sets, not a value the ambient sheet could share.

## Task 15 (avatar FIX) — lessons
- **The initials block IS the root**: avatar renders the fallback as
  the SAME element (data-jx-avatar-fallback sits on the root span, no
  child) — a probe scoped to a child selector finds nothing and
  silently reads the root instead. Structure-dump one instance
  (outerHTML) before writing the measurement selectors; the two-burn
  readiness law now has a sibling: dump-then-measure.
- **The §11 echo's true shape, per family**: on heading it REPLACES a
  class ladder that exists to be replaced (intended, documented); on
  avatar it OVERRIDES a fixed voice that exists to stay fixed (defect,
  ledger #7). Same emission, opposite intent — the docs wording must
  name WHICH contract the echo meets or breaks, not just that it wins
  the cascade. "Inline beats class" is the mechanism; the contract is
  the story.
- **Ambient is a measured value too**: the "fixed 12px" claim was true
  in exactly one lane (ambient, no echo) — marginalia's "false at
  every explicit size" and my "fixed at every size" were both
  over-general. The fix names the lane predicate explicitly: a claim
  about a token's voice must carry its lane qualifier or it is false
  somewhere by construction.

## Task 16 (heading 2nd review) — lessons
- **Self-confirmation passes should re-run probes, not re-read
  conclusions**: my own task-14 PASS re-verified in ~10 minutes because
  the probe script survived in /tmp — LAW #15 gating + the 16 checks
  re-executed byte-for-byte against the current tree. The value of a
  2nd pass by the same reviewer is drift detection (did the tree move
  under the findings?), not opinion revision.
- **A carried finding must be re-stated with its current cost**: the cx
  MINOR carried from task 14 with its exact line (122:28), its fleet
  cost (1 of 1622), and its named fix (avatar's predicate) — plus the
  dispatch's disposition (quill's next micro-pass, non-blocking). A
  carried finding without a cost/fix/disposition line forces the next
  reader to re-derive all three.
- **git log -- <files> before re-verifying**: 54750f68 still being the
  heading files' last commit proved nothing drifted under the findings
  — the cheapest "did the tree move" receipt there is.

## Task 17 (hero-section REVIEW) — lessons
- **The query() demo class needs a LIVE flip check, not a mechanism
  cite**: the theme query demo never flipped (silent — zero console
  noise), while the identical engine resolved 'dark' standalone in the
  same page context. A query demo can be FALSE-implying even when
  every static artifact (code, caption, engine) is individually
  correct: the INTEGRATION is the claim. Any page whose query case is
  the teaching artifact gets a two-viewport probe with polar/clean
  assertions — and the wall-clock hue kills naive color-equality
  checks, so assert L/C polars or attribute flips, never full colors.
- **Stylex dev class names defeat attribute-substring selectors**:
  `[class*="ctaRow"]` matches nothing (classes are x1y0btm7-style
  hashes); scope by panel hook (data-probe) + element/tag selectors,
  or dump outerHTML first. Same discipline as LAW #15 but for
  SELECTORS, not timing.
- **Ambient solos can carry siblings' mid-edit failures**: the ambient
  bijection failed on `color-picker|1|size|1` — a sibling's page row
  landed before their matrix re-pin. Attribution procedure: read the
  uncovered key's page name, check git status for that page's in-flight
  edit, report the failure as attributed context (count + name) rather
  than pass/fail.

## Task 18 (inline-code REVIEW) — lessons
- **Tier-3 by pin density is a real decision procedure**: when a hand
  table is pinned N≥3 ways (row invariant + matrix ordinals +
  grammar-path extraction), the archetype migration cost is the re-pin
  cascade, not the writing — so the correct shape is gaps-only
  (install/overview/see-also) with the pinned table byte-preserved.
  The audit receipt is the COMMIT DIFF, not the rendered page: diff
  the integration commit against its parent and count the removed
  lines (here: exactly one, the cx filter). A zero-table-diff plus
  green pin specs is the whole tier-3 proof.
- **Weak signature gates fail SILENTLY-PARTIAL**: the mono-font gate
  read a page where SOME atoms (padding) had landed and others
  (background/border) hadn't — mixed live/dead reads look like
  plausible values and pass casually. Gate on the SPECIFIC atom whose
  value you are about to assert (the tonal tint for a tonal claim),
  not on any family-adjacent property.
- **The dispatch's byte-order sketch is a summary, not a spec**: real
  toc audit = every listed id present + listed-relative-order == DOM
  order + unlisted-but-present ids enumerated as findings (the axes
  section unlisted was the review's MINOR). Same for test counts:
  rg -c "it(" undercounts nested suites — the runner's own count is
  the receipt (22, matching the dispatch exactly).

## Task 19 (card-grid CODE) — lessons
- **Layout families split density into two measured halves**: the
  landlord's own rhythm rides the space ladder (--space-N =
  calc(--jx-unit × N), --jx-unit anchored at :root) — inert at every
  rung; the tenants read the per-rung kernel channels (--jx-inset/
  --jx-stack/--jx-text) that the stamped rung scope DOES re-base.
  "Supply-only" and "consumed" are simultaneously true on one element,
  split by WHO paints: one probe measuring gap + tenant padding side
  by side settles it. The dispatch's watch-item ("density may be
  genuine here") was right and wrong at once — the two-half row is the
  honest form.
- **from-meta synthesizes `rest` only when the family spreads rest**:
  card-grid's Props has no rest spread → no rest row → the arithmetic
  is 12−8=4, not the +1 the synthesized-rest pattern suggests. Count
  the SERVED rows before writing the arithmetic line (caught mid-write
  by the served-table count, not by reading source).
- **The IO-armed entrance must be read AFTER its own cascade**: mid-
  cascade reads show opacity 0 / translateY 26px and look like a dead
  entrance; scrollIntoView + 2s settle shows opacity 1 / transform
  none. LAW #14 applies to JS-armed time cascades with per-index
  delays, not just transitions — and a deterministic
  scrollIntoView+setInterval-armed check beats a blind scroll-through
  for distinguishing "dead" from "not yet".

## Task 20 (input-group REVIEW) — lessons
- **Computed duration serialization**: getComputedStyle returns
  durations in SECONDS for whole values ('0.15s', '1s') and ms for
  fractional ('150ms' stays only if authored fractionally...) — never
  string-compare a duration token literal; parse to ms or compare
  against both forms. My only probe FAIL this task was the assertion,
  not the family.
- **The :has() state machines read raw theme tokens deliberately**:
  input-group.css's well/hover/focus/invalid/disabled machines are the
  elevation grammar's WELL tier riding raw --shadow-well/--ring/--muted
  — a css state machine is a legitimate RAW-READ home (it wants theme
  response), unlike an atom that merely forgot its layer. The
  emission-form split crosses ONE bezel here: raw seam/well flip while
  the typed bezel freezes — the fleet's cleanest single-element
  demonstration of the refined law.
- **The legacy attribute as a family row**: data-density appears in the
  meta as its own main row (the escape hatch for consumers keying css
  on the attribute), sitting beside — not colliding with — the density
  AXIS row in the universal section. When auditing EXTRA arithmetic on
  form families, expect both keys and check the served tables keep
  them separate.

## Task 21 (descriptions REVIEW) — lessons
- **The stylesheet-walk bug that zeroes every emission-form census**:
  `if (r.cssRules) { walk(r.cssRules); continue; }` skips every
  CSSStyleRule, because modern Chrome gives STYLE rules an (empty)
  .cssRules list — truthy — so the walker descends into nothing and
  never reads cssText. The correct shape: handle r.type === 1
  (STYLE_RULE) by reading cssText (and its declarations) BEFORE
  descending, and only recurse for group rules (media/layer/supports).
  Every "tokenEmissions: []" scan I ran in tasks 17/20 was this bug
  reading an empty walk, not a clean sheet — the empty review's
  census-by-luck conclusion gets retroactive doubt, though its measured
  polar verdicts stand.
- **Injected-rung ladders beat on-page demo luck**: when a page's
  DensityDemo only exposes two rungs, the full ladder is still
  measurable by cloning the specimen into data-density wrappers
  appended to body (ephemeral, no tree edit). Same for coefficient
  wrappers: --jx-density-coefficient: 3 on a wrapper leaves the voices
  unmoved — the declaring-element law measured by injection, no
  family change.
- **Query-caption boundary rem**: a query case's VALUES can be right
  while its THRESHOLD sentence is wrong (lg key = 64rem, caption said
  40rem). The discriminator is a mid-band viewport (here 800px — above
  the stated boundary, below the true one): if the case hasn't
  engaged, the caption's number is the finding. Assertion tuples must
  name their lane (term/value/pad), or a true "unmoved" reads as a
  FAIL against mislabeled expectations.

## Task 22 (code-card CODE) — lessons
- **The theme-drop is the fourth theme pattern, and it is WRITTEN INTO
  the resolve**: code-card strips the lane at the resolve boundary —
  `stampCarriersForLanes({ ...d, theme: undefined })` + a broadcast
  that omits theme — while the family css declares its own
  `.dark .jx-code-card` / `.jx-light .jx-code-card` token
  re-declarations (ancestry-adaptive own tokens, with an order-based
  light re-flip). So a `theme="dark"` prop is a NO-OP by construction
  and a dark TREE re-inks the card (measured: ground oklab 0.981 →
  0.091, tok keyword re-derived dark, card carries no .dark class).
  The audit question per family is now four-way: raw-flip /
  typed-frozen / bridge-only / dropped-with-own-adaptation — and the
  drop is verifiable by grepping the resolve call, not just the css.
- **`condition && atom` call sites are a second cx-error class** beyond
  the .filter(Boolean) idiom: `false` is not in the cx union. The
  fleet-standard predicate handles undefined; the call-site ternary
  (`cond ? atom : undefined`) handles false. Two fleet errors retired
  by two ternaries — check both classes when a page claims zero
  diagnostics.
- **A page may rightly have NO query() seat**: a leaf surface that
  hosts no components and reads no rung channels gives a responsive
  lane nothing to re-base. State the absence + the probe receipt in
  the axes deviations paragraph instead of shipping a demo that
  demonstrates stillness (the hero-section query failure was the
  dishonest version of the same page shape).
- **DocsSeeAlso is data-driven and may render an empty section** if the
  reading chain has no entries for the family — check
  `data-doc-see-also` + the link count in SSR, don't just count ids.

## Task 23 (carousel REVIEW) — lessons
- **The one-token-apart contrast is the emission-form law's sharpest
  demonstration**: carousel's arrow and button-group's cluster wear the
  SAME sheet token (--shadow-xs) — but typed-intermediate emission
  (--jx-shadow-xs declared at :root, consumed as var(--jx-shadow-xs))
  freezes while the raw read re-substitutes at the consumer and flips.
  Two probes on two pages, one law: the census (which selector declares
  the token) predicts the probe (which way the shadow moves) every
  time.
- **Wall-clock hue rotates per READ, not per page load**: two
  getComputedStyle reads seconds apart measured the same dot at hue 279
  then 306 — any full-color equality assertion across time is a coin
  flip. Polar (L/C) comparisons or same-frame sampling only; the chip
  lesson now covers cross-READ comparisons too.
- **scrollLeft honesty needs the track's own padding in the model**:
  scrollTo(target.offsetLeft) on a padding-inline track lands at
  offsetLeft − scroll-padding (measured 831 = slide 819 + gap 12, while
  raw offsetLeft was 856). Assert the LANDING DELTA between consecutive
  positions (= slide+gap), not equality with offsetLeft.
- **Multiple same-family instances on one page**: the demo canvas
  carousel shadows the query canvas carousel for naive
  querySelector-first selectors — scope by the section's caption text
  or enumerate all instances and filter by the attribute under test
  (data-density presence, here).

## task 24 (CODE combobox)

- **query() is a CASES-RECORD call, and string lanes pin BOTH generics at the call site**:
  the engine is `query<T extends RawQueryCases, B>(cases: T, base?: B)` — the fleet form for
  string lanes is `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' })` (accordion/
  alert/anchor/card-grid… all pin the pair); a bare `query('lg','large')` fails to compile
  twice over (wrong arity AND `QueryResult<string|number>` vs the lane type).
- **Braces inside a Svelte ATTRIBUTE string are interpolation**: `summary="... ride {...rest}
  ..."` parses `{...rest}` as a spread expression → js_parse_error at that column. Prose in
  attributes must be brace-free (write "the rest spread") or interpolate a constant.
- **The page-local cx needs the banked predicate even when copied verbatim**: the old page's
  `.filter(Boolean).map(...)` carried 2 latent svelte-check errors (Object.entries over the
  un-narrowed union); the rewrite's `(style): style is string | { readonly [key: string]:
  string | object } => Boolean(style)` fixed them and TOOK THE FLEET DOWN (1606→1604).
  Copying "known-green" page code is not a receipt — page-scoped svelte-check before and
  after is.
- **DensityDemo ambient leaves the family attr null**: under the scope boxes the rung tokens
  cascade from the ANCESTOR [data-density] element — the family's own data-density attr only
  appears with an explicit lane (a query-resolved `large` stamps `lg` after aliasing).
  Document the mechanism as two-channel (CSS scope vs attr), never assume the attr.
- **The floor-asymmetry verdict class**: when a lane scales an inner lane but the shell's
  min-size is stylex-fixed, the honest row is "grow live / shrink dead" with both numbers —
  combobox: lane 26/30/38/46px vs shell floor fixed 40px.
- **docs-universal sibling attribution**: an UNTRACKED `+page.ts` (quill's native-scroll-area,
  in flight) makes the manifest count pages 110 vs markers 109 with the missing marker named
  — read the named page + git status before diagnosing your own edit; my page's marker rode
  in the 110.
- **The probe harness lives in /tmp and gets cleaned**: rebuild recipe (task 24 working):
  playwright-core via `createRequire('<repo>/node_modules/')`, `chromium.launch({ channel:
  'chrome', headless: true })`, route paths are LITERAL `.html` (combobox.html), and stylex
  classes are hashes — select by `.jx-field`/`.jx-label`/data-attrs, never `rt.panel`.
  Wait: initial goto + ~1s hydration settle; LAW #15 gate on the family signature (shell
  border+shadow read) before any density read.
- **DensityDemo/DensityDemoDefaults dogfood**: the theming section already renders the
  family at four rungs — measure there before building custom rigs; the scope label text is
  the rig's rung key.

## task 25 (FIX card-grid + CODE file-input)

- **A falsified claim is best fixed by making it TRUE, not by weakening it**:
  swapping the query demo's Card tenants for SectionCards turned the
  not-reproducible "measured 12↔16px" into a live measurement (8px 12px ↔
  12px 16px block/inline across 48rem) — the swap demonstrates more, and the
  frozen-Card truth stays stated as the contrast. Rule: when a claim names the
  wrong tenant, move the demo to the tenant that performs.
- **Drift-lock pins update WITH their curation**: adding a curation override
  (foot) breaks two pins — the legacy byte-for-byte row AND the override-field
  matrix; both live in props-table-meta-drift.spec.ts and both change in the
  same commit as the curation.
- **The ambient matrix pins (route, tableIndex, prop, occurrence)**: inserting
  a hand axes table ABOVE the contract table shifts tableIndex — the fixture
  entry moves with it, with a dated note (the color-picker re-pin precedent).
  Hand per-axis rows without ambient markers ("'auto'" alone) are NOT
  candidates — no exemption entry needed for them.
- **Synthetic DataTransfer drops work in Chromium**: construct
  `new DataTransfer()`, `dt.items.add(new File(...))`, dispatch DragEvent
  dragenter/dragover/drop — the full pipeline commits (Svelte handlers,
  accept gate, rejection line, preview). The transient over-pose class does
  NOT settle synchronously post-dispatch — don't assert it (or wait a
  macrotask); the pipeline result is the receipt.
- **The filechooser receipt**: playwright's `waitForEvent('filechooser')`
  proves the trigger's click reaches the platform picker in headless — the
  cleanest "ONE accessible control" receipt there is.
- **Density-by-alias-seams** (--jx-file-* ← hit/icon/text/inset) is the
  deepest consumption form in the fleet: every knob steps; the exception that
  proves the rule is the zone title (typed --text-label, 11px fixed at every
  rung — a label voice, deliberately density-deaf). Look for the fixed
  exception when a family claims full-ladder adoption.
- **Full-batch vitest runs can false-red load-sensitive specs** (hover-
  stability, ~5.7s): isolated re-run GREEN + full-set re-run GREEN before
  diagnosing anything — the banked contention law, again.
- **docs-universal can self-heal between runs**: a mid-task 109/110 FAIL
  (sibling's untracked +page.ts) cleared to 110/110 at gate time without any
  action of mine — re-run attribution-guarded failures at the end before
  reporting them as blockers.

## task 26 (REVIEW native-scroll-area, 1st of 2)

- **The fifth theme mechanism — observer-consumed**: the family's own
  MutationObserver resolves the nearest scope (data-theme/.dark/.jx-light,
  self-included walk) into a data-scheme attribute, and a capability sheet
  maps it to color-scheme — the PAINT is the platform's. Verified live both
  channels (class flip AND data-theme flip) with light→dark→light round-trip;
  medium named: the data-scheme attribute + computed color-scheme.
- **An SSR grep hit can be the page's own documentation**: the single
  `role="scrollbar"` in the raw HTML was the a11y table's NAME cell
  ("ABSENT"), not a mounted attribute — always resolve raw-byte hits to their
  DOM node (or absence of one) before judging; the live count is the receipt.
- **"N rows" claims need the authored/served distinction**: a hand table with
  the bare `universal` directive serves authored rows + the shared 8 axis
  rows — the authored count is the claim's referent; say so in the report so
  reviewer #2 doesn't flag the arithmetic.
- **Declaration precedence beats the §11 stamp**: inherited font-size stamps
  move the ROOT (16→14px measured) while children with their own declared
  voices keep theirs — "consumed through inheritance, declaration-scoped" is
  a distinct consumption class: verify BOTH halves (root moved, declared
  voice held) in one probe.
- **Zero-transition families**: grep `transition` in the family css AND the
  kit's sheet (count 0) before accepting "the OS owns the motion" — plus the
  reduced-motion block forcing scroll-behavior: auto is the guarantee the
  sheet keeps, not an animation claim.

## task 27 (CODE ghostty-term)

- **THE INTEGRATOR STOMPS UNCOMMITTED WORK**: mid-edit, the orchestrator's
  integration commits landed on the shared tree and my in-flight +page.svelte
  reverted to HEAD (only the edit applied AFTER the clobber survived). All
  section edits were re-applied from context. Defense: commit-adjacent
  checkpoints are forbidden to me (NO commits), so (a) re-apply from report
  drafts immediately, (b) verify with rg after every write (write-then-verify
  caught the stomp within one command), (c) expect M-status files to be a mix
  of mine + HEAD at any moment — `git diff` before resuming.
- **The universal directive's fold has an EXTRA escape hatch on hand tables**:
  props-table filters authored rows NAMED as axes when the universal section
  renders (`!UNIVERSAL_AXIS_NAMES.has(row.name) || extraRows.has(row)`), and
  extraRows = docs.extra BY REFERENCE — pass the same row objects in
  `docs={{ extra: [row, …] }}` and they survive the fold. This is the fix for
  "family prop shadows an axis name" (ghostty's theme OBJECT + family-own
  density) without losing the universal marker.
- **A missing-const error can be the ONLY symptom of a missing TreeFile**:
  ComponentCanvas files={queryFiles} with no const — svelte-check catches it,
  but the lesson is to define queryFiles IN THE SAME EDIT as the query case
  markup.
- **Ghostty-term is the typed-frozen pole's cleanest terminal case**: every
  painted voice is a typed token (--jx-terminal/-foreground/-ring/-primary)
  and the content is wasm ANSI — under scoped .dark NOTHING moves (measured
  ground/ink unchanged). A terminal is deliberately theme-independent; the
  theme slot is the absent-slot OBJECT escape hatch (the §13 shadow the
  carriers-bijection ruling names).
- **python heredoc block-moves need geometric asserts, not textual hope**:
  s.index anchors + assert 'marker' in span + assert count==1 BEFORE write,
  read-back after. The failed assert (span computed backwards) proved the
  asserts work — never "fix" a failing assert by loosening it.
- **docs-universal marker placement**: with the directive kept on the api
  table, the marker lives there; the axes section's hand table carries NO
  directive (its rows would all fold away — every row is axis-named). Marker
  + generic reference section on api; family truth on the axes table.

## task 28 (REVIEW combobox — SELF-review, 1st of 2)

- **Self-review protocol that actually adds value**: re-derive ALL numbers
  from the served tree BEFORE opening your own report (the report structures
  the claims list only); treat kernel/sheet drift through N integrations as
  the reason every measurement must be re-taken even when the PAGE source has
  zero commits touching it (eed9cd9e unchanged, but five fleet integrations
  moved the ground it stands on).
- **Floor-asymmetry re-measurement upgrade**: min-height alone proves the
  floor; the ACTUAL rendered height (getComputedStyle().height) proves both
  directions — 40px at xs/sm/default (lane shrinks inside the floor, dead)
  vs 48px at lg (46px lane + 2px borders — grow live). Measure height, not
  min-height, when the claim is about what the box DOES.
- **By-name row enumeration doubles as the drift check**: listing served row
  names (not bytes) proved the api arithmetic (13 family + 8 fold = 21) AND
  that no axis-named authored row was silently folded — the badge-indicator
  law applied as a regression instrument, not just an arithmetic one.
- **Probe-craft honesty**: when a DOM selector guess finds 0 drawers, say the
  SELECTOR was wrong and fall back to source wiring (5 canvases / 5 files=) —
  don't report the mechanism as absent. A probe limitation is a process note;
  a false negative reported as fact is a defect.

## task 29 (CODE input-otp)

- **The copied universal-props template text is a defect class**: "the family
  CONSUMES size and color" shipped on three pages (combobox, file-input,
  input-otp) and was false on all three (echo-only / supply-only). Any
  imported summary paragraph makes a CLAIM — grep the fleet for sibling
  copies when one falls ("CONSUMES size and color" is the canary string).
- **The max() geometry lane can invert which leg wins per rung**: OTP slot =
  max(--jx-hit, --jx-line × 2) — line×2 wins at xs/sm (32/36) while hit wins
  at default/lg (40/48). Measure the COMPUTED box, never re-derive from the
  formula; the winner changes with the rung.
- **python block-move asserts saved a second revert**: the backwards-span
  assert (l0 > l1 ⇒ empty span) aborted BEFORE the write — assert-before-
  write is the whole game; also s.index vs s.rindex matters when a tail
  pattern ('  </div>
</div>') occurs more than once across two shell wrappers.
- **rg pattern escapes**: `rows=\{3\}` inside double quotes still reaches rg
  as a Rust regex bounded repetition → silent zero-match exit. Use -F for
  literal braces; a silent empty rg result is a PATTERN failure until proven
  otherwise.
- **Per-slot OTP a11y model, measured**: role=group + labelled slots (real
  inputs), autocomplete=one-time-code on the FIRST slot only, inputmode per
  numeric, aria-invalid/describedby wired; mechanics = focus management over
  real inputs. Synthetic DataTransfer-free paste test: set input.value to a
  multi-char string and dispatch input — handleInput distributes.

## task 30 (CODE kbd)

- **"Inherits font-size from context" captions deserve a live falsification
  pass on every typography-first family**: kbd's served copy claimed context
  inheritance (0.75em), but the atom pins --jx-text-secondary — measured 12px
  inside 13.5px AND 13px contexts. The §11-vs-own-voice question resolves by
  reading two contexts, not the source comment; the source comment was the
  bug.
- **Typed tokens split TWO ways — literal vs stream**: kbd's tonal voices
  (--jx-tonal → primary) RE-DERIVE under scoped .dark (measured flip), while
  combobox's typed --jx-border/--jx-terminal freeze at the :root pole. The
  emission form that decides is whether the token's stored value is a literal
  or a var() stream (streams re-resolve per element). THEME-SPLIT verdicts
  must name which typed shape, not just "typed".
- **The EXTRA lane (docs.extra) only works on INLINE literal rows**: the
  ambient matrix's axisRowsOf parses PropsTable props arrays as object
  literals — a hoisted const identifier is invisible ("found 0"). When the
  matrix pins the row text (kbd density = frozen 'ambient scope'), keep the
  inline literal and let the fold stand; serve the family truth in the axes
  table instead.
- **Two-shell-wrapper pages have TWO '  </div>\n</div>' tail patterns**:
  s.index(CLOSES) lands on the FIRST (mid-file) one — use rindex for the real
  tail, and assert the span is non-empty before cutting.
- **Non-interactive glyph a11y**: a native <kbd> page's A11yTable keys row is
  honestly '—' (takes no focus/keys); the a11y content is the element
  semantics + combination reading (each key its own kbd, + as literal text).
- **TokenTable source is an enum**: 'variant grammar' (prose) fails the type;
  the honest enum value for a variant-grammar token is 'component'.

## Task 31 — menubar (2026-09-22)

- **The dispatch leads are hypotheses — the DOM answers them**: menubar's panel is
  IN-PLACE (chain `SPAN[slot] > LI > UL#bar`), so nav-menu's promotion-away channel
  (.jx-pop) and popconfirm's portal law simply don't apply; the family keeps its own
  `.jx-menubar-panel` law. The DOM-shape probe settles carrier inheritance questions
  in one shot.
- **defineVars pins :root literals; only the createTheme tokenScope class
  re-derives** (concrete instance of boot-time-snapshot ≠ alias-freeze): grep
  tokenScope consumers FIRST — families that don't stamp it (menubar) have frozen
  typed-atom voices under explicit dark while their legacy-var voices re-derive.
  Measure the theme row PER VOICE (bg/border/ink/poses/open-pose separately); a
  single "does it flip" question hides the split.
- **Keyboard-contract claims must be walked key-by-key**: the menubar glide is ONE
  HOP (after → focus lives in the next panel; the bar walker requires a
  trigger-focused activeElement, so further arrows are no-ops). My first glide probe
  pressed ArrowDown first and measured a false "glide broken" — and the hero text
  implied chain-gliding. Probe posture determines truth; write the measured
  contract, not the comment's aspiration.
- **Query-base prose canary caught my own error**: I wrote "small — 28px/11px"
  (the XS rung) before measuring; the small rung is 32px/12px. Measure the exact
  specimen the prose describes, at BOTH sides of the viewport key (768px ±).
- **TOC==DOM comparators**: toc hrefs carry '#', DOM ids don't — normalize before
  comparing or you get a false FAIL (and verify chrome-exclusion on both sides).
- **Playwright page.request.get(url)** replaces in-page fetch for SSR raw HTML
  (about:blank fetch has no origin and fails).

## Task 32 — number-input (2026-09-22)

- **Transition trap for theme probes**: a 150ms css transition on box-shadow meant
  the .dark read taken the same frame showed the OLD value ("frozen well") while the
  custom property had already flipped. Rule: when a var reads flipped but the
  computed property doesn't, wait past the transition (350ms) and re-read the
  end-state before writing a frozen/re-deriving verdict.
- **Consumer-vs-family prop asymmetry**: a family can destructure + consume a prop
  (chrome → data-chrome) without declaring it in Props — works internally, fails
  consumer call sites at svelte-check. Before putting `someProp="x"` in a page, grep
  the family's Props interface, not just the implementation.
- **Two-way bindings can fake commit behavior in demos**: a slider bound to the same
  value coerces undefined→min (range inputs can't represent empty), making a
  spec-proven "empty commits as undefined" LOOK broken on the live demo. Verify
  commit claims on an unbound field; keep playground-bound fields away from
  empty-state demos.
- **Hold-clock receipts are cheap**: pointerdown + sampled inputValue at ~80/250/420/
  700/1000ms distinguishes immediate-step / delay-plateau / repeat-cadence in one
  hold. A plateau reading where acceleration was claimed (or vice versa) is a
  one-probe falsification.
- **Ambient baseline failures can clear themselves** (second occurrence): quill's
  reference.html failed the ambient vocabulary gate at baseline, settled by gate
  time. Re-run attributed failures at the end before diagnosing; never touch the
  sibling's file to make it pass.
- **Hardcoded px in old copy ages badly**: "28px-wide steppers / 40px law" predated
  the density-kernel move — both numbers now measurable lies on scoped rungs. Grep
  the page copy for bare px claims tied to geometry and re-measure each against the
  served DOM.

## Task 33 — press-button (2026-09-22)

- **Cascade-kill triage is cheap when the atom map is honest**: press-button's
  VARIANT_CLASS was collision-free by construction (frame = geometry only; each rung
  owns all three paint channels; state paint rides css seams) — one read of the
  atom table + the css hook list clears the suspicion. Contrast: number-input's
  shellInvalid tied on border-style and needed the unlayered carve-out. The check:
  list every conditional class/attr, diff its properties against the base atoms.
- **emulateMedia({ forcedColors: 'active' }) verifies forced-colors laws live**:
  link → LinkText resolved rgb(0,0,159) in the probe — no need to trust the css
  block's comment.
- **Light-theme "black" can BE the destructive value**: this theme's light
  --destructive is oklch(0 0 0) (dark: white). Before reporting "the destructive
  color didn't apply — it's black", read the token's light value.
- **Custom-property seams flip instantly; computed properties transition**: probe-1
  measured a "frozen" well shadow that was just a 150ms transition at t≈0 (banked in
  task 32); press-button's fill re-tint needed the same 350ms-settle discipline.
- **python splices with read-back asserts catch my own planning errors**: the
  section-reorder script's trio assertion failed on the first pass (I moved the
  wrong block) — the assert fired AFTER the write, so the fix was a second
  verified splice, not a silent wrong order. Keep asserts on the ORDER, not just
  the inventory.
- **Surgical edits on a big page beat full rewrites when 600 lines are machinery**
  (the schema dock) — but re-grep the file after external modifications (a
  mid-task edit hit the "file modified" guard; re-read and re-applied cleanly).

## Task 34 — progress (2026-09-22)

- **getComputedStyle lies for engine pseudo-elements**: reading
  `getComputedStyle(bar, '::-webkit-progress-value')` returned the ELEMENT's own
  background and `0s` transition in Chromium — the first probe concluded the fill
  rules were dead. Pixel truth (screenshot the bar, scan the row: saturated fill vs
  gray track) proved the fill paints brand color fine. When a verdict hinges on a
  pseudo-element, go to pixels (canvas row-scan), not CSSOM.
- **Screenshot-diff is the clock for unreadable transitions**: fill-edge position
  sampled at first-frame after a value jump — identical in normal and reduced modes
  → the authored 200ms pseudo-width transition is Chromium-inert. Two modes × early
  frame settles "authored-but-inert" in one run.
- **The dispatch's duplicate-id lesson as a hard gate**: page-wide id regex scan
  (section AND non-section ids) with a dups assert before svelte-check — zero-cost,
  and the only check that would catch a copy-paste section clone.
- **Density-"managed" families can still be paint-invariant**: a rung attr on the
  root plus zero kernel-channel reads (fixed --jx-unit height) means the ladder is
  declared but invisible. Measure ONE stamp (2xs) before writing "CONSUMED" — the
  honest row here is "managed but paint-invariant".
- **The frozen-ink seam now has three instances** (menubar open-pose candidate,
  progress label/track/frame, press-button outline/ghost ink): all share the same
  root cause — defineVars :root literals the dark scope does not re-declare. Flag
  instances by family+atom list so one pattern fix can cover them.

## Task 35 — prototype-flex (2026-09-22)

- **ComponentCanvas mounts the playground snippet LAZILY**: controls inside
  `{#snippet playground()}` are absent from the DOM until the pane opens — a rig
  built there measures as nonexistent (0 selects on the page). Primary interactive
  demos belong in the STAGE BODY; the playground snippet is for help text and
  drawer-bound controls.
- **query() boundary is real and type-enforced**: the eight axis lanes accept
  QueryResult; native passthrough props do not (gap: number | string rejects it).
  Don't plan a query seat on a passthrough prop — pick an axis lane, and teach the
  boundary as a feature ("lanes take query(); passthroughs don't").
- **Rig wiring receipts are three reads**: baseline computed style → change a
  control → computed style again, per control. A rig that claims to edit flex
  direction but only re-renders a label fails this; the receipts take one page load.
- **Alpha/token-free families flip the measurement plan**: with no family paint,
  the axes table's evidence is STAMPS (attr presence, style-attr carriers, class
  bridge) not computed paint values. Say "no paint to measure is itself the
  measured finding" — and answer dispatch hypotheses (gap-tokens) with the family's
  own law when they contradict.
