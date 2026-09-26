# T124a — FIRST REVIEW card.html (quill)

Owner = marginalia (coded; independence kept — no discussion before filing). LEGACY-CLASS
first audit from my own source reads + probes. Page:
`apps/www/src/routes/docs/components/card.html/+page.svelte` (489 lines, **no +page.ts**).
Family read: card.svelte (300) / card-body / card-header / card-footer + card.css +
card.stylex.ts + defaults. Fresh build exit 0 at HEAD **79d7adde** (== the floor); probes
served from the dist via `vite preview`.

## Verdict: PASS — 0 MAJOR / 1 MINOR / 2 LOW / 1 NIT — Tier 2 proposed

## THE RAIL DECISION: PROPOSE THE RAIL — 8 entries

The page is the campaign's largest no-rail surface: **8 id'd teachable sections**
(usage · foot-flexibility · grid-composition · types · accessibility · theming ·
universal-props · api) plus an un-idd live playground. The no-rail posture is NOT
affirmed: this is a full archetype-sized page (install + usage + examples-class sections
+ the trio) that predates the rail convention — propose the rail entries exactly in DOM
order at consolidation: `usage → foot-flexibility → grid-composition → types →
accessibility → theming → universal-props → api`.

## Verified TRUE with digits (all probed on the dist)

- **The stamped presence**: the host carries `data-jx-card` with `data-sep-head` +
  `data-sep-foot` stamped per live zone.
- **Absent zones never render**: toggling the playground's **foot zone** switch removes
  `data-sep-foot` AND the cluster unrenders (Cancel/Save gone, `[data-jx-card-foot]`
  count 0); toggling back restores both. The stamp is the truth, verbatim.
- **The scroll law (the body-only scroll ring)**: `data-jx-scroll="off"` on the body cell
  ⇔ `overflow-y: visible`; the authority ON removes the attribute ⇔ `overflow-y: auto`.
  The gutter pads a stable **14px both edges in BOTH states** — the probed scrollbar
  width is 0 on this engine (overlay), and the compensation formula is the documented
  max(0.875rem − probed, 0): stable-by-design, no visual off-centering. (My first read
  expected the pad to DIFFER between states — the design's "stable both-edges" is the
  honest behavior; probe fault owned.)
- **The inline ruler, verbatim**: computed `grid-template-columns` resolves **FIVE named
  tracks** — `[card-inline-start] 14px · [card-content-start] auto · [card-fill]
  minmax(10px,1fr) · [card-content-end] auto · [card-inline-end] 14px` — the TokenTable's
  ruler row measured on the served card.
- **The §3 concentric anchor, digit-exact**: the radius-20 card stamps
  `--jx-radius-effective` and its `radius="auto"` PressButton computes **6px = max(0,
  20 − 14)**; the explicit-4 child stays **4px** (explicit wins over the anchor math);
  `radius="large"` resolves **var(--jx-radius-large)** with zero inline values; the
  **bare auto button with no supplying ancestor computes 0px** (the root invariants); the
  squircle seat's resolved corner runs the §14 factor (the child's computed corner ≥ the
  stamped effective — the doubling live).
- **CardGrid foot mode**: the three cards' feet land on **ONE bottom line** (per-card
  footer bottoms identical to the pixel) — the shared 1fr band row, live.
- **CardFooter seats the ButtonGroup name** ("cart actions" / "card actions" served).
- **The reveal-CB census**: zero open fixed-position demo content under data-reveal (the
  W-next #19 hazard structurally absent).
- **LAW #19**: zero duplicate ids. **LAW #18**: zero `{#each}` on page and component.
- **T94**: zero :checked/:indeterminate pairs in the family sheets.
- **Mirror law**: card.svelte / card.css / card.stylex.ts registry ⇄ www cmp-identical.

## Findings

**MINOR-1 — the page's snippet-typing errors ×3 (:245, :307, :308).** The top-level
`{#snippet xGlyph()}` / `{#snippet actionSeat()}` blocks are passed as variables
(`actions={showActions ? actionSeat : undefined}`); svelte-check types the reference as
`() => ReturnType<Snippet>` and rejects the `Snippet<[]>` prop (three seats). Runtime is
unaffected (the toggles drive the seats live — verified above). Fix shape: the standard
snippet-typing accommodation (type the const as `Snippet` or inline the conditional
snippets). Class: the same page-authoring debt her input review closed (five family type
errors, 104).

**LOW-1 — TokenTable `source: 'law'` is out of vocabulary (×2, :442).** The theming
rows cite their source as `'law'`; the TokenTable's type admits only
`density | color | component | structural`. The rendered cell presumably shows the
string; the type rejects the authoring. One-word fix (pick a sanctioned source or widen
the union) ×2 rows.

**LOW-2 — the cx clone class, card page + family (5 seats).** Page :221:28 + family
card-body :62, card-header :68, card.svelte :94 — the standing Object.entries-undefined
class in SIXTH-family concentration (the fleet sweep hasn't reached card). Also the
page's :442 rows carry it transitively. Ledger for the consolidation sweep.

**NIT-1 — card.svelte :260:18 "Cannot invoke an object which is possibly 'undefined'"** —
the `{@render foot()}` behind `{#if foot}`: snippet NARROWING typing (the guard doesn't
narrow across the compiled shape), NOT the tour-:456 latent-bug shape — the render is
guarded at runtime. Recorded so the tour precedent isn't assumed to recur here.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t124-scheck.log, grepped) | card.html: **6 ERRORs** (MINOR-1 ×3 + LOW-2 :221 + LOW-1 ×2) — the page-scoped-to-0 instrument FAILS on this page; family ui/card: **4 ERRORs** (LOW-2 ×3 + NIT-1), 8 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | 3/3 cmp-identical |

## Probe faults owned (mine)

1. **The playground toggles live behind accessible names** (PlayToggle bridges the row
   label via `aria-labelledby`) — my first two finders (attribute scan, row-text scan)
   never clicked them; `getByRole('switch', { name })` is the instrument.
2. **The scroll gutter**: I expected the padding to DIFFER between states; the design is
   stable-both-edges (the probed overlay width is 0) — my assertion was wrong, the
   family's honest behavior confirmed.
3. **The ruler count**: computed `grid-template-columns` interleaves track NAMES and
   sizes (10 tokens = 5 tracks) — my naive token count called five tracks ten.
4. **The executable-path one-liner**: a self-replacing template literal produced a
   garbage launch path — the standard literal is the instrument.

## Process

Port **5241** (preview/district seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → `lsof -ti :5241` **0 lines, EMPTY**, zero orphans. NO commits, NO
product-tree edits. Artifacts: /tmp/t124-card.mjs, card2, card3, scroll, -ssr.html,
-build/-prev/-scheck/-docs/-universal logs.
