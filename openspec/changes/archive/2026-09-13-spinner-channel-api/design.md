# spinner-channel-api — design

## §0 the contract (icon-channel-api design §0, carried over)

A spinner channel is ONE spinner source reachable through a
prefixed reference form (`myco:pulse`, `magecdn:blocks-wave`). The
contract mirrors `IconChannel` field-for-field where the spinner
domain has an equivalent, and replaces the icons' discriminated
resolver with the domain's honest equivalent:

```ts
interface SpinnerChannel {
  readonly id: string;        // /^[a-z][a-z0-9-]*$/ — unique among registered
  readonly prefix: string;    // /^[a-z][a-z0-9]*$/  — the `prefix:name` namespace, unique
  readonly spinners: Readonly<Record<string, SpinnerSource>>; // channel-RELATIVE kebab names
  readonly peerPackage?: string;  // named in loud-fail install hints
  readonly defaultsNote?: string; // human-readable mapping note
}
```

Why a record and not the icons' `resolveFile` resolver: icons
resolve per-ref out of peer packages BECAUSE the enabled set is not
enumerable (only used refs resolve, lazily chunked). Spinners have
no lazy tier — every configured spinner compiles into the one
artifact — so a channel IS its enumerable name set. The `resolveFile`
indirection would add a promise the domain cannot keep (nothing
resolves per-ref later). Both forms feed the SAME downstream:
resolve → RAW safety → structural validation → the pure generator.

`peerPackage` rides as ADVISORY metadata (declaration, not
resolution — the mirror of the resolver swap above): the icons'
loud-fail install hints hang off peer file resolution, which this
lane does not perform; the pack factories carry none (their bytes
are vendored). It names the expected package in error text and docs
only.

## §1 the validation split (the codex r1 B1 law, verbatim)

`defineSpinnerChannel(spec)` validates SHAPE + GRAMMAR at the
factory (one argument: everything checkable there fails there, with
named teaching errors — the defineIconChannel texts, adapted). SET-
level uniqueness (one entry per id, ONE channel per prefix — two
channels sharing `myco:` would silently last-win the merge map, a
configuration lie) lives in `normalizeSpinnerChannels` at config
time, because the one-argument factory cannot know the registered
set. `normalizeSpinnerChannels` also RE-RUNS the factory's checks so
a hand-forged channel literal fails by name (the smuggle gate).

No reserved id/prefix exists: icons reserve `lucide` because a
default-registered channel owns it; spinners' default manifest
(blocks-wave) is a FLAT built-in, not a channel, so there is nothing
to reserve. A future default-registered channel would reserve then.

## §2 the grammar + the merge law

Full artifact names accept the union of the existing flat grammar
and the namespaced form:

```
/^[a-z0-9][a-z0-9-]*$/                       (flat, unchanged — digit-leading legal)
/^[a-z][a-z0-9]*:[a-z0-9][a-z0-9-]*$/        (prefix:name — prefix per §0, name flat)
```

Channel-internal names are validated against the FLAT grammar at the
factory (a channel carrying `my-loader` produces `myco:my-loader`).
The `:` separator appears exactly once (regex-anchored).

`SPINNER_NAME_PATTERN` KEEPS its meaning (flat / channel-relative —
the pack battery's existing consumer) and a new
`SPINNER_FULL_NAME_PATTERN` (the union above) joins the exported
surface; rejection messages teach BOTH forms (the icons
teaching-error law). Flat namespaced keys are DECLARATIONS, not
refs: the icons' `assertRefPrefixesEnabled` law (every ref-shaped
source must speak an enabled prefix) has no spinner twin — a flat
`'myco:pules'` typo defines a new union member rather than
overriding anything. Recorded as the deliberate asymmetry: flat
keys create; only identical FULL names override (the case below).

An EMPTY channel record and an EMPTY `pick` are named errors at the
factory — "no silent no-ops" is §3's own law applied to the empty
set.

## §2a the normalization plumbing (the icons idempotence law)

