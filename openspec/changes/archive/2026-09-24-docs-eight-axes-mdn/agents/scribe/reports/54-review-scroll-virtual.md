# TASK 54 — SECOND REVIEW scroll-virtual (scribe, 2026-09-24)

- **Reviewer**: scribe (2nd of 2; independence law held — quill's report 30 and
  marginalia's report 40 were opened only AFTER the findings below were fixed by my own
  source reads + live probes; the concordance section follows at the end)
- **Target**: quill's page — `apps/www/src/routes/docs/components/scroll-virtual.html/`
  (+page.svelte 419 lines + +page.ts) over the engine-wrapper family
  `apps/www/src/lib/ui/scroll-virtual/scroll-virtual.svelte` (composing the scroll-area).
  Zero drift on scroll-virtual paths; the tree's in-flight sibling set (vellum's spin.html,
  quill's review stream, marginalia's prototype-flex) untouched, none of it in my probe paths.
- **Method**: source reads (page, family svelte, +page.ts), headless Chromium over dev SSR
  :5243 with warm-reload discipline, scoped selectors anchored on `.jx-play-seg` /
  `.jx-scroll-area` / `data-probe`, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW (record correction, no code owed) + the two
  carried LOWs confirmed. Every dispatched claim verified TRUE with digit-exact receipts;
  the page closes.

## The baseline receipt — re-verified my own way (one line)

Served toc == data.toc still holds in my run: the SSR payload (947,074 bytes — the 947KB
baseline) carries exactly the 8 data.toc ids (`overview, virtual-demo, law, types, usage,
api, axes, accessibility`) ×2 rail surfaces (16 anchor hrefs), every id live in the DOM,
the site skip-link `#main` the only extra anchor — matching
`+page.ts` (`toc`, 8 entries, `virtual-demo` included) entry-for-entry. No page change made.

## The claims — verified TRUE (my own instruments)

1. **Windowing — VERIFIED digit-exact.** count=10,000: **14 row wrappers** (data-index
   0-13), spacer authored **exactly 400000px** (10,000 × 40 estimate). Jump-4999
   (scrollToIndex align start): window **4993-5012** — exact — serving **20 wrappers** at
   the deep position (window + overscan after the measured-seam reflow). count=100,000
   (via the PlaySegmented): spacer raw style **`block-size: 4e+06px; inline-size: 100%`**
   — the CSSOM exponential serialization of exactly 4,000,000px — while the DOM window
   stays **14 at rest / 20 post-jump** (see the record correction below). The demo stage
   caps the scroller at 288px ⇒ 8 visible + 6 overscan = 14, count-independent: the window
   is viewport+overscan, content is arithmetic — and the page's own PlayFields output
   cross-agrees ("count 100,000 / dom window 14 rows").
2. **Forwarding stamps — VERIFIED on the composed root ONLY.** The sv-forward specimen's
   `.jx-scroll-area` root carries `data-density="sm"`, the `dark` class, and style
   `--jx-radius-effective: 8px; --jx-density-coefficient: 1; --jx-scroll-thumb-radius: 8px`
   — the 8px thumb chrome landing from the radius NUMBER lane. The inner
   `.jx-scroll-viewport` (role=region) carries an empty style attribute and neither stamp;
   spacer and rows carry neither (all negative reads clean). Engine-wrapper topology
   confirmed live: lanes forward to the composed ScrollArea's root, nothing lands on the
   TanStack internals.
3. **The radius seam — VERIFIED in source.** scroll-virtual.svelte :219 forwards
   `radius={typeof d.radius === 'number' ? d.radius : undefined}` — named steps and 'auto'
   die at the seam; the landed number is the W3-D2 thumb chrome param
   (`--jx-scroll-thumb-radius`, measured 8px), NOT a §3 corner stamp. The page's radius row
   says exactly this (:145 "FORWARDED AS THUMB CHROME, NUMBER LANE ONLY").
4. **query() — VERIFIED both directions, live.** sv-query (`query({ md: 18 }, 14)`):
   fresh load @600w → region font-size **14px** with `--jx-size-effective: 14px`; live
   resize →1280 → **18px**/18px stamp; live resize →600 → **14px**/14px back. The 48rem
   boundary flips in both directions with the stamp tracking the computed value.
5. **Region a11y — VERIFIED.** `role="region"` + `tabindex="0"` + the label prop as
   aria-label (read live on the sv-forward instance: "forwarding stamps" — the prop
   mechanism verified on a second instance beyond the main demo's "virtual list demo").
6. **Reserved-key precedence — VERIFIED in source.** mergedOptions (:154-161) spreads
   `...virtualOptions` FIRST, then count / estimateSize / overscan / horizontal /
   getScrollElement land LAST and win — the component's wiring always beats the
   passthrough, exactly as the law table states.
7. **LAW #18 — CLEAN.** The page carries **zero `{#each}` blocks** (grep — every law/api/
   axes row is hand-written); the family's single each keys on `(item.key)` (:232, unique
   by TanStack's virtualizer contract). Zero console errors/warnings across every probe
   session, including two count switches and two jumps — no `each_key_duplicate`, no
   mounted-children abort.
