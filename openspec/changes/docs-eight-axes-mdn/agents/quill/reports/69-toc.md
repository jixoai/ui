# TASK 69 — CODE toc.html (quill, 2026-09-22)

**Tier 2 (archetype rebuild over a content-rich stub).** The 253-line stub
already carried the fleet's best self-reference exhibit (the workbench
dual-rail: the page's aside rail is the COMPONENT in manual mode, and an
in-canvas rail ran AUTO outline mode over the workbench article) — but it had
no install/overview/base/see-also, no ToC policy file at all, an unmeasured
universal section, and — the real find — its AUTO exhibit was structurally
INERT (below). Two files changed, both page-level: `+page.svelte` (253 → full
archetype) + `+page.ts` (NEW — the opt-out document). NO commits, zero family
edits.

## The self-reference spine (the dispatch's demand, delivered)

Every toc claim on the page now NAMES ITS CHANNEL, and the channels are
separated structurally, not just rhetorically:

- **PAGE-toc channel**: `+page.ts` `load` data (`TocSection[]` — the interface
  this very family exports) that the ROOT LAYOUT renders as the scaffold rail.
  This route **deliberately exports no load** (+page.ts is the opt-out
  document, stating the decision and the three states: array = explicit
  rail, `'outline'` = self-derive, absent = rail-less). The channel's data
  shape is exhibited in the page body as a sample.
- **COMPONENT channel**: the family itself. The aside rail on the page IS
  `Toc` in manual mode (measured: nav aria-label "Table of contents", title
  "on this page", the composed tree rendering twice by design — desktop spine
  + mobile viewport = 18 links for 9 authored). No claim about "the rail"
  rides the page channel; no claim about the layout rides the component.

## The real find — the AUTO exhibit was dead, and the law is why

**The stub's AUTO-mode demo could never work as placed.** The component
canvas stamps `data-toc-skip` on its root (component-canvas.svelte:579, the
outline law: demo headings must never leak into page outlines), and
`deriveTocOutline` skips any heading inside that scope. Measured before/after
on the served page: with the workbench article inside the canvas, the outline
lib derived **0** entries, the AUTO rail rendered its empty shell forever
(samples 0/0/0 across 4.5s), and the article headings never acquired ids.
With the workbench moved OUT of the canvas (plain page markup — my fix), the
same rail derives **5** entries at mount and renders **10 links** (5 headings
× the two surfaces). The lib, the canvas law, and the engine are each
correct; the PLACEMENT was the defect. The page now teaches it as the
placement law ("an outline root cannot live inside a component canvas") in
the overview, the types section, and the workbench's own receipt note.

## What changed (page-level)

1. **Archetype rebuild**: hero → `#install` → `#overview` (the channel spine,
   IoM weights + line pick, modes + axes + the placement law) →
   `#live-demo` (the dual-rail workbench, now a plain SectionCard — placement
   law) → `#toc-base` (W3C foundation) → `#types` → `#usage` → `#theming` →
   `#api` → `#universal-props` (measured axes table + receipts + query() seat
   + specimens) → `#accessibility` → `#see-also`. ToC policy: the +page.ts
   opt-out document (see the spine).
2. **Measured axes table ×8** (all no-own confirmed; rows below).
3. **query() seat**: `query({ md: 18 }, 13)` on the size lane (the rail voice
   scales; the spy behavior is unchanged).
4. **EXTRA-lane by name**: the Toc root is ATTRIBUTE-TRANSPARENT (rest spread
   = HTMLAttributes minus color onto the rail root — id/data-*/aria-*/
   handlers); TocList spreads onto the ul; TocLink is a plain anchor with
   your href. The outline config ({ root, levels? }) and scrollRoot are
   named rows.
5. **LAW #19 exhibit**: the wrapper-twin guard, slug stamping, duplicate -2
   suffix, data-toc-skip, CJK positional fallback, two-tier collapse,
   idempotency, and extents were all exercised in-browser against a fixture
   (below) — this page is the outline path's exhibit hall, as the dispatch
   hoped.

## Measurements (probe receipts, served DOM at :5241 — 21/21 family + 5/5 chrome)

