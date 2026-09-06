# build-plugins — spec delta (icon-prefix-compiler)

## ADDED Requirements

### Requirement: prefixed icon names scan from source into the generated set

The scanner SHALL be a pure module with TWO entries feeding one
generator stream: (a) an EAGER project walk over consumer
.svelte/.ts/.js/.html sources (excluding node_modules/dist/
.svelte-kit/virtual modules/the artifact itself), run at buildStart
when `command === 'build'` AND inside the root script's
buildArtifacts — generation runs at buildStart BEFORE transforms and
the build promise is memoized, so transform-only collection cannot
serve production builds, and the script twin must see the same
scanned set so `gen:icons`/`--check` stay byte-equal to the
dev-server artifact; and (b) a DEV-INCREMENTAL vite transform
(enforce: 'pre', same scope and exclusions) collecting STATIC
`name="<preset>:<name>"` and `name="<preset>:<name> as
<identifier>"` literals (attribute and string-literal expression
forms only — no expression evaluation). The scanned-name grammar
SHALL be the ENABLED PRESET's own name grammar — the preset resolver
validates (material-symbols names are snake_case, e.g.
`md:copy_all`, not kebab) — while the scanner's literal regex is
permissive (`/^[a-z][a-z0-9_]*$/` after the prefix) and never the
authority; scanned keys like `md:copy_all` are EXEMPT from the
camelCase icon-name pattern while aliases must satisfy it. Scanned
refs resolve through the enabled presets' resolvers and pack
WITHOUT any vite-config declaration; duplicate refs (no alias)
dedupe silently; the scan order never affects artifact bytes
(refs sort by (preset, name)). A change in the scanned set SHALL
invalidate and regenerate the artifact through the slot face's
refresh path (dev only).

#### Scenario: an undeclared prefixed name just works

- GIVEN `presets: ['material']` and a component containing
  `<Icon name="md:copy_all" />` with NO `library.icons` entry
- WHEN the build runs
- THEN the artifact packs `md:copy_all` and `IconName` admits it

#### Scenario: a production build packs an undeclared scanned ref

- GIVEN `presets: ['material']`, a component containing
  `<Icon name="md:copy_all" />`, and `command === 'build'`
- WHEN buildStart fires (before any transform runs)
- THEN the eager project walk collects `md:copy_all` and the packed
  artifact includes it (a transform-only collector would have missed
  it)

#### Scenario: gen:icons output equals the dev-server artifact for the same scanned set

- GIVEN the same project sources with one scanned ref, run once
  through the dev server and once through the root `gen:icons`
  script
- WHEN both artifacts are compared
- THEN they are byte-identical (the script runs the same eager walk
  the build does — no scanner-less twin, no divergence)

#### Scenario: a dynamic expression is intentionally unserved

- GIVEN `` <Icon name={`md:${x}`} /> ``
- WHEN the scanner runs
- THEN nothing is collected for it (documented contract: dynamic
  names ride the runtime lane)

### Requirement: `as` aliases register dual keys, never rewrite sources

