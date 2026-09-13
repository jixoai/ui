# build-plugins — spec delta (spinner-channel-api)

## MODIFIED Requirements

### Requirement: the spinners library face resolves named svg spinners through plugin config

`jixoai({ spinners })` SHALL be the svg-animation spinner feature,
default OFF (`false`/`undefined` registers nothing); a bare `{}`
IS a legal configuration meaning the built-in manifest only. The
options SHALL be: `includeDefaults` (default true — the vendored
`blocks-wave` manifest, the magecdn MIT artwork carried verbatim in
the package), `spinners` (a record of name → SpinnerSource — the
grammar being the flat `/^[a-z0-9][a-z0-9-]*$/` (digit-leading
legal, the magecdn site URLs kept verbatim) OR the namespaced
`/^[a-z][a-z0-9]*:[a-z0-9][a-z0-9-]*$/`; SpinnerSource being an
inline `<svg>` string or `{ file }` with the plugin owning ALL file
I/O), `channels` (default absent — a readonly array of
`SpinnerChannel` instances, see the channel-contract requirement),
`output` (default `src/lib/spin-set.gen.ts`), and `write` (default
`false` — the single-writer law: in THIS repo the root `gen:spins`
script is the ONLY artifact writer; the vite adapter validates and
resolves at build start and WARNs on on-disk artifact drift but
never writes unless a consumer opts in).

#### Scenario: a bare configuration is legal

- GIVEN `jixoai({ spinners: {} })`
- WHEN the generator emits the artifact
- THEN the union is exactly `['blocks-wave']` and no named startup
  error fires (the icons ≥1-of-2 matrix does NOT apply — spinners
  have one face)

#### Scenario: a custom spinner joins the type union

- GIVEN `spinners: { spinners: { my-loader: { file: './l.svg' } } }`
- WHEN the generator emits
- THEN `SpinName` includes `'my-loader'` and `getSpin('my-loader')`
  answers synchronously, while `getSpin('myLoader')` is `undefined`

#### Scenario: a same-name entry overrides the built-in

- GIVEN `spinners: { spinners: { 'blocks-wave': customSvg } }`
- WHEN the generator packs
- THEN the name resolves to the custom artwork and no duplicate
  payload exists

#### Scenario: a namespaced flat key overrides a channel entry

- GIVEN a registered `myco` channel carrying `pulse` AND
  `spinners: { spinners: { 'myco:pulse': explicitSvg } }`
- WHEN the generator packs
- THEN `myco:pulse` resolves to the explicit artwork — explicit
  config beats channels, the icons override law

### Requirement: the vendored loader packs ship as injectable sub-entries

The package SHALL ship two loader packs as independent sub-entries:
`./spinners/magecdn` (the 94 VERIFIED-WORKING loaders of the magecdn
catalog — 109 vendored minus 15 dynamic-context exclusions, each
excluded with a receipt in the pack generator; upstream credit
shubhamjain/svg-spinners, itself aggregating SamHerbert's MIT set)
and `./spinners/svg-loaders` (SamHerbert's classic 12-loader MIT
set). Each sub-entry SHALL export BOTH the spread lane — a
`Readonly<Record<string, SpinnerSource>>` the consumer SPREADS into
`spinners.spinners` (same-name entries override by spread order,
the icons override law; unchanged from 0.4.0) — AND a channel
factory: `magecdn({ pick? })` building the `magecdn`-prefixed
channel (all 94 loaders, or exactly the picked channel-relative
names; an unknown pick name is a named factory error) and
`sam({ pick? })` building `{ id: 'svg-loaders', prefix: 'sam' }`
over the 12 (the short-prefix law, the icons md/ph/rx precedent).
Vendoring SHALL normalize only namespace noise (an `xml:space`
attribute and a habit-declared `xmlns:xlink` with zero uses are
stripped) and literal white ink (stroke/fill `#fff`, any case,
becomes currentColor); every other byte rides verbatim with the
source + license named in the file header.

#### Scenario: a pack spread joins the union

- GIVEN `jixoai({ spinners: { spinners: magecdnSpinners } })`
- WHEN the generator emits
- THEN all 94 names join the `SpinName` union and
  `getSpin('180-ring')` answers synchronously

#### Scenario: a pack channel namespaces its picks

- GIVEN `jixoai({ spinners: { channels: [magecdn({ pick: ['clock',
  'bars-scale'] })] } })`
- WHEN the generator emits
- THEN the union gains exactly `'magecdn:clock'` and
  `'magecdn:bars-scale'` (no other magecdn name) and
  `getSpin('magecdn:clock')` answers synchronously

#### Scenario: pack artwork meets the shared laws

- WHEN the pack battery runs
- THEN every key matches the grammar, every svg passes the RAW
  safety checker, and every entry structurally extracts

## ADDED Requirements

### Requirement: spinner channels carry the icon channel contract

The spinners face SHALL accept first-class channel instances —
`SpinnerChannel` with `id` (`/^[a-z][a-z0-9-]*$/`, unique among
registered), `prefix` (`/^[a-z][a-z0-9]*$/`, the `prefix:name`
namespace, unique among registered), `spinners` (a record of
channel-RELATIVE names each matching the flat spinner grammar →
SpinnerSource), and optional `peerPackage` + `defaultsNote`
metadata. `defineSpinnerChannel(spec)` SHALL be the public factory:
shape + grammar + per-entry name validation with named teaching
errors at the factory (the defineIconChannel law); set-level
uniqueness (one entry per id, ONE channel per prefix — two
channels sharing a prefix would silently last-win the merge) SHALL
fail at config normalization, which also re-runs the factory checks
so hand-forged literals fail by name. There SHALL be no reserved
id/prefix (the default manifest is a flat built-in, not a channel).
A channel's entries fold into the packing map as `prefix:name`
keys between the built-in manifest and the flat record (defaults →
channels in registration order → explicit record, last-writer on
full-name collision); namespaced names SHALL cross the SAME
resolve → RAW safety → structural validation pipeline and SHALL
require no component change (ordinary quoted union strings through
the existing name lane).

#### Scenario: a custom channel namespaced into the union

- GIVEN `channels: [defineSpinnerChannel({ id: 'myco', prefix:
  'myco', spinners: { pulse: inlineSvg } })]`
- WHEN the generator emits
- THEN `SpinName` includes `'myco:pulse'` and `getSpin('myco:pulse')`
  answers synchronously — no component edit involved

#### Scenario: two channels sharing a prefix fail by name

- GIVEN two registered channels both prefixed `myco`
- WHEN config normalization runs
- THEN a named startup error fires (one channel per prefix) — never
  a silent last-win

#### Scenario: a forged channel literal fails the smuggle gate

- GIVEN a hand-built channel object with an illegal prefix
- WHEN config normalization runs
- THEN the factory's grammar error fires by name (normalization
  re-runs every factory check)
