# T111 — grid (docs page) — 1st eight-axes review (marginalia)

**VERDICT: NEEDS-WORK — 1 MAJOR / 1 MINOR / 1 LOW / 0 NIT — Tier 2 proposed**

Owner = scribe; 1st review (vellum holds the 2nd). Independence: my own reads
+ probes only. Page: `apps/www/src/routes/docs/components/grid.html/+page.svelte`
(261 lines). Family read in full: `grid.svelte` (176), `grid.stylex.ts` (65),
`grid-defaults.svelte.ts` (40), `index.ts` (5). **Registry twins byte-checked:
all 4 files cmp-identical** (grid ships no css file on either side).

Process: port 5244 mine (pre-check rc=1, killed at end — lsof post_rc=1, no
orphans). Probes /tmp/marginalia-111-probe1.mjs + probe2.mjs. Dist 9f70476b.
No fixes applied.

---

## 1. Verified TRUE with digits

- **Blowout-proof tracks**: the workbench grid at cols=3 computes
  `271.328px 271.328px 271.344px` — the first cell carrying
  "a-long-unbreakable-identifier" measures the SAME width as its siblings
  (271/271/271); at cols=6: `131.656px × 6` all equal. The minmax(0, 1fr)
  law holds live: a wide child surrenders, never the siblings.
- **Gap ladder**: gap="8" → computed gap 8px over `--jx-space-8`; the gap
  union is exactly the 16 rungs 2…80 (source GRID_GAP_RUNGS :60-63) — the
  theming table's "16 rungs" TRUE.
- **data-jx-grid hook present; data-density ABSENT at auto** (the no-opinion
  stamp law visible).
- **A11y**: the rendered a11y table says "No ARIA surface: the grid is
  transparent layout" — the component renders a plain div, no role ✓.
- **LAW #18**: the workbench's `{#each Array(cellCount) as _, i}` is UNKEYED
  over static index cells — no key-collision habitat (the cells carry no
  per-item state). Noted, not a finding.
- **All-no-own defaults** (grid-defaults :31-40, eight no-own slots) ✓ the
  universal-props "FIRST-TIME contract, all no-own" claim; carriers stamp on
  the grid root; structural props (cols/rows/gap) never ambient ✓.
- **Rendered API table: [5 rows]** (cols/rows/gap/children/…rest) and NO
  axis table (no `universal` attr) — consistent with "Four structural props
  plus the HTML rest"; the axes are documented in the universal-props
  section. No omission finding.

## 2. Findings

**MAJOR-1 — the disclosure demo does not disclose: the lane computes 70px in
collapsed, open, AND re-collapsed states.** The section's entire point
(:197-198): "Grid can animate a row's height between zero and full … the
content keeps min-height: 0 / overflow: hidden." The live demo (:208-214)
renders its lane content as `<div class="rt.panel rt.p12 rt.text12">` — which
carries NEITHER `min-height: 0` NOR `overflow: hidden` (computed:
overflow "visible", minHeight "auto"). Measured across a real button toggle
(probe1): `rowsCollapsed: "70px"`, `rowsOpen: "70px"`,
re-collapsed `"70px"`; lane height 70px in all three states — the 0fr track
floors at the content's min-content height (auto minimum), so the demo's
lane never collapses and never animates. The API row's promise "collapse =
the 0fr track (hidden)" (:251) is equally falsified by the page's own
exhibit. The component's atoms are correct (stylex :37-38 emits 0fr/1fr —
computed reads resolve to used px, which is why the failure reads as 70px);
the missing half is exactly the requirement the summary states and the demo
omits. T93 zero-script class: the showcase feature shows nothing. Fix shape:
add `min-h-0 overflow-hidden` to the demo's lane content (one class list) —
or better, have the component wrap children in a min-h-0/overflow-hidden
cell when `rows` is set, so every consumer gets the honest animation the
copy promises.

**MINOR-1 — the toc's first anchor is dead and the order drifts.** Authored
+page.ts leads with `{ id: 'tracks', label: 'Blowout-proof tracks' }` — no
`#tracks` id exists in the DOM (the section is `grid-workbench`, :156, which
is NOT in the toc). Live targets census: `tracks → false`, all others true.
Order also drifts: the rail reads tracks → disclosure → usage …, the DOM
reads usage → grid-workbench → disclosure. T105 class (dead anchor +
unrail-ed section + drift). Fix shape: rename the id or the toc entry, and
order the toc to the DOM.

**LOW-1 — open cx joiner seats (new information).** Page :91-103 (seat
:99:28) and the component :105-117 (seat :113:28 — its
`(object | undefined | string | false)[]` signature breaks `Object.entries`
narrowing). First surfaced by this review — the fleet closure did not reach
this family. Fix shape: the transfer predicate, both trees.

## 3. Notes

- Sibling-differential (dispatch): the rig pages (prototype-grid etc.) were
  vellum's; nothing contradictory observed from this side — the grid family
  is the two-dimensional primitive and the page stays in its lane.
- The rest-spread semantics copy ("consumer attributes replace, never
  merge") is loose (class merges through cn, style merges into rootStyle)
  but not falsely exclusive — noted, not filed.
- LAW #19: no DensityDemo on the page (the workbench drives cols, not
  density). Reveal wrappers present; walk 7/7 sections painted.

## 4. Probe-fault ownership

- Probe1 died mid-batch on a Vite dep-optimization full reload ("Execution
  context destroyed" + a networkidle timeout on the next goto) — my
  waitUntil choice on a dev first-compile; probe2 switched to `load` +
  generous settles. No finding data was lost (grid API rows re-read in
  probe2).

## 5. Gate record (batch-wide, once)

- ambient solo: 284/284, rc=0. docs-universal: GREEN 110/110, rc=0.
- svelte-check: grid page 1 error (:99) + component 1 (:113) — filed LOW-1.
- `npm run verify:docs` (dist 9f70476b) → **rc=0, GREEN — the toast red is
  gone at this dist (the scribe's T71 landed)**; staged scope green.
- Server killed: lsof :5244 empty (post_rc=1), no orphans.
