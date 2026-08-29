# registry — spec delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: registryDependencies mirror actual imports

Every registry item that imports `$lib/icons` SHALL declare
`@jixoai/icons` in registryDependencies; items that do NOT import
it SHALL NOT declare it. No registry item gains an npm dependency
from the icon migration.

#### Scenario: an item's declared icon dep is unused

- GIVEN an item whose files never import `$lib/icons`
- WHEN registry.json still lists `@jixoai/icons`
- THEN the registry surface check flags the dead dependency
