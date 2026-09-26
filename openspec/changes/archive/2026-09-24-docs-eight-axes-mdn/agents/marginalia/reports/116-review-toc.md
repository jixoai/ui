# T116 — toc (docs page) — 2nd eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 2 NIT — tier 1 ratify CONFIRMED**
(vellum's tier-1 ratify stands: the page needs no work beyond the receipts-
precision notes below; this 2nd added one family seat and two digit-drift
notes.)

Owner = quill (task 69); 1st = vellum (task 79, PASS 0M/0m/3L/2N). 2nd-review
protocol followed: vellum's report opened FIRST; the three landed clauses
verified at copy + byte layers; headline receipts re-derived with my own
instruments; one fresh axis. Dist **97f5b6cc** (the dispatch's reference,
exact). Port 5244 mine (pre-check rc=1, killed by wrapper PID — lsof
post_rc=1, no orphans; siblings 5241/5242/5243/5230 untouched). Probes
/tmp/marginalia-116-probe1/2.mjs. No fixes applied.

---

## 1. The three landed clauses — verified at copy + byte layers

1. **The engine scoping clause — LANDED AND BYTE-TRUE.** Page :374-375:
   "toc-engine.ts is framework-free (no framework imports — **the engine owns
   the scroll/resize listener pair; the derivation lib toc-outline.ts is the
   listener-free half**: DOM in, plain data out)". Byte layer:
   toc-outline.ts — **0 addEventListener**; toc-engine.ts — **exactly 2**
   (:154 the scroll listener on the target, :155 window resize). The one
   clause vellum asked for, verbatim.
2. **The receipts census — LANDED AND RE-DERIVED.** Page :435-436: "six
   authored instances → **nine served roots** on this page — the DensityDemo
   multiplies the density sample across its scope wrappers". Live census: 9
   `[data-jx-toc-root]` roots (aside 18 links; the workbench AUTO rail; four
   DensityDemo scope copies at 4 links each; the query seat 2; the universal
   seats 4 + 2) — the six→nine multiplication visible in the root list, the
   DensityDemo named in the copy. (Probe1 caught one AUTO root at 0 links —
   the SSR-exception observed live, see §3.)
