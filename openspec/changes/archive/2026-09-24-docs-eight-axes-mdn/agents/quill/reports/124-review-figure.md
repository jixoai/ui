# T124b — FIRST REVIEW figure.html (quill)

Owner = marginalia (coded; independence kept). LEGACY-CLASS first audit from my own
source reads + probes. Page:
`apps/www/src/routes/docs/components/figure.html/+page.svelte` (158 lines, **no
+page.ts**). Family: figure.svelte (151) + numbering-provider.svelte + numbering.svelte.ts
+ defaults + index. Fresh build exit 0 at HEAD 79d7adde; probes on the dist via
`vite preview`.

## Verdict: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 2 proposed

## THE RAIL DECISION: PROPOSE THE RAIL — 4 entries

Six teachable zones on a 158-line page (hero, the live numbering canvas, usage,
accessibility, universal-props, api), 4 of them id'd. The page predates the rail
convention like card; propose at consolidation: `usage → accessibility → universal-props
→ api` (4 entries; optionally id the live canvas as `figure-demo` for a 5th — the
numbering walkthrough is the page's spine and deserves the anchor).

## Verified TRUE with digits (probed on the dist)

- **Native semantics**: every unit is a real `<figure>` with a real `<figcaption>` —
  the a11y table's "the platform announces the figure role and its caption" holds without
  ARIA.
- **The numbering domain, live**: the Section's decimal domain numbers the two equations
  **"Equation 1.1 — the momentum balance"** and **"Equation 1.2 — the energy bound"**;
  the number rides a real `[data-jx-number]` element (screen-reader text, as the a11y
  row claims).
- **References resolve the registry**: the demo sentence reads "**the bound of Eq (1.2)
  follows from Eq (1.1).**" — both references address the registered numbers, the
  display-currency claim live end to end.
- **citedIn (the manual backlink lane)**: eq-4-2's caption tail renders the verbatim
  display string "**· § 4.1**" AND emits the JSON data attribute
  (`data-cited-in="[&quot;§ 4.1&quot;]"` shape) — both halves of the Owner-2026-09-04
  manual lane on one figure.
- **The first-time universal contract**: the page's universal section is the no-seat
  text panel (supply-only teaching) — consistent with "document content, never paint";
  no axes seat to contradict.
- **LAW #18/#19**: zero `{#each}` on page and component; zero duplicate ids.
- **T94**: zero pseudo-class pairs in the family.
- **Mirror law**: figure.svelte registry ⇄ www cmp-identical.

## Findings

**LOW-1 — the cx clone class, page seat (:41:28).** The standing Object.entries-undefined
page-local joiner — the fleet sweep hasn't reached this page. One seat, mechanical fix
(the type-predicate precedent). Ledger.

**NIT-1 — the demo's eyebrow "4" vs the domain's chapter 1.** The Results SectionCard
authors `eyebrow="4"` (a display string: "4 / Results") while the numbering domain counts
this section as chapter **1** — the captions read "Equation 1.1/1.2", so the page shows a
hard-coded "4" that the machinery does not carry. The hero's "(Eq 4.5)" example invites
the chapter reading. The numbering is honest; the eyebrow is decorative drift. One-word
demo coherence fix (drop the eyebrow or make it "1") — or teach the distinction in one
clause.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t124-scheck.log, grepped) | figure.html: **1 ERROR** (:41 the cx clone — LOW-1); ui/figure family: **0 ERRORs, 0 warns** — the cleanest lane this batch |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | figure.svelte cmp-identical |

## Probe faults owned (mine)

1. I drove the numbering assertion expecting the hero's "Eq 4.5" chapter shape
   ("4.1/4.2") — the domain honestly produces 1.1/1.2 for the FIRST section; three
   initial fails were my expectation, not the page's. The corrected reading produced the
   NIT (the eyebrow vs the domain).
2. My figure census swept every `<figure>` on the page including the CodeCard drawers'
   figure roots (7 units) — the LIVE numbered pair is the two in the canvas; the census
   filter is the instrument.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t124-fig.mjs, -ssr.html, batch logs.
