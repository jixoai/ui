# component-authoring delta — stylex-kernel-phase0

## MODIFIED Requirements

### Requirement: styling posture

Tier-1 components' paint SHALL be authored as StyleX static atoms
against the typed token accessors (`.stylex.ts` modules), compiled
by the kernel build. The authoring rules, with their enforcement:

- STATIC ATOMS ONLY for declarations: `stylex.create` objects with
  longhand properties; shorthand properties are FORBIDDEN
  (`propertyValidationMode:'throw'` makes a dropped shorthand a
  build error).
- Dynamic values = CSS-var bindings: atoms consume
  `var(--jx-*)`/component custom properties; the component computes
  the vars at runtime. Factory functions, `vars` keys inside
  `create()`, and closure-composed dynamic values are FORBIDDEN
  (verify:stylex-authoring names the file + pattern) — each was
  proven to silently break or never reach the compiled rules.
- `cn()` merges CONSUMER-passed classes with the compiled constants
  (plain strings); it is not a cascade mechanism — the layer law
  (css-architecture) owns precedence.
- The transition state: components not yet migrated to atoms keep
  the utility-first posture with no override-guarantee change until
  their migration lands (phase train).

#### Scenario: consumer restyles an installed component

- GIVEN an atom-authored component with compiled atom paint
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the canonical layer law —
  the pre-refactor silent-loss defect stays dead

#### Scenario: consumer restyles a migrated component

- GIVEN an atom-authored component with compiled atom paint
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the canonical layer law

#### Scenario: unmigrated component (transitional)

- GIVEN a Tier-1 component still on utility-authored paint (pre-
  phase-train)
- THEN it keeps its current behavior and cn() merge discipline
  until its migration lands

#### Scenario: component needs non-utility css

- WHEN paint requires selectors atoms cannot express
- THEN it lands in `<item>.css` in the folder and still loses to
  consumer utilities (layer law)

#### Scenario: Tier-2 consume-only

- GIVEN a component using `.jx-control` (jx-pure Part A)
- WHEN the component is refactored
- THEN the class is consumed as-is; no component-side copy, re-wrap,
  or cascade-altering redefinition exists, and it never routes
  through `cn()`

#### Scenario: a forbidden dynamic idiom is authored

- GIVEN a `.stylex.ts` file containing a factory call outside
  markup-level use, or a `vars` key inside `create()`
- WHEN verify:stylex-authoring runs
- THEN it fails naming the file and the pattern, and the throw-mode
  build independently fails shorthands

#### Scenario: a component needs a runtime color mix

- WHEN a state color derives from props
- THEN the atom consumes `var(--component-state-ink)` and the
  component computes the var (possibly via `color-mix` inline) —
  no runtime style composition against atoms
