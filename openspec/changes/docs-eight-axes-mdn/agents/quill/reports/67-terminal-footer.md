# TASK 67 — CODE terminal-footer.html (quill, 2026-09-22)

**Tier 2 (archetype rebuild).** The 230-line page had the family story right
(composition-first, the ghost recipe, the free-children law) but violated the
eight-axes archetype structurally: no install/overview/live-demo/see-also, the
old pre-firstpaint section set (ghost-recipe, theming-before-api), a
hand-listed ToC of six with the trio misplaced, an unmeasured TokenTable, an
axes section that was one prose sentence, and no query() seat. Tier 2 not 3:
the family is untouched (composition-first was already correct) and the page's
ghost-recipe content folds forward. Two files changed, both page-level:
`apps/www/src/routes/docs/components/terminal-footer.html/+page.svelte` and
`+page.ts`. NO commits.

## What changed

1. **Archetype rebuild** (progress.html exemplar): hero (h1 ×1) → `#install`
   (DocsInstall) → `#overview` (law-notes: the platform landmark, the ghost
   recipe + theme split, the all-no-own axes + kinship) → `#live-demo`
   (playground: ghost word text, second-column toggle, © live-year/authored
   segmented) → `#terminal-footer-base` (W3C foundation) → `#types` →
   `#usage` → `#theming` (DensityDemo + measured TokenTable) → `#api` →
   `#universal-props` (measured axes table + receipts + query() seat +
   specimens) → `#accessibility` → `#see-also` (DocsSeeAlso). ToC == DOM 9/9,
   chrome OUT, trio LAST (probe PASS: `overview, live-demo,
   terminal-footer-base, types, usage, theming, api, universal-props,
   accessibility`).
2. **Axes table**: 8 measured/grepped rows (below).
3. **query() seat**: `query({ md: 18 }, 13)` on the size lane (the free text
   echoes it; the ghost stays clamped).
4. **EXTRA-lane by name**: this family is the anti-progress — the components
   are NOT rest-less. The api section enumerates the declared surface (12
   named shell props: ghost, copyright, children, class, style + the eight
   axes; 3 column props: title, children, class) and states the passthrough
   law: `{...rest}` forwards onto the real `<footer>`/column elements
   (HTMLAttributes passthrough, the `color` ATTRIBUTE withheld — the color
   AXIS is not), so the footer is attribute-transparent.
5. **THEME-SPLIT at the element, and a host lesson**: measured, three layers —
   (a) the family carries NO shell-theme literal (the split vs the bezel twins
   header/card, per the defaults file and measured class:dark stamping);
   (b) under a `.dark` scope the ghost's STROKE re-derives — color-mix over
   var(--border), `1px oklab(0 0 0 / 0.55)` → `oklab(1 0 0 / 0.55)` — while
   the meta/title ink keeps its light `--jx-muted-foreground` (the --jx-* set
   is :root-only — frozen): a split INSIDE the component; (c) the HOST
   decides first: the component-canvas stage pins a `data-theme="light"` +
   `.jx-light` island — under `html.dark` the page's --border flips white
   (measured oklch(1 0 0) at body/main) yet the served demo footer stays
   black-stroked (the island re-pins light at the stage), and the SAME
   rendered footer cloned to body level re-derives the white stroke. The
   delivery-shape answer: the stamp lands on the canvas stage; location
   beats the prop.
6. Ghost recipe receipts added to the overview: 140.8px at 1280 (11vw under
   the cap), 144px at 1600 (the 9rem cap), transparent fill, 1px stroke at
   55%, the @supports fallback (unlayered carve-out), aria-hidden +
   user-select none.
7. **KEYED-EACH/mounted-children**: the page's one conditional (the second
   playground column) rides `{#if}`; the family renders children via
   `{@render children()}` (mounted-children law held); no keyed loops needed
   (no repeated rows on this page). **LAW #19**: ToC == DOM, zero duplicate
   ids, the skip-link resolves to the scaffold main (zero dangling hashes).

## Measurements (probe receipts, served DOM at :5241 — 22/22 family + 5/5 chrome, three consecutive GREEN battery runs)

- **Shell**: 90rem cap measured 1440px, auto margins center it (left 80 at a
  1600 viewport); padding seams 16px base → 24px at 40rem → 32px at 64rem
  (measured at 600/800/1280); block steps 32/40. The tl-shell pattern is
  real and seam-correct.
- **Ghost**: aria-hidden + user-select none; transparent fill; 1px stroke of
  the border tint; clamp fires (140.8px @1280, 144px @1600); the ghost does
  NOT move under a component font-size stamp (viewport/root-relative).
