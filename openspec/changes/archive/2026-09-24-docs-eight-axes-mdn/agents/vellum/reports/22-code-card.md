# TASK 22 — CODE code-card (vellum, 2026-09-22)

**Tier decision: targeted gaps-only over a canonical page** — the page
was already the campaign's deepest (workbench with live backend/lang/
theme switching, the scroll-law section, the Shiki contract, the engine
matrix, the lang=auto detection section with its own detector
playground, types/usage/a11y/theming/universal-props/api). The archetype
gaps were: Overview, Install, See-Also, a measured per-axis table, and
the cx/call-site diagnostics. NOT a full archetype rewrite: the canon
sections are the page's value and carry no page-table pins requiring
preservation (code-card.spec pins the family CSS law;
variant-grammar/props-table pins do not bind this page's prose).

## Diff (mine: 2 files)

- `code-card.html/+page.svelte`:
  - imports + Install section (`data-doc-install`, `aria-label="install
    code-card"`) + Overview (three paragraphs: the engine seam with the
    six-backend contract and lazy chunk economics; the inline-code
    kinship — shared `HIGHLIGHT_KEY`/types, different stock backends
    shiki-vs-microlighter, never mounted by each other; the SEVEN-lane
    theme-drop story preview) — the archetype gaps.
  - See-Also section (the reading-chain data source renders table +
    more — populated, not an empty shell).
  - the universal-props section gains the MEASURED per-axis table
    (8 rows, findings below) + the deviations paragraph naming the §13
    theme keep and the no-query-seat reasoning.
  - cx predicate + the two `condition && atom` call sites narrowed to
    ternaries (retired 2 fleet errors; the page now carries ZERO
    +page.svelte diagnostics).
- `code-card.html/+page.ts` — toc + Overview entry.

## The measured theme story — the page's deepest row (NEW)

The §6 theme axis is **DROPPED AT THE SOURCE** (code-card.svelte:209
`stampCarriersForLanes({ ...d, theme: undefined })`; :210 broadcasts
eight-minus-theme) — the shiki `theme` literal owns the theme word (the
§13 keep). What answers the dark is ANCESTRY: the family css declares
its own `.dark .jx-code-card` token re-declarations (the readonly tints
+ the tok palette dark formulas) with a `.jx-light` re-flip after them
(the paper-is-white law). MEASURED: wrapping a card in an ancestral
`.dark` flips the ground tint (oklab 0.981 → 0.091) and re-derives
`--tok-token-keyword` to the dark formula (oklch(0.7044 0.1872 …)) while
the card itself carries NO .dark class — the axis prop sits out by
construction. The universal-props summary's "SEVEN lanes" claim and the
new per-axis theme row now document this with the measured receipt.

## Other verified rows (probed, LAW #15 gate: the readonly tint)

- **density: MEASURED INERT — the quietest lane in the fleet.** The
  family reads ZERO density-kernel channels (grep: no
  --jx-text/--jx-hit/--jx-inset/--jx-gap anywhere), the shell is
  px-anchored (12.5px pre, typed --jx-text-label head, fixed paddings),
  a DensityDemo scope moves nothing, and the broadcast reaches no
  components (the card hosts none). The stamped sm rung measured: no
  movement. This is why the page carries no query() seat — a
  responsive lane would re-base nothing; the reasoning is stated in
  the axes deviations paragraph (flagged for the reviewer in the final
  message).
- **size: the §11 echo, nothing follows** — measured `--jx-size-effective:
  18px; font-size: var(--jx-size-effective, 1rem)` on the universal demo
  root; the pre stays 12.5px (the px-anchored contrast case again).
- **shape/radius/color/elevation**: supply-only receipts (zero carrier/
  corner/shadow reads; hue rides the theme sheet + the jx-hue-success
  injection on the copied state).
- **The shiki contrast with inline-code, measured**: the served pre
  carries real token SPANS (68 in the workbench sample) — markup, versus
  inline-code's single-text-node range engine. The Overview names the
  trade (markup for print survival + grammar depth).

## Extra arithmetic — the no-rest-spread check

The hand api table documents 13 props (code required; the family
interface additionally carries the 8 axes NOT in the hand table — the
universal section carries them; `theme` here is the SHIKI literal, §13).
The family Props spreads NO rest, so no synthesized rest row applies to
a hand table anyway — the hand form documents exactly its 13. The meta
(code-card.meta.ts) exists but is not the page's table source (the hand
table is by design; the meta stays for the registry surface). No page
arithmetic sentence needed — the api summary's "Thirteen props; code is
the only required one" is the served truth.

## Gates

- code-card.spec + code-card-backend-highlightjs + print-stylesheet-gate
  solos: **44/44** (the family files untouched by this docs edit —
  before/after equivalent; the after run is the receipt)
- ambient solo: **283/283, exit 0**
- page-scoped svelte-check: **ZERO +page.svelte diagnostics** after the
  predicate + call-site fixes (fleet 1611 → **1609 errors**); the route
  dir still carries 2 pre-existing detector-playground.svelte errors
  (the cx idiom at 42:28 + a `px6` typo at 231:54) — flagged for
  quill's flow, not blocking
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green
- SSR: HTTP 200; h1 = 1; all 12 section ids present, toc order == DOM;
  install + see-also markers present; shiki spans render

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 61268 → vite
  61315; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push. My diff: code-card.html/+page.svelte +
  code-card.html/+page.ts only.
- Probe: inline node scripts (density inertia, size echo, theme-drop +
  ancestry .dark flip, shiki markup census) with LAW #15 gating; SSR
  snapshots /tmp/vellum-22-cc-ssr*.html; logs /tmp/vellum-22-cc-*.log.
- BREAKPOINT DISCIPLINE: the page claims no viewport-rem boundaries in
  its captions (the two rem hits are maxHeight lengths) — nothing to
  falsify; recorded.