3. **The 'outline' annotation — LANDED AND STILL TRUE.** Page :286-289: the
   third form "is the layout seat's capability, **not yet any route's
   practice (the fleet's 107 authored rails are all arrays)**". Byte layer:
   the layout seat types `TocSection[] | 'outline' | undefined`
   (+layout.svelte :443) with the `{:else}` branch implemented; the fleet
   now counts **120** array rails and the ONLY `toc: 'outline'` textual
   match is toc.html's own +page.ts COMMENT (the trio documentation) — zero
   genuine practice, exactly as annotated.

## 2. Headline receipts re-derived with my own instruments

- **Renders-twice**: the aside rail carries **18 links, 9 desktop-visible,
  label-identical halves** (probe1: `labelIdenticalHalves: true`) — the
  desktop spine + mobile viewport dual render, digit-true.
- **Scrollspy two-scroll census**: driving `.jx-shell-body` for real — at
  top all weights 0.000 with the pick on "what it tracks"; mid-scroll the
  sweep is continuous (1.000/1.000/1.000/0.567 at 1600; 0.845 pick +
  0.999 at 2400; engine 1.000 at 3200); at bottom the last-region
  saturation holds. **The parent-marker law observed**: the picked count is
  2 at every station (the pick + its parent both carry aria-current).
  **--jx-progress live on the SPINE FILL element**: 0.185 at scroll 1800
  (probe2; the var lives on the fill element, not the root — my probe1 read
  the wrong node, owned in §5).
- **SSR duality**: the raw SSR bytes carry 10 `data-jx-toc-root` stamps with
  the AUTO aside present and effectively link-less, while the MANUAL aside
  ships **18 links SSR-complete** — the declared exception ("the server
  paints the rail shell, links arrive on hydrate") bytes-true. Probe1's
  census caught one AUTO root at 0 links pre-derivation and 10 links
  post — the exception observed live, not just in bytes.
- **Opt-out trio**: ABSENT here — this route exports `export {}` (the
  +page.ts header documents the trio) and the live chrome slot carries **0
  toc roots** (probe2 OPT_OUT_CHROME_SLOT; my probe1 selector was wrong —
  the toc component stamps `data-area="toc"` on ITSELF (toc.svelte :419,
  the self-adoption mechanism), which is why a naive `[data-area="toc"]`
  census matches 18 component-internal nodes; the chrome-slot-scoped check
  is the honest one). ARRAY spot-check on statistic.html served: the chrome
  rail renders all 12 authored hrefs (×2 surfaces, 24 anchors) ✓.
  'OUTLINE': zero genuine route practice (the only textual match is this
  page's own comment) ✓.

## 3. Fresh axis — the rail click lands on the pick line

Clicking the AUTO rail's "the line pick" link (real click on the derived
anchor): the RUNTIME-STAMPED heading (`the-line-pick` — the lib minted and
stamped it; the authored wrapper id `toc-line` is a different node) lands at
**headingTop 74** — exactly the shell's toc-line
(`calc(74px + 0px + 0px)`, scroll-padding-block-start 74px on this page) —
and the scrollspy pick follows the region law ("what it tracks" — the
h2 whose heading-to-heading extent contains the landed h3). The a11y row's
"Enter … the heading lands exactly on the pick line" is TRUE digit-exact,
and it cross-receipts T108's toc-line work on the shell side. Focus note:
after the click activeElement is BODY (anchor navigation) — the toc page
makes no focus claim for clicks, so nothing filed (contrast T108's Enter
row, which DID claim focus and was trued).

## 4. LAW #19 fixture battery — 8/8 GREEN at the correct stages

In-page import of `/src/lib/toc-outline.ts` (the vite-dev capability) against
fixture DOM: slug mint+stamp ✓; wrapper-twin adoption ✓ (the exact-slug
wrapper's id adopted, the heading NOT stamped); duplicate -2 ✓; CJK
positional fallback (目录 → section-N) ✓; data-toc-skip ✓; idempotent
re-derivation ✓; extents end at same-or-higher ✓; **two-tier collapse ✓ at
its correct stage** — `deriveTocOutline` returns the FLAT level-tagged
entries and `tocOutlineToSections` (the lib's second export, :137) builds
the tree (my first battery checked children on the entries and read false;
the sections form gives 2 sections with 2 children under the first). The
two-step design is the lib's, not a defect.

## 5. Findings

**LOW-1 (new information) — toc-link.svelte carries a 4-error
type-inference cluster.** svelte-check seats :26:9/:26:58/:26:74/:28:9 —
the `$derived` props object closes over the `$props()` destructure
(href/rest), and Svelte's inference reports circularity ("implicitly has
type 'any' … referenced by a variable used before its declaration",
including a literal "Block-scoped variable '$props' used before its
declaration"). Runtime is exercised clean (the rails render, the derived
click landed, aria-current writes). The toc.html PAGE is at **0 errors**
(the gate holds); this is the family's seat, first surfaced by this review.
Fix shape: annotate the destructured `href`/`rest` (or move the derived to
`$derived.by` with an explicit return type) — the standard circularity fix.

**NIT-1 — the landed annotation's fleet digit has drifted.** "the fleet's
107 authored rails are all arrays" (:289): the fleet now counts **120**
array rails (campaign growth) — the substance (all arrays, zero outline
practice) still holds byte-true. One-digit touch-up whenever the clause is
next edited.

**NIT-2 — the receipts paragraph's theme-strata digits are vellum's.**
"rail title oklch(0.3211 0 0) → oklch(0.8452 0 0) under the page bridge"
(:442-443) — task-69/probe-era digits riding a live-receipts list (the
T108 NIT class). The muted-foreground value still matches the current
theme (oklch(0.3211 0 0) live ✓); the dark-side digit was not re-derived
(no dark flip exercised in this pass). Attribute-or-refresh whenever
touched.

## 6. Gate record

- ambient solo: 284/284, rc=0.
- docs-universal: GREEN 110/110, rc=0.
- **verify:docs: rc=0 — the fully-green state HOLDS** ("all docs pages pass
  the skeleton lint"); any red would have been new information; none.
- page-scoped svelte-check: **toc.html page 0 errors**; the family carries
  the toc-link.svelte cluster (LOW-1, new information).
- Server killed: lsof :5244 empty (post_rc=1), no orphans; siblings
  5241/5242/5243/5230 untouched.

## 7. Probe-fault ownership (mine)

- Probe1's LAW19 battery threw "deriveOutline is not a function" — the
  lib's export is `deriveTocOutline`; probe2 fixed it.
- Probe1's two-tier check read the ENTRIES stage (flat, level-tagged) —
  the collapse lives in `tocOutlineToSections`; probe3-style rerun
  confirmed 2 sections / 2 children. My fixture, the lib's design.
- Probe1's --jx-progress read the ROOT (empty) — the var lives on the
  spine fill element; probe2 read it there (0.185).
- Probe1's rail-click used `#toc-line` (the authored wrapper div) — the
  derived anchors point at the STAMPED heading id `the-line-pick`; probe2
  clicked the real link.
- Probe1's opt-out check matched 18 component-internal `data-area="toc"`
  nodes (the toc self-adoption stamp, toc.svelte :419) — probe2 scoped the
  check to `.jx-chrome-slot` (0 roots ✓, matching vellum).
- Probe1's SSR auto-aside grep by aria-label missed; probe2 grepped by the
  root stamp (10 stamps in SSR, auto aside present, ~link-less).
