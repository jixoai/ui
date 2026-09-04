# context-plugin — the plugin kernel (living spec)

## Purpose

The ContextPlugin kernel: every jixoai-ui Context object (density / hue /
highlight / any future def) can be intervened on by PLUGINS — pure,
immutable value transformers composed as Svelte reactive projections.
Context defs are identity objects; a plugin targets one BY REFERENCE and
its hook types bind the targeted def; the onion-order chain wraps one
writable raw value into a read-only exposed projection. Plugins are NOT
how components read context — components and Defaults never know them;
the kernel is a zero-npm-dependency registry:lib item.

> Capability owner: `registry/files/lib/context-plugin.svelte.ts` (the
> kernel, byte-mirrored to apps/www/src/lib/) + the def-owning axis
> modules (density.svelte.ts DENSITY_DEF, hue-runtime HUE_DEF,
> highlight context HIGHLIGHT_DEF, medium MEDIUM_DEF read-only).

## Current contract (state: 2026-09-03, context-plugin-v2)

## Requirements


### Requirement: context defs are identity objects

A context def SHALL be constructed by `defineContextDef` (frozen,
returned as-is — the def and its references are the SAME object). A
def SHALL carry the kernel's private type brand: an inline def
literal (the forgotten-import mistake) SHALL fail at compile time,
never become a silent dead target. The plugin chain's targeting
SHALL match by OBJECT IDENTITY (`plugin.targets.includes(def)`),
never by string comparison; `def.key` SHALL serve diagnostics
(error messages, gate vocabulary) only. General defs SHALL NOT
carry a runtime registry (identity matching is self-protecting);
the read-only marker set is the one runtime exception (see the
read-only requirement).

#### Scenario: an inline def literal fails to compile

- GIVEN `targets: [{ key: 'density', defaults: () => 'sm', ssrSafe:
  'default' }]` (no `defineContextDef`, no brand)
- THEN the call fails type checking — the silent dead target is a
  compile error, not a runtime mystery

#### Scenario: two defs with the same key never cross-target

- GIVEN two distinct `defineContextDef` products both declaring
  `key: 'density'`
- WHEN a plugin targets the first and a context instance is built on
  the second
- THEN no hook of that plugin runs (identity, not string, decides)

### Requirement: plugin targets bind a def at the type level

`definePlugin`'s spec SHALL take `targets: readonly [D]` — a
single-def tuple (one plugin, one def) — and every hook's value type
SHALL derive from that def (`DefValue<D>`, inferred through
`ContextDef<string, infer T>`). A hook declaring a parameter type
that disagrees with the targeted def's value type SHALL be a compile
error; the plugin author SHALL have no independent type parameter to
lie with.

#### Scenario: a wrong-typed before fails to compile

- GIVEN `targets: [DENSITY_DEF]` (value type `Density`) and
  `before: (value: number) => number`
- THEN the call fails type checking (spec-d negative probe)

#### Scenario: a dual-target plugin fails to compile

- GIVEN `targets: [DENSITY_DEF, HUE_DEF]`
- THEN the tuple violates `readonly [D]` and the call fails type
  checking

### Requirement: the medium def is read-only

