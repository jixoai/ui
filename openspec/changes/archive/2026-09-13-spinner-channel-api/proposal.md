# spinner-channel-api

## Why

The spinners feature shipped in v0.5.0 flattened the icons channel
concept out ("no chunks, no channels" — spin-ora-svg-lane design §5,
a deliberate scope cut recorded at the time). The Owner ruling of
2026-09-13 reverses that cut: the plugin's custom-extensibility
surface SHALL align with the icon channel API — the `md:home`-style
prefixed reference form, the `defineIconChannel` factory/normalize
validation split, and the shipped-pack-as-channel shape. Consumers
today can only bring flat names; there is no namespaced lane and no
first-class channel instance to validate, name in errors, or carry
peer/defaults metadata.

## What Changes

- `SpinnersPluginOptions` gains `channels?: readonly SpinnerChannel[]`
  (additive; the flat `spinners` record and every existing option are
  unchanged — 0.4.0 configs keep working verbatim).
- New `SpinnerChannel` contract + `defineSpinnerChannel(spec)` public
  factory mirroring the icon channel law: id/prefix split, grammar
  `/^[a-z][a-z0-9-]*$/` (id) and `/^[a-z][a-z0-9]*$/` (prefix),
  factory-time shape+grammar validation, config-time set-level
  uniqueness (one entry per id, one channel per prefix), optional
  `peerPackage` + `defaultsNote` metadata.
- A channel contributes its spinner record under namespaced artifact
  keys `prefix:name`; the full-name grammar extends to
  `prefix:kebab` for the flat record too (the explicit-override
  lane). Merge order: defaults → channels in registration order →
  flat record (explicit beats channels, last-writer on full-name
  collision, the icons override law).
- The two vendored packs each grow a channel factory alongside the
  existing Record export (the spread lane is untouched):
  `magecdn({ pick? })` (prefix `magecdn`, all 94 or the picked
  subset) and `sam({ pick? })` (id `svg-loaders`, prefix `sam`,
  SamHerbert's 12) from their existing sub-entries.
- The www site dogfoods a `docs` channel with one custom loader; the
  docs page documents the channel face and renders the namespaced
  name live.
- Release train v0.5.1: CLI 0.5.0 → 0.5.1, plugin 0.4.0 → 0.5.1
  (versions align with the train from this release on).

## Impact

- `packages/vite-plugin/src/spinners/` — new channel/ module
  (types/define/normalize), resolve.ts grammar + merge law,
  pack factories, umbrella re-exports from the ./spinners entry.
- `packages/vite-plugin/test/spinners/` — channel validation, merge
  precedence, pack-factory, and artifact-key coverage; packaging
  frozen-export lists grow.
- `apps/www` — vite.config dogfood channel, regenerated committed
  artifact, docs page section; `registry.json` spin docs fields.
- Zero component changes expected: namespaced names are ordinary
  union strings through the existing name lane (verified by test).
- Spec: build-plugins — one ADDED requirement (the channel
  contract), MODIFIED spinners-face + packs requirements.