8. **LAW #19 — CLEAN, one line.** Post-hydration id scan: **48 ids, zero duplicates**.

## Findings (severity-tagged)

1. **[LOW — RECORD CORRECTION, no code owed]** The 1st review's receipt "count 100,000
   renders **110 wrappers** with the spacer at 4e6 px" did not reproduce under my
   instrument: at count=100k the DOM window is **14 wrappers at rest (indices 0-13) / 20
   post-jump (4993-5012)**, and the page's own "dom window" readout prints **14 rows**.
   The author's original claim (quill: "served rows stay 14 → 20 while content ×10") is
   the correct one; 110 is a probe artifact (most plausibly an unscoped or pre-hydration
   census — her own craft note flags an earlier unscoped scan on this page). The behavior
   under test is correct; only the ledger number needs superseding.
2. **[LOW — carried, unchanged files]** Family typing debt confirmed: **5 svelte-check
   errors in scroll-virtual.svelte** (`VirtualItem` not generic ×2 at :116/:204, overload
   :60, `number | undefined` :150, VirtualizerOptions :154) — pre-existing, untouched by
   this change. Page: **0 diagnostics**.
3. **[LOW — carried, cosmetic, family lane]** The 4e+06px serialization observed live in
   my own probe (`block-size: 4e+06px`) — valid CSS, Chromium applies it; page-side
   nothing owed (matches the dispatched disposition). My own instrument tripped on it
   twice before I read the raw string — see experience note.
4. **[NIT — concurred, no action]** No in-page 2xs rung ladder: the page claims
   forwarding, not consumption; nothing to measure a hit floor on.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, exit 0** (vitest close-timeout warning is the known benign hang; zero keyed noise from vellum's spin.html — not in this suite's candidates) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 606 files) | **page 0 diagnostics**; the 5 family errors are the carried LOW (unchanged files); fleet 1567/1028 is the in-flight sibling set + ambient debt, attributed not chased |
| Raw SSR | 947,074 bytes; toc 8 == +page.ts == DOM; h1 ×1; universal marker ×1; zero undefined/null literals; 48 ids 0 twins |

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 75325 + wrapper 75294**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** Siblings' in-flight files untouched.
- Independence: quill 30 / marginalia 40 opened only after the findings above were fixed;
  concordance follows.
- Instruments: the count switch is a **PlaySegmented** (`.jx-play-seg` role=group of
  class-less buttons) — `selectOption` cannot drive it; stamps anchor on `.jx-scroll-area`
  (the composed root), not the role=region (the viewport one level down); CSS lengths from
  inline styles must be read as raw strings — `parseInt` stops at the `e` of `4e+06px`.
- Artifacts: /tmp/scribe-54-probe1b.mjs, probe1c, probe1d, probe1e, probe1f,
  /tmp/scribe-54-ssr.html, /tmp/scribe-54-{ambient,universal,scheck}.log.

---

## Concordance addendum (appended after reading quill 30 + marginalia 40)

My findings above were fixed before this section.

- **FULL CONCORDANCE with marginalia 40 on every measured law**: the 14-wrapper /
  400000px @10k window, the 4993-5012 jump window, stamps on the scroll-area ROOT with
  viewport/spacer/rows clean (her walk-up attribution — my holder-vs-viewport dump is the
  same lesson), query 14⇄18 live with stamp tracking, role/tabindex/label, reserved keys
  landing last (:154-161), radius number-lane-only seam (:219), 5 family errors at the
  same lines, page 0 diagnostics, **48 ids zero duplicates** (exact match), and the
  4e+06px serialization.
- **THE ONE DIVERGENCE — her "110 wrappers @100k"**: not reproducible; my census + the
  page's own readout + quill's original 14→20 all agree the window stays viewport-bound
  (14 at rest / 20 post-jump). Filed as my LOW record correction; nothing on the page
  moves. This is the second unscoped-instrument artifact on this page per her own craft
  note — the corrected numbers should stand as the record.
- **quill 30 reconciliations**: her 24/24 probe numbers all reproduce (spacer
  magnitudes, frame-exact jump, stamps, query, rows by name); her OQ1 (see-also wrapper
  id twinning the DocsSeeAlso h2) is resolved in the current tree — my LAW #19 scan reads
  48 ids ZERO duplicates post-guard; her OQ2 (named radius lanes die silently at the
  seam) remains a fair meta-annotation observation, out of scope for a docs page verdict.
- **Additions (mine, not in either report)**: the page-side zero-`{#each}` receipt (LAW
  #18 is structural on this page, not just probe-clean); the PlayFields self-readout as a
  cross-check instrument ("dom window: 14 rows"); the PlaySegmented locator lesson; and
  the parseInt-vs-exponent-serialization trap (twice-bitten, banked in experience).
