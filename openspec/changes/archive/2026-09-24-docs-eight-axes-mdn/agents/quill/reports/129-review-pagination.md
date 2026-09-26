# T129b — FIRST REVIEW pagination.html (quill)

Owner = marginalia (coded; independence kept). First audit from my own source reads +
probes. Page: `apps/www/src/routes/docs/components/pagination.html/+page.svelte`
(304 lines, +page.ts routed, authored toc 8). Family: the seven-part composition
(pagination/content/item/link/previous/next/ellipsis) + the pure pageRange helper.
Fresh build exit 0 at HEAD 2b06c0d5; probes on the dist via `vite preview`.

## Verdict: NEEDS-WORK — 0 MAJOR / 1 MINOR / 2 LOW / 1 NIT — Tier 2 proposed

The composition claims all measure true (the window math is lawful at every pose, the
edges are honest disabled spans, aria-current follows real state, ellipses stay out of
the reading order) — the NEEDS-WORK driver is one LAW #19 violation plus the family's
typing lane, both bounded and mechanical.

## Verified TRUE with digits (real drives on the dist)

- **The window, as evidence — LAWFUL at every pose**: the served grid reads
  page 1 → `1 2 … 30` · page 5 → `1 … 4 5 6 … 30` · page 12 → `1 … 11 12 13 … 30` ·
  page 30 → `1 … 29 30` · page 2/4 → `1 2 3 4` (no ellipsis when nothing collapsed).
  Sticky edges ✓, ±1 siblings around current ✓, tokens only when something was actually
  collapsed ✓ — my first assertion strings assumed a wider sibling window and
  false-failed the grid; the structure laws are the claim, and they hold.
- **Honest edges at the bounds (REAL state drives)**: driving the playground range to
  page 1 moves `aria-current="page"` to 1 and renders Previous as a **SPAN with
  aria-disabled="true" and NO href** ("‹ prev"); page 30 does the same to Next
  ("next ›") — "a link that goes nowhere is a lie to every input mode", measured.
- **Real links, real routes**: the numbered links carry self-route hrefs
  (`?page=N`); the nav landmark is `aria-label="Pagination"`; the live window slides
  with the playground range.
- **Ellipsis decoration**: the collapsed-range node is `aria-hidden="true"` — out of the
  reading order as the PlayHelp teaches.
- **The density + press token rows served** (--jx-hit/--jx-inset/--jx-text/--jx-line +
  --jx-press-shadow-hover/active).
- **T94**: zero pseudo-class pairs in the family. **Mirrors**: all 8 family files
  cmp-identical.

## Findings

**MINOR-1 — LAW #19 violated: duplicate `id="usage"` ×2 (:230 and :264).** The page
carries TWO `usage` sections — the composition-law "Render a page window" section
(:230, eyebrow usage) and the demo-standard "Usage" section (:264, family="usage").
The authored toc lists `usage` ONCE (resolving to the first); native resolution masks
the second. Every other id clean. Fix shape: fold the two Usage sections into one (both
render the same `usage` CodeBlock — the page shows the identical code block twice) or
re-id one. This is exactly the duplicate-id class the campaign has killed twice
(icon-button's live duplicate, T125).

**LOW-1 — the family is the campaign's deepest cx-clone concentration: 7 seats.**
pagination.svelte :111, content :30, link :61, previous :46, next :45, ellipsis :31 —
every part file carries the Object.entries-undefined joiner clone, plus the page's own
:94. The sweep list should treat the whole family as one closure unit.

**LOW-2 — the family's `$props`-before-declaration trio.** link :49, previous :34,
next :33 each carry "Block-scoped variable '$props' used before its declaration" plus
implicit-any fallouts (link :42/:43/:47/:72, previous/next same shape) — the part files
reference the props binding ahead of its declaration line. Typing-lane debt (the owner's
composition-first files, untouched by me); belongs on the same sweep unit as LOW-1.

**NIT-1 — the toc's `pagination-demo` label is the only lowercase-kebab rail label in
the trio's style** ("live demo" reads lowercase on the rail while the rest are
Title-cased). Cosmetic; note for the rail-polish pass.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t129-scheck.log, grepped) | pagination.html: **1 ERROR** (:94 cx — the page seat of LOW-1); ui/pagination family: **19 ERRORs** (LOW-1 ×6 + LOW-2's trio lanes), 8 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | all 8 family files cmp-identical |

## Probe faults owned (mine)

1. **The rail census polluted itself**: the demo's own `nav` (aria-label Pagination)
   sits inside my `nav a, aside a` sweep — its `#usage` DensityDemo link and `#` edge
   hrefs masqueraded as rail entries. The toc rail must be scoped to the scaffold's
   aside; the AUTHORED toc (8 entries) is clean.
2. **My expected window strings were guesses** — the served grid is the pageRange truth;
   the structural laws (sticky edges / ±1 siblings / tokens-only-when-collapsed) are the
   assertion shape.
3. **Edge reads raced the state twice**: the ‹/› glyph finder matched ancestors, and one
   read ran before the slider's state applied — the aria-current-guarded read (wait until
   `aria-current` == the driven value) is the honest instrument.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t129-pag.mjs, pag2, pag3, -ssr.html, batch logs.
