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
