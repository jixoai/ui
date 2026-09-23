# Task 36 — CODE table (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构, surgical)** — the 1591-line page's
recipe suite (six ability-named recipes, the tasks table, the semantic set)
carried untouched; the archetype gained overview, the frame-width laws, the
measured eight-axes layer, a rebuilt ToC, and two long-standing page
diagnostics fixed. Probe **29/29 GREEN, stable across reruns**. THREE family
defects receipted (dense no-op at sm, the radius silhouette outranked, the
playground rowId twins). Family files: zero edits.

## Tier decision + gap analysis

**Tier 2 优化重构 (surgical).** The old page already carried the archetype's
heavyweight middle — install, a live frame-width workbench, usage, six
recipes, the tasks table, the semantic set, real semantic a11y rows, and the
--jx-table-* theming — but lacked overview/law, asserted the eight-axes
contract without measuring it, shipped a ToC that predated the archetype
(install IN, no overview/law/axes), and carried two standing svelte-check
diagnostics on the page itself (untyped TreeFile, unguarded cx). Tier 3 would
destroy the window's best demo suite; tier 1 cannot add layers.

## What changed

- `+page.svelte`: **overview** inserted (semantics-ownership first) ·
  **law** inserted ("The frame-width laws" — 6 postures, NAMED-row mapping) ·
  **#universal-props → #axes**: the 8 lanes measured (density OWN 'sm' with
  the override receipt, the size-voice split, the radius silhouette defect)
  + the theming TokenTable merged (6 seams) + a third stamps panel
  (density="large" — large, not small, so the override-vs-own receipt is
  distinguishable) · **#theming folded** (DensityDemo import retired) ·
  **a11y moved after api** (the archetype trio: api → axes → accessibility)
  · **two standing page diagnostics fixed** (TreeFile import; the typed cx
  predicate — the page's own contribution to the gate).
- `+page.ts`: ToC rebuilt — 17 entries, DOM order, install/see-also chrome
  OUT, overview/law/axes IN, theming OUT.
- Family files: **zero edits**. No matrix re-pin owed (zero matrix rows).

## Measurements (probe 29/29; headless Chromium over dev SSR :5241)

1. **The frame container**: computed `container-type: inline-size`, name
   `jx-table` — the responsive decisions read the frame.
2. **Both frame-width laws, driven live across the 30rem line** (the
   workbench rig's slider, keyboard-driven 560 → 238 → back):
   wide = thead visible, table scrollWidth 646 > frame 558 (real overflow),
   `th[data-sticky]` computes position: sticky; narrow (238px) = thead
   folds (display none) and `td::before` renders the data-label
   ("Consumer" — computed ::before content, the pseudo-safe read).
3. **The a11y battery**: caption names the table; `aria-sort` flips
   ascending → descending on the sorted th only (clicks on the sort BUTTON
   — the th text itself is inert); the selection recipe's
   `aria-live="polite"` readout exists ("0 of 6 selected").
4. **Density, the fleet's opinion family**: the bare workbench table stamps
   `data-density="sm"` with NO prop (the own); `density="large"` overrides
   to rung `lg` (the stamps panel — large, not small, so the override is
   distinguishable from the own).
5. **The size-voice split (measured)**: `size={18}` stamps 18px on the
   FRAME while the table keeps its 12px density-tuned voice inside — the
   declared posture wins inside the frame; the axis row and the page text
   say exactly this.
6. **Three family defects receipted** (below).

## Family defect receipts (W-next; zero family edits from me)

1. **Dense is a visual no-op at the family's own sm density.** The dense
   class lands (`table.dense` present) and the rule fires
   (`padding: var(--jx-gap) var(--jx-inset)`), but at sm the gap channel
   EQUALS the inset channel (both 8px) — regular and dense rows both
   measure 34px tall. Dense only bites at higher density rungs (inset
   12/16). The api row now carries the measured note.
2. **The radius silhouette is painted by the static atom.** `radius={12}`
   stamps `--jx-radius-effective: 12px` correctly, but the computed
   border-radius is 8px — the frame atom's static
   `borderRadius: tokens['--jx-radius']` outranks the zero-specificity
   `:where` consumed rule. The stamped supply is correct; the painted
   corner needs the atom to read the consumed var.
3. **Playground rowId twins (fleet-level, live tree).** Two canvases each
   mint `jx-play-row-1-label` — the playground's row label ids are not
   page-unique, so the duplicate canvas's aria-labelledby points at the
   other canvas's label node. NOT the print clone (both twins live in the
   source tree), NOT heading-stamper twins (LAW #19 holds — zero H2 twins).
   For the playground family owner: salt the rowId with the canvas/section
   identity.

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both table.html files — including the two standing diagnostics this task fixed |
| docs-ambient-vocabulary solo | **284/284** |
| table family solos | table.spec **6/6** + table-grid-toolbar **25/25** + table-grid-toolbar-pages **5/5** |

Port receipts: `lsof :5241` EMPTY before AND after; server killed by PID +
wrapper. Sibling files (vellum's separator.html) untouched.

## Open questions

1. **The three family defect receipts above** — dense-no-op-at-sm, the
   radius silhouette outrank, and the playground rowId salt all belong to
   W-next / the family owners; my probe carries a check for each, ready to
   flip when they land.
2. **The size-voice split is design-honest but surprising**: consumers who
   expect `size={18}` to scale the table TEXT will see it scale only the
   frame (the 12px density voice wins). If the fleet wants the lane to
   reach the cells, that is a family change (the table atom reading
   --jx-size-effective); documented as measured either way.
3. The recipe suite's six canvases each run their own keyed each blocks
   (row.id keyed — LAW #18 clean: sorting reorders without duplicate-key
   crashes, measured through the aria-sort flip).