The medium def SHALL be constructed by `defineReadOnlyContextDef`
(carrying the `ReadOnlyContextDef` marker and registered in the
kernel's read-only set). `definePlugin` SHALL reject a read-only
target at the type level (the conditional error literal arms) and
`definePlugin` and `provideContextPlugins` SHALL each reject it
again at runtime.

#### Scenario: a medium plugin cannot be authored

- GIVEN `targets: [MEDIUM_DEF]`
- THEN the call fails type checking; the cast-forged runtime
  equivalent throws at construction and again at registration

### Requirement: the onion law and the identity fast path

The intervention semantics SHALL hold unchanged: `init` runs ONCE at
instance creation (environment-free full-value reducers, plugin
order, later covers earlier); `before` walks the composed chain in
array order (outer→inner) and `after` in reverse (inner→outer), each
step gated by `filter !== false`; chain results SHALL NEVER flow
back into `raw`; a chain holding no plugin targeting the def SHALL
take the identity fast path — no hook of any kind runs and
`exposed === raw` by reference.

#### Scenario: the onion order is exact

- GIVEN two chained plugins A then B on one def
- WHEN the projection evaluates
- THEN the call order is exactly `before:A → before:B → after:B →
  after:A`

#### Scenario: zero targeting stays structurally free

- GIVEN a scope whose chain holds no plugin for the def
- WHEN the pipeline is built
- THEN `exposed === raw` and no derived chain segment is created

### Requirement: roots are scoped and stack

`provideContextPlugins` SHALL capture the nearest ancestor scope and
append this root's sorted plugins (parent-first; `pre`/unanchored/
`post` stable anchors; same-NAME collapse to the later registration
within one root, cross-root names never dedupe), freezing the result
ONCE — resolves and gets never recompose it. There SHALL be no
module-level singleton registry.

#### Scenario: nested roots compose parent-first

- GIVEN an outer root providing A and an inner root providing B
- WHEN a context instance is created inside the inner root
- THEN its chain is `[A, B]` — the inner root's interventions land
  innermost

### Requirement: the kernel is a zero-npm-dependency registry:lib item

The kernel SHALL live at `registry/files/lib/
context-plugin.svelte.ts` as a registry:lib item (byte-mirrored to
`apps/www/src/lib/`, listed in the mirror manifest, blueprint scene
committed), importing NOTHING beyond `svelte` and same-tree lib
modules — never a provider module (medium/hue implementations are
site concerns). The density item SHALL declare
`@jixoai/context-plugin` in its registryDependencies; the defaults
and paint items SHALL NOT (their DIRECT faces stay kernel-free —
the kernel rides the density item transitively, so a press-button
install reaches it through press-button's own density dependency). The plugin scope key SHALL be a module-private symbol
(no `Symbol.for` global registry key remains).

#### Scenario: a consumer installs density

- WHEN the registry resolves the density item's dependencies
- THEN the kernel arrives as a registry:lib item and the plugin
  economy is installable outside the site

#### Scenario: the module posture holds

- WHEN the dependency gate scans the kernel's imports
- THEN only `svelte` and same-tree lib imports are found (zero npm)

### Requirement: env is injected; the kernel imports no provider

`ContextEnv.medium` SHALL read through the `medium` getter injected
at `provideContextPlugins` (options: `{ root?, medium? }`);
absent injector or `undefined` SHALL yield the explicit `'screen'`
initial (SSR truth, never a window access). The `MediumState`
vocabulary type SHALL be owned by the kernel; the medium module
SHALL import it from the kernel (never the reverse direction).

#### Scenario: a root above every medium provider

- GIVEN a plugin root provided with no `medium` injector
- THEN `env.medium` is `'screen'` and `env.root` is `undefined`

### Requirement: resolution happens inside the component window — a hard contract

Context reads (the plugin scope, axis ambient reads, slot ambient
reads) SHALL happen inside a component's initialization/`$derived`
window. A read outside that window SHALL throw the platform's
`lifecycle_outside_component` error UNTOUCHED — the kernel and the
axis/tool modules SHALL NOT catch, normalize, or string-match
lifecycle errors; there SHALL be no ambient-skip degradation
anywhere on the path. Unit assertions of resolution SHALL mount a
host component (the harness fixtures).

#### Scenario: an out-of-window resolve throws

- GIVEN `XxxDefaults.resolve({})` invoked in a plain unit test
- WHEN no component window exists
- THEN the platform error propagates (no silent own-only
  projection)

#### Scenario: an axis bug still propagates

- GIVEN an axis module whose ambient read throws a non-lifecycle
  error
- WHEN resolve evaluates the slot
- THEN the error propagates (no silent identity)
