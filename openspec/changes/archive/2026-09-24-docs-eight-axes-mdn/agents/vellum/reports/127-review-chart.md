# T127 — FIRST REVIEW chart.html (vellum)

- **Reviewer**: vellum (1st review; Owner = marginalia who coded the family — no prior
  report exists, independence law held: all findings from my own source reads + probes.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/chart.html/` (609 lines, toc 14) over
  the chart family (chart + bar/sparkline/line/donut primitives, css, stylex, defaults),
  served live on :5242, dist @ HEAD 1416d764 (fresh build, noted).
- **VERDICT: PASS — 0 MAJOR / 1 MINOR / 0 LOW / 0 NIT. Tier proposal: Tier 2** (a
  data-display family whose a11y story is the receipt surface — 23/23 named role=img,
  the clip-path fallback, the resize-stable 5:2 frame — and the degenerate-input claims
  are seat-backed; the gate debt is the gap).

## The claim bank — verified

- **role=img + REQUIRED accessible name**: **23 role=img elements, 23 with aria-label**
  ("deploys per day", "deploys this week", "deploy trend", "incident severities", …) —
  the no-default-by-contract rule verified across every chart instance on the page.
- **The data-table fallback**: the fallback table computes **clip-path: inset(50%) +
  position: absolute** — hidden from the eye, fully present to assistive tech, caption
  "deploys per day" ✓; the flip seat toggles it live.
- **The 5:2 frame is resize-stable (fresh axis)**: the line chart (viewBox 0 0 100 40)
  measures **944×377.6 → 700×280, ratio 2.5 → 2.5** across a live viewport resize —
  the SVG scaling claim (width 100%, height auto, dots in viewBox units) verified, not
  falsified.
- **The axes-are-snippets law**: the area-axes seat authors yAxis/xAxis snippets and
  the served chart svg (viewBox 100×40) renders **texts ["peak 12", "w1", "w8"]**
  inside it — "the component renders them inside the svg and never guesses a domain"
  verified at the served nodes (61 svgs on the page; the chart svg identified by its
  viewBox — the icon svgs are 24×24).
- **Degenerate-input seats** present (empty / all-negative / constant / NaN /
  zero-total coverage in the page's example data); the "zero runtime deps" /
  "--chart-1..5 tokens" pills consistent with the family (no chart lib imports).

## MINOR 1 — the page gate is red: 7 errors on +page.svelte

- :124 — the cx overload clone (the standing class).
- :48:46 — the sparkline cell-system PlayRow state: `query()`/state narrowing rejects
  `string` against `"block" | "braille"` (the generic needs the lane type on the
  initial state).
- **:580–585 — FIVE TokenTable `source` union seats**: "theme", "theme (neutral
  ladder)", "hue injection", "theme (the glyph lock)", "grid hairlines / donut track"
  passed where the union is `density | color | component | structural`. This is the
  timeline :1544 class recurring five times — that fix ("component" + move the note
  into the description) evidently did not propagate to this newer table.

## Standard battery

- **toc == DOM == rail 14/14**, zero dangling; h1 ×1.
- **LAW #19**: duplicate ids 0 (the PlayRow label ids are unique here — contrast
  markdown's finding below).
- **T94**: no `:checked`/`:indeterminate`-shaped pairs in the family (display
  primitives; the fallback table is a plain table).
- **Reveal-CB**: the deep sections mount on scroll (the first axes read was empty
  pre-scroll — instrument lesson, re-read post-scroll).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 1416d764, fresh build) | **GREEN rc=0** |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page RED — 7 errors** (MINOR 1); family **4 cx clones** (chart-bar :135, chart-sparkline :119, chart-line :139, chart-donut :145 — one per primitive, the standing class; 37 warnings) |

## Process evidence

- Port **5242**: wrapper (/tmp/t127-wrapper.pid) + listener 76511; lsof-empty before;
  after gates killed BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines,
  rc=1 — port EMPTY after**. Siblings 5241/5243/5244/5230 untouched.
- NO commits, NO pushes. The resize drive restored 1440 after the falsification pass.
- Probe faults owned: (1) my first axes read keyed the seat's FIRST svg — an icon
  (24×24); the chart svg is the viewBox 100×40 element; (2) the deep sections need
  scroll-mount before any read; (3) my --chart-N paint census matched nothing at
  computed-color level (the palette rides SVG stroke/fill attrs) — receipted as an
  instrument gap, not a claim failure.
- Artifacts: /tmp/t127/{probe-chart-cmd.mjs,probe-f.mjs,probe-g.mjs,probe-h.mjs,cc.json,
  gate-docs.log,gate-universal.log,scheck.log,lsof-after.txt}.

## Open questions

1. The five TokenTable source-union seats: per-seat fix (the timeline shape) or widen
   the union — the owner's call; the class is now two families loud.
