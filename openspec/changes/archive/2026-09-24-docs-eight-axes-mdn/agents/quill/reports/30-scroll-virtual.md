# Task 30 — CODE scroll-virtual (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构)** — the archetype skeleton replaced the
230-line skeleton; the workbench canvas, types, usage, a11y and the 10 API rows
carried; the family itself untouched (engine-wrapper owns no paint surface).
Probe **24/24 GREEN**; every gate green.

## Tier decision + gap analysis

**Tier 2 优化重构 (not tier 1, not tier 3).** The old page (docs-restructure P0,
2026-08-25) already carried a law-grade workbench canvas (100k-row segmented
control, scrollToIndex jump, window-size echo), types/usage/a11y/api — but: no
install/overview/law/axes/see-also sections, no ToC file sync (old ToC listed a
`theming` id that no longer matched any plan and missed overview/api order), a
theming section with two weak token rows, and zero measured per-axis claims.
Tier 1 (review-only) cannot fix missing sections; tier 3 (rewrite from zero)
would discard the only genuinely good part (the workbench). Tier 2 carries the
canvas, adds the archetype layers, and measures the axes.

## What changed

- `apps/www/src/routes/docs/components/scroll-virtual.html/+page.svelte`
  (230 → ~475 lines): hero (CATALOG summary) · **install** (`DocsInstall`) ·
  **overview** (thin-coupling charter: TanStack semantics / our DOM wiring /
  your paint; the engine-wrapper delivery shape named) · workbench canvas
  (carried verbatim in behavior; now under `id="virtual-demo"`) · **law**
  (the thin-coupling contract: spacer / rows / measurement / passthrough /
  escape hatch — 5 postures) · types (vertical/horizontal; variant-retirement
  note) · usage (code, `${close}` dodge kept) · api (10 rows by name + the
  PropsTable universal appendix) · **axes** (all 8 lanes measured as FORWARDED;
  TokenTable of the 6 seams; two canvases: forwarding stamps + the one
  query() case) · accessibility (WAI scrollable-region) · **see-also**
  (`DocsSeeAlso`). Old theming folded into axes (the scrollbar-token law is
  the composed ScrollArea's, not this family's). h1 ×1, universal marker ×1.
- `+page.ts`: ToC rebuilt = overview / live demo / law / types / usage / api /
  axes / accessibility (install + see-also chrome OUT; theming dropped).
- Family files: **zero edits** (grep-level reads only).

## The law story (gap-analysis justified claims)

1. **ENGINE-WRAPPER dialect, measured.** scroll-virtual owns no DOM root: the
   composed ScrollArea renders the region and the resolved lanes forward
   (source receipt: scroll-virtual.svelte:210-223 forwards all eight `d.*`
   lanes). Probe: density/theme/radius stamps land on `.jx-scroll-area`
   (root), NOT on the spacer/rows (all three negative reads clean).
2. **The radius seam (the find of this task).** scroll-virtual forwards
   `radius={typeof d.radius === 'number' ? d.radius : undefined}` — named
   radius steps and 'auto' die at the seam, and a landed number is NOT a §3
   corner stamp: ScrollArea's `radius` is the W3-D2 thumb chrome param
   (`--jx-scroll-thumb-radius`, source receipt "NOT the radius axis").
   Measured: `radius={8}` → root style `--jx-scroll-thumb-radius: 8px`.
   The axis row says exactly this.
3. **Density stamps in the LEGACY RUNG vocabulary.** density="small" →
   `data-density="sm"` on the region root (§4 legacy bridge — today's CSS
   keys on the rungs; densityRungOf passes rungs verbatim). The page text
   carries the measured vocabulary, not the prop vocabulary.
4. **Zero-token wrapper (grep receipt).** The family's only jx- hooks are
   `data-jx-sv-spacer` / `data-jx-sv-row`; zero `--jx-*` readers anywhere in
   ui/scroll-virtual/ — every lane's consumption lives in the composed
   ScrollArea family or the consumer's rows.
