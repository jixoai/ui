# Task 35 — FOLLOW-UP system-dialog (the anchor-fix flip)

Verdict: **LANDED-READY.** The anchored rise is LIVE and measured:
position-anchor resolves the uid, the panel opens below the trigger —
centered on it, 12px gap — and the full 41-check battery is GREEN stable
across reruns. One family-side repair was required and is included in my
working tree (see finding 1): the landed fix crashed SSR; the page served
500 until I moved one const.

## Finding 1 — the landed fix SSR-crashed; repaired (family file touched)

25c32355 turned the anchor style into a template literal — but
`anchorStyle` is a `const` declared ~20 lines BEFORE
`const api = getContext(...)` in system-dialog-content.svelte. The new
`${api.uid}` read evaluated eagerly in the TDZ: every SSR render threw
`ReferenceError: Cannot access 'api' before initialization` (verified:
HTTP 500, the error serialized in the served HTML; the coordinator's
"+2 warnings" forecast was in fact a fatal at render).

**Repair (working tree, integration required):** `anchorStyle` moved below
the context init, with a comment carrying the ordering law (uid is
instance-stable, pose is static per usage — a plain const remains correct).
AFTER the repair: SSR 200, the anchored rise live, and the full battery
green. This is the only family edit; it is mechanical, ordering-only, and
semantics-preserving. **Mirror law held**: the dev server's registry ⇄ www
sync propagated the identical repair into
`registry/files/ui/system-dialog/system-dialog-content.svelte` — both trees
verified byte-identical post-edit; integration must carry the pair
together.

## Finding 2 — the anchored rise, measured live

- `position-anchor` computes `--s2` (the uid interpolated) — the seam works.
- `position-area: block-end` places the panel BELOW the trigger, and the
  anchor-center alignment centers it exactly: panel center-x 556 ==
  trigger center-x 556.
- The gap is the designed breathing room: gapBelow = 12px (--jx-gap).
- All the anchored-alert mechanics re-measured green on the live panel:
  outside click does not dismiss (alert gravity), Escape scoped to the
  panel (outside: no cancel; inside: cancels + restores the invoker), Tab
  exits (non-modal), safe landing on Cancel, the confirm seam flips the
  onconfirm echo and restores focus, the trio resolves exactly-once at
  pose=center (dead-center measured) with the destructive fill injected.

## Finding 3 — open question 2 resolved as a SPLIT: the width-atom loss
persists and is now cleanly separable from the anchor bug

Post-fix, the panel's layout width is still 545px (offsetWidth — not a
transform artifact) against the atom's `min(24rem, calc(100vw - 2rem))` =
384px cap, with `maxWidth: none`; computed position-anchor is correct, so
the anchor seam and the width loss are TWO independent defects. The panel
lives inside a ComponentCanvas stage — the same host that beat the sheet's
width atoms in task 31 — so this receipts as an **extension of W-next #8
(canvas-host interaction)**. Non-blocking for this page: the panel is
anchored, usable, and the page documents the contract.

## The flip (what changed)

- Probe (`/tmp` receipt, not repo): the defect-signature check flipped to
  three positive checks — `position-anchor` resolves the uid's anchor;
  `position-area: block-end` + panel-centered-on-trigger (Δx = 0) +
  gapBelow = 12; and the canvas-host width defect receipt
  (panelWidth > 400 persists).
- `+page.svelte`: the overview's measured-defect note replaced by the
  measured teaching paragraph (the anchored rise with the numbers: 12px
  gap, anchor-center, block-end, the try chain, anchors-visible, the
  trio's center pose); the workbench canvas description teaches the live
  rise again.
- `+page.ts`, matrix fixture: unchanged from task 34 (no further re-pin).

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on the +page files. The FAMILY files carry their known baseline (the +2 expected `state_referenced_locally` warnings plus the family's standing type noise — receipted, not chased; my repair adds no new diagnostics) |
| docs-ambient-vocabulary solo | **284/284** |
| system-dialog-trio solo | **9/9** |
| defaults-overlays + composition-props + carved-action-band solos | **13 + 5 + 10** (312 total with ambient) |

Port receipts: `lsof :5241` EMPTY before AND after; server killed by PID +
wrapper. Sibling noise: vellum's separator.html / scribe's waterfall /
marginalia's stack — none of my gates read them; untouched.

## Open questions

1. **The family repair needs integration with this task** — the working
   tree carries the moved `anchorStyle`; without it the page 500s. The
   +2 `state_referenced_locally` warnings the coordinator forecast live at
   the moved site's neighbors (provideUniversalLanes reads the eight lane
   props at 144; pose at the anchorStyle const) — cosmetic, semantics
   correct.
2. **W-next #8 extension**: canvas-host vs platform-element width atoms now
   receipted on TWO families (sheet 545-wide, system-dialog 545-wide vs
   384 cap). The canvas owner has both repro scripts (my probe history).
3. The trio's `test/system-dialog-trio.spec.ts` carries standing svelte-check
   type errors in the app baseline (import-with-.ts, mount overloads) — the
   vitest suite itself is green 9/9; noted for whoever owns the spec.
