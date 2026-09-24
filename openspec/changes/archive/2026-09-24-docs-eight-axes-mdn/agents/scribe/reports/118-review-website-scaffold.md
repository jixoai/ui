# TASK 118 — website-scaffold (docs page) — 2nd eight-axes review (scribe, reassigned)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
All four of marginalia's landed items verify at source + twin + served-byte + live-DOM
layers; three headline receipts re-derived with my own instruments (two digit-exact against
her numbers); the fresh axis (the scroll-padding regime across the immersive state) lands
POSITIVE — the reservation is immersive-static and reveal-safe by construction. Owner quill
✓ (coded, task 70); her 1st (task 108, PASS 0M/0m/3L/1N) consolidated at 9f70476b; this
review ran at HEAD f4a36087 on a fresh build (dist = f4a36087).

## The landed four, verified

1. **LOW-1 (the a11y Enter row) — LANDED, TRUE at the paint.** Served row reads "the VIEW
   lands on #main at the toc line (scroll-padding); focus itself stays on body (main
   carries no tabindex −1 — the classic skip-link caveat)" — byte-verified. Live re-run of
   her instrument: real Tab → first stop `.jx-skip-link`, revealed (clip-path none), "Skip
   to content"; from a 2200px-deep scroll, real Enter → `activeElement === body` TRUE,
   `main.hasAttribute('tabindex')` FALSE, mainTop **73** (her 74 — ±1 sub-pixel at the
   clamped scroll-origin edge; main is the first element, so the landing clamps at the body
   padding rather than the 106 line — consistent with her read).
2. **LOW-2 (the --jx-toc-line two scopes) — LANDED, TRUE at both scopes and at the paint.**
   Served TokenTable row: default "76px :root standalone · 106px shell-derived" with the
   description naming both scopes. Source: toc.css `:root { --jx-toc-line: 76px }` inside
   the "serves standalone consumers only" comment ✓; website-scaffold.css :90-92 derives
   `calc(var(--jx-header-h) + var(--jx-chrome-top) + var(--jx-line-extra))` ✓. Live: the
   shell-body computes `--jx-toc-line: calc(74px + 0px + 32px)` and
   `scroll-padding-block-start: 106px` ✓.
3. **LOW-3 (the family joiner twin :95) — CLOSED.** website-scaffold.svelte :95 now carries
   `Object.entries(style ?? {})`; **registry twin byte-identical** (diff clean at
   `registry/files/ui/website-scaffold/website-scaffold.svelte`); svelte-check family lane:
   **0 errors** (the 8 standing `state_referenced_locally` warnings at :191 are the fleet's
   provideUniversalLanes cosmetic class, predating, untouched).
4. **NIT-1 (the 6164px attribution) — LANDED.** Served: "6164px scrollable at the task-70
   read — a point-in-time digit, the page grows with the campaign" — attributed in place,
   the structural scroll-padding 106 kept current beside it.

## Headline receipts re-derived (my instruments)

