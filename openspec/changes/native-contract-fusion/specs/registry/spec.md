# registry — delta

## MODIFIED Requirements

### Requirement: item file contracts

An item SHALL declare one or more files, each `{path, target, type}`.
Targets use the consumer alias space (`@ui/...`, `@lib/...` per
components.json). The folder law applies to `registry:ui` items'
COMPONENT-LOCAL files only: one directory per item under
`registry/files/ui/<name>/` containing the item's canonical main
component file, its sub-components, a pure-barrel `index.ts`, and
the item's colocated css for component EXTRAS only (the native laws
ride the theme's .jx-html standard layer — never a component file).
The canonical main is machine-resolved by the committed
`apps/www/mirror-manifest.json`'s `canonicalMainSource`.
`registry:lib`, `registry:theme`, and `registry:file` items KEEP
their canonical roots and targets. The standard layer lives IN the
jixoai-theme item (its css already ships with every component —
installing the theme installs the laws); the r1 jx-native-contract
extract item RETIRES per the deletion matrix. Native family UI
items declare `@jixoai/jixoai-theme`; the full componentless face
remains `@jixoai/jx-pure` (pipeline-bound). Component (`registry:ui`) items carry the
documented install prerequisite: Tailwind v4 PLUS the jixoai token
sheet wired into the consumer's single CSS entry — the canonical
consumer entry setup order is `@import 'tailwindcss'` → jixoai theme
import → (optional) the jx-pure face import — the standard layer rides the theme itself; the extract import is RETIRED; utility-authored UI items SHALL declare
`@jixoai/jixoai-theme` in `registryDependencies` uniformly; the
setup doc + `scripts/check-tw4-prereq.mjs` detection enforce the
entry wiring. The `jx-pure` item's index description SHALL carry the
current v2 class vocabulary (the stale `.jx-input/.jx-range` wording
is retired).

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/foo.svelte` (the
  folder-per-item law — one directory per item under
  `registry/files/ui/<name>/`; the flat pre-tw4 path is retired) and
  declared as an item in `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync
  spec)

#### Scenario: a native component's dependency closure

- GIVEN the `checkbox` item
- THEN its registryDependencies include `@jixoai/jixoai-theme` (the
  standard layer arrives with the theme) and NOT a law-carrying css
  item — clean consumers receive theme + component files only

#### Scenario: consumer installs a multi-file item

- GIVEN a multi-file registry:ui item (e.g. accordion)
- WHEN a clean consumer installs it
- THEN every file lands at its target and the component renders from
  the standard classes without extra css dependencies

#### Scenario: consumer installs a folder-shaped item

- GIVEN a folder-shaped item with sub-components
- THEN the install preserves the folder shape and the barrel resolves

#### Scenario: consumer installs an item with a shared lib file

- GIVEN an item referencing a shared @lib file
- THEN the shared file installs at its canonical @lib target

#### Scenario: consumer entry setup resolves utilities

- GIVEN the documented entry order (tailwind → jixoai theme → jx-pure)
- WHEN the consumer builds
- THEN the .jx-html utilities and the face's @apply chain compile

#### Scenario: payload stability, layout breakage honesty

- GIVEN the registry payload parity gate
- THEN every public/r payload embeds its current source and stale
  payloads fail the gate

#### Scenario: npm dependency needed by an item

- GIVEN an item whose css imports npm packages (fonts)
- THEN the item's dependencies field declares them
