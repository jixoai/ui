# T117 — SECOND REVIEW tree-view.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 101 1st-review report opened FIRST;
  landed items verified byte + served; headline receipts re-derived; fresh axis.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/tree-view.html/` over the
  tree-view family, served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (her
  proposal; the APG-contract page keeps its tier — my re-derives hit her digits). Her
  MINOR-1 (all three page errors) CLOSED — the TreeSlotRender whole-arrow casts
  landed; her LOW 1 (the fixed-utilities contradiction) LANDED as the reword carrying
  her own drift digits.

## Her findings — both closed

1. **MINOR-1 (page cx :387 + the :581/:666 snippet-type-identity pair) — CLOSED.**
   The snippet seams now cast the WHOLE arrows at the boundary:
   `onSuffixSlotRender={((ctx: TreeItemCtx) => …) as unknown as TreeSlotRender}`
   (source :318/:595/:665 — :595 typed `TreeSlotRender<FileType>`) — her noted fix
   class, landed at all three seats. svelte-check page-scoped: **0 diagnostics** (the
   cx clone gone with the wave; both identity errors gone with the casts).
2. **LOW 1 (the theming summary claimed "fixed utilities" while ~1.7px of rung drift
   leaks) — LANDED as the reword, her digits verbatim**: source :707 now reads "Row
   paint rides the ambient chain (**measured: row height drifts 17.5/18/18.5/19.2px
   across the rungs** — the density response flows; no fixed utility pins it);
   --jx-indent is the one geometry lever". The two summaries no longer disagree; the
   drift is the teaching.

## Headline receipts — re-derived

- **Roving tabindex**: the basic tree carries **exactly one tabindex=0 treeitem**
  before the walk and **exactly one after** (the stop follows focus; the post-walk
  stop sits on the walked row) ✓ — her contract digit reproduced at the live tree.
- **The keyboard contract, spot**: real ArrowDown/ArrowUp on the focused tree walk
  rows with the single-stop invariant held throughout ✓ (her full per-press census
  accepted; the walk seam re-driven).
- **LAW #19 / the path key**: id census zero duplicates at the current tree ✓ (the
  composite path-key design holding at the recursion frontier).

## Fresh axis (beyond her report)

- **The rung-drift re-measure at the treeitem hook**: my computed heights across the
  four density seats read **xs 52.36 / sm 54 / default 55.36 / lg 57.56px** — a
  monotonic per-rung drift (~1.4–2.2px steps) at a DIFFERENT measure surface than her
  17.5/18/18.5/19.2 inner-row digits (my hook includes the row box; hers the label
  line). Both surfaces agree on the LAW the reword now teaches: the paint is
  density-reactive, nothing pins it. (Instrument note for the fleet: "row height"
  digits on this family are hook-dependent — the reword's numbers should be read as
  the label-line measure.)

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (all three of her Finding-1 seats closed) |
| family lane | tree-view.svelte :268 cx + tree-view-multiselect.svelte :133 cx ERRORs remain — the recorded standing class (family-lane twins of the page clone her report flagged; the page is clean, these stay with the family ledger) |

## Process evidence

- Port **5242**: wrapper + listener 27154; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Walk state died with the probe browser.
- Probe faults owned: (1) my first density-drift read keyed the section wrapper's
  height (73/295px monsters — whole sections) before re-pointing at the treeitem
  inside each density seat; (2) the walk needed the focus-first anchoring (her lesson,
  applied pre-emptively).
- Artifacts: /tmp/t117/{probe-b.mjs,b.json,scheck.log,lsof-after.txt}.

## Open questions

1. The family-lane cx twins (tree-view.svelte :268, tree-view-multiselect.svelte
   :133) remain the standing ledger class — recorded, not chased; they join the
   shared-util consolidation queue.
