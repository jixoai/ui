# Report 11 — dropdown-menu, REVIEW (1st, vellum)

agent: vellum · 2026-09-22 · route
`apps/www/src/routes/docs/components/dropdown-menu.html/` + curation
`src/lib/ui/props-table/docs/dropdown-menu.docs.ts` + re-pin
`test/fixtures/docs-ambient-vocabulary.matrix.json` + `test/docs-ambient-vocabulary.spec.ts` ·
coder quill (integrated 304e4064) · law: mdn-doc-style §5 + §6 + LAW #14 ·
reviewer #2: marginalia. All claims re-derived: source, raw SSR bytes, live
probes on :5242 (panel-opening probes under LAW #14 — 600ms settle +
double-read).

## Verdict: PASS

0 BLOCKER · 0 MAJOR · 1 MINOR · 1 NIT. All four consumed-axis claims
re-derived (density, elevation in depth; radius's dual-form at the byte
level; shape via the css read), the theme-split measured within one widget
with a bonus frozen/flip token pair, the dock receipt re-counted (21, not
14 — see MINOR), the matrix re-pin is honest and narrowly scoped, and the
EXTRA arithmetic is exact.

## The four consumed axes (re-derived)

- **density — CONSUMED, measured**: trigger min-block-size **32px at sm /
  48px at lg**, items **32px / 48px** in the open panels, riding `--jx-hit`
  (the resolved ladder tracks per rung); the item font steps 12px → 15px.
  The **inherit-then-provide provider** measured: the item carries the rung
  (`data-density` sm/lg on the panel) through the same contract — "items
  resolve their own stamp" is live-true. The number lane is inert per the
  declaring-element law (unprobed here — no number demo — but the row's
  mechanism text matches the kernel's substitution law verbatim). The
  read channels verified in source: the trigger rides the jx-html-input
  law and items read `--jx-hit`/`--jx-text`/`--jx-line`
  (dropdown-menu.css:39-44).
- **elevation — CONSUMED, the OWN level2 vs level4 pair re-derived** (all
  three legs differ, measured): `--jx-elevation-effective` **3 vs 8**;
  surface fills **oklch(0.96 0 0) vs oklch(0.92 0 0)**; shadow recipes
  `0 1px 2px/0.3, 0 2px 6px 2px/0.15` (3dp) vs
  `0 2px 3px/0.3, 0 6px 10px 4px/0.15` (8dp). SSR stamps: 29 panels carry
  the level2 pair, 2 the level4 pair — the OWN default is the fleet-wide
  rung and the explicit level steps the theme table exactly as the row
  says.
- **radius — the DUAL-FORM verified both halves at the byte level**:
  explicit → `--jx-radius-effective: var(--jx-radius-medium)` stamped on
  the anchor panel + consumed `calc(var(--jx-radius-effective, 0px) *
  var(--jx-radius-factor-effective, 1))` (the anchor form), computing
  8px; auto → the consumed var is the **§3 concentric calc verbatim**
  (`max(0px, calc(var(--jx-radius-effective, 0px) − var(--jx-inset-effective, 0px))) × factor`, 61 panels) and computes **honestly 0px** at
  the root invariants — the page's "honestly 0" claim is measured-true.
- **shape — CONSUMED**: `.jx-menu` paints `corner-shape: var(--jx-shape-
  effective, round)` (dropdown-menu.css:28) — read in the breadcrumb
  round, unchanged; the row's mechanism is the family's real read.

## THEME-SPLIT within one widget — measured both halves

One widget (the axes dark island, panel opened per LAW #14, 600ms +
double-read): **panel flips raw** — bezel fill `--jx-elevation-surface` =
`oklch(0.185 0 0)` under the island (the dark profile; the light level2
surface measured `oklch(0.96 0 0)`), panel ink `--popover-foreground` =
white, item focus `--ring` = the dark rotating formula
(`oklch(0.7044 0.1872 calc(23 − 4))`); **trigger chrome stays FROZEN** —
ground `oklch(1 0 0)` byte-identical across reads, `--jx-background` =
light. BONUS pair measured at the same panel: `--jx-popover` =
`oklch(1 0 0)` FROZEN (the stylex alias) while raw `--popover` =
`oklch(0.3211 0 0)` flipped — the strongest possible exhibit of the
stylex-:root vs raw-scope split the page's theme table names.

## The dock receipt — RE-COUNTED: 21, not 14

The claim "the page's own SSR carries 14 composed instances at density xs"
is **stale**: the current SSR carries **21** dock axis-menu instances —
3 docks (the lab, "the consumed lanes", and the query canvas — dock id
`dropdown-menu-query` was added with the query case) × 7 axis menus each
(size, density, shape, radius, color, elevation, motion — theme left out
per the census), **all 21 at `data-density="xs"`**. The density-xs half is
TRUE; the count is not 14 under any slicing I found. **MINOR — update the
count to 21** (or scope the sentence: "the lab and axes docks alone carry
14" — 2 × 7 = 14 reconstructs exactly if the query dock is excluded; the
page should say which).

**Composed-consumer naming — import-grep TRUE**: all five composers
import the family — breadcrumb/breadcrumb-dropdown.svelte,
menubar/menubar.svelte, navigation-menu/navigation-menu.svelte,
button-group/button-group.svelte:253-254, component-canvas/
canvas-playground.svelte:185-186.

## The matrix re-pin — HONEST

- **Removed**: dropdown-menu's two t0 pins (variant own-`auto`, density
  scope) — orphaned BY CONSTRUCTION: the checker skips meta-driven
  PropsTable calls (no props expression → no parseable rows), so the t0
  candidates ceased to exist when the table went meta. **Replacement gates
  named and real**: `verify:meta` exists (repo package.json:22,
  component-metadata-gen --check) gating the meta-side ambient facts, plus
  the 110-page universal manifest; the curation's zero-content-drift is
  separately pinned by test/props-table-meta-drift.spec.ts.
