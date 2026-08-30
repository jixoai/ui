# Proposal: docs-demo-standard — one demo page skeleton, derived from the market leaders

## Why

Market research (`.agents/audit/2026-08-30-site-walkthrough/market-research.md`,
2026-08-30) shows the leading registries win on demo-page CONSISTENCY,
not component count: reui.io (Intro → Install → Examples with
Preview/Code tabs → API table → Credits), shadcn official (composition
trees, ability-named demos), Origin UI (the "with X" variant naming
grammar). jixoai-ui already owns the technical base — component-canvas
(live stage + playground + code drawer), shiki, llms-txt, and a
props table on EVERY page — but the 79 pages drift: duplicate Usage
sections, missing playgrounds, and props tables that are
HAND-MAINTAINED per page (79 copies of the same truth, drifting from
the source interfaces). This change defines the standard, moves props
truth to ONE source, and lands it on the existing pages via a lint,
so every later demo-expansion change has a template to fill.

## What Changes

- **The docs page skeleton becomes law** (spec delta below):
  Intro → Install (`npx jixoai-ui add <name>`, copy-ready) → Usage →
  Examples (ability-named, `with X` grammar, each collapsible
  Preview/Code) → API (props table: Prop/Type/Default) → See Also
  (related component links). The existing ComponentCanvas stays the
  rendering vehicle; the lint enforces the section contract.
- **Variant naming grammar**: demos are named by ability ("with clear
  button", "async loading", "multiple chips") — one phrase, one prop
  or composition capability; registry-level variants (when a demo
  ships as a separate item later) use the suffix convention
  (`<name>-<ability>`), matching the `@reui/date-picker-range`
  precedent.
- **Props tables, one source**: the tables exist on all 79 pages but
  are hand-written arrays. A `PropsTable` source migration picks ONE
  source of truth (build-time extraction from the Svelte 5 Props
  interfaces + JSDoc, OR a per-item manifest, OR lint-checked
  hand-written arrays — the design spike decides with all three on
  the table) and migrates the 12 most-used components' pages to it
  with diff verification against today's tables.
- **Density + theme preview toggles**: the canvas stage gains the two
  standard toggles (density tier, light/dark) applied to the demo
  surface — a REGISTRY-side change to `component-canvas` (mirror +
  manifest re-record), reusing the existing DensityDemo scoping
  mechanism (siteOnly `density-demo.svelte`) where possible.
- **Copy registry URL**: every page header gets the registry item URL
  copy affordance (`https://ui.jixoai.com/r/<name>.json`), the direct
  `shadcn add` path for non-CLI consumers.
- **Audit defects fold in**: the F10 structure drift items are the
  lint's first catch list (they may already be fixed by site-polish —
  whichever change lands second reaps the other's lint).

## Layering

- `registry/files/ui/component-canvas/**` (stage toggles — registry
  side) + its apps/www mirror + manifest re-record.
- `apps/www/src/lib/ui/props-table/**` (extend the EXISTING siteOnly
  component; do not create a second one).
- `apps/www/src/routes/docs/components/**` (per-page compliance).
- `scripts/verify-docs-structure.mjs` (extends the site-polish lint
  with the skeleton contract) + `verify:all`.
- New docs page: `docs/demo-standard.html` (the written standard,
  linked from the docs learning path).

## Sequencing

C's compliance pass (tasks 5.2) runs LAST in the batch — E/F/G/H
reshape the same docs pages; C's skeleton lint is their acceptance
harness. `+layout.svelte` (learning-path link) is shared with H's
Docs-dropdown entry: C lands first, H reuses.

## Risks

- Props truth migration touches 79 pages of hand-written arrays; the
  diff-verify step (pilot twelve) guards regressions. Mass-editing
  the remainder is mechanical — the lint turns it into a tracked
  backlog, not a standing violation.
