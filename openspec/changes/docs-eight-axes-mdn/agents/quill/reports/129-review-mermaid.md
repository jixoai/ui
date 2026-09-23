# T129a — FIRST REVIEW mermaid.html (quill)

Owner = marginalia (coded; independence kept — no discussion before filing). First audit
from my own source reads + probes. Page:
`apps/www/src/routes/docs/components/mermaid.html/+page.svelte` (635 lines, +page.ts
routed). Family: mermaid.svelte + `$lib/mermaid-engine.ts`. Fresh build exit 0 at HEAD
**2b06c0d5** (== the floor); probes served from the dist via `vite preview`.

## Verdict: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 2 proposed (the deepest live-claim surface this batch; every falsifiable claim I drove reproduced)

## Verified TRUE with digits (all probed on the dist, real clicks)

- **The floor → lazy svg swap, live**: the hydrated page carries **6+ rendered SVGs**
  across the seats; the toc (authored 10 == DOM, zero missing, zero dup ids per LAW #19).
- **The render-id collision contract — VERIFIED**: five instances render with DISTINCT
  svg id bases — `deploy-flow-mmd-0-0` (the named workbench seat) + `jx-mermaid-1-0` …
  `jx-mermaid-4-0` (the unnamed seats falling to the sanitized default) — no collision
  anywhere on a page mounting this many instances. (Probe fault owned: my first census
  counted nested marker-def svgs — 37 nodes, 31 id-less; filtering to instance roots
  gives the clean contract.)
- **The error floor stands**: the invalid-source seat scrolls into view, the engine pass
  flips it to `data-state="error"`, the **role="status" strip reads "render error
  [jixoai/mermaid-engine] render failed: No diagr…"**, and the source floor (`pre`)
  still carries the raw text — the never-disappears law, all three halves.
- **Zoom is a pure transform**: two **zoom in** presses put matrix(1.5, 0, 0, 1.5, 0, 0)
  on an unclassed wrapper ancestor (+0.25 × 2 exactly), the svg node IDENTITY preserved
  and outerHTML byte-length stable — no engine call, no re-render. (Probe fault owned: my
  first pass captured the node before the LAZY render swapped it and read the swap as a
  zoom re-render.)
- **Theme pins read their target sheets**: the light/dark pinned pair both render through
  the local probe wrapper (both svgs present under the opposite ambient root).
- **The backdrop veil (the subtraction ink law)**: `data-testid="backdrop-on"` paints a
  backdrop-filter chain; `backdrop={false}` paints none — the W2 fixture pair, measured.
- **The a11y ladder**: every viewport is `role="img"` with a non-empty aria-label
  (named ×N == N).
- **The pan-viewport exemption receipt**: the zoom section teaches the two-axis exemption
  from the shared scroll-run system — consistent with the math-block T89 receipt from the
  other side.

## Findings

**LOW-1 — the cx clone class, page seat (:266:28) + family seat (mermaid.svelte :377:28).**
The standing Object.entries-undefined joiner in both lanes; mermaid.svelte :86 also
carries a `MermaidConfig` module-export mismatch ("declares MermaidConfig…"). Ledger for
the consolidation sweep (the family files are the owner's; page + family seats both open).

**NIT-1 — the hand-authored canvas mirrors carry their own recorded follow-up.** The
kinds/theme/backdrop/zoom/error demos are "hand-authored mirrors of the effect-only demo
regions" with the same-source resolveRawCode migration self-recorded as the follow-up
(:125-127 comment). The mirrors matched the live seats in every probe I ran — recorded
here so the migration follow-up doesn't get lost.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t129-scheck.log, grepped) | mermaid.html: **1 ERROR** (:266 cx — LOW-1); ui/mermaid family: **2 ERRORs** (:86 config export + :377 cx), 7 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | mermaid.svelte / engine.ts source via ?raw; registry files cmp-identical (mermaid.svelte, index.ts, defaults, stylex) |

## Probe faults owned (mine)

1. My render-id census counted nested marker-def svgs (37 nodes, 31 id-less) — the
   contract needed INSTANCE-ROOT svgs only.
2. My zoom pass raced the LAZY render: the node captured pre-swap compared against the
   post-swap svg — read as a "re-render". Settle on the rendered state first; the same
   svg node then survives zooming untouched.
3. The error seat needed a scrollIntoView + engine-pass wait (lazy per-viewport) — the
   at-rest read showed the pre-error "rendering" state.

## Process

Port **5241** (preview seat): rc=1 before → fresh dist → after gates killed by PID +
wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree edits.
Artifacts: /tmp/t129-mer.mjs, mer2, -ssr.html, batch logs.
