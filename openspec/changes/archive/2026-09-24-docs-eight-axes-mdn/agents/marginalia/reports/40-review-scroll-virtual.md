# TASK 40 — REVIEW scroll-virtual (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer — no prior findings exist; independence law
  trivially held: all receipts derived from my own source reads + live probes)
- **Target**: quill's page integrated at `ecf87c9f` — `scroll-virtual.html/+page.svelte` (419
  lines) + `+page.ts` (12-entry toc) + the family (engine-wrapper over @tanstack/svelte-virtual
  composing the scroll-area). Zero drift since integration on scroll-virtual paths; the tree's
  uncommitted set (scroll-area.html — vellum, sheet — quill, the ambient matrix re-pin,
  prototype-grid) belongs to siblings — untouched, and the ambient matrix edit is IN the served
  gate state (receipted below).
- **Method**: source reads (page, family, defaults, toc-outline stamper), live probes with
  scoped selectors, cold/hydrated + fresh-load/resize discipline, SSR parse + real-DOM
  duplicate-id scan, ambient solo + same-source + docs-universal + fleet svelte-check.
- **VERDICT: PASS** — 0 MAJOR / 1 MINOR / 2 LOW / 1 NIT. The LAW #19 watch-item receipts
  CLEAN on every axis the dispatch named; the windowing, forwarding stamps, and query() are
  digit-exact; the findings are navigability and dead-data, not defects in the demo or family.

## The LAW #19 watch-item — receipts CLEAN on all three named axes

1. **Every id unique post-hydration — VERIFIED**: real-DOM scan found **48 ids, zero
   duplicates** (the fill-label-ink-era scan class: attribute-level, code-text excluded).
2. **Wrapper ids present in SSR — VERIFIED**: install, overview, virtual-demo, law, types,
   usage, api, axes, accessibility, see-also all serve their wrapper ids in the prerendered
   bytes; **zero SSR duplicate ids**.
3. **ToC hrefs resolving — VERIFIED**: every served fragment anchor resolves to a live id
   (0 unresolved).
4. **The guard observed working, not just absent**: the stamper (toc-outline.ts :86-99, LAW #19
   verbatim — "adoption happens ONLY on exact slug match") ADOPTED the wrapper slug for the
   Overview heading (whose title slug equals the wrapper id — the exact twin case) with
   deliberately NO stamp (the h2 stays id-less — measured), while non-matching titles (the
   thin-coupling contract, the eight axes) stamp their own title slugs, which cannot twin. The
   scroll-virtual page is the law's clean exhibit.

## The claims — verified TRUE

