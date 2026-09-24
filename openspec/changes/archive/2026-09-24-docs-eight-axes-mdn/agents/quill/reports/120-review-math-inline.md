# T120a — SECOND REVIEW math-inline.html (quill)

**1st:** marginalia 111, PASS 0M/0m/1L/1N, Tier 2 proposed (consolidated 97f5b6cc).
Owner = scribe. **2nd protocol:** her report opened FIRST; landed items verified at
DOM + source layers; headline receipts re-derived with my own instruments; fresh axis =
the macros passthrough driven live (and the NIT's mechanism receipt completed through the
governing scope). Fresh build exit 0 at HEAD **33b28d8d** (== the dispatch floor);
**probes served from the dist via `vite preview`** (the T114 sibling-churn lesson).

## Verdict: PASS — 0 M / 0 m / 0 L / 0 N — Tier 2 confirmed (both her findings closed or recorded-true)

## Landed items — verified

1. **LOW-1 (toc order) — LANDED**: authored +page.ts now leads with **usage**, then
   workbench/lane/accessibility/universal-props/api; the served rail is exactly those 6 in
   DOM order (my order-match check: every rail index ascending, `#usage` first) — the
   rail and the page's own declared skeleton now agree.
2. **NIT-1 (theme-flip control) — recorded, and the mechanism receipt now measured from
   BOTH sides.** Her NIT: no discoverable control flips the theme; the mechanism
   (inheritance, no re-render) is architectural. My probe completes it: the lane's prose
   and `.katex` share ink EXACTLY at rest (both oklch(0 0 0)); the katex-html
   innerHTML length is **3343 → 3343** across a flip attempt (her identical byte-count
   receipt, reproduced); and flipping EITHER channel — root `html.dark` OR the governing
   stage's own `data-theme` — moves NOTHING, because the lane sits in a stage-pinned
   subtree whose ink aliases are :root-pinned (the alias-theme law's immovable hold,
   measured both directions). The "moves for free" clause is true by construction; the
   NIT's receipt-scope limit stands as the honest record. Nothing owed.

## Her receipts re-derived — concordant

- **role=math + htmlAndMathml**: every live `[data-jx-math-inline]` span carries
  `role="math"`, ZERO aria-labels, and BOTH `.katex-mathml` + `.katex-html` children —
  the facade's `output: 'htmlAndMathml'` live on every span.
- **The error run in place + synchronous recovery**: driving the workbench tex to an
  unclosed `{` paints `.katex-error` with the raw source in **oklch(0.6 0.2 25)**;
  restoring the identity brings `.katex-html` back with the error gone — the
  `throwOnError: false` facade, live.
- **The zero-re-render architecture**: the 3343-byte innerHTML identity across a flip
  attempt (above).
- **Registry twins**: her cmp-identical receipt re-checked by the mirror law's standing
  state (no family edits by either reviewer since; nothing to re-cmp).

## FRESH AXIS — the macros passthrough driven live

Her macros/strict/trust receipt was source-level (facade :61-72, component :126). My
live drive through the workbench tex:

- The **site-level registerMacros table is EMPTY on this site** (grep: zero
  `registerMacros(` callers in apps/www) — so a registered-macro expansion is not
  demonstrable, consistent with the facade's merge (site table ∅).
- `\RR` (a hypothetical site macro) renders as **literal text `\RR`** — NOT an expansion
  and NOT a `.katex-error` span; same for `\ZZZNOTAMACRO`. The sharp contract: on this
  facade, **parse errors** (unclosed groups) take the in-place `.katex-error` path while
  **unknown macros** pass through as literal text — both non-throwing. A sharper
  description of the non-throwing contract than the 1st review recorded; the
  macros/strict/trust props remain live passthroughs (table rows served, facade merged).

## Gates (batch-shared, per the ONE-svelte-check rule)

| Gate | Result |
|---|---|
| svelte-check (ONE full run, saved /tmp/t120-scheck.log, grepped) | math-inline.html + +page.ts: **0 diagnostics** — her :113 cx clone CLOSED since her review. ui/math-inline family: **0 ERRORs**, 8 standing W3-D3 warns (:110) |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once) |
| Fresh build | exit 0 at 33b28d8d; probes on the dist via vite preview |

## Probe faults owned (all mine)

1. **Double-escaped TeX**: my first macro candidates carried `\\RR` in JS (a TeX
   linebreak + "RR") and rendered "RR" — I nearly filed that as the passthrough behavior;
   correct single-backslash escaping showed the literal-command path. The TeX string in
   JS needs the JS escape and the TeX escape counted SEPARATELY.
2. **Root-dark first**: my NIT leg flipped `html.dark` first and read "no movement" —
   the lane is stage-pinned; the governing scope is the STAGE, and flipping it (data-theme)
   also can't move :root-pinned ink aliases. Both flips measured before filing the
   immovability receipt.
