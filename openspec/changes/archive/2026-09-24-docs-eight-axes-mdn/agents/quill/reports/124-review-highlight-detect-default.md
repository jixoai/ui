# T124c — FIRST REVIEW highlight-detect-default.html (quill)

Owner = marginalia (coded; independence kept). LEGACY-CLASS first audit from my own
source reads + probes. Page:
`apps/www/src/routes/docs/components/highlight-detect-default.html/+page.svelte`
(156 lines, **no +page.ts**). Family: the wrapper (92 lines) + defaults + index — the
component imports live in `$lib/highlight/*` (context-key, default-detector). Fresh
build exit 0 at HEAD 79d7adde; probes on the dist via `vite preview`.

## Verdict: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 1 proposed

## THE RAIL DECISION: AFFIRM NO-RAIL — the deliberate pointer page

Three id'd sections (usage · universal-props · api), 156 lines, and the page DECLARES its
own posture: the hero routes the deep story elsewhere ("The deep story — the three rings,
the null cascade, the layer table — lives on the code-card page's lang=auto section"),
the usage section serves the deferral link
(`/docs/components/code-card.html#code-card-auto`), and the component is wiring-only
("zero styling · zero behavior beyond wiring"; "scope IS the API"). Below the ≥5-section
bar, and chrome-less ON PURPOSE: a rail of three entries would add navigation chrome to
a pointer stub. **Affirmed: no rail, by design.**

## Verified TRUE with digits (probed on the dist)

- **The wrapper adds NO element**: the demo pair's two CodeCard roots (native FIGUREs)
  are DIRECT siblings under the layout container — no intermediate wrapper node anywhere
  in the pair. `{@render children()}` verbatim.
- **The detection receipt, both halves**: the wrapped card (`filename="main.ts",
  lang=auto`) carries **13 highlight spans** after hydration — L1's extension table
  answered typescript with no named language; the sibling outside the wrapper (explicit
  `lang=ts`) highlights via its own path, untouched by the context (**context spreads
  downward only**, measured).
- **"Prerendered output stays plain by law"**: the SSR payload's demo-card region ships
  the code essentially span-free (≤3 spans incl. chrome) while the hydrated DOM carries
  13 — the detection is a hydration-time act, byte-verifiable against the served payload.
- **The NO-ROOT dialect**: the universal seat wraps an InlineCode at `size={18}` — the
  wrapped component stamps its OWN root at the supplied size; the wrapper contributes no
  element. The lanes flow through context; the HIGHLIGHT_DETECT_KEY detection default is
  family state, untouched by the axes (the summary's claim, structure-true).
- **The API's honesty**: exactly ONE named prop row (children) — "scope IS the API" (see
  NIT-1 for the fold question).
- **LAW #18/#19**: zero `{#each}` anywhere; zero duplicate ids.
- **T94**: zero pseudo-class pairs.
- **Mirror law**: the wrapper cmp-identical registry ⇄ www.

## Findings

**LOW-1 — the cx clone class, page seat (:55:28).** The standing page-local joiner —
the fleet sweep hasn't reached this page either. One seat, mechanical. Ledger.

**NIT-1 — the API table's single row undersells the wrapper's live axis supply.** The
wrapper's Props interface declares **all eight universal axes** (density/size/shape/
radius/color/theme/elevation/motion — the context-supply half of the no-root dialect) and
the universal section DEMOS them (`size={18}`, `size="medium" radius="large"` — my probe
measured the wrapped InlineCode resolving the supplied size). The API table lists only
`children`. No false count claim is made, and the universal summary teaches the posture —
but the fold convention would list the eight rows. Fold them (or one line: "the eight
axes ride the no-root context supply — see universal props").

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t124-scheck.log, grepped) | highlight-detect-default.html: **1 ERROR** (:55 the cx clone — LOW-1); ui/highlight-detect-default family: **0 ERRORs, 0 warns** |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | wrapper cmp-identical |

## Probe faults owned (mine)

1. My first pair census keyed on `pre` elements and caught NESTED pres inside one card —
   the "direct siblings" check false-failed; the correct instrument enumerates the pair
   container's DIRECT children (the two CodeCard FIGUREs).
2. The API single-row assertion first compared raw row strings including the universal
   fold's "Property" headers — the fold convention (named rows + the axis fold) needed
   separating before counting.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t124-hdd.mjs, hdd2, batch logs.
