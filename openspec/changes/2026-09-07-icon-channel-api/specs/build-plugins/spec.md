# build-plugins — spec delta (icon-channel-api)

## ADDED Requirements

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
payload: the artifact carries an ALIASES row (`lucide:X` → `X`), one
payload, canonical-only counts).

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
- THEN no second payload packs — the artifact gains an ALIASES row
  `lucide:check` → `check` and `getIcon('lucide:check')` returns the
  built-in data (iconCount counts canonicals only)

#### Scenario: duplicate channel ids or prefixes fail by name

- GIVEN `channels: [md(), md({ weight: 500 })]`
- WHEN the config validates
- THEN startup fails naming both entries (the uniqueness law carried
  over from the presets era)

## MODIFIED Requirements

### Requirement: the icons library face ships preset resolvers for the common icon libraries

`library.channels` SHALL register icon channels, each contributing a
prefixed reference form usable wherever IconSource strings are
(`md:home`, `ph:atom`, `rx:system:add-line`). Channels SHALL resolve
ONE icon per reference at build time through the shared safety→
optimize→extract pipeline (no bulk bundling), with per-icon nature
detection. The shipped channels and their SVG-source packages
(research-verified 2026-09-07): material (sub-entry `…/icons/md`) →
`@material-symbols/svg-${weight}` (Apache-2.0; weight/style/fill
configurable, default outlined / weight 400 / FILL 0), phosphor
(`…/icons/ph`) → `@phosphor-icons/core` (MIT), remixicon (`…/icons/rx`)
→ `remixicon` (Apache-2.0); `lucide` remains the default-registered
channel. Each channel package SHALL be an optional peer whose absence
fails loudly with the install hint (the lucide precedent). Referencing
a disabled or unknown channel prefix SHALL fail with a named error
listing the enabled set. tabler and hugeicons SHALL NOT ship as
channels (no per-icon SVG source package on npm / JS-data only —
documented on the icons page), and SF Symbols SHALL NOT ship on
licensing grounds (Apple system-provided-image terms restrict use to
Apple-platform apps and prohibit SVG export/redistribution — the docs
page states the verdict; consumers with licensed artwork point the
generic `{file}`/`{font}` lanes at their own assets).

#### Scenario: a material preset icon joins the set

- GIVEN `channels: [md()]` and `icons: { home: 'md:home' }`
- WHEN the generator runs
- THEN `IconName` includes `home` rendering the outlined weight-400
  FILL-0 Material Symbols artwork, and no other material icon
  entered the artifact

#### Scenario: the preset package is absent

- GIVEN `channels: [md()]` without `@material-symbols/svg-400`
  installed
- WHEN resolution starts
- THEN the build fails with a named error carrying the npm install
  line (no silent fallback)

#### Scenario: an unknown prefix is referenced

- GIVEN `icons: { x: 'fa:home' }` with no channel providing `fa:`
- WHEN the config validates
- THEN startup fails naming the reference and the enabled prefixes

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
`name="<channel-prefix>:<name>"` and `name="<channel-prefix>:<name> as
<identifier>"` literals (attribute and string-literal expression
forms only — no expression evaluation). The scanner SHALL capture
the prefix plus the COMPLETE literal suffix (to the closing quote
or the ` as ` boundary) and validate NOTHING about the suffix — the
OWNING CHANNEL's own name grammar is the law and the channel
resolver is the authority (material-symbols names are snake_case,
e.g. `md:copy_all`; remix names carry a second colon, e.g.
`rx:system:add-line` — any suffix pattern would reject legal
names). Scanned keys like `md:copy_all` are EXEMPT from the
camelCase icon-name pattern while aliases must satisfy it.
Name-literals whose prefix is not an enabled channel prefix SHALL be
ignored by the scanner (the unknown-prefix named error is a
config-face law over `library.icons` entries, unchanged). Scanned
refs resolve through the owning channels' resolvers and pack
WITHOUT any vite-config declaration; duplicate refs (no alias)
dedupe silently; the scan order never affects artifact bytes
(refs sort by (prefix, name)). A change in the scanned set SHALL
invalidate and regenerate the artifact through the slot face's
refresh path (dev only).

#### Scenario: an undeclared prefixed name just works

- GIVEN `channels: [md()]` and a component containing
  `<Icon name="md:copy_all" />` with NO `library.icons` entry
- WHEN the build runs
- THEN the artifact packs `md:copy_all` and `IconName` admits it

#### Scenario: a production build packs an undeclared scanned ref

- GIVEN `channels: [md()]`, a component containing
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

### Requirement: IconName gains template-literal members for enabled presets only

For each channel prefix the consumer has enabled (the
default-registered `lucide` plus every `library.channels` entry), the
generated `IconName` union SHALL include a
`` `${prefix}:${string}` `` template-literal member; prefixes that
are not enabled contribute NO member (an `fa:` name is a compile
error with no runtime story). This is the three-tier safety
contract, stated precisely: prefix safety at COMPILE time,
concrete-name validity at BUILD time (a scanned or declared ref that
fails channel resolution is a named build error), and dynamic
composition at RUNTIME — `getIcon` on an unpacked name returns null,
the component renders its reserved box through the existing lazy
path, and the unknown name warns once through the chunk-warn channel
(the channel is not dev-gated today and stays that way), with the
generator's loadIcon error message for unpacked names covering BOTH
causes (artifact drift or a dynamic/scanned-miss name).

#### Scenario: the union tracks enabled presets

- GIVEN `channels: [md(), ph()]`
- WHEN the artifact generates
- THEN `IconName` includes `md:${string}` and `ph:${string}` and
  NOT `rx:${string}`

#### Scenario: a scanned ref that fails resolution is a build error

- GIVEN `<Icon name="md:not_a_real_symbol" />` and the material
  package installed
- WHEN the generator resolves the scan
- THEN the build fails naming the ref and the channel (never a
  silently blank glyph)
