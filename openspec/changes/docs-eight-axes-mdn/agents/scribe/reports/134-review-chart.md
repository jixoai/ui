# TASK 134 — chart (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
Owner = marginalia; vellum's 1st (T127, PASS 0M/1m/0L/0N) consolidated at 4ab37d41. This
second review ran at HEAD/dist **4ab37d41** (fresh build rc=0). Port 5243 mine; killed
after probes, lsof post rc=1, siblings untouched.

## The landed items — verified closed

- **The :48 cells narrowing** — CLOSED at the type layer: the saved svelte-check run
  (/tmp/g134-scheck.txt, the batch's ONE run) reports **0 errors on chart.html/
  +page.svelte** (one standing `usageLive` warning, the fleet's cosmetic class).
- **The five token-vocab seats (:580–585)** — CLOSED: all four distinctive stale strings
  ("theme (neutral ladder)", "hue injection", "theme (the glyph lock)", "grid hairlines /
  donut track" — plus the bare "theme") are **zero-hit** in the page source; the surviving
  TokenTable `source` census is union-valid ('color' ×4, 'density', 'component' among the
  harvested values). The timeline-class recurrence vellum flagged is healed here.
- **cx ×5** — CLOSED: chart family **0 errors** (chart-bar/chart-sparkline/chart-line/
  chart-donut all clean; 37 standing warnings receipted, the state_referenced_locally
  cosmetic class).

## Her receipt set — re-derived on my instruments

- **role=img + accessible name**: **23 role=img elements, 23 with aria-label** — her
  23/23 reproduces exactly.
- **The eye-hidden fallback table**: computed `clip-path: inset(50%)` + `position:
  absolute`, caption "deploys per day" — hidden from the eye, present to AT, verbatim her
  receipt.
- **The 5:2 frame is resize-stable**: the viewBox 100×40 line chart measures **532×212.8
  (ratio 2.5)** at 1440 and **602×240.8 (ratio 2.5)** at 700 — the ratio invariant holds
  at a second viewport pair (her 944×377.6 → 700×280 pair; the digit that travels is 2.5).
- **The axes-are-snippets law**: the area-axes chart svg (identified by viewBox 100×40
  against the 24×24 icons) renders texts **["peak 12", "w1", "w8"]** — her receipt
  reproduces node-for-node.

## The fresh axis — degenerate inputs cannot corrupt the geometry

Her report noted the degenerate-input seats as present (empty / all-negative / constant /
NaN / zero-total) but seat-backed only. I swept the rendered geometry: **zero `path`
elements carry `NaN` in their `d` attribute anywhere on the page** — every degenerate seat
renders valid path geometry (the seats degrade their PAINT, not their syntax). Combined
with the 23/23 named-image census, the family's a11y story closes at both layers: a
nameless chart is impossible, and a senseless chart is still well-formed.

## Standard battery

- toc == rail **14/14** (her count holds); **LAW #19: 111 ids, zero duplicates**; h1 ×1.
- Gates: verify:docs **rc=0** · ONE saved svelte-check — page 0 errors, family 0 errors
  (the batch's single run; per the new rule, no re-runs).
- Probe-fault ownership: (1) my token-source harvest keyed table cells positionally and
  caught PropsTable descriptions/defaults as noise — the byte-check on the four stale
  strings (all 0) plus the union-valid census is the receipt; (2) the fallback-flip toggle
  was not driven this pass (my /fallback|data table/i locator missed it — it is a segmented
  control, not a labelled button); the eye-HIDDEN state is the served rest state and her
  live-flip receipt stands from T127.
- Artifacts: /tmp/g134-chart.mjs + /tmp/g134-{build,docs,scheck,preview}.log.

## Open questions

None new. The family's remaining debt is zero at both lanes; the Owner's union-vs-per-seat
question (her OQ1) is answered in practice — the consolidation chose the per-seat reword,
and the seats are union-clean now.
