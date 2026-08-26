# native-contract — delta (NEW spec)

## ADDED Requirements

### Requirement: one law, two renderers, gate-locked

The native form-control laws SHALL have exactly one law source —
this spec's vocabulary table plus the jixoai token sheet — and two
renderers: jx-pure.css (Tier-0: pure CSS, zero JS, zero tailwind
dependency, hand-written canonical) and the registry native-family
components (Tier-1: Svelte + slots, Part A classes consumed from the
shared contract, component-extra paint as @apply mirror sheets).
Value-layer duplication is forbidden (both renderers consume the
jixoai.css tokens + density aliases); rule-layer duplication is
either byte-shared (Part A via the contract extract) or
parity-gated (mirror rules). `@apply` is an implementation syntax of
renderer-1 and never a law source; jx-pure.css MUST NOT contain
`@apply`, `@utility`, or any tailwind dependency.

#### Scenario: a law change lands

- GIVEN a visual change to a native law
- WHEN the change lands
- THEN jx-pure.css and the component mirror sheet change in the same
  commit and the parity gate proves computed-style equivalence —
  a one-sided change fails CI

#### Scenario: the face stays standalone

- GIVEN a consumer with no tailwind at all
- WHEN they mount jx-pure.css on arbitrary DOM
- THEN the full face applies — the sheet never grew a tailwind
  dependency through this spec

### Requirement: the native vocabulary (1:1 granularity)

The vocabulary SHALL map each Tier-0 law to exactly one Tier-1
component: text-like input lanes (13-type allowlist, `.jx-control`
family) → `input`; textarea lane → `textarea`; select
chevron/listbox → `native-select`; checkbox repaint (+indeterminate)
→ `checkbox`; radio repaint → `radio`; switch (`[role=switch]`) →
`toggle`; toggle-group (`.jx-tgroup`) → `toggle-group`. Range and
color are input types (their laws are Part A classes the `input`
component consumes — no separate components). Non-form element laws
(table/details/progress/figure/fieldset) are Tier-0 only. A new
native-family registry component without a Tier-0 law — or a Tier-0
form-control law without its component — is a vocabulary violation.

#### Scenario: a new native component is proposed

- WHEN a form-control component enters the registry
- THEN the proposal names its Tier-0 law twin (existing or landing
  in the same change) or is rejected as out-of-vocabulary

### Requirement: the @apply mirror boundary

Renderer-1 folder css MAY use `@apply` ONLY with context-free core
utilities (flex, box-border, appearance-none, …) and arbitrary-value
utilities (`min-h-[var(--jx-hit)]`, `text-[length:var(--jx-text)]`).
`@apply` of NAMED theme utilities (`bg-background`, `border-border`)
in folder css is FORBIDDEN — a standalone sheet has no Tailwind
context (empirically locked by the tw-context probe). Token-bound
paint is expressed as plain CSS declarations or arbitrary utilities.
State machines (`:checked`/`:has()`/`:focus-visible`/`:focus-within`
repaints), UA pseudos, `@keyframes`/`@property`/`@supports`,
forced-colors blocks are bare CSS; state machines ride the unlayered
`:where()` carve-out. Static mirror rules sit in `@layer components`
behind `:where()` so consumer utilities keep winning.

#### Scenario: the boundary is probed

- GIVEN the tw-context probe fixture
- WHEN it compiles named-theme, arbitrary, and core @apply forms
  against a clean consumer entry
- THEN the named form fails and the other two compile — the probe is
  the standing evidence and a CI gate

#### Scenario: a consumer overrides mirror paint

