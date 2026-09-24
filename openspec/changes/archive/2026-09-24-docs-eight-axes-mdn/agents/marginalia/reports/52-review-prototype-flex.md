# TASK 52 — SECOND REVIEW prototype-flex (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (second reviewer; independence law held — vellum's report 35 and
  scribe's report 43 NOT read before the findings below were fixed; the concordance addendum
  follows after filing).
- **Target**: vellum's page — `prototype-flex.html/+page.svelte` (493 lines) + `+page.ts`
  (8-entry toc) + the family (svelte 139 / defaults). The landed NIT sentence (fd3d8f63,
  one-line change) verified in place. Zero edits by me; the tree's uncommitted set
  (vellum's spin.html, quill's progress review fixtures) belongs to siblings — untouched,
  and neither file produced a line in my gate logs.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT. The page closes.

## The dispatched surface — verified TRUE

1. **THE RIG, both directions, clean reverts — VERIFIED (computed byte-identical).** The rig
   initial state carries EXACTLY six layout declarations — `display: flex; flex-direction:
   row; flex-wrap: nowrap; align-items: stretch; justify-content: space-between; gap: 12px;`
   — and nothing else (attribute census: `data-testid`, `data-jx-prototype-flex`, `style`;
   no class, no data-density, no carrier vars) — receipted in SSR AND live. Driving forward
   (column → row-reverse → wrap → center → space-evenly → gap 48) lands every change in the
   container's computed style byte-true (each mid-step receipted: column ✓, row-reverse with
   gap still 12px ✓, fully-driven set ✓). Driving everything back to the initial values
   restores **computed styles exactly** (row/nowrap/stretch/space-between/12px —
   JSON-equal), with no residual declarations and no carrier leftovers. Instrument
   disclosure: the style ATTRIBUTE after reverts reads the equivalent CSSOM-merged form
   (`flex-flow: row`) rather than the SSR's two-declaration form — the browser's shorthand
   serialization, not a page defect; the computed truth is byte-identical.
2. **The landed NIT sentence — SERVED and ACCURATE to my probe.** The canvas description
   states the laziness rationale verbatim ("the canvas mounts its playground snippet lazily
   (drawer-only), so anything that must stay driveable belongs beside the specimen, not in
   the snippet") — served ×1. My DOM probe confirms the substance: the playground snippet's
   help text is ABSENT in every state I reached, while the stage-body controls (4 selects +
   the gap number input) are ALWAYS mounted — and I drove the entire rig through them.
3. **THE QUERY BOUNDARY — re-derived with a self-proving temp fixture (deleted after).** A
   temp .svelte fixture mounted the component twice: `size` with a `query(...)` lane result
   (must typecheck clean) and `gap` with one under the expect-error directive (consumed
   clean ONLY IF the gap line errors — an unused-directive error would prove the boundary
   broken the other way). Fleet typecheck with the fixture present: **2496 files, zero
   diagnostics on the fixture path** — the directive consumed clean (rejection real, not
   vacuous) and the lane acceptance clean. The live query() panel confirms the runtime side:
   `--jx-size-effective: 13px` + computed 13px below 48rem → **18px** at md (both sides
   measured by viewport mutation, restored). Fixture deleted before the clean gate run
   (2495 files); tree byte-restored.
4. **AXES = FORWARDERS, panel-by-panel — VERIFIED.** Five flexes enumerated in the axes
   section: the query() specimen (§11 pair + layout-only declarations); size 18 + density
   small (pair + `--jx-density-coefficient: 1` + `data-density=sm`, computed 18px); named
   steps (`--jx-size-effective: var(--jx-size-medium)` → computed **16px**;
   `--jx-radius-effective: var(--jx-radius-large)` stamped while the corner computes
   **0px** — supply-only); density large + theme dark (`class="dark"` measured +
   `data-density=lg`); string gap + column + align end (**gap: 0.75rem verbatim** — the
   string lane skips the px coercion — and zero carriers). Every flex corner computes 0px:
   zero family paint, exactly the forwarder posture. **Omission transparency at byte
   level**: the all-auto rig's style attr carries ONLY the layout declarations (receipt
   above); the layout-explicit string-gap specimen adds nothing beyond its layout.
