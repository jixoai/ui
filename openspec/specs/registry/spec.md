# registry — the shadcn distribution capability (living spec)

> Capability owner: `registry.json` (the index) + `registry/files/**`
> (the item sources) + `shadcn build` (the distributables pipeline).
> The registry is the source of truth; `apps/www` only browses it.

## Current contract (state: 2026-08-24)

### Requirement: single-source item authoring

Every distributable artifact originates in `registry/files/**`; nothing
hand-edits `public/r/*.json`. `registry.json` is the machine index and
stays in lockstep with the file tree.

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo.svelte` and declared
  as an item (`type: registry:ui`, files `[{path, target}]`) in
  `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync spec)

### Requirement: item file contracts

An item declares one or more files, each `{path, target, type}`. Targets
use the consumer alias space (`@lib/...`, `@ui/...` per components.json).
Multi-file items are legal (e.g. `accordion` ships `accordion.svelte` +
`accordion-item.svelte`). Inter-item dependencies use
`registryDependencies`. Today the per-item file set is FLAT (no
sub-directories under `registry/files/ui/`).

#### Scenario: consumer installs a multi-file item

- GIVEN a consumer with `@jixoai` namespace configured
- WHEN `npx shadcn add @jixoai/accordion` runs
- THEN every file of the item lands at its resolved alias target

### Requirement: distributables pipeline

`scripts/build-site.mjs` orchestrates, in load-bearing order: build
apps/www → empty `public/` → copy site dist → `shadcn build` (emits
`public/r/*.json`) → assert both artifacts → generate AI-facing exports
(llms.txt / llms-full.txt / per-page .md) from the FINAL `public/`.
Generation happens at exactly one point (never inside the vite build).

#### Scenario: full site build

- WHEN `npm run build:site` executes
- THEN `public/` is directly deployable (GitHub Pages) with both the
  site pages and `/r/<name>.json` registry payloads coexisting

### Requirement: consumer contract

Consumers register the namespace
`"@jixoai": "https://ui.jixoai.com/r/{name}.json"` in components.json.
Svelte 5 is first-class (all jixoai sites are SvelteKit); the engine and
theme items are framework-free so non-Svelte consumers can still install
`jixoai-theme` / `toc-engine` / `jx-pure`.
