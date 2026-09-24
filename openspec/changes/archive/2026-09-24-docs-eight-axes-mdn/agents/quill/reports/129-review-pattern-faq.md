# T129c — FIRST REVIEW pattern-faq.html (quill)

Owner = marginalia (coded; independence kept). First audit from my own source reads +
probes. Page: `apps/www/src/routes/docs/components/pattern-faq.html/+page.svelte`
(211 lines, +page.ts routed). Family: pattern-faq.svelte (composed over the accordion
family's native details/summary). Fresh build exit 0 at HEAD 2b06c0d5; probes on the
dist via `vite preview`.

## Verdict: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 1 proposed (a compact pattern page: every claim rode composed platform behavior and measured true)

## Verified TRUE with digits (real clicks on the dist)

- **The man-page framing served**: `jixoai-ui-faq(7)` head, the **NAME** row, the
  **SEE ALSO** footer citing the defaults ("jixoai-ui(1), patterns(7)") — all three
  leader lines in the served DOM (my first head-read scoped to `article` and missed the
  head's actual root — probe fault, owned; the SSR payload carries the string twice).
- **Four authored questions as native details/summary** — the platform owns the
  disclosure: no hydration anywhere in the toggle path.
- **The exclusive guard, live**: opening Q3 leaves exactly ONE `details[open]`; opening
  Q1 closes Q3 — one-open-at-a-time measured across two transitions (the accordion's own
  guard passed through).
- **Keyboard, native**: summaries focus and toggle via the platform (Enter on the
  focused summary) — "nothing hydrated" holds.
- **The composition teaching matches the surface**: AccordionItem children (summary
  snippet = question, children = answer), command/section man framing, seeAlso as a
  snippet, the no-interactive-in-summary constraint — each note has its referent.
- **LAW #18**: the page's one `{#each}` is the types grid (6 panels, static data — the
  keyed-each surface trivial). **LAW #19**: zero duplicate ids.
- **T94**: zero pseudo-class pairs. **Mirror law**: pattern-faq.svelte cmp-identical.

## Findings

**LOW-1 — the cx clone class, page seat (:59:28) + family seat (pattern-faq.svelte
:126:28).** The standing joiner class in both lanes; ledger for the sweep.

**NIT-1 — the universal demo pair is numerically coincident.** The seats ship
`size={16}` and `size="medium"` — and medium resolves to 16px, so both roots compute the
same 16px and the demo cannot SHOW the scale difference it teaches ("does the man page
scale? — yes, the framing sizes in em"). The em mechanism is source-true; a `size={20}`
(or any non-16 value) would make the pair visibly distinct. Cosmetic demo-coherence, the
popover/analog of the coincidence class.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t129-scheck.log, grepped) | pattern-faq.html: **1 ERROR** (:59 cx — LOW-1); ui/pattern-faq family: **1 ERROR** (:126 cx — LOW-1's twin), 8 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | pattern-faq.svelte cmp-identical |

## Probe faults owned (mine)

1. The man-head read scoped to `article` — the head lines live outside that element;
   the demo-root text scan is the honest read (the SSR payload carries
   "jixoai-ui-faq(7)" twice — head + the aria/payload lane).
2. My keyboard probe dispatched a synthetic Enter first (which the native summary
   correctly ignored — synthetic events don't toggle) before falling back to the real
   click; the platform-behavior claim needs REAL keys from real focus.
3. The universal "sizes differ" assertion ignored that `medium` IS 16px — the demo pair
   is coincident by value, not broken.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t129-faq.mjs, -ssr.html, batch logs.
