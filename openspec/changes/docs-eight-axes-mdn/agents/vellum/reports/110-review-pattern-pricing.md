# T110 — SECOND REVIEW pattern-pricing.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 92 1st-review report opened FIRST;
  landed hedge verified served; the column law re-derived; fresh axes run. NO commits,
  NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/pattern-pricing.html/` over the
  pattern-pricing family, served live on :5242.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 0 NIT.** **Tier ruling: Tier 1** (per
  her proposal; nothing contradicts it). The LOW is a census-correction receipt against
  HER report (not the page): her 13-cell count is a text-census artifact; the served
  DOM has 4 recommended cells and always did since her dist.

## Her MINOR 1 — the landed hedge, verified SERVED

The comparison summary now reads (served text receipt): "…each tier's install command
rides a code-card, and the recommended tier is one **paint law**…" with the uniform-
cards clause landed (source :117, commit 4c054233 — "the summary now teaches the
measured column law… and names the cards uniform by design"). The diff is minimal and
clean: **2 insertions / 2 deletions, zero data-jx-recommended changes** — the fix was
prose-only, as adjudicated.

## Her MINOR 1's other half — cards uniform, verified

My tier-card census: the tier CodeCards compute **oklab(0 0 0 / 0.18) 1px solid** —
the same neutral border on all three (solo / team / self-host), no primary rung, no
stamp — the hedge is measure-true ✓.

## The column law — re-derived digit-exact

- **4 `data-jx-recommended` cells served** (1 th + 3 tds of the seats column: th
  "seats", tds "1" / "unlimited" / "unlimited"), all in the comparison table.
- **recTh**: bg oklab(0.9122 −0.0258 −0.0209) — the 14% primary-into-head tint (vs the
  plain th oklch(0.9551 0 0)) — **plus the flanking inset rules: oklch(0.6489 0.237
  219) 2px 0 0 inset, −2px 0 0 inset** (hue 219 = the brand rotation's current
  wall-clock; her receipt read 260 — same law, rotated hue, expected drift).
- **recTd**: bg oklch(1 0 0) with the same 2px flank pair — rules-only, no background
  swap ✓ (the css header's law, paint-true).

## LOW 1 — her "13 data-jx-recommended cells" census is a text-census artifact

Live-DOM element count: **4** — and the hedge commit moved zero attributes, so the
served count at her dist was also 4. Her 13 came from counting the attribute STRING in
the served bytes: the usage code-sample, the two inline `<code>data-jx-recommended</code>`
teaching spans, and the prose occurrences all match a byte-grep. The distinction
matters for future censuses on pages that teach attribute names (the teaching prose
inflates byte-greps); the live-DOM element census is the honest instrument. No page
change owed — the page makes no count claim; the law paints at 4 cells exactly as
taught.

## Fresh axes (beyond her report)

- **The fold, EXERCISED end-to-end** (she receipted mechanism-only): at viewport 1440
  the comparison table renders table-row/table-cell; at 420 the container query
  (`@container jx-table (width < 30rem)`, table.css :118) drives the fold — rows
  compute **block**, cells **flex** (card rows). The frame's container chain was
  confirmed live (container-type inline-size found in the ancestor chain; note the
  shell also declares a named container, jx-shell — a census hazard she didn't hit).
- **Row-hover under the inset law**: real page.hover on a body row — row bg stays
  **rgba(0, 0, 0, 0)** (transparent; the table family's own hover wash paints on the
  plain tds, oklab(0.9754 …)), while the recommended column keeps rules-only —
  "row hover keeps flowing" is paint-true at both strata ✓ (page prose receipt).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her :73 overload is closed by the cx-joiner wave) |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Viewport restores to 1440 after the fold probe.
- Probe faults owned: (1) my first container census matched the shell's jx-shell
  container at 1440 (first inline-size in document order) — the named-container
  distinction is now in the receipt; (2) my first tier-card walk caught a bare `pre`
  alongside the cards — trimmed by border-law signature.
- Artifacts: /tmp/t110/{probe-patterns.mjs,probe-addendum.mjs,patterns.json,
  scheck.log,lsof-after.txt}.

## Open questions

1. None on the page. Her fleet-level press-shadow-pose note (two patterns, tonal seats
   without shadow poses) stays with the press-button owner — unchanged, receipted.
