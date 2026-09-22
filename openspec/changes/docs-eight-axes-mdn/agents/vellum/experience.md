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
