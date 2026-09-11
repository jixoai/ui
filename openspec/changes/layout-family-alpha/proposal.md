# Proposal: the layout family, alpha track (layout-family-alpha)

## Why

The design studio (design-studio-r2 §6, Owner ruling 2026-09-11)
needs three standardized layout primitives — Flex, Grid, Waterfall —
as the vocabulary its property panel edits live ("属性面板对标准
属性即时微调"). They are the FIRST alpha-track items: components
that ship through the standard registry pipeline while wearing an
`alpha: true` meta stamp, so the community can `shadcn add` them
today and the design tool can rely on their prop vocabulary staying
standardized.

The alpha track is also the stamp mechanism's family bet
(design-studio-r2 §3): every one of the three components is
SINGLE-ROOT + `{...rest}` spread — the structural precondition for
the studio's dev-only element stamping. This change is the family's
in-repo self-proof.

## What Changes

- **ADDED spec domain `layout-family`** — the alpha-track layout
  primitives contract: the standardized prop vocabulary
  (Flex: direction/wrap/align/justify/gap; Grid: cols/rows/gap/areas;
  Waterfall: columns/gap/strategy), the inline-style-only styling
  posture (zero Tailwind, zero theme tokens — any host renders
  them), the single-root + rest-spread law, and the alpha meta
  stamp. A separate domain (not a component-authoring MODIFIED)
  because the inline-style posture is a deliberately DIFFERENT
  styling lane from the utility-first Tier-1 law — alpha components
  must run in hosts that never installed the jixoai token sheet.
- **Three registry items** under `registry/files/ui/`:
  `prototype-flex`, `prototype-grid`, `prototype-waterfall` — each
  one component file + pure barrel, zero registryDependencies, meta
  `{ group: "layout", href: …, alpha: true }`.
- **The www mirror + docs pages** (the standing laws apply to alpha
  items unchanged): byte-mirrors under `apps/www/src/lib/ui/`,
  mirror-manifest regeneration, one minimal alpha docs page each,
  `svelte.config.js` entries, and the docs-structure taxonomy
  snapshot re-freeze (layout 16→19, 103→106 ui items).
- **The acceptance suite** `apps/www/test/prototype-layout-family.spec.ts`:
  props→inline-style mapping (1:1, no vocabulary translation layer),
  rest spread landing `data-*` on the single root, children
  rendering, and the alpha stamp contract.

## Impact

- Specs: new `openspec/specs/layout-family/spec.md` (ADDED
  requirements; shared component laws — props discipline,
  composition-first, data-jx hooks — are REFERENCED from
  component-authoring, never re-stated).
- Files: `registry/files/ui/prototype-{flex,grid,waterfall}/**`,
  `registry.json` (+3 items), `apps/www/src/lib/ui/prototype-*`
  mirrors, `apps/www/mirror-manifest.json` (regenerated),
  `apps/www/src/routes/docs/components/prototype-*.html/**`,
  `apps/www/svelte.config.js`, `apps/www/test/docs-structure.spec.ts`
  (snapshot), `apps/www/test/prototype-layout-family.spec.ts`.
- Gates touched: `verify:mirror` (manifest), catalog + docs-structure
  specs, the new suite. `verify:context` untouched (no Defaults
  contract owed — see design §4). No existing component, spec text,
  or public API changes.
- Not in scope (v0, per design-studio-r2 §6): Waterfall strategies
  beyond `'balanced'` (CSS columns only — no JS measurement), the
  `@jixoai/ui-prototype-plugin` design-tool-side package (the
  product branch consumes these items by rebase), and the stamp
  mechanism itself.