- GIVEN a component whose static paint is a mirror rule in
  `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer utility wins (layer law, unchanged posture)

### Requirement: the Part A contract extract

`registry/files/theme/jx-native-contract.css` SHALL be a generated
byte-exact extract of jx-pure.css Part A, sliced between planted
BEGIN/END markers by `scripts/gen-jx-native-contract.mjs`; it is
never hand-edited and a drift gate fails when either side changes
without the other. It ships as the `@jixoai/jx-native-contract`
registry:lib item (dependent on `@jixoai/jixoai-theme`); native
family items depend on it instead of the full jx-pure face.
jx-pure.css remains the hand-written canonical and its existing
byte-locks (mirrors, payload parity, gzip budget) stay in force.

#### Scenario: Part A edits flow one way

- GIVEN an edit to Part A in jx-pure.css
- WHEN the generator + gates run
- THEN the extract regenerates byte-identically to the region and a
  hand-edit to the extract alone fails the drift gate

#### Scenario: a consumer installs a native component

- GIVEN `shadcn add input` on a clean consumer
- THEN the payload carries jx-native-contract.css (not the 2006-line
  face) plus the theme dependency, and the component renders the
  contract classes from it

### Requirement: computed-style parity gates

Each vocabulary row SHALL carry a parity fixture: the same DOM
rendered (i) bare under `.jx-pure` and (ii) as the Tier-1 component,
with computed styles compared over the row's posture-agnostic
property whitelist, values normalized (color notations with a
sub-visual component tolerance, shorthands). The gate's matrix is
DECLARED and VALIDATED machine-readably: every expected row,
variant section (density via the tier0 data-density marker, dark via
the section class), and state action must exist or the gate fails —
no silent under-coverage; states are ISOLATED (a fresh page per
non-base state with motion frozen, including pseudo-elements).
Pseudo-carrier probes (e.g. the switch knob's ::before ⇄ the
component's span) assert the unified carriers. Screenshot-oracle
evidence (the capture-baseline tolerant pixel comparator) covers
geometric rows; a documented rasterization-path artifact
(::before-inside-input vs a real child element) is warn-only with
its root cause recorded. Extending the matrix toward the full
cross-product {hover, aria-invalid} × per-row densities is follow-up
work, declared here as the growth path — the gate enforces exactly
what it declares.

#### Scenario: drift sneaks into one renderer

- GIVEN a one-sided declaration change (jx-pure.css OR a mirror
  sheet)
- WHEN the parity gate runs
- THEN it fails naming the fixture, state, and property that
  diverged

#### Scenario: the double-paint coexistence stays safe

- GIVEN renderer-1 DOM inside a `.jx-pure` subtree
- THEN both rule sets may paint the same element and the computed
  result is unchanged — identical-by-parity declarations make the
  winner irrelevant; the gate is what makes them identical

### Requirement: toggle-group is a native radio/checkbox group

The toggle-group SHALL render label+input pairs — `input[type=radio]`
(single) or `input[type=checkbox]` (multiple), visually hidden but
focusable — with content in a `.jx-tgroup-content` span. `name` is
REQUIRED for single (radio grouping is name-scoped), optional for
multiple. DOM `checked` is the uncontrolled truth; `value` is a
$bindable projection (DOM change → value; external value → DOM) with
no blind two-way loops. FormData is native (multiple submits
repeated entries in DOM order; the jx-form-field bridge is deleted
from this component). single mode does NOT support re-press clear
(an explicit none item is the pattern); keyboard is native (radio
arrow-walk + one tab stop). `form.reset()` re-syncs `value` via the
reset event (microtask). `required` forwards to inputs in single
mode; at-least-one-of-many is explicitly out of scope. Duplicate
item values are a contract violation. The event API separates native
event forwarding from `onValueChange`; internal handlers bind AFTER
`{...rest}` so consumer spreads cannot sever the value law.
Interactive descendants are banned inside label content. The CSS
discriminator is the `.jx-tgroup` Part A opt-in class; `data-jx-tgroup`
remains the semantic hook; roles never serve as css discriminators.

#### Scenario: single mode submits natively

- GIVEN a single toggle-group inside a form with `name="density"`
- WHEN the user arrow-walks and presses a value, then submits
- THEN FormData carries exactly `density=<value>` with no bridge
  element in the DOM

#### Scenario: form reset restores state

- GIVEN a group whose value changed after mount
- WHEN `form.reset()` fires
- THEN inputs restore initial checked AND `value` re-syncs to the
  restored set in the same task (browser-verified)

#### Scenario: consumer spread cannot break the value law

- GIVEN `<ToggleGroupItem {...{ onchange: fn }}>` spread
- WHEN the input changes
- THEN the internal value-sync still fires (bound after rest) and
  `fn` observes via onValueChange, not by severing the law