5. **window-vs-content arithmetic (the brief's lead).** Spacer block-size =
   count × estimateSize: 399,999.97px at 10k×40, 4,000,000px at 100k×40
   (CSSOM serializes the latter `4e+06px` — probe reads the rect, not the
   attribute). Served rows stay 14 → 20 while content ×10: the window is
   viewport+overscan, content is arithmetic.
6. **scrollToIndex is frame-exact.** scrollToIndex(4999, align start) →
   scrollTop 199,960 = 4999×40 exactly; anchor row rect-top delta 0px; 6
   overscan rows render before it (firstIdx 4993); 20 served.
7. **query() media lanes re-resolve live.** size={query({ md: 18 }, 14)}:
   18px stamp + `font-size: var(--jx-size-effective)` decl on the root at
   1280px, 14px below 48rem; rows inherit both (computed reads).
8. **The retired `use:` is still dead** — the row-measurement mount is the
   `{@attach measureItem(item)}` factory (component source receipt, lane-B
   spike), documented in the law table.

## Measurement story (probe PASS, headless Chromium over dev SSR :5241)

24/24 checks: h1 ×1 · marker ×1 · toc == DOM (8, ordered; install/see-also
shipped, chrome OUT; only other hash anchor is the site skip-link #main) ·
spacer = count×estimate (both magnitudes) · window constant under count ×10 ·
scrollToIndex frame-exact (scrollTop 199,960; anchorDelta 0; overscan −6) ·
forwarding stamps on the composed root only (sm / dark / 8px thumb radius) ·
query() 18px⇄14px live across 48rem with row inheritance · law postures ×5 ·
axes rows ×8 by name · api rows ×10 by name (+ the 8-row universal appendix).
Server killed by PID + wrapper; `lsof :5241` EMPTY before AND after.

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both scroll-virtual.html files (app baseline 1585 pre-existing errors in untouched files; three caught pre-gate in my page: state_referenced_locally capture, two `possibly undefined` reads through `getVirtualizer?.()`) |
| docs-ambient-vocabulary solo | **284/284** |
| scroll-area-family solo | **19/19** (includes the zero-retired-API source scan) |
| scroll-area-kit solo | **26/26** |

Matrix re-pin: not owed — scroll-virtual is outside the ambient matrix
universe and no PropsTable row moved (meta 17 props vs api table's 10
component rows: the 8 axes are the appendix table, `rest` does not exist on
this component, `virtualOptions`/`label`/`onscroll` are explicit rows).

## Sibling discipline

Zero touches outside my two files. Working tree also carries
`prototype-flex.html` (+page.svelte/+page.ts) modifications that are NOT mine
and were left alone; scribe's review report is present, untracked, untouched.

## Open questions

1. **Archetype-wide duplicate id on see-also** (minor, convention question):
   `<div id="see-also"><DocsSeeAlso/></div>` yields a second id on
   DocsSeeAlso's own `<h2 id="see-also">` — reference.html (landed) has the
   identical pattern, so I kept the convention and the probe asserts
   presence (count 2). If the coordinator wants single-id hygiene, the fix
   is one line per page (drop the wrapper id) and belongs in a batch pass,
   not this task.
2. **radius named steps die silently at the forward seam** — deliberate in
   source (the ternary) but undiscoverable for consumers: the meta lists
   `radius` with the full lane type. Worth a meta annotation or a dev-gated
   warn ("named radius lanes are dropped at the ScrollArea seam — pass a px
   number for the thumb, or compose radius on the region yourself"). Filed
   here as an observation; no code changed.
3. The old theming section's `--jx-scrollbar-thin` TokenTable rows are gone;
   that law now lives on the scroll-area page where it belongs (the wrapper
   reads no tokens — grep receipt). Flag if you want a pointer row back.
