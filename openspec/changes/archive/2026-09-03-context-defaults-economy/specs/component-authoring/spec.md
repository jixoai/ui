# component-authoring delta — the Defaults contract

## ADDED Requirements

### Requirement: every registered component family ships a Defaults contract

Every registered component family with public STYLE props (per the
pinned detection vocabulary) SHALL ship ONE `XxxDefaults` object (a
`*-defaults.svelte.ts` file inside the family folder, a member file of
the registry:ui item, byte-mirrored, zero kernel imports) — per
family, not per part file. The Defaults object is the family's SINGLE
declared ambient contract. Coverage means EVERY style prop has a
slot, in exactly two kinds: an axis slot (ambient-manageable) or a
literal-family slot — `literalSlot` (own default declared) or
`absentSlot` (absent-meaningful, undefined-capable) — both with
ambient capability pending a future axis. Every style prop SHALL be classified (axis / literal /
roadmap / never-ambient); the classification is versioned and
gate-checked as a whole.

#### Scenario: the standalone look vs the nested look

- GIVEN `PressButtonDefaults` declares `variant: paintSlot<PressButtonVariant>('outline', pressButtonVariants)`
- WHEN a PressButton renders standalone
- THEN its variant resolves to 'outline' (the frozen variant-grammar
  default)
- WHEN the same button renders inside a Dialog zone providing ghost
- THEN its variant resolves to 'ghost' with no per-call-site code

#### Scenario: a style prop with no axis yet

- GIVEN Dialog exposes `variant?: 'solid' | 'acrylic' | 'auto'`
- THEN its Defaults declares
  `variant: literalSlot<SurfaceVariant>('auto')` — auditable today,
  promotable to an axis slot when an axis opens

#### Scenario: an absent-meaningful style prop enters the contract

- GIVEN a component's optional style prop whose absence IS the
  meaningful state (native/unset rendering)
- THEN its Defaults declares `absentSlot<ThatUnion>()` (the absent
  overload) — the slot's resolved value may be undefined and the
  component renders its absent-state path

#### Scenario: the contract is auditable

- GIVEN a reviewer asks which of a family's props respond to the
  environment
- THEN the answer is exactly the key set of its Defaults `slots`,
  split by slot kind

### Requirement: slots are branded factory products only

A Defaults slot SHALL be a branded callable (module-private unique
symbol) constructible ONLY by the slot factories exported from
`lib/defaults.svelte.ts` and the axis modules. Bare functions, bare
literals, and forged brand objects SHALL fail at compile time
(negative type assertions are gate material); `defineComponentDefaults`
SHALL additionally verify the brand at runtime (the kernel's
registration-guard precedent — cast-forged slots are rejected when
the Defaults object is built); the gate's AST check SHALL accept only
registered factory calls as slot values.

#### Scenario: a bare function sneaks into slots

- GIVEN `defineComponentDefaults({ variant: (v) => v ?? 'fill' })`
- THEN the brand constraint rejects it at compile time and the gate
  fails it at AST level

### Requirement: explicit-wins sentinel discipline

`undefined` SHALL be the only "unspecified" sentinel (TS optional
props; `null` is not a sentinel and the slot signature rejects it).
Slot resolution SHALL be `explicit ?? ambient ?? own default` with
ambient read via getter closures (no snapshot caching). No-opinion
axes (density) SHALL keep their fleet-law semantics: the slot's
resolved value may BE undefined (no opinion → no stamp → the ambient
css scope channel keeps flowing); a family's local fallback (e.g.
Table's 'sm') SHALL be declared as the slot's own argument, never an
inline component fallback. Instance semantics props (open/bind,
callbacks, aria/data attributes, class, id) SHALL NEVER become
ambient; bindable state-typed style props (page-owned toggles) are
instance semantics and exempt.

#### Scenario: explicit beats the zone

- GIVEN a zone scope provides variant ghost
- WHEN a button inside passes `variant="fill"`
- THEN the button renders fill — the explicit prop wins

#### Scenario: a family fallback migrates into the slot

- GIVEN Table today resolves `density ?? 'sm'` inline
- WHEN its Defaults declares `density: densitySlot('sm')`
- THEN no-provider resolves 'sm', an explicit prop wins, and a parent
  provider's opinion beats 'sm'

#### Scenario: no-opinion stays unstamped

- GIVEN a density slot resolving to undefined (no explicit, no
  inherited opinion, no own)