- **The t2 exemption is NARROW**: `route === 'dropdown-menu' &&
  c.tableIndex === 2` with an inline evidence comment — scoped to the
  per-axis MECHANISM table only (the campaign's consumption/supply rows,
  outside the ambient economy the matrix guards); the item hand table's
  density row keeps its t1 entry, and my avatar table[1] re-pin rode
  through the same landing intact.
- **Ambient solo re-run by me: exit 0, 284/284** — the expected count.

## Standard review

- **Tier 2 justified** — the demo canvas, playground, platform/component
  split and a11y table survive; the skeleton gained Overview, the
  generated props table, the per-axis table and the query case (the
  commit's own claim, verified against the diff shape).
- **Archetype order** — hero → install → overview → usage → live demo →
  props → axes → accessibility → see-also ✓.
- **toc 6/6** — overview/usage/dropdown-menu-demo/api/axes/accessibility
  each ×1 in raw SSR; dead ids (types/theming) gone.
- **EXTRA arithmetic 16−8+0=8** — meta = 16 props (id, density,
  triggerLabel, placement, variant, size, shape, radius, color, theme,
  elevation, motion, trigger, panelClass, onToggle, children); family
  table renders exactly 8 rows ✓; the item hand table (3 rows) rides
  below with its density row pinned at t1.
- **query() §6** — two-generic in stage and drawer; type-checks clean;
  flip measured both directions (32/48/32 min-block-size + the rung attr).
- ** declaring-element + receipts** — supply rows (size/color/motion)
  carry the house negative-grep form; my grep re-derives: zero
  `--jx-size-effective` / `--jx-color-effective` / `--jx-motion-effective`
  readers in ui/dropdown-menu/. The consumed rows name the family's own
  css reads (verified: corner-shape :28, the concentric calc :32-33, the
  hit/inset/text/line lanes :39-44).
- **吃也供** gloss present in raw SSR (the overview's radius sentence).
- **LAW #14** — panel-opening probes awaited 600ms (> 150ms surface +
  100ms item transitions) with double-reads; the trigger chrome's
  byte-identical double-read is the frozen receipt.

## Findings

1. **MINOR — the dock receipt count is stale: 14 → 21.**
   The page's overview says the composers "all mount it" (true) and the
   review brief carries "14 composed instances at density xs"; the current
   SSR carries **21** dock axis-menu instances (3 docks × 7 axes — the
   query canvas's dock joined after the count was written), all at xs.
   Fix: "21 composed dock instances (3 docks × 7 axis menus), all riding
   density xs" — or scope the sentence to the two docks that reconstruct
   14.
2. **NIT — the elevation demos' own-default panel is not visually
   distinguished from an unset panel.** `axes-e-own` passes no elevation
   prop, so "own level2" renders identical to an omitted lane; the
   distinction lives only in the caption. A one-line style-attr receipt in
   the caption (or the panel id in the caption text) would make the OWN
   claim curl-checkable like the radius demos' stamps. Fix: caption
   "level2 · own — inspect the panel's --jx-elevation-effective: 3".

Zero BLOCKER/MAJOR — justified: the four consumed-axis claims, the
theme-split, the dock count's density half, the re-pin and the arithmetic
all reproduced from independent evidence.

## Gates (re-run this review)

| gate | result | tail |
|---|---|---|
| ambient vocabulary SOLO | exit 0 | **284/284 passed** — the expected count |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| `verify:docs` | exit 0 | skeleton lint green |
| svelte-check page-scoped | 1 error | `91:28` cx `Object.entries` — the fleet idiom debt; query() two-generic type-checks clean |

## Process evidence

- Port :5242 empty before (lsof exit 1); wrapper PID **85998** (log
  /tmp/vellum-11-dm-vite.log); killed by PID; `lsof -ti :5242` → empty
  (exit 1); wrapper dead; no orphan.
- Probes: /tmp/vellum-11-dm-probe2.mjs (density/elevation/radius/theme/
  query — LAW #14 double-reads), probe3.mjs (query-panel items at both
  rungs + the dark bezel surface), diag.mjs. SSR:
  /tmp/vellum-11-dm-ssr.html (1,007,153 bytes). Gate logs:
  /tmp/vellum-11-dm-{tw,univ,docs,scheck,amb}.log.
- Test pins read BEFORE review: composition-c, defaults-nav-providers,
  batch2-components, density-adoption-menus, table-grid-toolbar,
  docs-structure — all family/chrome pins, none constrain this page's
  prose; the ambient matrix pins ARE the re-pin under review.
- My locator lesson re-learned and banked: the DropdownMenu `id` prop
  lands on the PANEL (the promoted root — the page says so), the trigger
  is `[popovertarget="<id>"]`; first probe died clicking a hidden panel.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
