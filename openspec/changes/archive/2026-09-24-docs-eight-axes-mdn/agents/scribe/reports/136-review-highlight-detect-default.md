# TASK 136 — highlight-detect-default (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 1 CONFIRMED.**
Owner = marginalia; quill's 1st (T124c, PASS 0M/0m/1L/1N, Tier 1) consolidated. Dist =
**ef520d44** (fresh build rc=0). Port 5243 mine; killed after probes, lsof post rc=1,
siblings untouched.

## The landed items — verified closed

- **No-rail AFFIRMED** — structurally true: no +page.ts exists, and the page's pointer
  posture (hero deferral + the usage deferral link) is unchanged.
- **The children-row axis description (NIT-1)** — LANDED verbatim: the api table's
  children row now teaches "The eight axes arrive through context (HighlightContext) —
  the wrapper stamps nothing itself; the universal fold below serves the axis rows" —
  her "fold them (or one line)" remedy landed as BOTH (the one-liner AND the fold).
- **The cx clone (LOW-1)** — CLOSED: page 0 errors; family **0 errors, 9 standing
  warnings** (the cosmetic class).

## Her receipts — re-derived on my instruments

- **The hydration receipt, byte-precise this pass**: the SSR payload ships **five `<pre>`
  blocks, every one ZERO spans** (prerendered output stays plain by law — tighter than
  her ≤3 slice); after hydration the wrapped card's pre computes **13 highlight spans**
  (her exact count), while the sibling explicit-`lang=ts` card carries its own 9 via its
  own path — context spreads downward only, both halves reproduced.
- **The wrapper adds no element**: the pair container's direct children are exactly
  `[FIGURE, FIGURE]` — no intermediate node, `{@render children()}` verbatim.
- **The deferral link** to `/docs/components/code-card.html#code-card-auto` renders ✓ —
  the pointer page routes its deep story as declared.

## The fresh axis — the no-root dialect's other half

Her probe measured the wrapped CodeCard; the universal seat's InlineCode supply (the
no-root dialect applied to a NON-card component) was taught but not re-measured. Verified
this pass at the source+seat layer: the universal seat wraps `InlineCode` at `size={18}`
and the wrapped component stamps its OWN root — the wrapper contributes no element and
the size arrives through context. The detection default (HIGHLIGHT_DETECT_KEY) remains
family state, untouched by the axes — the summary's claim holds for both dialect halves
now (card and inline), closing the last uncovered branch of the no-root teaching.

## Standard battery

- **LAW #19: 32 ids, zero duplicates**; LAW #18: zero each; T94 clean.
- Gates: verify:docs **rc=0** · ONE saved svelte-check (page 0, family 0/9 standing).
- Probe-fault ownership: my first SSR span count sliced ±400/2500 bytes around "main.ts"
  and caught adjacent chrome (7 spans) — the per-`<pre>` parse is the receipt (all five
  pres span-free); my api-row probe needle missed the landed wording (the row says
  "arrive through context", my needle said "ride the no-root context supply") — the
  source grep is the receipt.
- Artifacts: /tmp/g136-{card,hdd}.mjs + /tmp/g136-{build,docs,scheck,preview}.log.

## Open questions

None new. Tier 1 confirmed — the pointer page is wiring-only, its one contract
(hydration-time detection, downward-only) is byte-verified, and the api row now teaches
the axis supply it actually performs.
