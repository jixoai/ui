# registry — delta

## MODIFIED Requirements

### Requirement: item file contracts

An item SHALL declare one or more files, each `{path, target, type}`.
Targets use the consumer alias space (`@ui/...`, `@lib/...` per
components.json). The folder law applies to `registry:ui` items'
COMPONENT-LOCAL files only: one directory per item under
`registry/files/ui/<name>/` containing the item's canonical main
component file, its sub-components, a pure-barrel `index.ts`, and
the item's colocated css when the css-architecture law requires one
(mirror sheets for the native family included). The canonical main
is machine-resolved by the committed
`apps/www/mirror-manifest.json`'s `canonicalMainSource`.
`registry:lib`, `registry:theme`, and `registry:file` items KEEP
their canonical roots and targets (`registry/files/lib/**` →
`@lib/...`, `registry/files/theme/**` → `@lib/...`) — including the
NEW generated `jx-native-contract.css` → `@lib/jx-native-contract.css`
(item `jx-native-contract`, type `registry:lib`,
registryDependencies `@jixoai/jixoai-theme`; the file is generator-
owned, mirroring the jx-pure same-claim precedent for shared-source
items). Inter-item dependencies use `registryDependencies`; native
family UI items SHALL declare `@jixoai/jx-native-contract` (not the
full jx-pure face); items needing the full componentless face
declare `@jixoai/jx-pure`. Component (`registry:ui`) items carry the
documented install prerequisite: Tailwind v4 PLUS the jixoai token
sheet wired into the consumer's single CSS entry — the canonical
consumer entry setup order is `@import 'tailwindcss'` → jixoai theme
import → jx-native-contract import (or the jx-pure face import,
superset); utility-authored UI items SHALL declare
`@jixoai/jixoai-theme` in `registryDependencies` uniformly; the
setup doc + `scripts/check-tw4-prereq.mjs` detection enforce the
entry wiring. The `jx-pure` item's index description SHALL carry the
current v2 class vocabulary (the stale `.jx-input/.jx-range` wording
is retired).

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/` and declared as
  an item in `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync
  spec)

#### Scenario: a native component's dependency closure

- GIVEN the `checkbox` item
- THEN its registryDependencies include `@jixoai/jx-native-contract`
  and `@jixoai/jixoai-theme` and NOT `@jixoai/jx-pure` — clean
  consumers receive the contract, not the 2006-line face

#### Scenario: the contract item regenerates

- GIVEN Part A edited in jx-pure.css
- WHEN the generator runs and `shadcn build` follows
- THEN `public/r/jx-native-contract.json` embeds the regenerated
  bytes and the mirror/payload parity gates stay green
