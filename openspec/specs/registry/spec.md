# registry — the shadcn distribution capability (living spec)

## Purpose

What the jixoai-ui registry distributes and how: item authoring under registry/files/**, the registry.json index, the shadcn build pipeline into public/r/*.json, and the @jixoai consumer contract.

> Capability owner: `registry.json` (the index) + `registry/files/**`
> (the item sources) + `shadcn build` (the distributables pipeline).
> The registry is the source of truth; `apps/www` only browses it.

## Current contract (state: 2026-08-24)

## Requirements

### Requirement: single-source item authoring

Every distributable artifact SHALL originate in `registry/files/**`; nothing
hand-edits `public/r/*.json`. `registry.json` is the machine index and
stays in lockstep with the file tree.

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/foo.svelte` (the
  folder-per-item law — one directory per item under
  `registry/files/ui/<name>/`, the tw4-css-modularization form; the
  flat `registry/files/ui/foo.svelte` path this scenario historically
  taught was pre-tw4) and declared
  as an item (`type: registry:ui`, files `[{path, target}]`) in
  `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync spec)

### Requirement: item file contracts

An item SHALL declare one or more files, each `{path, target, type}`.
Targets use the consumer alias space (`@ui/...`, `@lib/...` per
components.json). The folder law applies to `registry:ui` items'
COMPONENT-LOCAL files only: one directory per item under
`registry/files/ui/<name>/` containing the item's canonical main
component file, its sub-components (ALL multi-file items fold in —
accordion (2), dropdown-menu, tabs (4), … enumerated by script, not
example), a pure-barrel `index.ts` (default re-export of the canonical
main + named sub-component re-exports + stable public types ONLY — no
logic, no defaults, no auto-exported private `Props`; snippet/context
imports stay folder-relative and are never promoted to public API),
and the item's colocated css when the css-architecture law requires
one. The canonical main is machine-resolved by ONE normative source:
the committed `apps/www/mirror-manifest.json` carries, per
`registry:ui` item, exactly one `canonicalMain` (+ its consumer
target) — same-name `.svelte` entries are script-derivable defaults,
non-identical ones (toast → `toast-viewport.svelte`) MUST be
explicit; the manifest check FAILS on missing, duplicate,
non-item-local, or files[]-inconsistent entries, and the P1
index/target generator reads ONLY that field. `registry:lib`,
`registry:theme`, and `registry:file` items KEEP their canonical roots
and targets (`registry/files/lib/**` → `@lib/...`,
`registry/files/theme/**` → `@lib/...`). A UI item referencing a
SHARED lib file (e.g. `code-card` → `lib/shiki.ts`, `toast` →
`lib/toast-store.ts`, `ghostty-term` → `lib/ghostty-vt.ts`) keeps
that file at its canonical `@lib` target — decided per-file by the
P0.3 migration mapping table (canonical owner, consumer target,
move-vs-dependency) — so shared-library install contracts do not
silently change. Inter-item dependencies use `registryDependencies`;
npm package dependencies use the item `dependencies` field (precedent:
shiki, @tanstack/svelte-virtual). Component (`registry:ui`) items
carry a documented install prerequisite: Tailwind v4 PLUS the jixoai
token sheet wired into the consumer's single CSS entry — the canonical
consumer entry setup order is `@import 'tailwindcss'` → jixoai theme
import → (optional) jx-pure import; utility-authored UI items SHALL
declare `@jixoai/jixoai-theme` in `registryDependencies` uniformly so
the token sheet arrives with the component, and the setup doc +
`scripts/check-tw4-prereq.mjs` detection (scoped to `registry:ui`
consumers, failure message names the missing requirement) enforce the
entry wiring. Items whose runtime needs a build-time-resolved binary
asset (the wasm-asset prerequisite, 2026-08-28: `ghostty-term` →
`ghostty-vt.wasm`) SHALL NOT ship the binary through the registry
payload; the item documents the `@jixoai/vite-plugin` wiring as an
install prerequisite of equal rank to the tw4 law (per the
build-plugins spec), and the asset URL reaches the component through
that plugin's virtual module (`virtual:jixoai-ghostty`), never
through a hand-placed file. The install chain of a wasm-consuming
item is frozen the same way as every dependency edge: `ghostty-term`
declares `registryDependencies = ["@jixoai/ghostty-vt",
"@jixoai/jixoai-theme", "@jixoai/utils", "@jixoai/color-utils",
"@jixoai/density"]` (density joined the frozen set in the impl
review: the component imports `$lib/density.svelte` for
resolveDensity/stamps, the list-item precedent),
and the `ghostty-vt` and `color-utils` lib items declare zero npm
`dependencies` (the bindings use only global web platform APIs); a
real `shadcn add` probe asserts the chain lands all dependencies with
no binary payload. A new `color-utils` lib item (engines group,
canonical `@lib/color-utils.ts`) gives the previously unreferenced
`registry/files/lib/color-utils.ts` an owning item AND repairs the
pre-existing break where `color-picker`'s registry source imports
`$lib/color-utils` that no item shipped — `color-picker` gains
`@jixoai/color-utils` in its `registryDependencies`, and the shadcn
add probe covers BOTH `ghostty-term` and `color-picker` installs.
The `jixoai-theme` item's own npm
dependency closure MUST be declared: its css imports
`@fontsource-variable/jetbrains-mono` + `@fontsource/share-tech-mono`,
so both MUST be in the item's `dependencies` (clean consumers resolve
the theme css; today the packages exist only in apps/www). Theme/
lib/engine items stay framework-free — a lib item that binds a wasm
ABI (`ghostty-vt`) stays framework-free by taking its wasm source as
an explicit `loadGhosttyVT({ url | bytes })` argument instead of
importing the virtual module (the virtual-module contract belongs to
the ui item layer). Consumer installability of the folder shape MUST
be proven by real `shadcn add` probes before migration (P0.2: the
multi-file accordion + toast — toast covers the non-identical-main
AND item-shipped canonical `@lib` file paths; code-card's npm/registry
dependency chain is asserted in the P0.3 mapping + P1 full gate), not
inferred from `shadcn build` output.

#### Scenario: consumer installs an item needing a wasm asset

- GIVEN a consumer with the `@jixoai` namespace and
  `jixoaiGhostty()` wired in vite
- WHEN `npx shadcn add @jixoai/ghostty-term` runs
- THEN the component folder and the shared `@lib/ghostty-vt.ts` land
  at their canonical targets (all five frozen registryDependencies —
  `@jixoai/ghostty-vt`, `@jixoai/jixoai-theme`, `@jixoai/utils`,
  `@jixoai/color-utils`, `@jixoai/density` — arrive with it) with NO
  binary payload in the registry JSON, and the component resolves the
  wasm at runtime through the plugin's virtual module

#### Scenario: the color-utils item repairs color-picker's install

- GIVEN a consumer fixture with color-picker's OTHER runtime
  prerequisites already present (its under-declared import graph —
  input, native-select, press-button, surface-motion, density — is a
  PRE-EXISTING condition, out of this change's scope and flagged as
  input for a follow-up registry dependency-audit change)
- WHEN `npx shadcn add @jixoai/color-picker` runs after this change
- THEN `@jixoai/color-utils` arrives via its new registryDependencies
  entry and the installed component resolves that import — the
  color-utils half of the clean-install break is repaired and locked
  by the shadcn add probe

#### Scenario: wasm prerequisite missing is named, not mysterious

- GIVEN a consumer who installed `ghostty-term` but did NOT wire the
  vite plugin
- WHEN their build runs
- THEN the failure path is documented on the item's docs page (the
  install-prerequisite section names `@jixoai/vite-plugin` and the
  one-line fix), mirroring the tw4-prerequisite law

#### Scenario: consumer installs a multi-file item

- GIVEN a multi-file item (accordion: group + item + barrel + css)
- WHEN it is installed via `shadcn add`
- THEN every file lands inside its folder target — the flat-sibling
  era's name-mangling is gone; this scenario name carries that history

#### Scenario: consumer installs a folder-shaped item

- GIVEN a consumer with `@jixoai` namespace configured
- WHEN `npx shadcn add @jixoai/accordion` runs
- THEN every file lands under the resolved alias target directory and
  `import ... from '$lib/ui/accordion'` works via the shipped index
  (proven by the P0.2 fixture)

#### Scenario: consumer installs an item with a shared lib file

- GIVEN `toast` (non-identical main `toast-viewport.svelte` +
  `@lib/toast-store.ts`)
- WHEN `shadcn add @jixoai/toast` runs
- THEN the UI folder lands under `$lib/ui/toast/**` with the index
  default export pointing at the manifest's `canonicalMain`
  (`toast-viewport.svelte`), AND the shared file lands at its
  canonical `@lib` target, without duplication or clobbering (proven
  by the second P0.2 fixture)

#### Scenario: consumer entry setup resolves utilities

- GIVEN a clean consumer whose single CSS entry follows the canonical
  order (`@import 'tailwindcss'` → jixoai theme → optional jx-pure)
- WHEN a utility-authored UI item is installed (theme arrives via its
  `registryDependencies`)
- THEN `dark:*`, `border-border`, `bg-background` and the component's
  utilities all resolve in the compiled output (proven by the P3a
  clean-consumer fixture)

#### Scenario: payload stability, layout breakage honesty

- WHEN the layout moves to folders
- THEN `/r/<name>.json` payload names and the consumer namespace stay
  unchanged, AND the change documents that installed file paths and
  import paths break (deliberate v1 layout break in the pre-adoption
  window)

#### Scenario: npm dependency needed by an item

- GIVEN the `utils` item needs clsx + tailwind-merge
- WHEN the item is declared
- THEN they are listed in the item's npm `dependencies` field, and
  depending items reference `@jixoai/utils` via
  `registryDependencies`

### Requirement: distributables pipeline

`scripts/build-site.mjs` SHALL orchestrate, in load-bearing order: build
apps/www → empty `public/` → copy site dist → `shadcn build` (emits
`public/r/*.json`) → assert both artifacts → generate AI-facing exports
(llms.txt / llms-full.txt / per-page .md) from the FINAL `public/`.
Generation happens at exactly one point (never inside the vite build).

#### Scenario: full site build

- WHEN `npm run build:site` executes
- THEN `public/` is directly deployable (GitHub Pages) with both the
  site pages and `/r/<name>.json` registry payloads coexisting

### Requirement: consumer contract

Consumers SHALL register the namespace
`"@jixoai": "https://ui.jixoai.com/r/{name}.json"` in components.json;
Svelte 5 is first-class and theme/lib/engine items stay framework-free.

#### Scenario: namespace registration

- GIVEN a components.json with the @jixoai namespace
- WHEN items are added via shadcn
- THEN Svelte 5 consumers receive them first-class; theme/lib/engine
  items stay framework-free

Consumers register the namespace
`"@jixoai": "https://ui.jixoai.com/r/{name}.json"` in components.json.
Svelte 5 is first-class (all jixoai sites are SvelteKit); the engine and
theme items are framework-free so non-Svelte consumers can still install
`jixoai-theme` / `toc-engine` / `jx-pure`.

### Requirement: catalog groups are the display taxonomy

registry.json `meta.group` values SHALL form the single display
taxonomy mirrored by `apps/www` `CATALOG_GROUPS` (label + description
per id, antd-style functional naming), and the docs navigation
derives from it automatically. The `terminal` group (2026-08-28) is
the brand's native-surface family: `ghostty-term` (live terminal
canvas), plus `terminal-card`, `terminal-header`, `terminal-footer`
migrated in from `data-display` / `layout`. Item hrefs and payload
names do NOT change on group migration — a group move is a
`meta.group` field edit plus the CATALOG_GROUPS mirror row, nothing
else.

#### Scenario: adding the terminal group

- GIVEN ghostty-term authored under `registry/files/ui/ghostty-term/`
- WHEN the item is declared with `meta.group: "terminal"` and
  `CATALOG_GROUPS` gains the row after `general`
- THEN the docs nav, the components index grouping, and per-group
  counts regenerate without manual page edits, and the three
  terminal-* items appear under the same group with unchanged hrefs

#### Scenario: group snapshot stays truthful

- GIVEN the frozen docs-structure test snapshot counts groups and
  items
- WHEN a group is added or items migrate groups
- THEN the snapshot is updated in the same change and the
  reading-chain coverage test still covers every ui item

### Requirement: the icons lib item is generated from lucide

The `@jixoai/icons` registry item (`registry/files/lib/icons.ts`)
SHALL be the emitted artifact of `scripts/gen-icons.mjs`, whose
manifest maps every export to a lucide icon. The public interface
is frozen: SVG strings, `{@html}` consumption, 24×24 viewBox, 16px
baked size, `data-jx-icon`, `aria-hidden="true"`, sw 2,
stroke currentColor. The item declares NO npm dependency — registry
consumers stay lucide-free. `verify:icons` (`--check`) SHALL fail
when the committed file is stale against the manifest + lucide.

#### Scenario: the generated module is stale

- GIVEN the manifest or the lucide version changes
- WHEN `verify:icons` runs against an un-regenerated icons.ts
- THEN the gate FAILS listing the file as stale

#### Scenario: a consumer adds the icons item

- GIVEN `shadcn add @jixoai/icons`
- WHEN the item lands in the consumer project
- THEN it imports nothing beyond itself (zero npm deps) and every
  export renders identical geometry to lucide@0.472.0

### Requirement: registryDependencies mirror actual imports

Dependency truth is OWNERSHIP-RESOLVED through `registry.json`
`files[].target` (raw alias matching is not the test): every declared
`@jixoai/*` edge SHALL name an existing item; every cross-item import
of an owned file SHALL have a declared edge; a declared-but-unimported
edge SHALL fail UNLESS it is a structured install prerequisite — the
theme sheet is the canonical case (every registry:ui item declares
`@jixoai/jixoai-theme` without importing it). `verify:deps` enforces
all three with the four-case fixture matrix (dangling FAIL /
undeclared cross-item import FAIL / theme prerequisite PASS / dead
non-prerequisite FAIL).

#### Scenario: a dangling registry dependency

- GIVEN any item whose `registryDependencies` lists `@jixoai/foo`
- WHEN `registry.json` has no item named `foo`
- THEN `npm run verify:deps` fails naming the offender and the missing
  target

#### Scenario: an undeclared cross-item import

- GIVEN an item whose owned files import a file owned by another item
  (target-resolved, e.g. `$lib/toc-engine`)
- WHEN the item's `registryDependencies` does not list the
  corresponding `@jixoai/*` item
- THEN `npm run verify:deps` fails naming the file and the undeclared
  dependency

#### Scenario: an item's declared icon dep is unused

- GIVEN an item whose files never import `$lib/icons`
- WHEN registry.json still lists `@jixoai/icons`
- THEN the registry surface check flags the dead dependency
  (unchanged — now enforced by `verify:deps`)

#### Scenario: the theme install prerequisite

- GIVEN a registry:ui item that declares `@jixoai/jixoai-theme`
  without importing it
- WHEN `verify:deps` runs
- THEN the declaration PASSes as the structured install prerequisite

### Requirement: the homepage consumes a validated featured projection

The homepage catalog SHALL render from a featured projection exported
by `catalog.ts` — an explicit item-ID list validated against the
derived catalog (unknown or duplicate IDs throw at build time). The
registry-total count SHALL render from the catalog and be labeled as
the registry total; the featured row count is a separate curated
number and the two SHALL NOT be equated.

#### Scenario: the count never drifts

- WHEN an item lands in or leaves `registry.json`
- THEN the labeled registry total reflects the catalog on the next
  page build with no hand edits

#### Scenario: a featured row outlives its item

- WHEN an item is deleted while still referenced by the featured ID
  list
- THEN the projection validation fails the build naming the ghost ID

### Requirement: the published artifact carries its custom domain

`build-site.mjs` SHALL emit a `CNAME` file (`ui.jixoai.com`) into
`public/` so every deploy re-attaches the custom domain to the Pages
artifact, and `deploy.yml` SHALL smoke-test the deployed domain
(`/`, `/r/registry.json`, `/r/press-button.json` — all HTTP 200)
after publish.

#### Scenario: a fresh checkout deploys

- GIVEN a clean clone on a fresh Pages target
- WHEN `build-site.mjs` runs and `deploy.yml` publishes
- THEN the artifact contains `CNAME` and the smoke job verifies
  `https://ui.jixoai.com/r/registry.json` returns 200
