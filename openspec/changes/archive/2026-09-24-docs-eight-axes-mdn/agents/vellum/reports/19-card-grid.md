# TASK 19 — CODE card-grid (vellum, 2026-09-22)

**Tier: 2** — the page was content-rich docs-demo-standard (interactive
min/opt-out canvas, subgrid-law, types, a11y, theming DensityDemo,
meta+curation api all real) but lacked Overview, the per-axis table and
a query() case. Gaps filled; every real demo kept; the universal-props
demo folded into the axes section. NOT gaps-only: the page carries no
page-table pins (card-grid.spec pins the family CSS law, meta-drift
pins the meta — neither lives on the page), so a tier-2 rewrite was
safe, and the integration-diff-as-receipt form does not apply.

## Diff (mine)
- `card-grid.html/+page.svelte` — rewritten: archetype order (hero →
  install → overview → usage → demo canvas → subgrid-law → types →
  a11y → theming → axes → api → see-also); Overview added (the landlord
  story + the layout kinship: grid/stack ride the same fixed space
  ladder; leaf-mount + composes-nothing receipts); per-axis table added
  (measurement-first rows below); query() case added; the density and
  theme rows carry the measured two-half and bridge-only stories; cx
  predicate applied; the stray "ToC rail" comment cleaned.
- `card-grid.html/+page.ts` — toc rebuilt (8 ids; overview added; the
  universal-props demo folded into axes).
- `props-table/docs/card-grid.docs.ts` — the stale header ("all three
  rows") refreshed to the 12-prop meta truth; rows untouched (prose
  curation, nothing hidden).

## Measured mechanism rows (all probed, all cited in the page)

- **density = SUPPLY-ONLY ON SELF, CONSUMED BY COMPOSITION — both
  halves measured.** ON SELF: the grid's own gap is **20px at xs/sm/
  default/lg** — `--space-20 = calc(var(--jx-unit) × 5)` and
  `--jx-unit` is declared at `:root` only (jixoai.css:1233), which no
  rung scope re-bases (the declaring-element law). ON THE TENANTS: the
  rung scope re-bases `--jx-inset/--jx-stack/--jx-text` — measured
  section-card header padding **12px (xs/sm) / 16px (default) / 20px
  (lg)**. The watch-item's suspicion ("density consumption may be
  genuine here") resolves precisely: genuine for the COMPOSITION,
  inert for the landlord.
- **size = the heading-contrast case, confirmed**: the §11 echo lands
  verbatim (`--jx-size-effective: 14px; font-size:
  var(--jx-size-effective, 1rem)` in SSR), the root computes 14px, and
  nothing follows — the grid's paint is structural, the tenants' voices
  are fixed `--text-*` steps.
- **theme = BRIDGE-ONLY**: the `.dark` class lands on the section root;
  the grid's own paint has nothing theme-able; measured a Card tenant
  under the bridge holding its light paint (the typed-layer frozen
  pole) — the grid supplies the island, the guests speak through their
  own emission forms.
- **motion = the family's OWN law, outside the axis**: the IO-armed
  entrance verified end-to-end (scrollIntoView → `.is-entered` lands →
  cascade completes to opacity 1 / transform none; 70ms × index capped
  at 8; reduced-motion + html.js no-JS visibility documented). The
  carrier `--jx-motion-effective` is unread (grep).
- **shape/radius/color/elevation**: supply-only, grep receipts (zero
  corner/box-shadow/hue reads in ui/card-grid/).

## EXTRA arithmetic — corrected mid-write by the served count

12 meta rows − 8 ambient axes = **4 family rows** (min, foot, class,
children). The dispatch's "synthesized rest" does NOT occur here: the
family spreads no `...rest` (the children snippet + min/foot are the
whole surface), so from-meta synthesizes no rest row — counted from the
served tables (4 + 8), not assumed. The api summary states it; the
curation's stale "all three rows" header refreshed.

## Kinship (the dispatch's watch-items)

- `grid` and `stack` are the sibling layout primitives — grid.stylex
  rides the same `--jx-space-*` ladder for gaps; card-grid's ONE owned
  var is `--jx-grid-min` (the collapse width). Layout families are
  supply-only-on-self by construction; named in the Overview.
- Composition, both directions: card-grid mounts no component (types/
  utils/kernel imports only); the fleet mounts it only in
  `blueprints/scenes/card-grid.svelte` (a demo scene). Leaf both ways.

## Gates

- Affected specs solo BEFORE: card-grid + card + meta-drift
  **73/73** · AFTER: **73/73** (identical)
- ambient solo AFTER: **283/283** (the scribe's color-picker conversion
  settled — no sibling-attributed failures remained)
- page-scoped svelte-check: **ZERO diagnostics** on +page.svelte
  (fleet 1615/1030, sibling churn)
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green
- SSR: HTTP 200; h1 = 1; toc 8/8 ids, order == DOM; density=sm stamped
  ×19; the size stamp verbatim ×5; served api rows 4 + 8.

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 8297 → vite 8331;
  BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push. My diff: the three files above; siblings'
  in-flight files untouched.
- Probes: /tmp scripts (gap-inertia per rung, tenant padding per rung,
  size echo, dark-bridge cross-family, entrance cascade end-to-end);
  SSR snapshots /tmp/vellum-19-cg-*.html; logs /tmp/vellum-19-cg-*.log.
- LAW #14 vindicated twice on my own probe: the entrance-cascade reads
  (opacity 0, translateY 26px) were mid-cascade artifacts; after the
  full 70ms×i + 420ms settle, opacity 1 / transform none. Await the
  cascade before asserting.
