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
resolvable names). The runtime artifact SHALL remain pure SVG —
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
- THEN the build fails listing the ligature names that DO resolve
  in that font (never a silent blank glyph)
