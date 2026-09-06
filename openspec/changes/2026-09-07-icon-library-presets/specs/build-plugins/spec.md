# build-plugins — spec delta (icon-library-presets)

## ADDED Requirements

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
file I/O — loads through the provider context, watched for HMR), a
`lucide:<kebab>` reference, a preset reference `md:`/`ph:`/`rx:`
(the preset node-resolves the peer package to an ABSOLUTE SVG path;
the plugin still READS it through the provider context), or a font
source `{ font, code }` / `{ font, liga }` (build-time glyph
extraction)), `maxChunkBytes` (default 20480, raw
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