`name="md:X as Y"` SHALL declare Y as a local alias: the artifact
resolves BOTH `md:X` and `Y` to the SAME packed payload — the
payload packs ONCE under the canonical `md:X` key, and `Y` derefs
first through the artifact's `ALIASES: Readonly<Record<alias,
canonical>>` table (sources are NEVER rewritten — the ruled form;
an alias costs an alias-table row in the budget, never a second
packed payload; `report.iconCount` counts canonical entries with
aliases excluded, and ICON_NAMES emits each alias ADJACENT to its
ref). Collision rules SHALL fail the build with
named diagnostics: an alias colliding with any declared/scanned
name; two refs claiming one alias; a ref's name colliding with
another ref's alias. Alias identifiers SHALL match
`/^[a-z][A-Za-z0-9]*$/` (scanned keys like `md:copy_all` are exempt
from the camelCase icon-name pattern; aliases are not).

#### Scenario: the alias and the full ref share one icon

- GIVEN `name="md:copy_all as copy2"` in one file and
  `name="md:copy_all"` in another
- WHEN the artifact generates
- THEN `getIcon('copy2')` and `getIcon('md:copy_all')` return the
  SAME data and the payload packs exactly once

#### Scenario: an alias collision fails by name

- GIVEN `md:a as dup` and `md:b as dup`
- WHEN the generator validates
- THEN the build fails naming both refs and the contested alias

### Requirement: IconName gains template-literal members for enabled presets only

For each preset the consumer ENABLED, the generated `IconName`
union SHALL include a `` `${prefix}:${string}` `` template-literal
member; presets that are not enabled contribute NO member (an
`fa:` name is a compile error with no runtime story). This is the
three-tier safety contract, stated precisely: prefix safety at
COMPILE time, concrete-name validity at BUILD time (a scanned or
declared ref that fails preset resolution is a named build error),
and dynamic composition at RUNTIME — `getIcon` on an unpacked name
returns null, the component renders its reserved box through the
existing lazy path, and the unknown name warns once through the
chunk-warn channel (the channel is not dev-gated today and stays
that way), with the generator's loadIcon error message for unpacked
names covering BOTH causes (artifact drift or a dynamic/scanned-miss
name).

#### Scenario: the union tracks enabled presets

- GIVEN `presets: ['material', 'phosphor']`
- WHEN the artifact generates
- THEN `IconName` includes `md:${string}` and `ph:${string}` and
  NOT `rx:${string}`

#### Scenario: a scanned ref that fails resolution is a build error

- GIVEN `<Icon name="md:not_a_real_symbol" />` and the material
  package installed
- WHEN the generator resolves the scan
- THEN the build fails naming the ref and the preset (never a
  silently blank glyph)

## MODIFIED Requirements

### Requirement: the icons library face resolves named icons through plugin config

`jixoai({ icons })` SHALL validate its config against a fixed
matrix: `false`/`undefined` = the feature is OFF (the unchanged
default); `{}` (neither `provider` nor `library`) = a named startup
error naming both legal shapes; `{ provider }` = the slot face only,
with emitted output byte-identical to the pre-change plugin
(regression-locked by test); `{ library }` = the library face only
(no CSS module emitted); both keys = the two faces run as
independent modules. The library options SHALL be:
`includeDefaults` (default true — the built-in manifest, the 38
lucide names in the frozen GROUPS order migrated from
scripts/gen-icons.mjs), `icons` (a record of name → IconSource where
IconSource is an inline SVG string, `{ file }` (the plugin owns ALL
file I/O — loads through the provider context, watched for HMR), or
a `lucide:<kebab>` reference), `maxChunkBytes` (default 20480, raw
non-gzip module bytes), `chunking` (`'auto'` | `'single'`, default
`'auto'`), `inlineFirstChunk` (default true), `output` (artifact
path, project-root-relative, default `src/lib/icon-set.gen.ts`),
`write` (default `false` — the vite adapter never writes the
artifact unless a consumer opts in; see the single-writer law
below), and `optimize` (default true). The library face carries a
single-writer law for the artifact: a `write` option (default
`false`) — the Vite adapter serves virtual chunks and WARNS on
on-disk artifact drift but never writes unless a consumer app opts
in with `write: true` + `output`; in THIS repo the root `gen:icons`
script is the ONLY artifact writer (the www copy arrives via the
existing mirror tooling), both in-repo app configs run `write:
false`, and a dual-app build probe asserts no `registry/src/**`
artifact and no default-output orphan ever appears. A same-name
entry OVERRIDES the built-in; prefixed refs scanned from consumer
sources by the prefix compiler (see the ADDED requirements) SHALL
enter the set WITHOUT any `icons` declaration. Icon names SHALL
match `/^[a-z][A-Za-z0-9]*$/`, EXCEPT prefixed scanned keys
(`md:copy_all`), which are EXEMPT (the enabled preset's own name
grammar governs them) while ALIASES must satisfy the pattern.
`lucide` SHALL remain an optional peer of
the PLUGIN package only — built-in resolution runs inside the
plugin at build time via dynamic `import('lucide')` with the
loud-fail install hint; the emitted artifact carries zero lucide
references.

#### Scenario: a custom icon joins the type union

- GIVEN a consumer configuring `library: { icons: { myLogo: { file:
  './brand/logo.svg' } } }`
- WHEN the generator emits the artifact
- THEN `IconName` includes `'myLogo'` and `<Icon name="myLogo" />`
  type-checks, while `<Icon name="mylogo" />` is a compile error

#### Scenario: an override replaces a built-in in every chunk

- GIVEN `library: { icons: { check: '<svg …>…</svg>' } }`
- WHEN the library packs
- THEN the name `check` resolves to the custom artwork everywhere
  (inline core and lazy chunks) and no duplicate entry exists

#### Scenario: neither face is configured

- GIVEN `jixoai({ icons: {} })`
- WHEN the plugin initializes
- THEN startup fails with an error naming the `provider` and
  `library` options as the two legal shapes

#### Scenario: provider-only output is regression-locked

- GIVEN a pre-change config `{ provider: lucideIconProvider() }`
- WHEN the same config runs post-change
- THEN the emitted CSS module is byte-identical (the provider-only
  path gains no library behavior)

### Requirement: icons pack into budgeted chunks with an inline sync core

The packer SHALL greedily fill chunks in manifest order (built-ins
in GROUPS order, then custom icons in config insertion order, then
scanned refs, sorted (preset, name)) with
each chunk's serialized module bytes ≤ `maxChunkBytes` (20480
default, raw non-gzip); an icon larger than the budget forms its own
chunk with a warning. The four-mode matrix SHALL hold exactly and
be test-locked: (`'auto'`, inline=true=default) budgeted chunks with
chunk 0 embedded inline and chunks 1..N lazy; (`'auto'`,
inline=false) budgeted chunks all lazy; (`'single'`, inline=true=
default) ONE chunk fully inline, zero virtual imports (the 不拆
mode); (`'single'`, inline=false) ONE lazy chunk holding everything.
Chunk 0's inline embedding SHALL make the default-config artifact
synchronously importable (SSR renders it with zero wiring) and —
when the whole library fits chunk 0 — leave the artifact with ZERO
virtual imports so it builds plugin-free. Lazy chunks SHALL be
virtual modules `virtual:jixoai-icons/chunk/K` exporting
`{ default: Record<name, IconData> }`, loaded through dynamic
import by the artifact's `loadIcon`/`preloadIcons`. Packing SHALL be
deterministic: identical inputs produce byte-identical outputs. The
default 38-icon set's chunk count and byte totals SHALL be asserted
from REAL generator output in an acceptance test, never assumed in
documentation.

#### Scenario: the default built-in set's layout is measured

- GIVEN the default library (38 built-ins) under default options
- WHEN the acceptance test runs the generator
- THEN chunk count, per-chunk totals, and the artifact's import list
  are asserted from the real output — and the artifact builds
  plugin-free exactly when that output has zero lazy chunks

#### Scenario: overflow past the budget spills into lazy chunks

- GIVEN a library whose serialized bytes exceed one budget
- WHEN the artifact is generated
- THEN chunk 0 stays inline-sync, overflow names map to lazy chunk
  indexes, and `<Icon>` renders a size-reserved empty box until the
  chunk import resolves

#### Scenario: determinism holds across runs

- GIVEN unchanged inputs
- WHEN the generator runs twice
- THEN the artifact bytes are identical (the `--check` freshness
  gate is meaningful)
