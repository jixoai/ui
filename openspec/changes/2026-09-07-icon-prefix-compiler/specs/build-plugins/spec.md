# build-plugins — spec delta (icon-prefix-compiler)

## ADDED Requirements

### Requirement: prefixed icon names scan from source into the generated set

A vite transform (enforce: 'pre', scoped to consumer .svelte/.ts/
.js/.html sources, excluding node_modules/dist/.svelte-kit/virtual
modules/the artifact itself) SHALL collect STATIC `name="<preset>:
<kebab>"` and `name="<preset>:<kebab> as <identifier>"` literals
(attribute and string-literal expression forms only — no expression
evaluation) and feed them to the generator as a third input stream.
Scanned refs resolve through the enabled presets' resolvers and pack
WITHOUT any vite-config declaration; duplicate refs (no alias)
dedupe silently; the scan order never affects artifact bytes
(refs sort by (preset, name)). A change in the scanned set SHALL
invalidate and regenerate the artifact through the slot face's
refresh path.

#### Scenario: an undeclared prefixed name just works

- GIVEN `presets: ['material']` and a component containing
  `<Icon name="md:copy_all" />` with NO `library.icons` entry
- WHEN the build runs
- THEN the artifact packs `md:copy_all` and `IconName` admits it

#### Scenario: a dynamic expression is intentionally unserved

- GIVEN `` <Icon name={`md:${x}`} /> ``
- WHEN the scanner runs
- THEN nothing is collected for it (documented contract: dynamic
  names ride the runtime lane)

### Requirement: `as` aliases register dual keys, never rewrite sources

`name="md:X as Y"` SHALL declare Y as a local alias: the artifact
registers BOTH `md:X` and `Y` as keys into the SAME packed entry
(one payload, both resolvable; sources are NEVER rewritten — the
ruled dual-key form). Collision rules SHALL fail the build with
named diagnostics: an alias colliding with any declared/scanned
name; two refs claiming one alias; a ref's name colliding with
another ref's alias. Alias identifiers SHALL match
`/^[a-z][A-Za-z0-9]*$/`.

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
returns null, the component renders its reserved box, and (dev
server only) the unknown name warns once through the chunk-warn
channel.

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
