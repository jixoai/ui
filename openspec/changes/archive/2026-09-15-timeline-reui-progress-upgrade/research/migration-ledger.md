# Migration ledger — 2026-09-15-timeline-reui-progress-upgrade

Every retirement this change ships, with its replacement and the
receipt that proves the migration landed.

## W1 — the fill auto basis

| Retired | Replacement | Receipt |
|---|---|---|
| `contextBaseCss(host)` — the nearest-opaque-ancestor measured walk | `contextCanvasCss(host)` — the theme scope's `--background` token (raw-string alpha pre-pass + `@jixoai/color-utils` parse; root token first; white/black terminal) | research/w1/fill-scope-token-probe.mjs 30/30 ×3 (the gallery case: opaque dark band inside a light scope never reaches the fill) |
| `contextBase(host)` — the walk's 0xRRGGBB form | (none — consumers switched or deleted) | repo grep: zero surviving consumers outside frozen archives |
| `colorAlpha` helper (dead after the walk retired) | `tokenAlphaIsOpaque` raw-string pre-pass | test/press-fill-basis.spec.ts (9 slash-alpha arms) |
| solidFill's default base = measured page walk | hostless `contextCanvasCss()` (document-root token; API unchanged) | press-fill-basis.spec.ts hostless assertions |
| registry: press-button had no color-utils edge | `registryDependencies += "@jixoai/color-utils"` (verify:deps rule b — the runtime imports an owned file) | `pnpm verify:deps` GREEN |

## W2 — the scroll-area chrome

| Retired | Replacement | Receipt |
|---|---|---|
| the hard capsule thumb (`border-radius: calc(infinity * 1px)`) | `var(--jx-scroll-thumb-radius, 0px)` — radius 0 default, `radius` prop (px \| 'full') | research/w2/scroll-chrome-params-probe.mjs 63 assertions ×3 (0px default, 6px configured, 3.35544e+07px 'full') |
| the single 12px chrome width | `width` tiers thin/auto/wide → track 8/12/16, thumb resting 4/8/12, hover/drag 6/10/14 | same probe, per-tier measurements |
| the track's 2px edge standoff (insets 2px) | FLUSH track (edge insets 0) + the thumb's edge-side flank pinned at 2px | same probe — flush computed 0 on all six edges; edge flank Δ 0.000px under hover; growth +2.000px strictly inward |
| centered hover growth (both insets narrowing) | edge-anchored growth (the inset-carried transform-origin: right center law; RTL mirrors logically) | same probe, RTL arm |

## W3 — the timeline

| Retired | Replacement | Receipt |
|---|---|---|
| the first↔last CHORD `runLength` in every dasharray consumer (a standing bug on non-collinear spines) | `pathLength = stops.at(-1).arc` — the cumulative polyline (scroll stroke dasharray + `--jx-tl-run`, beam dasharray/park, beamLen) | test/timeline-value.spec.ts polyline-vs-chord fixture; timeline-spine.spec.ts keepers 10/10 (the `runLength` FIELD stays in the payload — additive freeze; custom snippets keep working) |
| (no value contract existed) | `defaultValue`/`value`/`onValueChange` + item `step` + `data-completed` paint + pending-wins precedence | timeline-value.spec.ts 21/21 |
| (no progress channel existed) | the value-driven progress stroke with the STOPS protocol (deduped milestones, gap interpolation, duplicate-first owner semantics, sub-first → 0) | research/w3/timeline-progress-probe.mjs 19/19 ×3 |
| scroll mode's exclusive stroke ownership was implicit | explicit: the value inline dashoffset is NOT painted under `animation='scroll'` | same probe arm D |

## W4 — docs

| Retired | Replacement | Receipt |
|---|---|---|
| the ten-family invented demo list | the TWELVE official reui families (inventory-frozen aria-labels) + our four highlights | research/w4/timeline-demos-probe.mjs (A4's receipt — row-by-row stage verification) |
