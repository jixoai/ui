# component-authoring deltas (slot-values-first)

> 注：variant-grammar 项删去 living 文本 "(the shared axis never
> widens it — link stays PressButton-only)" 括号句为**有意重述**——
> values ≡ 冻结行的门禁双断言已承载该法，scenario 尾注保留 link 法。

## MODIFIED Requirements

### Requirement: every registered component family ships a Defaults contract

Every registered component family with public STYLE props (per the
pinned detection vocabulary) SHALL ship ONE `XxxDefaults` object (a
`*-defaults.svelte.ts` file inside the family folder, a member file
of the registry:ui item, byte-mirrored, zero kernel imports) — per
family, not per part file. The Defaults object is the family's
SINGLE declared ambient contract. Coverage means EVERY style prop
has a slot, in exactly two kinds: an axis slot (ambient-manageable)
or a literal-family slot — the literal kind has three forms:
`defineLiteralSlot(values, default)` (closed scalar domain, default
∈ values compile-locked), `defineOpenSlot<T>(own)` (an OPEN scalar
domain — free lengths/numbers with no union to enumerate; explicit
type argument, the absentSlot discipline), and `absentSlot`
(absent-meaningful, undefined-capable) — all with ambient
capability pending a future axis. Literal/paint slots SHALL
be declared as NAMED exported constants (`const kbdVariantSlot =
defineLiteralSlot(…)`) — the capability concentrates on the single
slot value — with the family's union type derived from it
(`type KbdVariant = ReturnType<typeof kbdVariantSlot>`; the values
array is the one source of truth — the meta-feeding families
(select/combobox/date-picker) keep their component-Props inline
unions, the surviving half of the drift double-lock: Props ⊆ values
is compile-checked at the resolve call site).
Every style prop SHALL be classified (axis / literal / roadmap /
never-ambient); the classification is versioned and gate-checked as
a whole.

#### Scenario: the standalone look vs the nested look

- GIVEN `pressButtonVariantSlot = definePaintSlot(['fill', 'tonal',
  'outline', 'ghost', 'link'], 'outline')` feeds `PressButtonDefaults`
- WHEN a PressButton renders standalone
- THEN its variant resolves to 'outline' (the frozen variant-grammar
  default)
- WHEN the same button renders inside a Dialog zone providing ghost
- THEN its variant resolves to 'ghost' with no per-call-site code

#### Scenario: a style prop with no axis yet

- GIVEN Dialog exposes `variant?: 'solid' | 'acrylic' | 'auto'`
- THEN its Defaults declares
  `dialogSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic',
  'auto'], 'auto')` — auditable today, promotable to an axis slot
  when an axis opens

#### Scenario: an absent-meaningful style prop enters the contract

- GIVEN a component's optional style prop whose absence IS the
  meaningful state (native/unset rendering)
- THEN its Defaults declares `absentSlot<ThatUnion>()` (the absent
  overload — no values to infer from, the explicit type argument
  stays) — the slot's resolved value may be undefined and the
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
(negative type assertions are gate material);
`defineComponentDefaults` SHALL additionally verify the brand at
runtime IN DEV ONLY (the `import.meta.env?.DEV`-gated WeakSet check
— vitest runs under vite so the guard stays test-assertable; the
type brand is the production contract); the gate's AST check SHALL
accept only registered factory calls as slot values — resolving a
NAMED slot constant to its same-file factory-call initializer.

#### Scenario: a bare function sneaks into slots

- GIVEN `defineComponentDefaults({ variant: (v) => v ?? 'fill' })`
- THEN the brand constraint rejects it at compile time and the gate
  fails it at AST level

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
`data-jx-chip`). The frozen table's per-component rows become the
`definePaintSlot(values, own)` calls in each family's Defaults —
the values array IS the family union's SOURCE (default ∈ values is
compile-locked; the runtime consumes no value-domain guard; the AST
gate asserts the array bidirectionally against the frozen table);
the family's exposed union derives from the slot
(`ReturnType<typeof slot>`); the previously implicit `??` chains
are the paint slot's `explicit ?? ambient(zone) ?? own` resolution.

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
  the paint slot's values array, the own default matches the table,
  and the array contains no variant outside its table row (link
  never reaches Badge/Chip/Alert)

### Requirement: the context coverage gate

`verify:context` (`scripts/verify-context-coverage.mjs`) SHALL take
deterministic in-repo inputs (registry items, parsed component
sources, the exemptions whitelist
`scripts/context-coverage.exemptions.json` with kinds
`bindable`/`passthrough`/`no-style`/`provider`/`roadmap` —
`provider` exempts ONLY the legacy-helper bypass check, never
Defaults existence, slot coverage, or resolve presence; `roadmap`
entries (prop + target axis + reason) carry the class-c props
awaiting their axis — and the versioned detection vocabulary in
`scripts/context-coverage.config.json`) and enforce FAMILY-LEVEL
coverage: (a) a family with style props has a Defaults object
covering them (or an explicit exemption); (b) every slot value is a
registered slot factory call (AST — resolved through a named slot
constant's same-file factory-call initializer); (c) every consumer
file of a family with a Defaults object CONTAINS a
`XxxDefaults.resolve(` call AND contains NONE of the banned bypass
channels (direct axis-symbol `getContext`, `resolveDensity`,
`getDensityContext`, known scope reads) outside axis modules and
whitelisted providers; (d) the paint family's values array (the
slot's first argument) matches the frozen availability table
bidirectionally (link stays PressButton-only). Per-prop dataflow
beyond these clauses is OUTSIDE static decidability — the boundary
is declared, not hidden, and belongs to code review. Output SHALL
be machine-readable JSON plus a human list with exit codes; a
`--scope=pilot` mode runs the pilot subset. The single
full-enablement point is the final integration task.

#### Scenario: a new component lands without a Defaults object

- GIVEN a registry component exposes a public variant prop
- WHEN `verify:context` (`scripts/verify-context-coverage.mjs`)
  runs
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
- THEN the legacy helpers in its provider path do not fail the
  gate, while its Defaults existence and slot coverage are still
  checked

#### Scenario: a badge tries to reach link

- GIVEN Badge's Defaults declared a paint slot whose values array
  contains 'link'
- WHEN the gate runs
- THEN it fails the availability-table consistency check