- **Channels**: 9 component rails on the served page (every demo specimen is
  a Toc root — titled census: "on this page" ×2, "auto mode", "density
  sample" ×4, "axes", "named steps"); the layout rail is absent (the opt-out).
- **Scrollspy** (the manual aside rail, driven via the .jx-shell-body
  scroller): weights paint per link as `--w` (computed 0.000 → 0.499 → 1.000
  across the tracked links — non-uniform, IoM), the pick's `aria-current`
  follows (#types at the types scroll, #accessibility deeper), the spine
  fill `--jx-progress` reads 0.30-0.47 live.
- **AUTO derive + stamp**: after the placement fix — 5 headings stamped
  at runtime (`what-it-tracks`, `iom-weights`, `the-line-pick`,
  `two-modes-one-family`, `the-engine`), 10 derived links rendered (×2
  surfaces), stable across time samples [10, 10, 10].
- **LAW #19 lib battery (in-browser against a fixture)**: slug mint + stamp
  (id-less h2 → `#alpha-section` on the element); wrapper-twin guard (a
  wrapper whose id equals the minted slug is ADOPTED — the heading is NOT
  stamped); duplicate slug → `-2`; `data-toc-skip` removes a heading; CJK
  falls back positionally (`section-4`); two-tier collapse (h3s into the
  preceding h2's children); idempotent re-derivation (same ids on rerun);
  extents end at the next same-or-higher heading (an h2 runs past h3s).
- **Mobile**: below 900px the rail collapses to the glass single-row bar
  (`data-jx-effect="blur"`, 44px, disclosure toggle aria-expanded="false");
  the desktop spine hides.
- **Axes**: explicit-density specimens stamp `data-density`; the size
  specimen echoes 18px on the root; radius 0; zero carrier readers (grep).
- **Theme L1**: the aside rail's title ink re-derives under the page bridge
  (oklch(0.3211 0 0) → oklch(0.8452 0 0)) — the rail is page-level chrome
  here, outside any island; the strata L2/L3 receipts carry over from the
  sibling lanes (terminal-footer/textarea, filed).

## Family observations (receipted, not chased — zero family edits)

1. The AUTO rail's `$effect` returns early when the outline root is missing
   at mount and never re-arms (no retry, no observer on the root's
   existence). Inside a canvas that is invisible (data-toc-skip zeroes it
   anyway); for late-mounting roots it would dead-end the same way. A
   root-readiness retry is a family-lane candidate (INFO).
2. `getComputedStyle(link).getPropertyValue('--w')` reads the weight because
   the engine writes it on the enclosing li (inheritance) — probe note; the
   engine's contract (write the li, paint the link) is intact.
3. The framework-free claim verified: `toc-outline.ts` has zero listeners/
   observers (DOM in, plain data out — the MutationObserver lives in
   toc.svelte, the scroll listener in the engine wiring, both component-side
   by contract).

## Gates (repo root unless noted)

| Gate | Result |
|---|---|
| verify:tailwindless | GREEN — receipt VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check page-scoped | **0 diagnostics on toc.html/+page.svelte and +page.ts**; family standing debt unchanged and untouched (12: toc.svelte :164 8× `state_referenced_locally` warns + toc-link :26/:28 cx-typing ×4) |
| docs-ambient-vocabulary solo (apps/www) | 284/284, exit 0 |
| Probe battery | chrome 5/5 + family 21/21 (plus the stability rerun) |
| Mirror law | `cmp` byte-identical registry/files/ui/toc/ ⇄ apps/www/src/lib/ui/toc/ (7/7 files — zero family edits) |
| SSR | page 200; h1 ×1; universal marker ×1; all 40 rail links resolve; dup ids 0; zero dangling hashes |

## Process evidence

- Port **5241**: `lsof` EMPTY before; dev server started for the session
  (vite PID 27396); after gates killed by PID; **port 5241 EMPTY after**.
- **NO commits, NO pushes.** Zero product-tree edits; family + registry
  mirrors byte-identical to HEAD.
- Sibling noise receipted, not chased: vellum's transfer.html, scribe's toast,
  marginalia's tags-input in flight.
- Probe honesty: five instrument iterations are receipted in the probe file —
  the naive expectations that failed were mine (8 vs 2 rails: every specimen
  is a Toc; 10 vs 22 links: the tree renders twice by design; --w written on
  the li, inherited by the link; the pick after a boundary scrollIntoView
  resolves by the line rule, not by the target; extents end at
  same-or-HIGHER level). The data-toc-skip discovery came FROM one of those
  failures.
- Artifacts: /tmp/toc-probe.mjs, /tmp/toc-chrome.mjs, /tmp/scroller-diag.mjs,
  /tmp/tf-ancestor.mjs (reused walk), /tmp/toc-dev.log,
  /tmp/svelte-check-toc.txt.

## Open questions for the reviewers

1. The dead-derive early return (family observation 1) is the one candidate
   family fix from this lane — a root-readiness retry (or a documented
   requirement that the outline root exist at mount). Owner's call.
2. The channel-spine teaching (page-toc vs component) is written for THIS
   page; if the fleet likes the two-column channel naming, the +page.ts
   header comment pattern (the opt-out document) could become the standard
   for any route that demos its own navigation chrome.
3. The toc workbench article's headings now carry runtime-stamped ids on the
   docs page — visible in devtools as `id="what-it-tracks"` etc. That is the
   stamper working as designed (fragment anchors need real ids); noted so
   nobody "fixes" the ids away.
