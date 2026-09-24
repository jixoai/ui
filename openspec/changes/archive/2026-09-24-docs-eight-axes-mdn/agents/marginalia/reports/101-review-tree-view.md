# T101 — FIRST REVIEW tree-view.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 1 LOW / 0 NIT**. Tier proposal: **Tier 2**
(the APG tree keyboard contract demanded a per-press census, the recursion ARIA ran to
241 treeitems across 27 trees at levels 1–5, and the extension surface (resolvers,
cascade, disabled subtrees) needed behavioral receipts on top). Independence law kept:
findings formed from my own source reads (the 766-line page, tree-view.svelte 525, the
multiselect's cascade markers) and four probe passes on port 5244 BEFORE any report
reading; no other tree-view review exists. NO commits, NO pushes. Zero family edits.

## Verified — the claim bank

**The tree keyboard contract — EVERY press receipted on real keys.** Focusing the
basic tree's first row, then walking: ↓ moves Leads → Leads/New Lead → Leads/Contacted
Lead; ↑ walks back; ↑ to the Leads folder → **→ jumps into its first child (New
Lead)**; **← returns to the parent (Leads)**; **← collapses the expanded folder**
(aria-expanded flips false); **→ re-expands**; Home → **Leads**, End →
**Activities/Emails** (the last VISIBLE row — the walker skips collapsed extents by
construction, `visibleItems()` filters `closest('[data-collapsed]')`); **Enter toggles
the folder** (expanded flips); **Space selects the leaf** (aria-selected moves to
Leads/Contacted Lead). The a11y table's five key rows and the law section's full APG
paragraph reproduce press-for-press.

**Roving tabindex.** Exactly ONE tab stop per tree; the initial stop is the
**selected** row (`Leads/New Lead` — initialStop = selected ?? first node), and the
stop FOLLOWS focus (after the walk, the focused row is the only tabindex=0 — measured
`isFocused: true`).

**Recursion + ARIA at scale.** 27 trees, **241 treeitems**, 85 groups on the page;
`aria-level` on every item (levels 1–5 served — the org chart's five-deep chain);
`aria-expanded` folders only; `aria-selected` leaves only and mirroring the controlled
path; `aria-label="tree"`. SSR ships the full tree (241 items, aria-level ×241) — the
no-JS page still reads as a tree.

**LAW #18 at the recursion frontier — the path key.** The recursive each keys
`(parentPath === null ? node.name : parentPath + '/' + node.name)` — the composite
PATH id at every depth: same-value siblings cannot collide, 241 items zero duplicate
ids. The steps-99 content-key hazard and the timeline composite-key precedent both
resolved by the path-key design. The same path semantics flow everywhere: selection
ids, expanded ids, the multiselect cascade, ctx.id.

**Multiselect cascade — tri-state live.** Initial state: all four folders **mixed**
(aria-checked="mixed" + data-mixed) over 5 pre-checked leaves. Checking the Billing
folder cascaded over its enabled descendants (**checked count 5 → 7**); unchecking a
leaf flips the folder back to mixed. The extension drives through the core's
onactivate seam (Space/Enter flow the same path).

**Suffix actions + the disabled subtree.** Row hover reveals the suffix (opacity 1,
pointer-events auto, 2 buttons); clicking **Add** fires the resolver handler
(canvas output: **"last action add → src"**) and **the row does not toggle** (the core
skips interactive descendants). The **archive subtree ships inert**: the group carries
`inert` + `data-collapsed` (Playwright literally cannot click it — a 30s actionability
timeout as evidence), the rows carry aria-disabled through the whole frozen subtree
(archive + both children), clicks do nothing, expansion stays closed — "focusable for
screen readers, never activatable" via the frozenPaths law shared by core and
extensions.

**Selection two-way.** The PlaySelect set to `Accounts/Globex Inc/Cloud Migration` →
aria-selected moves to that path in the tree; leaf clicks move it back through
onselect — the controlled `selected` prop is the single truth both directions.

**Extensions.** indent 32 → `--jx-indent: 32px` computed (the one geometry lever);
the resolver demo renders per-file-type snippets (amber/blue/purple/yellow per meta —
measured in the served tree), the org chart's prefix avatars + two-line labels render.

**Structure/battery.** toc == DOM == rail **9/9 in order**; h1 ×1; duplicate ids 0;
SSR byte-stable. **T94 audit**: the family paints by attribute
(`data-collapsed`/`data-disabled`/`data-path`) + `.selected` class — no
`:checked`/`:indeterminate`-shaped pseudo pair; the multiselect's tri-state is
ARIA-checked + data-mixed (attribute paint, spec-clean). **Density**: rows measure
17.5/18/18.5/19.2px across the four rungs at a constant 12px label — see LOW 1.

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 3 ERRORS on +page.svelte.** :387:28 —
   the cx overload (the EIGHTH page clone; the shared-util consolidation note stands).
   :581:13 and :666:11 — the Svelte 5 snippet-type-identity pair: the page's
   top-level snippets returned from `onPrefixSlotRender`/`onSuffixSlotRender` arrows
   fail the `TreeSlotRender` assignment with "Two different types with this name
   exist, but they are unrelated" (the Snippet nominal type differs across the page's
   script boundary). **Runtime is fine** — demo 5's resolver and demo 8's suffix
   render and measured working — so this is typing debt, but it is the page's gate.
   Family standing warns (tree-view.svelte :255) pre-existing, untouched.
2. **[LOW] The theming summary's "row paint rides fixed utilities" does not fully
   hold — a ~1.7px rung drift leaks.** Row heights measure 17.5 / 18 / 18.5 / 19.2px
   across the four density rungs at a constant 12px label font: some internal measure
   (line-height rounding through the ambient chain) is density-reactive. The page
   contradicts itself — the universal-props summary says the rows "ride the ambient
   chain" (which is what the drift shows) while the theming summary says "fixed". The
   `--jx-indent`-is-the-one-GEOMETRY-lever half is true (indent 32 measured). One
   reword (or a clamp on the leaking var) aligns the two summaries with the paint.

**Receipt-only notes (not findings):** the api coverage is the campaign's most
complete — three tables (17 TreeView props, 4 TreeNode fields, 3 multiselect
additions) with no omission found against the interfaces; the depth math
(`path.split('/').length`) would mis-count node names containing '/' — no such data
served and the page claims nothing about it (latent, unfiled); the DensityDemo seat
carries no headings and no ids (the T97/T94 clone classes do not recur).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ fbebbe2b) | RED — sole FAILED seat = **toast** (the recorded red); tree-view in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 3 ERRORS (:387 cx clone; :581/:666 snippet-type identity)** (Finding 1) |

## Process evidence

- Port **5244**: wrapper 56813 started for the session (/tmp/marginalia-101-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Multiselect state restored (Billing re-checked); the suffix/
  archive probes left no DOM state behind.
- Probe faults owned: (1) the keyboard walk must FOCUS a tree row first — a bare Tab
  lands in the page header and every keypress read "A" (an anchor); re-anchored via a
  row .focus() before the real-key census; (2) the suffix reveal read opacity 0 after
  hovering the li — re-hovering the ROW div measured 1/auto (the hover target is the
  row, and my earlier read raced the transition); (3) the archive click times out by
  design — Playwright refuses inert elements, which IS the receipt; re-proven with a
  DOM-click inert check; (4) the multiselect "uncheck" first pressed an already-
  unchecked mixed box (no-op) — the cascade receipt re-taken on the check direction
  (5 → 7 descendants).
- Artifacts: /tmp/marginalia-101-probe{1,2,3}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
