# component-authoring deltas (context-plugin-v2)

## MODIFIED Requirements

### Requirement: slots are branded factory products only

A Defaults slot SHALL be a branded callable (module-private unique
symbol) constructible ONLY by the slot factories exported from
`lib/defaults.svelte.ts` and the axis modules. Bare functions, bare
literals, and forged brand objects SHALL fail at compile time
(negative type assertions are gate material);
`defineComponentDefaults` SHALL additionally verify the brand at
runtime IN DEV ONLY (the `import.meta.env?.DEV`-gated WeakSet check
— vitest runs under vite so the guard stays test-assertable; the
type brand is the production contract); the gate's AST check SHALL
accept only registered factory calls as slot values.

#### Scenario: a bare function sneaks into slots

- GIVEN `defineComponentDefaults({ variant: (v) => v ?? 'fill' })`
- THEN the brand constraint rejects it at compile time and the gate
  fails it at AST level

### Requirement: slot factories are lazy; context reads happen at resolve time

Slot factories SHALL be pure at construction (capturing only the
own argument; module-level Defaults objects SHALL NOT touch
context). Context reads SHALL happen only when `resolve` evaluates
the slot — inside a component's initialization/`$derived` window
(Svelte's runtime carries the creating component's ctx through
derived recomputation). A read OUTSIDE that window SHALL throw the
platform's `lifecycle_outside_component` error untouched — slots
and axis modules SHALL NOT catch, normalize, or string-match
lifecycle errors, and there SHALL be no ambient-skip degradation;
axis-internal and plugin errors SHALL propagate the same way. Unit
assertions of resolution SHALL mount a host component (the
`unit-resolve-host` fixture and the per-suite host precedents).

#### Scenario: pure unit call outside a component

- GIVEN `PressButtonDefaults.resolve({})` must be asserted in a
  plain unit test
- WHEN the assertion renders the unit-resolve host (the resolve
  runs inside the host's `$derived` window)
- THEN the own-defaults projection is read from the host's echoed
  value — the window contract is the test's shape, not a runtime
  degradation

#### Scenario: an axis bug is not swallowed

- GIVEN an axis module whose ambient read throws a non-lifecycle
  error
- WHEN resolve evaluates the slot
- THEN the error propagates (no silent identity)

### Requirement: zone scopes are axis-level providers

A zone scope SHALL be a zero-DOM, getter-backed partial provider
for ONE axis, carrying axis VALUES only (never layout — the layout
half stays in components like ButtonGroup); the paint axis key
(`PAINT_ZONE_KEY`) SHALL be distinct from any family-state context
key; nested zone scopes stack with the nearest winning. During the
dual-key transition, the shared helper
`providePaintZone(variant: () => ZonePaintVariant | undefined)`
(exported from `lib/paint.svelte.ts`; ZonePaintVariant excludes
'link' — link is PressButton's interaction exception and never a
zone default) SHALL write ONLY the new PAINT_ZONE_KEY (payload:
`{ get variant() }`, getter-backed); ButtonGroup and
ButtonVariantScope keep writing the legacy BUTTON_GROUP_KEY
themselves (orientation/separator/layout semantics untouched,
r14-10 effective-variant logic intact) — their variant props NARROW
to ZonePaintVariant (a `<ButtonGroup variant="link">` that was
legal becomes a compile error; link stays reachable through
PressButton's own explicit prop) — and call the helper as
`providePaintZone(() => effectiveVariant)`; WHEN the legacy key's
inherited value is 'link' (possible only from an external old-only
provider), the new-key getter SHALL return undefined (link keeps
its legacy-key-only semantics and never enters PAINT_ZONE_KEY —
`effectiveVariant === 'link' ? undefined : effectiveVariant`), the
legacy key keeping its original value; a parent variant flip SHALL
re-derive both keys' consumers in the same frame (reactivity
assertion; external-old-link and dual-provider negative fixtures);
the paint SLOT reads PAINT_ZONE_KEY first, falling back to the
legacy key's variant when the new key is absent OR its getter
returns undefined (`newVariant ?? legacyVariant` — the
inherited-link narrowing relies on exactly this), TRUSTING the
typed zone domain (ZonePaintVariant narrows at the provider; the
values array is the gate's availability carrier, not a runtime
guard — an out-of-family ambient value is not clamped and does not
warn), so consumers under external old-only providers still inherit
(the external-old-link fixture asserts PressButton's
legacy-key-compatible result); the legacy key retires at a future
versioned checkpoint when the gate's consumer census reaches zero.

#### Scenario: nested zone scopes

- GIVEN an outer zone providing tonal and an inner zone providing
  ghost
- WHEN a button inside the inner zone resolves its paint slot
- THEN it sees ghost

#### Scenario: mixed legacy and migrated consumers in one group

- GIVEN a ButtonGroup (dual-providing) containing one legacy
  consumer reading BUTTON_GROUP_KEY and one migrated consumer
  reading PAINT_ZONE_KEY
- WHEN both resolve their variant
- THEN the values agree (atomic dual-write)

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception. Semantic color is NEVER a variant name: intent is expressed
by injecting values into the four global hue slots (`--jx-fill`,
`--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
inheritable). The action/status split is mandatory: destructive
ACTIONS inject `--destructive` (the fill pair), error STATUSES inject
`--error` into the tonal slot. Variant paint rides token utilities in
the markup (tw4 utility-authored law); press physics (`.jx-press`)
never change with paint. Availability is per-component (see the
frozen table in
openspec/changes/archive/2026-08-27-variant-grammar/design.md §4 —
the table itself is authoritative):
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
tonal/outline (default tonal, locally neutral); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability). Valued `data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`). The frozen table's per-component own defaults
become the `own` arguments of the corresponding
`paintSlot<FamilyVariant>(own, values)` in each family's Defaults
object (values = the family union's satisfies array — the gate's
availability carrier, AST-asserted bidirectionally against the
frozen table; the runtime consumes no value-domain guard); the
family's exposed union stays per the frozen availability (the
shared axis never widens it — link stays PressButton-only); the
previously implicit `??` chains become the paint slot's
`explicit ?? ambient(zone) ?? own` resolution.

The injection seam is TWO-LAYERED (hue-injection-utilities,
2026-08-27): the CANONICAL form for the curated semantic set is the
theme's TW4 `@utility` intent layer — `jx-hue-primary | neutral |
error | success | warning | info` (tonal slot) and
`jx-pair-destructive` (fill + fill-ink together, making the
always-inject-both law structural; there is no `jx-hue-destructive`
— the action/status split holds by construction). The
arbitrary-property class (`[--jx-tonal:var(--error)]`) remains the
escape hatch for values outside the closed set; ONE form per slot in
a class list (cross-form mixing is not dedupable). `cn()` registers
the closed set as tailwind-merge dedupe groups.

#### Scenario: a failed status chip is authored

- WHEN a badge must read as failed
- THEN it is `<Badge variant="tonal" class="jx-hue-error">` (or the
  arbitrary equivalent) — never `tone="destructive"` and never the
  destructive ACTION hue

#### Scenario: a variant utility set is audited

- GIVEN any component's variant map after this change
- WHEN the source guard scans its markup
- THEN every variant's paint consumes the four global slots and no
  variant name encodes a semantic hue

#### Scenario: the frozen table reads through Defaults

- GIVEN the frozen availability table and a migrated family
- WHEN the family's Defaults is read
- THEN every available variant in the table is addressable through
  the paint slot, the own default matches the table, and the
  family's union contains no variant outside its table row (link
  never reaches Badge/Chip/Alert)