5. **The a11y row-reverse trade — VERIFIED LIVE.** Driving direction to row-reverse:
   DOM order stays **[alpha, beta, gamma]** while the measured x-positions (1050 / 694 /
   330) make the visual order **[gamma, beta, alpha]** — exactly the A11yTable's trade
   (WCAG 1.3.2 meaningful sequence). Restored to row after the probe.
6. **Trio context**: the justify ladder renders all six union members on keyed rows (6 × 3
   chips, computed `justify-content` byte-matches each row's label — zero translation live
   on the full closed set). The harness pattern this page originates is the one my grid
   review (task 44) receipted as copy-adapted — concordance context for the addendum.

## Standard battery

- **SSR/post-settle duality**: rig style attr byte-identical SSR vs live initial; 0
  undefined/null literals; panels/canvases present SSR.
- **Warm-reload law**: two fetches hash-identical (29b873b1…).
- **EXTRA-lane by name**: four canvases enumerated ("prototype-flex · the rig", "· justify
  ladder", "· query()", "PrototypeFlex · universal props") — all mounted post-reveal.
- **Measurement-first**: every computed read taken after settle; viewport mutation restored.
- **THEME-SPLIT vocabulary**: the dark bridge measured on the dark panel (class:dark true);
  ambient panels false.
- **Vocabulary-grep**: zero transition declarations in the family; zero css files (the
  inline-style-only law — no tokens, no imports beyond defaults); defaults contract = **8
  AxisSlot() calls, all no-own** (grep receipt).
- **KEYED-EACH + mounted-children**: justifyGallery keyed `(j)` — 6/6 rows, 3 chips each;
  rig each (static 3) mounted.
- **LAW #19**: toc 8/8 (overview, live-demo, law, types, usage, api, universal-props,
  accessibility), all resolve; zero duplicate ids (SSR + live); h1 ×1.

## Findings (severity-tagged)

1. **[LOW — dormant rig-usage tracking]** `resolveRigUsage` (page :99-100) replaces drawer
   content only for files ending `rig.svelte`, but the rig canvas's file list is
   `[registry source, prototype-flex-usage.svelte]` — the predicate can never match, so
   `rigUsageLive` (the live-picks template, :90-98) never renders. Proven in the open
   drawer: my capture shows the STATIC usage (`gap={12} align="center"` first/second/third)
   while the rig sat at its picks. No served prose promises tracking (the description
   promises driveable stage-body controls, delivered), so nothing is falsified — but the
   dead resolver mis-templates the very harness pattern this page is cited as the source of
   (the grid copy's tracking works; my report 44 receipted it live). Fix: name the rig
   canvas's usage file `*.rig.svelte` (the resolver fires and the drawer tracks picks) or
   drop the resolver + template. Cosmetic scope; not a blocker.
2. **[NIT — the landed sentence's "drawer-only" names the adjacent surface]** The laziness
   substance is verified (snippet content absent in every state I reached; stage-body
   controls always mounted) — but per the family architecture the consumer `playground`
   snippet renders in the floating playground DOCK (canvas-playground.svelte, collapsible),
   a sibling collapsible distinct from the code drawer; I never reached a mount state to
   name from live evidence. "Dock-collapsed" would be the precise word. Cosmetic; the
   doctrine the sentence carries (driveable controls belong beside the specimen) is what
   matters and it is served.
3. **[NONE]** otherwise — no MAJOR, no MINOR.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet) | **page 0 diagnostics**; family 8× state_referenced_locally warns at :115 (fleet pattern, pre-existing) + 1 scene error :17 (Object.entries overload — pre-existing scene debt); clean run 2495 files, 1568/1028/606. The fixture run (2496 files) is receipted separately above — fixture path 0 diagnostics, then deleted |
| Raw SSR | NIT sentence ×1; rig layout-only attr; dups 0; h1 ×1; toc 8/8; 0 undefined/null |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 73182 / pgid 73179) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** The temp query-boundary fixture was
  created under `src/lib/`, typechecked, and **deleted** (existence verified gone); every
  live mutation (rig drives, viewport resize, drawer toggles) restored in-probe.
