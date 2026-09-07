# build-plugins Specification

## Purpose
How this repo ships vite build plugins as npm packages: the
@jixoai/ui-vite-plugin package (the ghostty wasm supply plugin — pin-verified
asset resolution, dev serving, build emission, virtual-module handoff),
its probe bin, its self-contained npm engineering, and the
ghostty-wasm-sync supply-chain workflow that keeps the pin honest. The
registry distributes components; this capability distributes what a
consumer's BUILD needs before the component can run — the "we assemble
it, not the user" law applied to the build pipeline itself.

## Requirements

### Requirement: the @jixoai/vite-plugin package

`packages/vite-plugin` SHALL publish as `@jixoai/ui-vite-plugin` (the
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
`/// <reference types="@jixoai/ui-vite-plugin/client" />` line to their
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

- GIVEN a vite consumer with `@jixoai/ui-vite-plugin` installed and
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

### Requirement: ghostty wasm supply chain is pin-verified

The repo SHALL carry a text pin manifest
(`packages/vite-plugin/ghostty.pin.json`) as the ONLY committed
artifact of the wasm; binaries stay out of git. The manifest schema
is frozen: top-level `{ pinnedAt, source{repo,tag,releaseUrl},
variants }` with EACH variant (`full`, `small`) independently
carrying `{ url, sha256, size, buildInfo }` — never a mixed
top-level/variant split. The version identity SHALL come from the
wasm's own `ghostty_build_info` (extracted by the probe), NOT from
release metadata — the tip release object's dates are static while
its assets rotate nightly. The pin has exactly ONE runtime writer:
the `ghostty-wasm-sync` workflow, which updates it only through a PR
and only after the probe passes (`WebAssembly.validate`, required
export-family assertions, an EMPTY import table assertion — the
shipped binaries import nothing and the binding instantiates with
`{}` — plus instantiation + ABI smoke: terminal create → vt_write →
render-state iteration → Enter encodes to CR);
the initial pin is committed once with the same probe run locally.
Every consumer build path (dev, CI deploy, package consumers)
resolves against the pin and verifies sha256 before use. Network
paths SHALL be hardened uniformly: a final-host allowlist (github.com
plus the GitHub asset CDN hosts objects.githubusercontent.com /
release-assets.githubusercontent.com), per-hop redirect validation,
a URL structure check parametrized by the pin's own `source.tag`
(the expected path is
`/ghostty-org/ghostty/releases/download/<source.tag>/<variant asset
name>` — tip today, a future stable tag without code changes; tests
cover both tag forms),
and a streaming 4MB hard cap on the response body that holds even
when Content-Length is missing or lies. The binary-stays-out-of-git
rule has TWO guardrails: the default cache dir lives under
`node_modules/.cache/` (covered by the existing node_modules ignore
rules everywhere — no special-case ignore entry), and
`verify:ghostty-pin` plus CI assert `git ls-files '*.wasm'` is empty.
Threat model, stated: sha256 pinning gives integrity, not publisher
authenticity — authenticity rests on the pinned github.com/
ghostty-org origin plus human review of pin PRs; minisig is a
non-goal.

#### Scenario: broken nightly is not pinned

- GIVEN a tip release whose wasm fails validation or the ABI probe
- WHEN the sync workflow runs
- THEN the pin stays on the previous version and the workflow fails
  loudly; no PR is opened

#### Scenario: airgapped build

- GIVEN an environment with `JIXOAI_GHOSTTY_WASM_PATH` pointing at a
  local file
- WHEN the plugin resolves the wasm
- THEN the local file is used, its sha256 still verified against the
  pin, and no network is touched

### Requirement: package release rides the trusted-publishing flow

`@jixoai/ui-vite-plugin` SHALL be published by the same release
workflow pattern as the `jixoai-ui` CLI (npm Trusted Publishing /
OIDC, idempotent skip when the version exists, tarball attached to
the tagged release); configuring the npm-side trusted publisher for
the new package name is an Owner TODO that blocks publishing day,
not development (in-repo consumers use the `file:` dependency).

#### Scenario: tagging a release publishes both packages

- GIVEN a `v*` tag pushed with an unchanged cli version but a bumped
  `packages/vite-plugin` version
- WHEN release.yml runs
- THEN the CLI publish step skips (already published) and the
  vite-plugin job builds, packs, and publishes only the new version

### Requirement: the lucide provider imports the library

`lucideIconProvider` SHALL read slot geometry from the `lucide`
package (dynamic `import('lucide')` inside the async factory) and
serialize IconNode children through the stroke-artwork wrapper
(viewBox 0 0 24 24, fill none, stroke currentColor, sw 2, round
caps/joins, no width/height). Embedded hand-copied path literals
are REMOVED. `lucide` is an OPTIONAL peer dependency: consumers
who never configure the icons feature install nothing; a missing
install MUST fail loudly at factory time with the install hint.

#### Scenario: lucide is not installed

- GIVEN a consumer config with `icons: { provider: lucideIconProvider() }`
- WHEN the lucide package is absent from node_modules
- THEN the provider factory rejects with a message naming
  `npm i lucide` (build fails, no silent fallback)

#### Scenario: slot geometry matches the library

- GIVEN lucide@0.472.0 installed
- WHEN the provider serves the 'chevron' slot
- THEN the serialized children equal the lucide `ChevronDown`
  IconNode serialization, and the wrapper carries no width/height
  attributes (theme owns sizing)

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

### Requirement: the generated icon-set artifact comes from a pure generator with adapters

`generateIconLibraryArtifacts()` — a PURE core (no fs, no vite,
input = the RESOLVED asset list, never IconSource) exported from
`@jixoai/ui-vite-plugin/icons` — SHALL be the ONLY code that
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

### Requirement: the icons library face ships preset resolvers for the common icon libraries

`library.presets` SHALL enable named icon-library presets, each
contributing a prefixed reference form usable wherever IconSource
strings are (`md:home`, `ph:atom`, `rx:system:add-line`). Presets
SHALL resolve ONE icon per reference at build time through the
shared safety→optimize→extract pipeline (no bulk bundling), with
per-icon nature detection. The shipped presets and their SVG-source
packages (research-verified 2026-09-07): `material` →
`@material-symbols/svg-${weight}` (Apache-2.0; weight/style/fill
configurable, default outlined / weight 400 / FILL 0), `phosphor` →
`@phosphor-icons/core` (MIT), `remix` → `remixicon` (Apache-2.0);
`lucide` remains the built-in default. Each preset package SHALL be
an optional peer whose absence fails loudly with the install hint
(the lucide precedent). Referencing a disabled or unknown preset
prefix SHALL fail with a named error listing the enabled set.
tabler and hugeicons SHALL NOT ship as presets (no per-icon SVG
source package on npm / JS-data only — documented on the icons
page), and SF Symbols SHALL NOT ship on licensing grounds (Apple
system-provided-image terms restrict use to Apple-platform apps and
prohibit SVG export/redistribution — the docs page states the
verdict).

#### Scenario: a material preset icon joins the set

- GIVEN `presets: ['material']` and `icons: { home: 'md:home' }`
- WHEN the generator runs
- THEN `IconName` includes `home` rendering the outlined weight-400
  FILL-0 Material Symbols artwork, and no other material icon
  entered the artifact

#### Scenario: the preset package is absent

- GIVEN `presets: ['material']` without `@material-symbols/svg-400`
  installed
- WHEN resolution starts
- THEN the build fails with a named error carrying the npm install
  line (no silent fallback)

#### Scenario: an unknown prefix is referenced

- GIVEN `icons: { x: 'fa:home' }` with no preset providing `fa:`
- WHEN the config validates
- THEN startup fails naming the reference and the enabled prefixes

### Requirement: font files are icon SOURCES, extracted at build time

`IconSource` SHALL accept `{ font, code }` (codepoint) and
`{ font, liga }` (ligature name, best-effort): the plugin
decompresses woff2 (the existing loadSource lane), parses with
opentype.js, extracts the referenced glyph's outline, and
normalizes it (contain-fit, the slot-face fontIconProvider math,
factored shared) into the standard fill-nature `{v, n, d}` payload.
A codepoint absent from cmap, or a ligature the parser cannot
resolve, SHALL fail loudly (the ligature miss lists the font's
resolvable ligature names WHEN THE PARSER EXPOSES THEM, else the
glyph-name/cmap hint — opentype.js high-level GSUB enumeration is
thin). The runtime artifact SHALL remain pure SVG —
fonts never reach the browser through this lane. woff1 stays a hard
error; ttf/otf paths are accepted directly.

#### Scenario: a codepoint glyph lands in the artifact

- GIVEN `icons: { brand: { font: './brand.woff2', code: 0xE002 } }`
- WHEN the generator runs
- THEN `brand` renders the extracted outline as fill-nature artwork
  and the artifact carries no font bytes

#### Scenario: an unresolvable ligature fails by name

- GIVEN `{ font: './brand.woff2', liga: 'no-such-ligature' }`
- WHEN resolution runs
- THEN the build fails listing the font's resolvable ligature names
  when the parser exposes them, else the glyph-name/cmap hint (never
  a silent blank glyph)

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
dev-server artifact for script-supported (svg-only) configs; and (b) a DEV-INCREMENTAL vite transform
(enforce: 'pre', same scope and exclusions) collecting STATIC
`name="<preset>:<name>"` and `name="<preset>:<name> as
<identifier>"` literals (attribute and string-literal expression
forms only — no expression evaluation). The scanner SHALL capture
the prefix plus the COMPLETE literal suffix (to the closing quote
or the ` as ` boundary) and validate NOTHING about the suffix — the
ENABLED PRESET's own name grammar is the law and the preset
resolver is the authority (material-symbols names are snake_case,
e.g. `md:copy_all`; remix names carry a second colon, e.g.
`rx:system:add-line` — any suffix pattern would reject legal
names). Scanned keys like `md:copy_all` are EXEMPT from the
camelCase icon-name pattern while aliases must satisfy it.
Name-literals whose prefix is not an enabled preset SHALL be
ignored by the scanner (the unknown-prefix named error is a
config-face law over `library.icons` entries, unchanged). Scanned
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

- GIVEN the same project sources with one scanned ref and an
  svg-only library config, run once
  through the dev server and once through the root `gen:icons`
  script
- WHEN both artifacts are compared
- THEN they are byte-identical (the script runs the same eager walk
  the build does — no scanner-less twin, no divergence; a
  font-source config named-rejects in the script twin per the
  companion change and is outside parity by declaration)

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
ref). Canonical keys SHALL serialize QUOTED when not bare
identifiers (`'md:copy_all': { … }` — an unquoted `md:copy_all:`
key is invalid TypeScript), with budget accounting counting the
serialized key bytes. `CHUNK_OF`/`preloadIcons` SHALL deref aliases
to the canonical's chunk, and the runtime lookups SHALL accept the
un-split literal itself — `getIcon('md:copy_all as copy2')`,
`getIcon('md:copy_all')`, and `getIcon('copy2')` resolve the SAME
payload. Collision rules SHALL fail the build with
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

