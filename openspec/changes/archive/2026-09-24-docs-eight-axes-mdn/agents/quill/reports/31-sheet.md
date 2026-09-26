# Task 31 — CODE sheet (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构)** — archetype skeleton replaced the
skeleton page; workbench canvas, universal demos, api rows and the a11y table
carried; family untouched. Probe **41/41 GREEN, stable across reruns**; every
gate green.

## Tier decision + gap analysis

**Tier 2 优化重构.** The old page carried a working side-switching workbench,
two universal demos (width/elevation), 8 api rows and an a11y table — but no
install/overview/law/axes/see-also, a stale 5-entry ToC, a theming section
with no measured claims, and zero pixel-level transition receipts. Tier 1
cannot add the missing layers; tier 3 would discard the good workbench. Tier 2
carries everything, adds the archetype, and measures.

## What changed

- `apps/www/src/routes/docs/components/sheet.html/+page.svelte`: hero ·
  **install** · **overview** (dialog positioning variant charter; self-carried
  promotion; card-dialect interior; the scroll honesty note) · workbench
  (id="sheet-demo") · **law** ("The dialog laws, side-docked" — 6 postures) ·
  types (side/width/variant with the §13 receipt) · usage · api (8 rows
  verbatim — the matrix-pinned variant row untouched) · **axes** (8 lanes
  measured + 6-seam TokenTable + 3 demo triggers) · accessibility (measured
  focus chain) · **see-also**. h1 ×1, marker ×1.
- `+page.ts`: ToC = overview / live demo / law / types / usage / api / axes /
  accessibility (install + see-also chrome OUT).
- Demo-sheet titles made unique (one was "Filters" twice — ambiguous
  accessible names across four dialogs on one page; renamed to "Width demo").
- Demo sheets hosted OUTSIDE the ComponentCanvas (beside the workbench
  sheet) — see finding 2.
- `test/fixtures/docs-ambient-vocabulary.matrix.json`: **matrix re-pin** — the
  sheet variant row's `tableIndex` 0 → 1 with a note (the archetype inserts
  law+axes PropsTables ahead of api; the row itself is byte-identical:
  bareDefault 'auto', own marker, sheetSurfaceVariantSlot lock).
- Family files: **zero edits**.

## Findings (the task's value)

1. **Hydration crash caught pre-integration (the big one).** PropsTable's
   keyed each is `{#each mainRows as prop (prop.name)}` — law-table rows
   shaped `{posture, input, renders, announces}` give every row key
   `undefined` → Svelte throws `each_key_duplicate` during client render and
   the whole app WIPES (served h1 count drops to 0; the page is dead). My
   first draft reproduced it; the fix is the law-table mapping the task-30
   integration already added to scroll-virtual:
   `lawTable.map((row) => ({ name: row.posture, type: row.input, default: row.renders, description: ... }))`.
   LESSON BANKED: the law-table-through-PropsTable contract requires named
   rows — every archetype page must ship the map.
2. **Canvas-host vs top-layer dialog (defect receipt for the canvas owner).**
   A sheet declared inside a ComponentCanvas stage loses its width atoms:
   identical class lists (diffed), the live dialog computes width 1280px /
   maxWidth 100% (full-bleed) while the page-hosted twin computes 384px /
   maxWidth none. A cssRules walk found NO matching author rule — suspect
   canvas containment or runtime mutation; needs the canvas family's owner.
   Worked around by hosting the demo sheets outside the canvas (the
   workbench pattern). Pre-existing: the old page hosted its demo sheets
   inside the canvas the same way.
3. **showModal does NOT lock page scroll (measured, both directions).** The
   docs scroller is `.jx-shell-body` (the window never scrolls). Wheel over
   the open sheet's ::backdrop chains to the page scroller (measured 0 →
   1396px); after close, wheeling works identically. The overview states the
   measured truth: the modal contract is about focus, not scroll.
4. **Tab containment nuance (measured).** Tab cycles the drawer's controls,
   but between cycles Chromium may visit BODY for one hop (sequential
   navigation across the inert page) and re-enters; NO live control behind
   the sheet ever takes focus, and focus restores to the trigger on close.
   The a11y table says exactly this.
5. **Duplicate ids = SectionCard auto-anchor twins (mechanism receipted —
   the coordinator's hypothesis confirmed).** Every archetype page shipping
   `<div id="overview"><SectionCard title="Overview">…` gets a second id:
   SectionCard renders its own `<h2 id="overview">` inside the wrapper.
   Receipted set on this page: overview/types/usage/accessibility/api/
   see-also — all H2-twins-inside-wrapper; toc navigation unbroken (first
   match = wrapper). Fleet-wide, exactly the "check the rendered DOM and
   batch-fix if a real collision shows" case — the collision is real and the
   mechanism is now named.
6. **The 200ms declared exception, measured in pixels.** Entry: rAF-sampled
   x from 1280 → 896 through 6 intermediate frames (1148→911), moving window
   ~97-128ms under --motion-200. Exit via Escape: .closing class inside the
   open window, closed at 223-230ms. Reduced-motion: instant (24-30ms, the
   double kill — CSS animation:none + the timer skip).
7. **Focus chain measured end-to-end**: initial focus lands on the × (Close
   IconButton, inside); Tab cycles stay within the drawer's controls; Escape
   restores focus to the trigger button; backdrop click never closes
   (deliberate, re-measured).

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both sheet.html files |
| docs-ambient-vocabulary solo | **284/284** (after the documented tableIndex re-pin) |
| sheet-defaults solo | **5/5** |
| batch3-components solo | **13/13** (includes the dialog.jx-sheet render pins) |

Matrix re-pin: the documented `tableIndex` 0 → 1 shift above (archetype
inserts law+axes tables ahead of api); row content byte-identical; note
appended in the fixture.

## Sibling discipline

Zero touches outside my four files (+page.svelte, +page.ts, the matrix
fixture, this report). Working tree carries vellum's prototype-flex files and
scribe's/marginalia's review reports — untouched. Dev server killed by PID +
wrapper; `lsof :5241` EMPTY before AND after.

## Open questions

1. **Fleet decision — the SectionCard auto-anchor twin ids** (finding 5): the
   mechanism is receipted; the fix is either dropping wrapper ids (toc points
   at the SectionCard anchors) or making SectionCard skip the anchor when the
   wrapper already carries the id. One-line-per-page vs one-line-in-component
   — the component fix fixes every page at once. The duplicate-id hard assert
   is now in my probe pattern for the fleet to reuse.
2. **Canvas-host vs top-layer dialog width** (finding 2): a real interaction
   defect with an unfound rule (cssRules walk clean). The canvas owner should
   reproduce with `<Sheet>` inside a stage — the probe receipt (identical
   classes, 1280 vs 384) is the repro script.
3. **Tab wrap-around**: Chromium's modal dialog does not wrap Tab at the last
   control; it falls to body and re-enters. If the fleet wants spec-exact
   internal wrap, that is a manual keydown handler in the dialog/sheet
   families — platform-first philosophy says document it (done on this page)
   unless a11y rules demand more.
4. The scroll-not-locked truth is now on the page; if the family ever adds
   scroll-lock (dialog-family feature), the overview paragraph and the probe
   both need updating.
