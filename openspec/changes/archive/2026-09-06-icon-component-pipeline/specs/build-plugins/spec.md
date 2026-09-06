# build-plugins — spec delta (icon-component-pipeline)

## MODIFIED Requirements

### Requirement: the @jixoai/vite-plugin package

`packages/vite-plugin` SHALL publish as `@jixoai/vite-plugin` (the
cli/ package precedent: a separate npm-publishable package, not a
registry item) with ZERO runtime dependencies and peerDependency
`vite ^8.0.0` (the only tested surface), built by tsdown into
`dist/index.js` + `dist/probe.js` and carrying the
`jixoai-ghostty-probe` bin — with ONE sanctioned exception:
`svgo` (the icons library face's build-time optimizer; a regular
`dependencies` entry with the self-contained package-lock.json
updated in the same change, kept EXTERNAL in the tsdown build and
loaded only through the icons sub-entry's dynamic import so the
umbrella entry's module graph stays provider-free; it never ships
to a consumer's browser, exactly like opentype.js). The package's
public API is frozen: `jixoai(opts)` (THE umbrella entry — one call
wires every jixoai build-time feature; `ghostty` is the first,
default-on feature, taking `boolean | options` under
`jixoai({ ghostty })`; the unpublished `jixoaiGhostty()` name never
shipped, the umbrella landed in its place), `resolveGhosttyWasm(opts)`
(the node-usable resolver: variant/cacheDir/offline →
`{ bytes, path, sha256, variant, buildInfo }`, cache filename
`<sha256>.wasm`, default cache dir
`<cwd>/node_modules/.cache/jixoai-ghostty/`, and a frozen behavior
matrix: an env-override file is verified against the pin and its own
path returned without copying; offline resolves cache-only with a
named error on miss; the online path fills the cache atomically),
and the `./client` sub-export (`dist/client.d.ts`, ambient
`declare module 'virtual:jixoai-ghostty'` with NAMED exports only).
The package is a SELF-CONTAINED npm project: its own committed
package-lock.json and devDependencies so `npm ci && npm run build`
reproduces without any root install (the repo root is not a
workspace). Consumers add ONE
`/// <reference types="@jixoai/vite-plugin/client" />` line to their
d.ts environment (the apps/www vite-env.d.ts fixture proves
svelte-check stays green). Its plugins are build-time only: they
never transpile or instantiate wasm; their contract surface is
source-resolution (verify + cache), dev serving, build emission, and
handing data URLs to code via virtual modules.

#### Scenario: package build emits the type contracts

- GIVEN the package built by `npm ci && npm run build`
- WHEN `npm pack --dry-run` inspects the tarball
- THEN `dist/index.js`, `dist/probe.js`, `dist/index.d.ts`, and
  `dist/client.d.ts` are all present in the published files (CI
  asserts this — a types-less publish is a gate failure, since
  exports['.'] and exports['./client'] both point at d.ts files)

#### Scenario: consumer wires the ghostty plugin

- GIVEN a vite consumer with `@jixoai/vite-plugin` installed and
  `jixoai()` in `plugins`
- WHEN the dev server starts or a build runs
- THEN the pinned `ghostty-vt.wasm` resolves (env override →
  sha256-keyed cache → pinned download, verified), is served in dev
  at a sha-prefixed path with `application/wasm` + immutable caching,
  and is emitted into `dist/` in build with the content-addressed
  filename `assets/ghostty-vt-<sha256-16>.wasm` (our hash, not the
  bundler's) — no manual file placement anywhere

#### Scenario: virtual module carries provenance, not behavior

- WHEN code imports `virtual:jixoai-ghostty`
- THEN it receives a pure-data module
  `{ url, sha256, variant, buildInfo }`; the module does not touch
  fetch or WebAssembly at evaluation time, so SSR and node test
  environments import it safely, and a server-consumer build emits no
  duplicate asset

#### Scenario: emission timing follows rollup semantics

- GIVEN the virtual module is loaded during a build
- WHEN its code is generated
- THEN the wasm asset was emitted in the same `load` hook (before
  rendering) and the URL is produced from
  `import.meta.ROLLUP_FILE_URL_<ref>`; a vite `build()` integration
  test asserts the real dist filename (the sentinel for vite/rollup
  major upgrades)

#### Scenario: svgo rides as the one sanctioned dependency

- GIVEN the package manifest, lockfile, and build output after this
  change
- WHEN they are inspected
- THEN `svgo` is the ONLY entry under `dependencies` (vite stays a
  peer, opentype.js/wawoff2 stay optional), the self-contained
  `npm ci && npm run build && npm pack --dry-run` chain reproduces,
  and the umbrella `dist/index.js` contains no svgo/provider code
  (the graph-purity gate)

## ADDED Requirements

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
entry OVERRIDES the built-in. Icon names SHALL match
`/^[a-z][A-Za-z0-9]*$/`. `lucide` SHALL remain an optional peer of
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

### Requirement: the library face optimizes and safety-gates artwork at build time

Every library icon SHALL pass the shared safety checker on its RAW
source BEFORE any transformation (warn-mode rejection drops the icon
with a named warning; error-mode fails the build), then — when
`optimize` is on (default) — pass through svgo v4 (preset-default
tuned: `removeViewBox: false`, floatPrecision 3, dimension
stripping) before structured extraction into `{ v: viewBox, n:
'fill'|'stroke', d: children-html }`. The safety surface SHALL
cover the extraction contract end-to-end: only RAW-gated,
plugin-extracted payload may reach the component's `{@html}` sink
(consumer strings never do), and the gate's test fixtures SHALL
cover disallowed elements, event-handler attributes, foreign
namespaces, and CDATA/comment injection. The optimizer SHALL NOT
run on the slot/CSS face — the ink byte-equivalence locks pin those
URIs byte-exactly and SHALL remain green unmodified. svgo's effect
on lucide's canonical serialization SHALL be pinned as a no-op by a
unit test so the geometry-consistency law survives optimization.

#### Scenario: an unsafe custom icon is rejected before optimization

- GIVEN a custom svg containing a disallowed element or injection
  payload
- WHEN the library resolves it
- THEN the safety checker rejects the RAW source first (warn mode:
  the icon is dropped with a named warning; error mode: the build
  fails) — optimization never launders unvalidated content

#### Scenario: slot-face bytes are untouched by the optimizer

- GIVEN a config enabling both the provider face and the library face
- WHEN the plugin emits the CSS module
- THEN every `--jx-icon-*` URI is byte-identical to the pre-library
  output (the ink-equivalence and icons-dogfood gates stay green
  without modification)

### Requirement: icons pack into budgeted chunks with an inline sync core

The packer SHALL greedily fill chunks in manifest order (built-ins
in GROUPS order, then custom icons in config insertion order) with
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

### Requirement: the generated icon-set artifact comes from a pure generator with adapters

`generateIconLibraryArtifacts()` — a PURE core (no fs, no vite,
input = the RESOLVED asset list, never IconSource) exported from
`@jixoai/vite-plugin/icons` — SHALL be the ONLY code that
serializes the library, returning `{ artifact, chunks, report }`.
Two adapters own all side effects: the VITE adapter (emits the
virtual chunk modules; dev watch/HMR through the slot face's
refresh path; serves the artifact module and WARNS on drift — it
writes the artifact only when the consumer opted in via
`write: true` + `output`, default `false`; in this repo the ROOT
script is the sole writer) and the ROOT-SCRIPT adapter (`gen:icons`
canonical write into registry/files; `verify:icons --check`
freshness gate — both run WITHOUT importing vite). When the vite
plugin is present but the library face is unconfigured, its
resolver SHALL recognize `virtual:jixoai-icons/chunk/*` and fail
the build with the fixed named error pointing at
`jixoai({ icons: { library } })`; the artifact's LAZY loaders
carry the same message as a runtime catch (fetch/parse failures
after a green build). The committed artifact mirrors
byte-identically (`registry/files/lib/icon-set.gen.ts` ←→
`apps/www/src/lib/icon-set.gen.ts`); lazy chunk bodies are virtual
modules generated at dev/build time by whichever app runs the
plugin — they are NEVER files and never enter the mirror manifest.
Artifact ↔ chunk parity SHALL be asserted by a dogfood test
comparing the FULL serialized chunk module bytes served by the
plugin against the artifact's chunk map — not just names and
indexes.

#### Scenario: the freshness gate catches a stale artifact

- GIVEN the library config or a source svg changes
- WHEN `verify:icons --check` runs against an un-regenerated
  artifact
- THEN the gate FAILS naming the stale file (and the check ran
  without vite)

#### Scenario: dev watch regenerates without a loop

- GIVEN the dev server running with a `{file}`-sourced custom icon
- WHEN the svg file is edited
- THEN the library regenerates, virtual chunks invalidate with a
  reload, and the watcher does not re-trigger itself

#### Scenario: the vite adapter never writes in-repo

- GIVEN both app configs running the library face with the default
  `write: false`
- WHEN a dual-app build completes
- THEN no `registry/src/**` artifact and no default-output file
  appeared anywhere (the probe asserts the absence), and the
  canonical artifact changed only through `gen:icons`

#### Scenario: an unwired overflow build fails by name

- GIVEN the vite plugin present but no `icons.library` configured,
  and an artifact importing `virtual:jixoai-icons/chunk/1`
- WHEN the build runs
- THEN the plugin's resolver throws the fixed named error pointing
  at `jixoai({ icons: { library } })` (not vite's generic
  unresolved-import message)

#### Scenario: mirror covers the artifact only

- GIVEN a build with lazy chunks
- WHEN the mirror manifest is generated
- THEN only `icon-set.gen.ts` appears as a new mirrored file — chunk
  bodies exist solely as virtual modules in the building app

### Requirement: the umbrella entry stays free of the icons implementation graph

`src/index.ts` (the umbrella) SHALL NOT statically import the
icons implementation: the current static imports of
`./icons/types.js` and `./icons/vite-plugin.js` are REPLACED by a
bridge plugin — a thin `'jixoai-icons-bridge'` proxy whose hooks
memoize one `await import('./icons/vite-plugin.js')` and delegate —
keeping the frozen sync `jixoai()` API (Plugin[] returned
immediately) while the icons/provider/svgo/lucide graph is
reachable only through the `./icons` sub-entry and the bridge's
dynamic import. The graph-purity gate SHALL verify the real static
import graph of `dist/index.js` (transitively — no
`icons/vite-plugin`, provider, `lucide`, or `svgo` modules), and an
integration test SHALL prove `jixoai({ icons: … })` still works
end-to-end through the bridge (all config-matrix rows).

#### Scenario: the built umbrella carries no icons graph

- GIVEN `npm ci && npm run build`
- WHEN the graph-purity gate parses `dist/index.js`'s static import
  graph transitively
- THEN no icons implementation, provider, lucide, or svgo module
  appears — only the bridge's dynamic import reference

#### Scenario: the bridge delegates the full matrix

- GIVEN `jixoai({ icons: … })` across every config-matrix row
  (provider-only / library-only / both)
- WHEN the integration test runs the bridge end-to-end
- THEN behavior is indistinguishable from the pre-bridge direct
  wiring (provider-only output still matches its golden fixture)