#### Scenario: the un-split alias literal resolves at runtime

- GIVEN the artifact generated with `name="md:copy_all as copy2"`
- WHEN `getIcon`/`loadIcon` receive the un-split literal
  `'md:copy_all as copy2'`
- THEN they split on ` as `, deref the base, and return the SAME
  payload as the bare canonical and the alias

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

### Requirement: icon channels are the public plugin surface

The package (named `@jixoai/ui-vite-plugin`) SHALL expose the channel
capability as the public base every prefixed lane rides: a
`defineIconChannel` factory (sub-entry `…/icons/channel`) that ALWAYS
builds a file-resolver channel — `{ id, prefix, peerPackage?,
resolveFile(ref) }` with prefix grammar `/^[a-z][a-z0-9]*$/` (`lucide`
reserved) and id grammar `/^[a-z][a-z0-9-]*$/`; the resolver contract
is DISCRIMINATED (the `file` kind, and the reserved `lucide` kind
routing to the IconNode lane), and set-level id + prefix uniqueness is
enforced at config normalization with named errors (the factory cannot
know the registered set). `library.channels: IconChannel[]` SHALL be
the registration surface (replacing `library.presets` — bold break,
unreleased API, no compat layer). A registered channel's prefix SHALL
work identically to a shipped one: config `icons` refs, source
scanning, template union members, and the enabled-prefix laws.
Channel resolution SHALL keep frozen principle #4: the channel LOCATES
(node resolution); the adapter READS through `ctx.loadSource` (mime
law + watchFile) and every icon crosses the shared RAW safety → svgo
→ extract pipeline — custom channels inherit the built-ins' guarantees
by construction. The shipped channels SHALL be importable as
independent sub-entries of the same package — `…/icons/md`,
`…/icons/ph`, `…/icons/rx` (factories with their options preserved)
and `…/icons/lucide` (an INSTANCE) — while `lucide` stays
DEFAULT-REGISTERED (zero-import) and resolves through the existing
IconNode lane (the one documented non-file asymmetry; `includeDefaults`
keeps gating the 38-name manifest independently — and a scanned
`lucide:X` whose `X` is already packed SHALL NOT pack a second
payload: the artifact carries a row in a SEPARATE, compiler-generated
`EQUIVALENCES` table (`lucide:X` → `X`) — one payload, canonical-only
counts, and exempt from the `as`-alias grammar and collision matrix BY
CONSTRUCTION (a different table under a different law; alias↔key
collision is IMPOSSIBLE under the alias grammar — aliases cannot
contain `:` — and `canonicalOf` chains ALIASES then EQUIVALENCES so an
`as` alias on a deduped ref resolves through both). The css-laws
workspace package SHALL carry the Owner-confirmed corrected name
`@jixoai/ui-css-laws`; the `@jixoai/css-laws` MARKER TOKEN in the theme
sheets is a decoupled protocol string and does not migrate.

#### Scenario: a custom channel replaces per-icon config

- GIVEN `defineIconChannel({ id: 'myco', prefix: 'myco', resolveFile:
  (ref) => resolvePeerFile('my-icons', `svgs/${ref}.svg`) })`
  registered via `library.channels`
- WHEN a component writes `<Icon name="myco:logo" />`
- THEN the scanner collects it, the channel resolves it, the artifact
  packs `myco:logo` and `IconName` gains `myco:${string}` — with ZERO
  per-icon `library.icons` entries

#### Scenario: the built-ins import from their own entries

- GIVEN `import { md } from '@jixoai/ui-vite-plugin/icons/md'` and
  `library: { channels: [md()] }`
- WHEN the build runs
- THEN `md:` refs resolve exactly as the presets era's material
  preset did (same peer package, same options, same errors)

#### Scenario: lucide needs no import and scans like any channel

- GIVEN a default library config (no channels) and a component
  writing `<Icon name="lucide:zap" />`
- WHEN the build runs
- THEN the lucide channel (default-registered) resolves the ref
  through the IconNode lane and the artifact packs `lucide:zap`
  with no config declaration

#### Scenario: a scanned lucide ref dedupes against the built-in

- GIVEN the default manifest (38 built-ins including `check`) and a
  component writing `<Icon name="lucide:check" />`
- WHEN the artifact generates
- THEN no second payload packs — the artifact gains an EQUIVALENCES
  row `lucide:check` → `check` (never an ALIASES row) and
  `getIcon('lucide:check')` returns the built-in data (iconCount
  counts canonicals only); an `as` alias on the same ref
  (`lucide:check as c2`) chains through ALIASES then EQUIVALENCES to
  the same payload

#### Scenario: duplicate channel ids or prefixes fail by name

- GIVEN `channels: [md(), md({ weight: 500 })]`
- WHEN the config validates
- THEN startup fails naming both entries (the uniqueness law carried
  over from the presets era)
