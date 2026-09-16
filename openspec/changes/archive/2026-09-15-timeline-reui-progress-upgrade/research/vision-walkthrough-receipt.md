# The vision walkthrough receipt (5.4 — the Owner's acceptance step)

Agent: the vision-pipeline fallback (the dedicated vision agent type is
broken in this environment — "Model provider is not configured:
builtin:zai"; a general-purpose agent ran capture → Read-upload →
analyze_image + deterministic probes). 46 PNGs in /tmp/vision-r2/ +
capture log.

## Verdicts (all four Owner surfaces)

| Surface | Verdict | Evidence |
|---|---|---|
| timeline — the twelve official families | PASS | each stage coherent, completed vs pending distinct in every family; both horizontal families confirmed horizontal; no overlap/clipping/unstyled content |
| timeline — the value contract + tween | PASS | deterministic readouts 1.00→2.00→3.00→2.00→1.64→1.00; random 1.64 lands the stroke visibly between nodes 1-2; tween frames 2.37 → 3.89 show the stroke lengthening; the 12-variant geometry matrix renders (v/h × ltr/revert/interlaced × RTL) |
| scroll-area chrome params | PASS | idle thumb 4px square-cut (radius 0 computed), right edge 2px inside; hover 4→6px widening toward content with the edge flank CONSTANT (gapRight=2); drag pins widened; tiers 4/8/12 per column, all flush |
| effects shimmer/rainbow (the r2 fix) | PASS | on the dark band rgb(16,16,20) inside the light stage: LIGHT faces + dark readable text under BOTH OS schemes; hosts `oklch(1 0 0)` + `color: oklch(0 0 0)` deterministic |
| press-button | PASS | light faces both schemes |

## Findings

1. **bars-scale "frozen" — NOT REPRODUCIBLE in the delivered state;
   recorded as the spin item's pre-hydration floor behavior.** The
   walkthrough agent measured a frozen SMIL clock + byte-identical
   rasters during its capture window and traced a real SSR id
   collision (`begin="0;spinner_IzZB-jx1.end-0.1s"` with one element
   carrying the id — pre-hydration output). The orchestrator's
   re-verification on the settled page: the clock advances
   (3.30→3.87s), ids are namespaced post-hydration
   (`spinner_IzZB-jx262` on both sides of the chain), and the raster
   A/B over 350ms DIFFERS (139 vs 529 bytes) — the loader animates.
   The walkthrough's capture had raced the dev server's hot-reload
   window (it ran while implementation probes hammered the module
   graph). The SSR-floor id collision itself is REAL and belongs to
   the spin item's standing pre-hydration behavior class (the
   round-8/9 saga) — outside this change's blast radius; flagged for
   a follow-up spin change, not fixed here.
2. Nice-to-have (cosmetic, repeating): the demo-canvas toolbar can
   occlude right-edge demo content (22-72% coverage measured on
   three specific labels: family-11's year label, family-12's LTS
   tick, spine-presets' "beam" header). Recorded; not blocking.
3. Nice-to-have: a 9px spinner is barely resolvable even while
   animating — the running semantic rides the label text. Recorded.

## Overall (the walkthrough's own words, kept)

"The timeline page delivers a genuinely strong documentation
experience … the value-contract demo is a small masterpiece … the
scroll-area chrome honors its edge-anchored growth law to the pixel …
the r2 effects fix holds under both visual and computed-style
inspection." Acceptance-ready.
