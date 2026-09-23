# T79 — FIRST REVIEW toc.html (vellum)

**Verdict: PASS** — **0 MAJOR / 0 MINOR / 3 LOW / 2 NIT**, tier proposal **tier 1 ratify**
(the page needs no work; the findings are receipts-precision notes). Independence law kept:
verdict formed from my own source reads (toc.svelte 452L, toc-outline.ts 154L, toc-engine.ts
162L, toc-link/item/list, toc.css, the 474-line page, +page.ts, and the ROOT LAYOUT seat at
routes/+layout.svelte) and live probes — quill was not consulted; marginalia holds the 2nd.

## The self-reference spine — VERIFIED

- **The channel split is real and named on both sides.** PAGE-toc: routes/+layout.svelte:443
  reads `page.data.toc as TocSection[] | 'outline' | undefined` and the chrome snippet
  (:772-797) renders the composed tree for arrays, `<Toc outline={{ root: '#main' }}>` for the
  string, nothing for undefined. COMPONENT: the page's own aside aside rail is a `<Toc>` in
  manual mode. The route's +page.ts exports `export {}` — THE OPT-OUT DOCUMENT — with the
  trio documented in its header comment.
- **Opt-out trio receipts (2 of 3 served-verified, 1 documented)**: ARRAY — 107 fleet
  +page.ts files carry `const toc: TocSection`; spot-checked **accordion.html served**: the
  chrome-cell rail (`[data-area="toc"][data-jx-toc-root]`) renders exactly the page's authored
  ids (#accordion-base, #usage, #types, #api, #universal-props, #accessibility). ABSENT —
  toc.html served: 9 Toc roots, **0 layout-rail roots** (none in the chrome cell). 'OUTLINE' —
  ZERO genuine loads fleet-wide (the only textual match is toc.html's own comment; the layout
  seat's `{:else}` branch implements it) — the third form is implemented-but-unexercised;
  noted for the orchestrator (a one-route migration would light it).
- **The canvas outline law**: component-canvas stamps `data-toc-skip` on its root (verified at
  the source and on the served page — the three canvas-wrapped Toc seats all report a
  data-toc-skip ancestor); the workbench article deliberately runs as plain page markup.

## The measured claims — re-derived

- **Census — 9 Toc roots served** (aside manual 9+9 links; AUTO workbench 5+5; four
  DensityDemo scope copies 2+2; query/axes/named-steps seats 1/2/1 inside canvases). The
  page's receipts paragraph says "8 component rails" — census drift (NIT 1): 6 authored
  instances → 9 served roots (the DensityDemo multiplies), neither 6 nor 9 is 8.
- **Renders twice BY DESIGN — VERIFIED**: the aside rail's composed tree renders **9 desktop
  spine links + 9 mobile viewport links, label-identical** (18 for 9 authored — digit-exact
  per the dispatch).
- **The workbench "derive 5 / render 10" — VERIFIED**: the AUTO rail derived exactly 5 links
  from the workbench headings, each href matching a **runtime-stamped id** on the h2/h3
  elements (what-it-tracks / iom-weights / the-line-pick / two-modes-one-family /
  the-engine — the headings ship id-less and the lib stamps them); 5 × 2 surfaces = 10.
- **LAW #19 EXHIBIT HALL — the lib battery, 8/8 GREEN in-browser** (live module import in
  vite dev against fixture DOM): slug mint+stamp ✓; **WRAPPER-TWIN GUARD ✓** — the
  exact-slug wrapper's id ADOPTED (`entries[0].id === "ghost-wordmark"`) while the heading is
  **NOT stamped** (heading id stays empty) and the wrapper keeps ownership; **duplicate -2** ✓
  (setup / setup-2, unique); **CJK positional fallback ✓** (目录 → section-1); data-toc-skip ✓;
  **idempotent re-derivation ✓** (alpha-beta stable across two passes); **two-tier collapse ✓**
  (2 sections, 2 children under the first); **extents end at same-or-higher ✓** (A→B, a1→a2,
  a2→B, b→null — my fixture's a1 expectation line was miswritten; the lib's next-heading
  behavior is per-spec).
- **Scrollspy — VERIFIED with the two-scroll census.** Driving `.jx-shell-body` for real:
  at top all weights 0.000 + pick "what it tracks" (aria-current true); mid-scroll the sweep is
  continuous — caught 0.616/0.392, then 0.141/0.245, 0.587, 0.222/0.392, 0.139, 0.415,
  0.096/0.904 across nudges (the 0.499 mid-digit is an exemplar; the continuous per-link sweep
  is the law and it holds); at bottom 0.996 with the last-region saturation and the pick on
  "The eight axes". **The parent-marker law observed live**: mid-scroll both the pick and its
  parent carry aria-current. **--jx-progress live on the spine**: 0.020 (the min clamp) →
  0.311 → 0.571 → 0.911 monotone with scroll.
- **Mobile 44px glass bar — VERIFIED**: viewport row exactly **44px** (`--jx-chrome-bar:
  44px`), `data-jx-effect="blur"` with computed backdrop-filter blur(14px) saturate(1.35),
  toggle 44×44.
- **Framework-free — VERIFIED WITH SCOPING**: toc-outline.ts carries **zero listeners** (grep
  0 — "DOM in, plain data out"); toc-engine.ts carries exactly 2 (the scroll listener on the
  scroll root + window resize — the spy's job). The claim is true of the derivation lib; the
  engine is the listener-bearing half by design. One scoping word in the page copy would
  prevent the next reader from conflating the two libs (folds into LOW 1).
- **SSR duality — VERIFIED**: the raw SSR bytes contain the AUTO rail's aside with **zero
  toc links** (the declared exception: shell ships, links hydrate); the MANUAL aside is
  SSR-complete (the composed tree ships). LAW #19: 56 ids, duplicates NONE.

## Findings

1. **[LOW] The framework-free claim needs its scope named.** "zero listeners in the lib" is
   true of toc-outline.ts (grep 0) and false of toc-engine.ts (2 — scroll/resize, necessarily).
   The page's overview attributes the phrase to "toc-engine.ts is framework-free … the family
   talks to it entirely through the DOM" — the engine itself carries the two listeners. One
   clause ("the derivation lib is listener-free; the engine owns the scroll/resize pair")
   closes it.
2. **[LOW] The census count in the receipts paragraph is stale** — "8 component rails"
   vs **9 served roots** (6 authored instances; the DensityDemo multiplies the density sample
   across its scope wrappers). Re-count or say "every demo specimen is a Toc root" without the
   digit.
3. **[LOW] The 'outline' load form is implemented-but-unexercised fleet-wide** — the layout
   seat's `{:else}` branch and the +page.ts trio documentation describe it, and zero routes use
   it. Either migrate one route (lighting the third form) or note in the page-channel sample
   that it is the layout's capability, not yet any route's practice.
4. **[NIT] The receipts' "8 component rails" census digit** (see LOW 2 — same sentence).
5. **[NIT] The toc-engine rAF/scroll machinery is the lib law's counter-example** — the
   toc-outline header's "zero listeners" phrasing is per-lib; quoting it near the engine name
   invites the conflation (same clause as LOW 1).

## Gates

- **Fresh build** rc=0 (the verify:docs lint input; dispatch's dist reference f1e32741).
- `verify:docs` — **FAILED with exactly the expected fleet state**: `toast: skeleton: Examples
  renders before Usage` — scribe's T71 in flight, receipted, not mine; **zero toc.html
  problems** (the route passes the staged skeleton lint).
- `verify:docs-universal` rc=0 (**110/110**).
- ambient solo (three files): **3 files, 56/56, exit 0**.
- page-scoped svelte-check: **0 diagnostics on toc.html/+page.(svelte|ts)** (fleet rc=1 = the
  cx-clone aftermath seated elsewhere per f92d6555 — no toc.html diagnostics; sibling noise
  receipted: quill/website-scaffold, marginalia/tabs, scribe/toast in flight).

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 11744 + listener 11835 (/tmp/t79/*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. The LAW #19 battery ran against fixture DOM appended to the page body
  and removed in-probe; the live module import (`/src/lib/toc-outline.ts`) is a vite-dev
  capability — recorded as the instrument (a built/prerendered target would need a different
  route to the lib).
- Probe faults owned: my battery fixture's a1 expectation line was miswritten (I demanded
  a1→B; the lib's same-or-higher rule correctly ends a1 at a2) — the fixture was wrong, the
  lib right; my first density-census filter looked for rungs on the Toc roots (the
  DensityDemo stamps wrappers — the T75 lesson, applied on re-read).

## Open questions for the orchestrator

1. The 'outline' load form has zero fleet practice — migrate one route or annotate the sample
   (LOW 3).
2. The scrollspy's 0.499 exemplar: the sweep is continuous (mids caught at every nudge) — if
   the dispatch's 0.499 was a specific waypoint claim from quill's probe, it is environment-
   dependent; the page quotes no absolute weight (correct per the multi-run law).
3. The census digit (LOW 2) and the framework-free scoping (LOW 1) both ride closure as
   one-clause edits; marginalia's 2nd can verify them against the integrated tree.