1. **Windowing — VERIFIED live**: at count=10,000 the canvas renders **14 row wrappers**
   (window + overscan — the stage's visible window), the spacer authored **400000px**
   (10,000 × 40 estimate, exact); the jump button moves the window to **4993-5012**
   (scrollToIndex 4999 + overscan, scoped to the demo canvas); count 100,000 renders **110
   wrappers** with the spacer at 4e6 px. The rows are KEYED each — `(item.key)` — and the
   rendered `data-index` values are **unique within the list** (my first unscoped scan mixed
   the page's three lists; scoped, uniqueness holds).
2. **Forwarding stamps — VERIFIED on the composed region's root**: the sv-forward specimen's
   scroll-area root carries **data-density="sm"** (the §4 legacy rung), **the dark class**
   (with a real paint consequence: --foreground oklch(1 0 0) inside the island), and
   **--jx-scroll-thumb-radius: 8px** (the radius={8} number lane landing as thumb chrome); the
   spacer and rows carry none of it. The walk-up attribution matters: the stamps land on the
   scroll-area ROOT — the role=region viewport alone shows only the thumb var.
3. **query() — VERIFIED with breakpoint discipline**: the sv-query region stamps **14px below
   48rem / 18px at 48rem+**, rows inherit it exactly (computed row font-size == region at both
   widths), fresh-load pin at 700px → 14px, resize back → 18px.
4. **Region a11y — VERIFIED**: `role="region"` + `tabindex="0"` + the label prop as
   aria-label ("virtual list demo" live; default 'virtual list' in source :125).
5. **Reserved-key precedence — source VERIFIED**: mergedOptions (:154-161) spreads
   `virtualOptions` FIRST, then count/estimateSize/overscan/horizontal/getScrollElement — the
   component's wiring lands last and wins, exactly as the law table states.
6. **Engine-wrapper dialect — VERIFIED**: the wrapper owns no root (the composed ScrollArea
   renders the region — the forwarding walk proves the axis evidence lands on the scroll-area
   root); radius forwards NUMBER-LANE-ONLY (`typeof d.radius === 'number' ? d.radius :
   undefined`, :219 — named steps and auto dropped at the seam, matching the row); motion has
   zero readers (grep receipt re-run clean).

## Findings (severity-tagged)

1. **[MINOR — the served ToC covers 8 of 13 sections, and +page.ts is dead data with a stale
   id]** The served/live toc lists overview, virtual-demo, law, types, usage, api, axes,
   accessibility — the zone, anchors, async, theming and universal-props sections are
   unreachable from it. The shipped `+page.ts` (12 entries) is NOT the serving source (the
   served toc contains `virtual-demo`, which data.toc does not carry; data.toc's `live-demo` id
   does not exist in the DOM — the wrapper is `virtual-demo`): the layout's derived outline is
   what serves, and the toc file is stale dead data. Nothing illegal (all hrefs resolve); the
   cost is navigability on a 991-line page. Fix: either wire data.toc through or re-point the
   derived outline's coverage (and delete/fix the stale entry).
2. **[LOW — pre-existing family typing debt, unchanged files]** svelte-check: 5 family errors
   (`VirtualItem` not generic ×2 at :116/:204 — the @tanstack/svelte-virtual type import vs the
   installed core's generics; `number | undefined` → number at :150; the cx join at :60) + 2
   scene errors. Page: **0 diagnostics**. Fleet 1579/612 (sibling set).
3. **[LOW — the count=100,000 spacer serializes as `4e+06px`]** — scientific notation is valid
   CSS and Chromium applies it (the computed height matched), but it is an odd artifact for
   consumers reading inline styles; a `toFixed(0)` on the totalSize interpolation would keep
   the authored string decimal. Cosmetic robustness, family lane.
4. **[NIT]** The 2xs rung is absent from the DensityDemo-style coverage on this page (the
   a11y story quotes the 24px floor for other families; scroll-virtual's own hit-floor story is
   the scrollbar capsule's, forwarded — no in-page rung ladder exists to verify). Not a claim
   violation: the page claims forwarding, not consumption.
5. **[NONE]** on the dispatched claims; no stale vocabulary found in the family comments (the
   estimateSize default 48 matches source :121 and the api row).

## Gates

| Gate | Result |
|---|---|
| ambient solo + canvas-same-source | **376/376, exit 0** — GREEN **with** vellum's in-flight matrix re-pin in the tree (her scroll-area edit produced no keyed noise this pass; the sheet keys from task 38 are gone — her fixture edit carried them) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 612 files) | **page 0 diagnostics**; family/scene debt pre-existing (unchanged files) |
| Raw SSR + real DOM | h1 ×1; SSR ids clean; post-hydration 48 unique ids, 0 twins; ToC hrefs 100% resolving; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite killed by PID (+ wrapper);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** Siblings' uncommitted files
  (scroll-area, sheet, prototype-grid, the ambient matrix re-pin, agents' experience files)
  untouched — the ambient green includes her fixture edit as served.
- Probe craft: my first windowing scan was unscoped (three lists on one page → false duplicate
  data-index values) and my first stamps read targeted the role=region viewport (the stamps
  live on the scroll-area ROOT one level up) — both caught by impossible values and re-measured
  scoped; the receipts above are the corrected ones.
- Artifacts: /tmp/marginalia-40-probe{1,2}.mjs, /tmp/marginalia-40-ssr.html,
  /tmp/marginalia-40-{specs,scheck,dev}.log.