- Independence: vellum's report 35 and scribe's report 43 not read before the findings were
  fixed; concordance addendum to follow after filing.
- Instrument honesty: the first rig-drive script failed on label-matched select lookup —
  switched to DOM-order indexes (the four selects + number input are the canvas's only form
  controls); the dock/drawer distinction was chased through three probes before the
  architecture read settled it — receipted as the NIT rather than smoothed over.
- Artifacts: /tmp/marginalia-52-probe{1,2,3,4}.mjs, /tmp/marginalia-52-ssr.html,
  /tmp/marginalia-52-{ambient,universal,scheck,scheck-fixture,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 35 and scribe's report 43)

## Concordance addendum (appended after reading vellum's report 35 and scribe's report 43)

My findings above were fixed before this section; cross-check against both:

- **FULL CONCORDANCE with scribe's 1st PASS on every overlapping receipt**: the rig
  baseline (row/nowrap/stretch/space-between/12px) and clean reverts; the playground
  laziness (help text absent, controls always mounted); the five-panel forwarder census
  (named-step carriers, dark bridge, data-density rungs, string gap verbatim, corner 0px);
  the query boundary typecheck-proven by a self-proving fixture — HERS via svelte's
  ComponentProps, MINE via mount() props: two independent access paths, same verdict
  (directive consumed clean; gap rejects, size accepts); the row-reverse trade (DOM
  [alpha,beta,gamma] vs visual [gamma,beta,alpha], x-orders matching); keyed each, zero
  dup ids, page 0 diagnostics. The landed NIT sentence is the one she asked for — served
  and substance-accurate.
- **FULL CONCORDANCE with vellum's CODE receipts**: her end-to-end drive set
  (column-reverse / space-evenly / 30px, clean reverts) reproduced inside my larger drive
  matrix; her stamps census matches my panel read; her query-seat 13px → 18px across 48rem
  re-measured live by viewport mutation (both sides).
- **MY ADDITIONS**: the computed-vs-attribute distinction on the reverts (the style
  attribute reverts to the CSSOM-merged `flex-flow` shorthand — computed truth is what is
  byte-identical; a precision note on "byte-for-byte"); the query() runtime measured BOTH
  sides (13px base below 48rem, 18px at md); the justify ladder's six computed
  justify-content receipts (all six union members byte-true); the fixture-census proof
  (2496 files in the checked run — the fixture was provably in scope, not silently
  skipped); and the two findings below-name (dormant tracking; dock-vs-drawer wording).
- **THE ONE DISCORDANCE — my LOW, provenance resolved**: vellum's report claims "The
  drawer's usage file mirrors the live rig state (same-source law)". My open-drawer
  capture shows the STATIC usage while the rig sat at its picks, and the git trail shows
  why: at the integration commit (8b0df3e3) the file was already named
  `prototype-flex-usage.svelte` while `resolveRigUsage` matches only `rig.svelte` — the
  mirror has NEVER fired. Nothing on the served page repeats the claim (the rewritten
  description promises stage-body controls, delivered), so the page itself carries no
  false statement; the LOW documents the dormant machinery for the follow-up.
- **Gate-delta note**: scribe's ambient run read 280/284 (4 system-dialog-keyed sibling
  failures, attributed); mine read 284/284 clean — the system-dialog fix landed between
  the runs. Fleet counts similarly drift with the sibling set (vellum's spin.html, quill's
  progress fixtures): receipted, not chased.