- WHEN the component stamps `data-density={d.density}`
- THEN no data-density attribute lands and the ambient css scope
  channel flows through

### Requirement: slot factories are lazy; context reads happen at resolve time

Slot factories SHALL be pure at construction (capturing only the own
argument; module-level Defaults objects SHALL NOT touch context).
Context reads SHALL happen only when `resolve` evaluates the slot —
inside a component's initialization/`$derived` window (Svelte's
runtime carries the creating component's ctx through derived
recomputation). Outside a component context a slot SHALL catch ONLY the
`lifecycle_outside_component` error (normalized: strip a
`https://svelte.dev/e/` prefix, take line 1, compare the code —
Svelte 5.55's dev, prod, and bare shapes all match) and degrade to
ambient-skip (explicit/own still resolve); axis-internal and plugin
errors SHALL propagate.

#### Scenario: pure unit call outside a component

- GIVEN `PressButtonDefaults.resolve({})` invoked in a plain unit test
- THEN it returns the own-defaults projection without throwing

#### Scenario: an axis bug is not swallowed

- GIVEN an axis module whose ambient read throws a non-lifecycle error
- WHEN resolve evaluates the slot
- THEN the error propagates (no silent identity)

### Requirement: zone scopes are axis-level providers

A zone scope SHALL be a zero-DOM, getter-backed partial provider for
ONE axis, carrying axis VALUES only (never layout — the layout half
stays in components like ButtonGroup); the paint axis key
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
to ZonePaintVariant (a `<ButtonGroup variant="link">` that was legal
becomes a compile error; link stays reachable through PressButton's
own explicit prop) — and call the helper as
`providePaintZone(() => effectiveVariant)`; WHEN the legacy key's
inherited value is 'link' (possible only from an external old-only
provider), the new-key getter SHALL return undefined (link keeps its
legacy-key-only semantics and never enters PAINT_ZONE_KEY —
`effectiveVariant === 'link' ? undefined : effectiveVariant`), the
legacy key keeping its original value; a parent variant flip
SHALL re-derive both keys' consumers in the same frame (reactivity
assertion; external-old-link and dual-provider negative fixtures); the paint SLOT reads PAINT_ZONE_KEY first, falling back to
the legacy key's variant when the new key is absent OR its getter
returns undefined (`newVariant ?? legacyVariant` — the
inherited-link narrowing relies on exactly this), guarding external
values against its family's `values` array (fall to own with the
frozen warn), so consumers under external old-only providers still
inherit (the external-old-link fixture asserts PressButton's
legacy-key-compatible result); the legacy key retires at a future
versioned checkpoint when the gate's consumer census reaches zero.

#### Scenario: nested zone scopes

- GIVEN an outer zone providing tonal and an inner zone providing
  ghost
- WHEN a button inside the inner zone resolves its paint slot
- THEN it sees ghost

#### Scenario: mixed legacy and migrated consumers in one group

- GIVEN a ButtonGroup (dual-providing) containing one legacy consumer
  reading BUTTON_GROUP_KEY and one migrated consumer reading
  PAINT_ZONE_KEY
- WHEN both resolve their variant
- THEN the values agree (atomic dual-write)

### Requirement: the context coverage gate

`verify:context`（scripts/verify-context-coverage.mjs） SHALL take deterministic in-repo inputs
(registry items, parsed component sources, the exemptions whitelist
`scripts/context-coverage.exemptions.json` with kinds
`bindable`/`passthrough`/`no-style`/`provider`/`roadmap` — `provider`
exempts ONLY the legacy-helper bypass check, never Defaults
existence, slot coverage, or resolve presence; `roadmap` entries
(prop + target axis + reason) carry the class-c props awaiting their
axis — and the versioned detection
vocabulary in `scripts/context-coverage.config.json`) and enforce
FAMILY-LEVEL coverage: (a) a family with style props has a Defaults
object covering them (or an explicit exemption); (b) every slot
value is a registered slot factory call (AST); (c) every consumer
file of a family with a Defaults object CONTAINS a
`XxxDefaults.resolve(` call AND contains NONE of the banned bypass
channels (direct axis-symbol `getContext`, `resolveDensity`,
`getDensityContext`, known scope reads) outside axis modules and
whitelisted providers; (d) each family's exposed variant union
matches the frozen availability table (link stays PressButton-only).
Per-prop dataflow beyond these clauses is OUTSIDE static
decidability — the boundary is declared, not hidden, and belongs to
code review. Output SHALL be machine-readable JSON plus a human list
with exit codes; a `--scope=pilot` mode runs the pilot subset. The
single full-enablement point is the final integration task.

