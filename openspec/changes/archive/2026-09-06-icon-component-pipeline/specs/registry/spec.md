# registry — spec delta (icon-component-pipeline)

## MODIFIED Requirements

### Requirement: the icons lib item is generated from lucide

The `@jixoai/icons` registry item SHALL RETIRE (this change). Its
successor is the generated artifact `@jixoai/icon-set`
(`registry/files/lib/icon-set.gen.ts`, mirrored byte-identically to
`apps/www/src/lib/icon-set.gen.ts`): the emitted output of the
plugin's `generateIconLibraryArtifacts()` driven by the root
`gen:icons` script (canonical write) and gated by `verify:icons`
(`--check` fails on staleness). The public interface SHALL be:
`IconName` (the name union — consumer custom names join via plugin
config), `ICON_NAMES`, `IconData` (`{ v, n, d }`), `getIcon` (sync
peek), `loadIcon` (cached promise over lazy virtual chunks),
`preloadIcons`. The item SHALL declare NO npm dependency — registry
consumers stay lucide-free. The install contract has two tiers,
both probe-enforced (`verify-shadcn-add`): the DEFAULT tier ships
the default-config artifact (inline core; lazy-chunk count per the
CURRENT generator output, owned by the acceptance test) which
builds standalone with no plugin and no virtual imports; the OVERFLOW tier (big libraries, `inlineFirstChunk:
false`) is a DOCUMENTED plugin prerequisite — the item docs carry
the `jixoai({ icons: { library } })` wiring recipe (the ghostty-term
precedent), a forced-overflow clean-consumer probe builds a real
vite project with the plugin wired and asserts the lazy chunks emit
and load, and an unwired overflow build fails with a NAMED error
pointing at the plugin option (never a silent unresolved import).
The old `{@html}` string-bag interface (`lib/icons.ts`) SHALL be
REMOVED with no compat layer.

#### Scenario: the generated module is stale

- GIVEN the plugin's default manifest, the svgo preset, or a source
  svg changes
- WHEN `verify:icons` runs against an un-regenerated icon-set.gen.ts
- THEN the gate FAILS listing the file as stale

#### Scenario: a consumer adds the icons item

- GIVEN `shadcn add @jixoai/icon-set`
- WHEN the item lands in the consumer project
- THEN it imports nothing beyond itself and virtual chunk ids (zero
  npm deps), and every built-in name renders geometry identical to
  lucide@0.472.0 modulo the pinned no-op svgo pass

#### Scenario: an overflow consumer without the plugin fails by name

- GIVEN the vite plugin present but no `jixoai({ icons: { library }
  })` wiring, and an artifact importing
  `virtual:jixoai-icons/chunk/*`
- WHEN the consumer's build runs
- THEN the plugin's resolver fails the build with the fixed named
  error pointing at the plugin option (never vite's silent generic
  unresolved-import message); the same consumer wired per the item
  docs builds and loads the lazy chunks (the forced-overflow probe
  asserts the exact message both ways)

#### Scenario: the retired interface is gone

- GIVEN a consumer importing `{ icons }` from `$lib/icons`
- WHEN the migration has landed
- THEN the module does not exist (compile error) — the consumption
  path is `<Icon name=… />` from `@jixoai/icon` or the artifact's
  typed functions

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
non-prerequisite FAIL). The icon-family edges migrate with the
icon-component-pipeline change: component importers declare
`@jixoai/icon`; artifact-level importers declare `@jixoai/icon-set`;
the `@jixoai/icons` name RETIRES (a zero-hit sweep over
registry.json/scripts/apps/registry/packages closes the migration —
dangling edges cannot be baselined).

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

- GIVEN an item whose files never import `$lib/ui/icon` or
  `$lib/icon-set.gen`
- WHEN registry.json still lists `@jixoai/icon` or `@jixoai/icon-set`
  for it
- THEN the registry surface check flags the dead dependency
  (unchanged — now enforced by `verify:deps`)

#### Scenario: the theme install prerequisite

- GIVEN a registry:ui item that declares `@jixoai/jixoai-theme`
  without importing it
- WHEN `verify:deps` runs
- THEN the declaration PASSes as the structured install prerequisite

## ADDED Requirements

### Requirement: the Icon component item renders type-safe named icons

The `@jixoai/icon` registry item (`registry/files/ui/icon/`) SHALL
provide a Svelte 5 component with props `name: IconName` (required,
type-safe — unknown names are compile errors), `size` (default 16),
`strokeWidth` (default 2), plus `class`/rest spread onto the `<svg>`
root. The component SHALL own the root element: viewBox from the
icon data, `width/height={size}`, currentColor painting by artwork
nature (stroke nature: `stroke="currentColor" fill="none"`; fill
nature the inverse), `stroke-width={strokeWidth}`, round caps/joins,
`aria-hidden="true"`, `data-jx-icon`; children render from the
icon's `d` payload (`{@html}` demoted from public API to an internal
render detail). The sync path (`getIcon` hit) SHALL render directly
in SSR; the lazy path SHALL render a size-reserved empty box pending
the chunk import and warn once on rejection. The item declares
`@jixoai/icon-set` + `@jixoai/jixoai-theme` in registryDependencies
(actual imports + the uniform theme prerequisite).

#### Scenario: an unknown name is a compile error

- GIVEN `<Icon name="chevronright" />` (typo) in a consumer
- WHEN svelte-check runs
- THEN the name fails against the `IconName` union

#### Scenario: SSR paints the core set with zero wiring

- GIVEN a server-rendered page using built-in names (inline core)
- WHEN the HTML is rendered
- THEN the icons' `<svg data-jx-icon>` markup is present in the
  server response (no hydration pop-in)

#### Scenario: per-instance overrides replace descendant-class hacks

- GIVEN `<Icon name="x" size={13} strokeWidth={2.5} />`
- WHEN it renders
- THEN the svg root carries width=height=13 and stroke-width=2.5 —
  no `[&_svg]:*` wrapper classes needed
