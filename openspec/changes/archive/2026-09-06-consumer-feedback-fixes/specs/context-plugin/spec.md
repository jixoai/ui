# context-plugin — delta

## MODIFIED Requirements

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

The kernel's own brand-stamping statements SHALL stay
typecheck-clean under current TypeScript (the 2026-09-06 consumer
gate: TS 5.9 svelte-check): assignments that write the brand or the
read-only marker route through MUTABLE CARRIER casts (or
`Object.defineProperty`) — never through the readonly branded
interface — and computed unique-symbol keys never ride
`Object.assign`'s inferred type (it widens the key). The runtime
result is byte-identical; only the assertion lane changes.

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

#### Scenario: the kernel passes a TS 5.9 consumer gate

- GIVEN the registry-shipped `context-plugin.svelte.ts` and
  `defaults.svelte.ts` installed in a consumer running svelte-check
  with TypeScript 5.9
- THEN zero brand-stamping diagnostics surface — the carrier-cast /
  defineProperty lanes typecheck while the branded interface stays
  readonly to consumers