#### Scenario: a new component lands without a Defaults object

- GIVEN a registry component exposes a public variant prop
- WHEN `verify:context`（scripts/verify-context-coverage.mjs） runs
- THEN it fails naming the component and the uncovered prop

#### Scenario: a legacy helper bypass

- GIVEN a consumer component still calls
  `resolveDensity(density, getDensityContext())` inline
- WHEN the gate runs
- THEN it fails naming the legacy-helper bypass

#### Scenario: an inherit-then-provide container stays legal

- GIVEN Table provides density derived from its inherited context
  (the documented provider idiom) and is whitelisted kind `provider`
- WHEN the gate runs
- THEN the legacy helpers in its provider path do not fail the gate,
  while its Defaults existence and slot coverage are still checked

#### Scenario: a badge tries to reach link

- GIVEN Badge's Defaults declared a paint slot typed with a union
  containing 'link'
- WHEN the gate runs
- THEN it fails the availability-table consistency check

## MODIFIED Requirements

### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves
policy: a getter-backed `DensityContext` (one Symbol key, one stable
object) with the law `explicit ?? inherited ?? own` [MODIFIED — was
`explicit ?? inherited ?? 'default'`; the manufactured-'default'
fallback retires into the family's Defaults slot argument or
no-opinion undefined]; providers are opt-in (no forced app root). The
CSS channel injects values: providers and density-aware components
stamp `data-density`, and ONLY the canonical theme sheet AND its
byte-identical generated mirror carry density scopes, mapping the
derived `--jx-density-*` vocabulary to inherited `--jx-*` aliases —
never component css. Components consume the aliases and MUST NOT
branch on density values in their own css; `data-size` authority is
removed (no alias). Every scale value is DERIVED from the ruler
(`--jx-unit`, text base) by written equations; the computed four-row
table is gate-asserted. The balance invariant holds at every density:
row inline-start inset == the media/content seam (one ruler mark);
media boxes derive from the line (icon = one line, image = two — the
seam never folds into the object); optical correction is ONE bounded
token (±U/2). [ADDED — the resolution carrier] Inline
`resolveDensity`/`getDensityContext` calls in consumer bodies retire
in favor of `densitySlot` wiring; the helpers remain, living only in
the axis module and the gate's provider whitelist (structural
providers and kind:`provider` inherit-then-provide containers).

#### Scenario: a group changes density after mount

- GIVEN an ItemGroup with density-adopting rows
- WHEN the group's size prop changes
- THEN rows re-resolve and re-stamp data-density reactively, and the
  CSS scope cascade repaints them in the same frame

#### Scenario: a component tries to branch on density

- GIVEN list-item component css after the migration
- WHEN the source guard scans it
- THEN no [data-density]/[data-size] selector exists and every
  density-owned declaration references --jx-* (or a family var
  derived from one) — literals fail with file/selector/property/value

#### Scenario: a family fallback resolves through the slot [ADDED]

- GIVEN Table's Defaults declares `density: densitySlot('sm')`
- WHEN the table renders with no provider and no explicit prop
- THEN data-density="sm" lands; with a parent provider's opinion, the
  provider wins; with an explicit prop, the prop wins

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
frozen table in openspec/changes/archive/2026-08-27-variant-grammar/design.md §4)
[path updated — the change was archived; the table itself is
authoritative]:
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
tonal/outline (default tonal, locally neutral); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability). Valued `data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`). [MODIFIED — the defaults carrier] The frozen table's
per-component own defaults become the `own` arguments of the
corresponding `paintSlot<FamilyVariant>(own, values)` in each
family's Defaults object (values = the family union's satisfies
array — the runtime value-domain carrier); the family's exposed
union stays per the frozen
availability (the shared axis never widens it — link stays
PressButton-only); the previously implicit `??` chains become the
paint slot's `explicit ?? ambient(zone) ?? own` resolution.

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

#### Scenario: the frozen table reads through Defaults [ADDED]

- GIVEN the frozen availability table and a migrated family
- WHEN the family's Defaults is read
- THEN every available variant in the table is addressable through
  the paint slot, the own default matches the table, and the
  family's union contains no variant outside its table row (link
  never reaches Badge/Chip/Alert)
