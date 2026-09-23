# T129d — FIRST REVIEW pattern-hero-set.html (quill)

Owner = marginalia (coded; independence kept). First audit from my own source reads +
probes. Page: `apps/www/src/routes/docs/components/pattern-hero-set.html/+page.svelte`
(297 lines, +page.ts routed). Family: pattern-hero-set (canonical main) + hero-ascii +
hero-marquee, composed over hero-section (the LAW #16 adjudication's subject family).
Fresh build exit 0 at HEAD 2b06c0d5; probes on the dist via `vite preview`.

## Verdict: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 2 proposed (three live forms, each with a falsifiable centerpiece claim — all measured)

## Verified TRUE with digits (real clicks/keys on the dist)

- **copyCommand is ONE string with THREE jobs — measured end to end**: the terminal
  hero's CTA is a real button whose visible label and aria-label ARE the command
  ("copy npx jixoai-ui init --hue 210"); pressing it puts the exact command on the
  **clipboard** (read back: identical), and the terminal demo **types the same string**
  (present in the surface text after the typing window). Label + payload + typed demo,
  one prop.
- **The ascii hero preserves whitespace as payload**: the figlet banner renders in a
  `<pre>` (computed white-space pre), multi-line shape intact — "art scrolls, never
  reflows" as authored.
- **The marquee's two-state contract**: the strip renders the readable row + the
  **aria-hidden duplicate** and runs a pure-CSS loop; under emulated
  `prefers-reduced-motion: reduce` the **animation dies** (computed animation-name none)
  and the hidden duplicate **folds away** (0 visible) — the static scrollable row
  fallback, measured live.
- **The hero-section composition (LAW #16 context)**: the terminal hero composes
  hero-section (the entrance cascade is its own; the column law's 1100px drop is taught
  in the PlayHelp) — the h census finds the single heading and the hero chrome.
- **The pick guide matches the demos**: three forms, three "what does the first screen
  prove" answers, each demonstrably the demo above it.
- **LAW #18**: the page's `{#each}` count is zero on the live surface (the marquee items
  are a static payload). **LAW #19**: zero duplicate ids.
- **T94**: zero pseudo-class pairs. **Mirrors**: hero-set/ascii/marquee cmp-identical.

## Findings

**LOW-1 — the cx clone class, page seat (:88:28) + family seats (hero-ascii :124:28,
hero-marquee :134:28).** The standing joiner class in three lanes (the canonical main
pattern-hero-set.svelte is clean — the two siblings carry it). Ledger for the sweep.

**NIT-1 — the API table's composite rows blur the three interfaces.** The table merges
the three components into one 12-row PropsTable with `HeroSet:` / `Ascii:` / `Marquee:`
prefixed names (the universal attr present). The prefix convention is readable but
non-standard — every other family documents one component per table. Cosmetic
convention note for the api-row polish pass; the information is complete.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t129-scheck.log, grepped) | pattern-hero-set.html: **1 ERROR** (:88 cx — LOW-1's page seat); ui/pattern-hero-set family: **2 ERRORs** (:124/:134 — LOW-1's siblings), 24 standing warns (the largest warn lane this batch) |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | hero-set/ascii/marquee cmp-identical |

## Probe faults owned (mine)

1. My copy-CTA finder keyed on visible text "copy" — the CTA's visible label IS the
   command (copyCommand drives the label); the control is findable by its aria-label
   ("copy " + command). The first click hit the hero bar's INSTALL copy button instead
   (clipboard read the wrong payload).
2. The typed-demo assertion needed the full typing window (~1.5s) before the command
   appears in the surface text — a 300ms read false-negatives.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Clipboard permission granted to the probe context only. Artifacts:
/tmp/t129-hero.mjs, hero2, hero3, -ssr.html, batch logs.
