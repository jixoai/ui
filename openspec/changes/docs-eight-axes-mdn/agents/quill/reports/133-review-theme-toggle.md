# T133a — SECOND REVIEW theme-toggle.html (quill)

**1st:** scribe 125, PASS 0M/1m/1L/1N, Tier 2 proposed (consolidated 2b06c0d5). Owner =
marginalia. **2nd protocol:** her report opened FIRST; the landed items verified at
DOM + source layers; headline receipts re-derived; one fresh axis (the two-channel
lockstep measurement). Fresh build exit 0 at HEAD **4ab37d41** (== the dispatch floor);
probes served from the dist via `vite preview`.

## Verdict: PASS — 0 M / 0 m / 0 L / 1 N — Tier 2 confirmed

## Landed items — verified

1. **MINOR 1 (cx + ternary) — CLOSED at both lanes**: the page's cx carries the `?? {}`
   one-liner (:98); the family's :227 ternary is the sanctioned dialog shape
   (`current === theme ? themeToggleStyles.segActive : undefined` — source read).
2. **'four variants' — LANDED**: the hero title reads "theme-toggle — light / dark /
   system, four variants" (served h1), the meta agrees; no "densities" string remains.
3. **The class:dark honest scoping — LANDED as the summary's inline hedge**: the
   universal summary now reads "The theme axis is tree-scoped paint by source (class:dark
   on the control own root — **declared in the family, not served by a demo instance on
   this page**); it is deliberately NOT the global flip … Flip the toggles below: the
   GLOBAL theme still moves." Her LOW-1's resolution form is the honest hedge (the limit
   declared in the teaching), not a bolted-on seat — and my probe confirms the declared
   state is the served state: the universal canvas hosts two theme-control roots, NEITHER
   stamped dark, and zero `theme=` props on the page.
4. **The global flip chain — re-derived**: system → light → dark → system on real clicks
   (aria-label walks, html.dark TRUE at dark, localStorage tracks) — her cycle receipt,
   reproduced on the dist.

## Fresh axis — the two-channel lockstep measurement

Her battery drove the flip chain; mine measured what the flip does NOT move: pressing a
segmented group's dark option moves **html.dark + localStorage** (the behavior channel)
while the control's own `class:dark` stamp **stays off** — the axis and the flip are
separate channels, live-proven in both directions (the paint follows the axis only; the
flip follows the group only). Exactly the honest-scoping teaching, now with a live
two-channel receipt. (Restore hygiene: my probe left storage at 'light' — the page's own
controls reset it on the next visit; injection reverted.)

## NIT (carried)

**N-1 — the theme-axis remains undemoed**: the LOW-1 resolution chose the hedge over a
`theme="dark"` seat. The hedge makes the page honest; a dark-stamped island seat would
make the teaching VISIBLE (the control flips while the page stays light). Carried as the
open question her report filed — now with the summary hedge as the interim truth.

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t133-scheck.log, grepped) | theme-toggle.html: **0 diagnostics**; ui/theme-toggle family: **0 ERRORs** (8 standing W3-D3 warns) |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| LAW #19 | zero duplicate ids; toc 8 == DOM |

## Probe faults owned (mine)

1. My island assertion expected the control's class:dark to follow the GLOBAL dark press
   — wrong channel model; the measured separation IS the landing.
2. My restore click left storage at 'light' instead of removing it — page-owned state,
   self-corrects; noted.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t133-tt.mjs, -ssr.html, batch logs.