- **Named-area budget at 1600 — digit-exact**: `.jx-shell` gridTemplateColumns computes
  `[rail-start] 256px [rail-end content-start] 1104px [content-end toc-start] 240px
  [toc-end]` = **256 / 1104 / 240**. Complement receipt: the SHELL's gridTemplateAreas is
  "none" (line placement — the page's "never grid-template-areas on the shell" claim),
  while the **top-layer** computes areas `"header header header" "tree stage toc"` —
  the named-area budget lives on the LAYER, exactly as the architecture claims.
- **The RO correction INLINE on .jx-shell — re-derived**: the shell's style attribute
  carries `--jx-header-h: 74px` (the declaring scope; a host-level write would be shadowed
  for descendants — the toc-flush seam); header band computes 74px.
- **The immersive law via the page's OWN buttons — digit-exact + mechanism pinned**: real
  click on "scroll body ↓ 360px" → host `data-hidden` TRUE + header transform
  **matrix(1,0,0,1,0,−74.74)** (reproducing marginalia's −74.74 to the hundredth); scroll ↑
  → data-hidden clears, transform none. NEW MECHANISM PIN: at the hidden state the header's
  computed `--jx-header-h` is **74px** while the transform reads −74.74 — the leave is NOT
  var-driven: website-scaffold.css :345 is `transform: translateY(-101%)` — **−101% of the
  band's own box** (74 × 1.01 = 74.74, which is WHY the digits carry the .74). Her receipt
  "−101% × the 74px band" is the exact mechanism; the toc max-height growth re-derived as
  `calc(100% + 74px)` (+header-h exactly; her +54.74 was a different toc node — same law,
  element noted).
- **The toc channel 10→10 — re-derived**: the chrome-slot rail renders the authored 10
  entries in DOM order (overview, live-demo, scaffold-base, shell-law, types, usage,
  theming, api, universal-props, accessibility), each twice (the toc family's dual
  desktop/mobile surfaces — her probe1 note confirmed, not a duplication).

## The fresh axis — the scroll-padding regime across the immersive state (POSITIVE)

Question: the shell reserves scroll-padding 106 (74 header + 0 chrome-top + 32 line-extra)
— but the immersive law REMOVES the header. Does the reservation follow? Measured with real
toc-rail clicks:

- Computed scroll-padding lives on `.jx-shell-body` (the scroll container): **106px at rest
  and unchanged while the header is hidden** — the reservation is IMMERSIVE-STATIC.
- Anchor-jump landing: `#theming` targetTop = **106** jumped at rest AND = **106** jumped
  with the header hidden — identical line.
- The reveal-fill check: after a landed jump (header hidden, headerBottom −1), a 60px
  scroll-up re-reveals the header (top 0, bottom 74) while the target head moved to 166 —
  **the re-revealed header NEVER covers the landed head**; the 74px of "empty air" above a
  landed section under immersive state is exactly the space an upward reveal fills.

Reading: the static reservation is self-consistent with the compact-by-header-h law —
anchor landings are reveal-safe by construction (a landing under a hidden header leaves
room that only the re-revealing header can occupy). No finding; the mechanism documented
for the next prober. **Cross-receipt with the closed toc page (marginalia 116, tier 1)**:
the toc page's pick-line lands at **74** (re-measured live: #overview targetTop 74) while
the scaffold page lands at **106** — the SAME var name landing different lines per scope,
which is LOW-2's two-scope story generalized and now reproduced on both pages by one
instrument.

## Skeleton-scope verification + the dialog-ruling tension

- Correction to the dispatch's premise: `scripts/docs-skeleton-scope.json` inScope is
  **['select','popover','checkbox','card-grid','date-picker','toast','combobox',
  'math-block','math-inline','mermaid','effects']** — website-scaffold is NOT in it (I
  initially trusted the dispatch; the JSON says otherwise). The page satisfies the
  contract's presence halves anyway: `data-doc-install` + `npx jixoai-ui add
  website-scaffold` copy served, `data-doc-see-also` + component link served, h1 ×1, api
  props-table present — and verify:docs (rc=0) does not hard-check it because the route is
  unmapped (warning-only), exactly like dialog.
- **The tension for the Owner, now GENERALIZED**: website-scaffold shares dialog's
  examples-before-Usage shape (first canvas stage @26602 vs the Usage H2 @111676 in served
  bytes — measured). The inScope 11 all avoid that ordering; both my dialog round's page
  and the NEWEST archetype page (task 70) carry it. When the successor gate
  (2026-08-30-docs-demo-standard-global-gate) flips hard-fail-everywhere, the backlog
  emptying requires either a fleet reorder (the toast-move class, ×~99 unmapped routes) or
  a scope ruling. My T112 adjudication (the reorder is the Owner's) was dialog-specific;
  the same decision now demonstrably spans the whole unmapped fleet including this page.
  No action this round; recorded for the staging debate.

## Standard battery

- SSR: **200, 440,502 bytes**; h1 ×1; `>undefined<` 0; `>null<` not reached (0 undefined
  class clean); `jxoai` 0; install/see-also markers present.
- **LAW #19: 55 ids, ZERO duplicates** page-wide.
- EXTRA-lane: her rest-less verdict re-affirmed from source (the destructure lists
  header/splash/chrome/children/footer + the eight axes — no `...rest`, no id, no class);
  the API table serves the six seams + the universal fold (14 tbody rows per her census —
  not re-counted, her receipt stands).
- Gates: fresh build **rc=0** (dist f4a36087) · verify:docs **rc=0** · docs-universal
  **110/110 rc=0** · page-scoped svelte-check: **page 0 diagnostics; family 0 errors** (8
  standing warnings, receipted above).

## Probe-fault ownership (mine, not the page's)

- **The pagedjs print-overlay interception**: my first battery died clicking the immersive
  button — a print-sim overlay (`data-jx-print-root`, "purpose":"sim", 14 pages) was
  intercepting pointers. Bisecting (Tab+Enter, scrolled Tab+Enter, toc-link click — all
  clean in isolation) did NOT reproduce it; it appeared intermittently once across runs. I
  removed it restoratively in-probe (`clearPrintOverlay` at click-dependent steps) and it
  never affected a measured claim. Whether a real user flow can summon it mid-page is
  unproven either way — my instruments could not pin the trigger; owned as probe
  environment, NOT a page finding.
- **Wrong-element reads, caught and re-run**: scroll-padding first read on `.jx-shell`
  ("auto") — it lives on `.jx-shell-body` (106px, re-read); gridTemplateAreas first read on
  the shell ("none" — which itself became the line-placement complement receipt) with the
  named areas on the top-layer.
- **mainTop 73 vs her 74**: sub-pixel at the clamped edge; within ±1, same behavior.
- The TOC_CHANNEL read returned 20 links before dedup — the dual-surface render, same as
  her probe1 note; the 10 unique ids are the channel.

## Process evidence

- Port **5243**: lsof EMPTY before (rc=1) → vite preview wrapper **31211** + listener
  **31259**; both killed by PID after probes; lsof after → **empty, rc=1**; orphan sweep
  clean. Sibling ports 5230/5241/5242/5244 untouched.
- NO commits, NO pushes, zero product-tree edits (git status: only my reports/experience).
- All interactions real (Tab/Enter keys, button clicks, toc-rail link clicks); DOM reads
  settled post-hydration (networkidle + explicit waits).
- Artifacts: /tmp/g118-{probe,probe2,printcheck,printcheck2,clear}.mjs,
  /tmp/g118-{build,docs,universal,scheck,preview}.log.
