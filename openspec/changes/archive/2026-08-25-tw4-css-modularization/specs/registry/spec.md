# registry — delta

## MODIFIED Requirements

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
`registry:ui` item, exactly one `canonicalMainSource` (+ its consumer
target) — same-name `.svelte` entries are script-derivable defaults,
non-identical ones (toast → `toast-viewport.svelte`) MUST be
explicit; the manifest check FAILS on missing, duplicate,
non-item-local, or files[]-inconsistent entries, and the P1
index/target generator reads ONLY that field. `registry:lib`,
`registry:theme`, and `registry:file` items KEEP their canonical roots
and targets (`registry/files/lib/**` → `@lib/...`,
`registry/files/theme/**` → `@lib/...`). A UI item referencing a
SHARED lib file (e.g. `code-card` → `lib/shiki.ts`, `toast` →
`lib/toast-store.ts`) keeps that file at its canonical `@lib` target —
decided per-file by the P0.3 migration mapping table (canonical owner,
consumer target, move-vs-dependency) — so shared-library install
contracts do not silently change. Inter-item dependencies use
`registryDependencies`; npm package dependencies use the item
`dependencies` field (precedent: shiki, @tanstack/svelte-virtual).
Component (`registry:ui`) items carry a documented install
prerequisite: Tailwind v4 PLUS the jixoai token sheet wired into the
consumer's single CSS entry — the canonical consumer entry setup order
is `@import 'tailwindcss'` → jixoai theme import → (optional)
jx-pure import; utility-authored UI items SHALL declare
`@jixoai/jixoai-theme` in `registryDependencies` uniformly so the
token sheet arrives with the component, and the setup doc +
`scripts/check-tw4-prereq.mjs` detection (scoped to `registry:ui`
consumers, failure message names the missing requirement) enforce the
entry wiring. The `jixoai-theme` item's own npm dependency closure
MUST be declared: its css imports
`@fontsource-variable/jetbrains-mono` + `@fontsource/share-tech-mono`,
so both MUST be in the item's `dependencies` (clean consumers resolve
the theme css; today the packages exist only in apps/www).
Theme/lib/engine items stay framework-free. Consumer
installability of the folder shape MUST be proven by real
`shadcn add` probes before migration (P0.2: the multi-file accordion +
toast — toast covers the non-identical-main AND item-shipped
canonical `@lib` file paths; code-card's npm/registry dependency
chain is asserted in the P0.3 mapping + P1 full gate), not inferred
from `shadcn build` output.

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
  default export pointing at the manifest's `canonicalMainSource`
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
