# TASK 136 — figure (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
Owner = marginalia; quill's 1st (T124b, PASS 0M/0m/1L/1N) consolidated. Dist = **ef520d44**
(fresh build rc=0). Port 5243 mine; killed after probes, lsof post rc=1, siblings
untouched.

## The landed items — verified closed

- **The 5-entry rail with `#numbering-walkthrough` id'd** — LANDED verbatim: +page.ts
  ships `usage → numbering-walkthrough ("The numbering walkthrough") → accessibility →
  universal-props → api`, and the live canvas carries the id — her optional fifth entry,
  taken.
- **The eyebrow (NIT-1)** — LANDED: the Results SectionCard authors `eyebrow="1"` (the
  domain's own chapter), killing the hard-coded "4" drift.
- **The cx clone (LOW-1)** — CLOSED: page 0 errors; ui/figure family **0 errors, 0
  warnings** — still the batch's cleanest lane.

## Her receipts — re-derived on my instruments

- **The numbering domain, live**: the two equation captions render **"Equation 1.1 the
  momentum balance"** and **"Equation 1.2 the energy bound · § 4.1"** — and the real
  `[data-jx-number]` elements carry the domain values **1 / 1.1 / 1.2** in the served DOM.
- **References resolve**: the demo sentence "the bound of Eq (1.2) follows from Eq (1.1)."
  is in the served text ✓.
- **citedIn, both halves**: the `data-cited-in='["§ 4.1"]'` attribute AND the visible
  "· § 4.1" caption tail render on the figure — and the second numbered figure carries the
  same pair, so the manual backlink lane is on both units (richer than her single-figure
  receipt, consistent with it).
- Native `<figure>`/`<figcaption>` semantics: untouched, as received.

## The fresh axis — the new rail entry navigates

The `#numbering-walkthrough` id is not just data: clicking the rail's "The numbering
walkthrough" entry scrolls the walkthrough canvas to **106px in the viewport** — inside
the toc-line band. The page's spine is now anchored, railed, and reachable; the T124
proposal's full shape (her 4 + her optional 5th) is live.

## Standard battery

- **LAW #19: 36 ids, zero duplicates**; LAW #18: no repeated-row each; T94 clean.
- Gates: verify:docs **rc=0** · ONE saved svelte-check — page 0, family 0/0 warnings (the
  cleanest lane in the fleet, held).
- Probe-fault ownership: my eyebrow probe's span-regex missed the rendered eyebrow
  element — the source receipt (`eyebrow="1"` at :90) is the landing proof; the
  `[data-jx-number]` visibility check found the numbers VISUALLY RENDERED (not
  screen-reader-hidden as T124's phrasing suggested) — the elements are real and present
  either way; the a11y row's wording on the current page governs.
- Artifacts: /tmp/g136-{card,hdd}.mjs + /tmp/g136-{build,docs,scheck,preview}.log.

## Open questions

None new. Tier 2 confirmed — the page is railed, drift-free, and its numbering registry
demonstrates both the display and the manual backlink lanes live.
