# Proposal: canvas-floor-lab — ComponentCanvas becomes the floor + flagship lab (Owner pick 乙, 2026-08-30)

## Why

Owner-selected direction (prototype round, 2026-08-30): the workbench
becomes a **floor** every demo page can afford (live stage + theme/
density toggles + filename-tab code drawer, NO tree for ≤2-file items)
plus a **flagship lab** (typed controls with keystroke-synced code)
invested only in the 8–12 flagship components. The collision round
killed the matrix-as-default and the REPL-as-default; Terminal's
OUTPUT artifacts (copy-command badges, ASCII anatomy, command-style
URLs) are absorbed here.

The anatomy audit (`.agents/audit/2026-08-30-site-walkthrough/
canvas/`) makes several of these fixes non-negotiable regardless of
direction: 46/77 dead sourceUrls, 8 pages of hand-copied "fake
source", the canvas `<h2>` outline leak (root cause:
`component-canvas.svelte:243` without `data-toc-skip`), the
DensityDemo ×4 children-copy hack, and the tree pane 45 pages don't
need.

## What Changes

### canvas registry item (`registry/files/ui/component-canvas/**` + mirror)

- **H2 leak root fix**: the canvas title demotes OUT of the outline
  (`h2` → `h3` styled as today's visual, or a `p[data-jx-canvas-title]`)
  and the root section gains `data-toc-skip`; the Playground heading
  follows the same rule. DensityDemo's ×4 rendering is RETIRED — the
  stage's density toggle replaces it (its four-copy pattern was the
  leak amplifier).
- **Stage toggles** (the docs-demo-standard requirement, implemented
  HERE): light/dark + comfortable/compact, scoped to the demo surface
  (`data-theme`/`data-density` on the stage element). State is
  composition-first: the canvas renders controls and scoping
  attributes; the HOSTING PAGE owns the state (bindable props).
- **Floor code drawer**: ≤2 files render filename TABS + one CodeCard
  (no TreeView); ≥3 files keep the tree. Files come from the page's
  `?raw` imports ONLY — the drawer never renders hand-pasted source
  (the 8 form-family pages are fixed by this same contract).
- **sourceUrl DERIVED**: the GitHub link is built from the item's
  registry path (manifest/registry.json projection passed by the page
  loader) — hand-written URLs are removed, killing the 46 dead links;
  a lint forbids literal `github.com` hrefs in docs pages.
- **copy-command badge** on the header (`npx jixoai-ui add <name>`,
  clipboard flash) and **copy-page** affordance (markdown + LLM
  targets) — the Terminal-round absorbed outputs.

### flagship lab (page-side composition over the same canvas stage)

- The existing `$lib/playground` Play* kit is consolidated under a
  typed controls contract: each control binds a page-owned rune state
  object; the canvas projects it. NO state moves into the canvas.
- The code panel re-generates from the current control state through
  the page's snippet function — the snippet is authored ONCE (it is
  the same string the docs page teaches), never hand-duplicated.
- `reset` restores the documented defaults; the state projection row
  (`variant=fill · size=md …`) is the read-only output lane.

### page migration (72 canvas pages)

- Batch 1 (pilot): press-button, input, dialog, badge, chip.
- Batch 2: all remaining single-instance pages (mechanical: drop
  DensityDemo usages, pass `?raw` files, derive sourceUrl).
- The 8 form-family pages without canvas gain the floor (their fake
  source dies here).

## Layering

- `registry/files/ui/component-canvas/**` + mirror + manifest
  re-record (integrator).
- `apps/www/src/lib/playground/**` (controls contract),
  `apps/www/src/routes/docs/components/**` (migration batches).
- Relationship to sibling changes: implements the docs-demo-standard
  canvas-toggles requirement (that change's task 3.1 delegates HERE);
  site-polish's heading lint scopes to `data-doc-demo-content`, which
  this change's drawer/stage markup provides.

## Sequencing

After A (registry-integrity harness) and B (docs-structure lint
exist). Pilot batch rides the C change's compliance pass.

## Risks

- Canvas is the most-consumed chrome on the site — the mirror parity
  tests and `verify:surface` (47/47) must stay green; the visual
  regression baseline (`shots`) re-captures.
- Retiring DensityDemo touches the pages that use it (component-canvas
  page itself) — same commit as the toggle so no gap.