- **Meta row**: flex wrap, space-between, 24/8 gaps, 12.5px voice; column
  title 11px uppercase with measured tracking 1.54px
  (calc(var(--jx-track-wide) × 1.75) = 0.88px × 1.75); © line defaults to the
  live year.
- **Free-link hover**: muted oklch(0.3211 0 0) → primary (measured both
  sides), transition `var(--motion-150) var(--motion-ease-out)` = 0.15s
  ease-out; **the seam governs** (a `--motion-150: 2s` injection re-timed the
  computed duration to 2s); **RM-safe** (0.15s preserved under RM emulation —
  a color transition has no motion path; no kill authored, none needed).
- **Axes**: all no-own (zero effective-carrier readers, grep). Density
  paint-invariant (identical shell at 2xs/lg — heights, paddings, cap).
  Size = inherited echo on the free text (30px © line under a 30px stamp),
  ghost immovable. Shape/radius: measured 0px corners, no card surface.
  Elevation: box-shadow none. Color: the hover is the only brand paint; the
  hue digits rotate with the runtime (oklch 0.6489 0.237 at hues 124/165/185
  across loads — L/C quoted, hue never).
- **Native a11y**: the footer landmark is implicit; the ghost is
  tree-hidden; column titles are spans (no heading semantics — receipted in
  the a11y table); links are real anchors in composed order.

## Family defects / observations (receipted, not chased — zero family edits)

1. The ghost stroke under a page-level dark is invisible-on-dark IF the page
   ships the footer outside a light island AND without a theme stamp — the
   stroke only re-derives under a `.dark` scope. On this site the docs shell
   is canvas-island-pinned light, so the demo never shows it; the real site
   chrome decides its own ground. Worth one line on the tokens page if the
   `--border` dark value is ever revisited (family-lane, INFO).
2. The component-canvas `data-theme="light"` island is now MEASURED as the
   theme-split's host mechanism (it was the canvas-pinned ground suspicion on
   website-scaffold's lane — the ground pins the stage, not the page).
   Cross-family consequence for terminal-header/card demos: their dark-locked
   shells are island-safe by construction.

## Gates (repo root unless noted)

| Gate | Result |
|---|---|
| verify:tailwindless | GREEN — receipt VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check page-scoped | **0 diagnostics on terminal-footer.html/+page.svelte and +page.ts** (one bind fix during authoring: PlayToggle binds `value`, not `checked`). Family standing debt unchanged and untouched: 8× `state_referenced_locally` warns (:114) + cx-typing errors (:129/:36) + scenes/terminal-footer ×2 — pre-existing |
| docs-ambient-vocabulary solo (apps/www) | 284/284, exit 0 |
| Probe battery | chrome 5/5 + family 22/22, consecutive GREEN |
| Mirror law | `cmp` byte-identical across registry/files/ui/terminal-footer/ ⇄ apps/www/src/lib/ui/terminal-footer/ (6/6 files — zero family edits) |
| SSR | page 200; h1 ×1; toc 9/9; universal marker ×1; dup ids 0; old-section ids gone (ghost-recipe folded into overview) |

## Process evidence

- Port **5241**: `lsof` EMPTY before; dev server started for the session
  (vite PID 89690); after gates killed by PID; **port 5241 EMPTY after** (a
  sibling's :5242 vite was visible in ps — untouched).
- **NO commits, NO pushes.** Zero product-tree edits; the family files and
  their registry mirrors are byte-identical to HEAD.
- Sibling noise receipted, not chased: vellum's toast.html, marginalia's spin,
  scribe's tags-input are in flight; one mid-session HMR reload destroyed a
  probe context (retried green) and an earlier full-page capture came back
  dark-themed — the same served-theme churn already receipted at task 53; the
  measurement battery is churn-resistant by design (theme pinned pre-load,
  colors calibrated per burst, DOM-verified interactions).
- Artifacts: /tmp/tf-probe.mjs, /tmp/tf-chrome.mjs, /tmp/tf-seam.mjs,
  /tmp/tf-ancestor.mjs (the ancestor walk that named the island),
  /tmp/tf-dev.log, /tmp/svelte-check-tf2.txt.

## Open questions for the reviewers

1. The api table's `…rest` rows use the ellipsis CHARACTER in a `name` cell
   (PropsTable keys on prop.name — unique ✓); if the fleet prefers a different
   convention for passthrough rows (`...rest` vs "rest"), it's a one-line
   follow-up.
2. The canvas light-island is now measured on terminal-footer's lane; if the
   fleet wants dark-mode demos verifiable in place, the canvas would need a
   data-theme passthrough (component-canvas family change — Owner's call,
   cross-family).
3. Ghost hue-rotation: the stroke tint follows --border (achromatic), so the
   ghost is hue-immune — only L moves across themes. No action; recorded for
   the token-lab lane.
