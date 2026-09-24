# Task 33 — CODE stack (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构)** — archetype skeleton replaced the
demo-standard page; the live workbench, gap ladder, axis-vocabulary and
flow-mode demos carried; family untouched. Probe **25/25 GREEN, stable across
reruns**; every gate green.

## Tier decision + gap analysis

**Tier 2 优化重构.** The old page was already demo-rich — a live workbench
(playground swaps gap/align/justify/direction with a tracking usage drawer),
the 16-rung gap ladder, the closed-vocabulary axis demos, wrap/inline modes —
but it followed the older demo-standard skeleton: no overview, no law layer,
no measured eight-axes section (the universal-props section asserted the W3-D3
contract without measuring it), a stale 7-entry ToC, and the universal marker
sat on the accessibility section's PropsTable instead of the api table. Tier 1
cannot restructure; tier 3 would throw away the window's best live workbench.
Tier 2 carries every demo, adds the archetype layers, measures the axes.

## What changed

- `apps/www/src/routes/docs/components/stack.html/+page.svelte`: hero ·
  install · **overview** (flow primitive charter; structural-vs-paint; the
  two holding contracts) · **stack-workbench** (carried verbatim) ·
  **gap-ladder** (carried) · **law** ("The flow primitive" — 6 postures:
  structural-not-style, omission transparency, the token-bound gap, rest
  before stamp, the paint half, layout only) · **postures** (the closed CSS
  vocabulary + wrap demos, merged from the old axes/flow-modes sections) ·
  usage · api (8 structural rows + `universal` — **the marker moved here
  from the a11y section's PropsTable**) · **axes** (8 lanes, all no-own,
  measured + 5-seam TokenTable + 4 probe-tagged demo panels) · accessibility
  (prose; the marker PropsTable removed) · see-also. h1 ×1, marker ×1.
- `+page.ts`: ToC = overview / live demo / The gap ladder / The flow
  primitive / Postures / Usage / API / The eight axes / Accessibility
  (install + see-also chrome OUT; theming folded into the axes TokenTable).
- Family files: **zero edits**. No matrix re-pin owed (stack has zero matrix
  rows).

## Findings + measurements (probe 25/25; headless Chromium over dev SSR :5241)

1. **Omission transparency, measured**: a bare Stack (no props) computes
   align-items: normal and gap: normal — no atom stamped; it also paints
   nothing (transparent ground, 0 padding, 0 border). The DOM carries only
   what you named.
2. **Token-bound gap, measured**: workbench gap="48" computes 48px, and the
   rung var reads `calc(0.25rem * 12)` — the ladder is REM-BASED CALCS, not
   literals (my first assertion expected a literal and FAILED; the token is
   more lawfully built than I assumed). The gap ladder demo receipts 4/12/
   24/48 as four distinct rungs.
3. **Closed axis vocabulary, live**: direction=column → flex-direction
   column; align=center → center; justify=between → space-between. The words
   are CSS's own words.
4. **Rest-replace + hook**: a consumer `data-probe-inner` attribute lands
   verbatim beside `data-jx-stack` (the component's ONLY hook) — consumer
   attributes replace, never merge.
5. **The merge law**: `radius={12}` + consumer `style="border-radius: 3px"`
   co-exist in one style attribute; the painted corner computes 3px
   (consumer wins the painted property).
6. **The size voice moves the whole stack**: `size={18}` stamps 18px on the
   root and the children inherit 18px — one number moves the stack.
7. **Stamps**: density="small" → data-density="sm"; theme="dark" → the dark
   bridge; named lanes stamp the alias vars (--jx-size-medium /
   --jx-radius-large).
8. **Chrome**: h1 ×1, marker ×1 (api table), toc == DOM (9, ordered),
   duplicate-id audit zero twins (LAW #19 guard holding).

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both stack.html files |
| docs-ambient-vocabulary solo | **284/284** |
| composition-b + composition-c solos | **24 + 14 (322 total with ambient)** |

Vellum's scroll-area.html uncommitted edit remains in the working tree —
untouched, and none of my gates read it. Dev server killed by PID + wrapper;
`lsof :5241` EMPTY before AND after.

## Open questions

1. **The rem-based gap ladder interacts with the size lane's STORY**: the
   gap rungs are `calc(0.25rem * N)` — rem resolves against the DOCUMENT
   root, so the size lane's stamped font-size on the stack root does NOT
   scale the gaps (only the children's em-based bits scale). That is the
   correct behavior (spacing stays system spacing) but the page's "one
   number moves the stack" line refers to the VOICE (font-size) only. If
   the fleet ever wants gap to ride the size lane, that is a
   family-level change (em rungs), not a page concern. Documented here so
   nobody reads the demo as gap-scaling.
2. The context gate's 9-word vocabulary and the never-ambient
   classification are quoted from the family header comment; if the gate's
   vocabulary ever grows, stack's structural props are the ones to re-check
   first (they are the fleet's largest structural surface).
