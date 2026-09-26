# T115 — SECOND REVIEW timeline.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 100 1st-review report opened FIRST;
  the campaign's largest page (1562 lines / 42 hosts / 129 items) audited at her
  claim-density seats; landed items verified byte + served; fresh axes. NO commits,
  NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/timeline.html/` over the timeline
  family, served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (her
  explicit proposal — the campaign's largest page earned it; my re-derivations hit her
  digits exactly). Her MINOR 1 (both page errors) CLOSED; her LOW 2 (the shared beam
  gradient id) LANDED axis-keyed in both trees AND live; her NIT 3 (the unkeyed twin
  each) LANDED.

## Her findings — all three closed

1. **MINOR 1 — both page errors CLOSED.** svelte-check page-scoped: **0 diagnostics** —
   the :80:28 cx clone is closed by the cx wave, and the :1544:403 TokenTable union
   error is fixed exactly per her direction: `source: 'component',
   description: 'stroke-alignment law (r5): the spine strokes and the dot border share
   ONE weight'` (source :1544 — the law note moved into the description, the union
   respected).
2. **LOW 2 (the beam gradient's shared def id — document-global first-def-wins) —
   FIXED and MIRRORED and LIVE.** Byte layer, both trees (:373/:379/:389): the two
   axis branches emit **`jx-tl-beam-grad-${geometry.axis}`** (vertical x2=0 y2=1;
   horizontal x2=1 y2=0) and the stroke references
   **`url(#jx-tl-beam-grad-${geometry.axis})`** — axis-suffixed exactly like the dot
   mask beside it. Served layer: the page's beam seat carries
   `linearGradient[id="jx-tl-beam-grad-vertical"]` and the beam path's stroke is
   **`url(#jx-tl-beam-grad-vertical)`** — id and reference match at the served DOM.
   A page hosting both axes can no longer cross-wire the traveling light.
3. **NIT 3 (the view demo's unkeyed each, twin of :775's keyed) — LANDED**: :1527 now
   keys `(phase)` — both seats of the page read the same LAW #18 hygiene.

## Headline claims — re-derived

- **The census**: **42 hosts, 42 drawn, 129 items** — digit-exact her count; the
  no-JS floor posture's live half (all 42 upgrade to drawn on hydration) ✓.
- **The drawn spine, falsifiable and TRUE — the canvas host**: the SVG progress path
  carries **`M 30 40 L 30 120.75 L 30 201.5`** (segment span 80.75 = her node spacing,
  her exact path string) with **stroke-dasharray 161.5px / stroke-dashoffset
  40.375px** → drawn = **121.125px**; the arithmetic chain: node2 at 120.75 +
  80.75/2 = 161.125 target, minus the 40 start = **121.125 drawn = exactly halfway
  between nodes 2 and 3 at value 2.5** — the decimals-first-class value contract
  verified through the stroke math alone (independent of her dot-rect comparison,
  which it corroborates: the endpoints ARE the node centers).
- **The scroll seat**: computed `animation-timeline: scroll()`, **dasharray 348px,
  dashoffset 348px at scrollTop 0** (draws to 0 at the bottom — the sampled-value
  clock) and **the inline dashoffset is ABSENT** (the frozen value/scroll interplay,
  verbatim her receipt).
- **The axis-keyed beam, live** (above).

## Fresh axes (beyond her report)

- The served beam id/reference match (her fix was source-level; the live DOM receipt
  is new).
- The drawn-arithmetic chain (dasharray − dashoffset == the between-nodes distance at
  decimal values) as a falsification instrument that needs no rect reads — cheaper
  than the 0.05px rect comparison and equally falsifiable.
- The 14-vs-11 settled-outputs delta on terminal-card aside, timeline's SSR carried
  clean; no count drift on this page.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 43da0d99) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (both of her Finding-1 seats closed) |

## Process evidence

- Port **5242**: wrapper + listener 76910; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Read-only probes (no stepper drives this pass — her tween
  receipts accepted; the page's 42 hosts re-censused, not re-driven).
- Probe faults owned: (1) my first spine read targeted `hosts[0]` — not the canvas
  host her receipt cites; the canvas is identified by the `M 30 40 …` path (the
  defaultValue-2 canvas) and the stroke math run THERE; (2) my dot-rect center reads
  returned mask-space coordinates (the svg's mask rects pollute a naive rect census)
  — replaced by the stroke-arithmetic chain, with her rect comparison standing as
  the corroboration; (3) my first completed-signature read keyed `li[data-completed]`
  — the attribute form isn't the item root's; her state-class census remains the
  right instrument.
- Artifacts: /tmp/t115/{probe-main2.mjs,probe-main3.mjs,probe-final.mjs,main2.json,
  main3.json,scheck.log,lsof-after.txt}.

## Open questions

1. None. The largest page closes 2nd review clean at Tier 2.