`NormalizedSpinnersOptions` GAINS `channels: readonly
SpinnerChannel[]` — validated instances carried through, so re-
normalizing an already-normalized object is a no-op (the vite
adapter normalizes at config time and `resolveSpinnerInputs`
normalizes again inside; the icons precedent verbatim). Dropping
the field on the second pass would silently pack zero channel
spinners on the vite lane while the root script worked — the
CONFIG-PARITY test exists for exactly this shape of skew.

Merge order into the packing map (Map key insertion order provides
in-place override, the existing mechanism, untouched):

1. `includeDefaults` manifest (flat built-ins) — first;
2. channels, in `channels: [...]` registration order — each entry
   folds in as `prefix:name` keys;
3. the flat `spinners` record, insertion order — explicit config
   beats channels and built-ins; a flat `myco:pulse` key (now legal
   under the extended grammar) overrides the channel's entry.

A same-FULL-NAME key IS the documented override (a flat `myco:pulse`
overriding the channel's `myco:pulse`); distinct keys never collide —
a `magecdn()` channel beside a `magecdnSpinners` spread ships
`magecdn:blocks-wave` AND `blocks-wave` as two members (an opt-in
double-shipment, documented, not warned).

## §3 the pack channel factories (the md()/ph() precedent)

Each vendored pack sub-entry grows a channel factory alongside its
existing Record export (the spread lane ships unchanged — 0.4.0
configs are sacred):

- `import { magecdn } from '…/spinners/magecdn'` →
  `magecdn({ pick?: readonly string[] })` builds
  `{ id: 'magecdn', prefix: 'magecdn', spinners: …94… }`; `pick`
  selects channel-relative names (default: all). An unknown pick
  name is a named factory error (the set is enumerable — no silent
  no-ops).
- `import { sam } from '…/spinners/svg-loaders'` →
  `sam({ pick? })` builds `{ id: 'svg-loaders', prefix: 'sam', … }`
  — the short-prefix law (icons: id `material`, prefix `md`):
  `sam:tail-spin` reads, `svgloaders:tail-spin` does not.

`pick` exists because the artifact is all-or-nothing (no lazy tier):
a consumer wanting 3 of 94 loaders must not ship 94 payloads. The
flat spread already provided selection; channels inherit it. `pick`
is a FILTER, not an ordering: the pack record's key order wins and
duplicate picks dedupe silently; an EMPTY pick is a named error
(§2's empty-set law).

## §4 the component: zero-change law

Namespaced names are ordinary strings in the generated `SpinName`
union (quoted members — the digit-leading precedent already quotes
keys). `getSpin`, the name lane's union check, the text-catalog
coexistence (camelCase can never match `prefix:kebab`), `scopeSvgIds`
keying, and the keyframes engine are name-agnostic. Pinned at the
GENERATOR level: a regression test drives the real generator with a
`myco:pulse` channel config and asserts the artifact round-trips
`getSpin('myco:pulse')` + the quoted union member (live rendering
is the docs page's dogfood, §5).

## §5 the umbrella face + the dogfood

`defineSpinnerChannel` (and the `SpinnerChannel` type) export from
the existing `./spinners` sub-entry — the umbrella `…/spinners`
module already re-exports the face's public surface; the pack
factories export from their own sub-entries (the `…/icons/md`
precedent: importable without reaching the umbrella graph).

apps/www dogfoods the lane in vite.config.ts: a `docs` channel
carrying one authored inline loader joins the existing picks. The
CONFIG-PARITY law covers THREE configs — `apps/www/vite.config.ts`,
`registry/vite.config.ts` (the mirror harness rides the same
picks), and the root `gen:spins` script's SPINNERS_OPTIONS — all
three gain the channel together or the committed artifacts diverge;
the committed artifacts then regenerate (`npm run gen:spins`). The
docs page's svg-lane section documents the channel face with the
config snippet and renders `<Spin spinner="docs:…" />` live.

## §6 release

One train: tag v0.5.1 publishes jixoai-ui 0.5.1 (no functional CLI
change — the bump keeps the train coherent) and
`@jixoai/ui-vite-plugin` 0.5.1 (the channel face; plugin and train
versions align from here on). The blog post's title drops the patch
emphasis ("Jixoai UI v0.5") per the Owner ruling and its plugin
references move to 0.5.1.
