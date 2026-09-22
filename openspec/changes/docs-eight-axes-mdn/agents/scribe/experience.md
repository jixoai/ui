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

