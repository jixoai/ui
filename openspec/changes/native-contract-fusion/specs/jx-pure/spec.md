# jx-pure — delta

## MODIFIED Requirements

### Requirement: Part A — the v2 class vocabulary (unlayered Tier-2 contract)

The Tier-2 class vocabulary SHALL be the v2 set — kept: `.jx-field`,
`.jx-label`, `.jx-error`, `.jx-slotted` (structural state stamp), the
icon custom properties; renamed with NO deprecated aliases:
`.jx-control` (was .jx-input), `.jx-control-shell` (was
.jx-field-shell), `.jx-control-lane` (was .jx-input-lane),
`.jx-slider` (was .jx-range), `.jx-color-shell` (was
.jx-color-field), `.jx-color-swatch` (was .jx-color), `.jx-color-expand`
(was .jx-color-stretch). Range size classes are REMOVED. Part A stays
the intentionally unlayered cascade exception (it beats layered
utilities by design); the sheet stays zero-JS and canonical/mirror
byte-identical. Part A ADDS the `.jx-tgroup` toggle-group law — the
joined-edge segment row: container opt-in class; labels as segments
(`label:not(:last-child)` right border); active segment via
`label:has(input:checked)`; focus ring via `:has(:focus-visible)`;
disabled dim via `:has(input:disabled)`; geometry from the density
aliases. The Part A region is delimited by planted BEGIN/END markers
and a generator slices it byte-exactly into
`registry/files/theme/jx-native-contract.css` (the shared contract
item — see the native-contract spec); the extract is generated-only
and drift-gated, while jx-pure.css remains the hand-written
canonical.

#### Scenario: a consumer writes an old class name

- GIVEN the rebuilt sheet
- WHEN markup uses .jx-input or .jx-range
- THEN no rule matches — old names are gone by contract and the
  parity test asserts the v2-only vocabulary

#### Scenario: the unlayered cascade exception survives the rename

- GIVEN a .jx-control-shell painted against a consumer utility
- THEN the Tier-2 unlayered rule still wins by design (the layer
  law's documented exception), unchanged from the frozen era

#### Scenario: the tgroup law paints classlessly

- GIVEN `.jx-tgroup` wrapping label>input+span pairs under .jx-pure
- WHEN an input checks, focuses, or disables
- THEN the active segment, inset focus ring, and dim paint all
  follow from :has() rules — zero JS, matching the registry
  component's identical DOM contract

#### Scenario: the contract extract stays byte-locked

- GIVEN Part A edited in the canonical sheet
- WHEN the generator and drift gate run
- THEN jx-native-contract.css equals the marked region byte-for-byte
  and one-sided edits on either side fail

### Requirement: Part B — element defaults on the density interface

Part B SHALL remain `@layer components`, `:where(.jx-pure)` scoped:
typography, links, buttons (the press variable contract — default
interactive lanes DERIVED from the density alias interface
`--jx-hit`/`--jx-gap`/`--jx-inset`/`--jx-text`/`--jx-leading`,
never a hard-coded 40px), type-allowlist text lanes,
checkbox/radio repaints, the slider law (pill fill via cqw shadow +
ringed disc thumb; rail = ctl-range-track, thumb = ctl-icon), the
switch (pill + round knob, [role=switch]; track =
ctl-toggle-w × ctl-toggle-h), color repaints (select = jx chevron by
default; Firefox keeps its platform arrow), number keeps the PLATFORM
stepper, fieldset/legend, details/summary, nav/ol/ul/dl, tables,
progress/meter/output, figure/figcaption + media, the aria-invalid
matrix on the SEMANTIC palette (success/error), the zero-class
STRUCTURAL input group, and the reverse scope (`:not(.no-jx-pure,
.no-jx-pure *)`). `.jx-pure` sets scoped
`font-size: var(--jx-text, 0.8125rem)` +
`line-height: var(--jx-leading, 1.6)`; `body` remains untouched.
`.jx-field`'s stack gap = the density stack-gap; label/error ride the
secondary voice aliases. The verify scripts assert DERIVED numbers
under each data-density scope (no `40px` literals). The typography
heading ladder keeps its fixed steps until a typography token law
exists (declared gap — not silently faked as density-aware).

#### Scenario: the static face follows density

- GIVEN a .jx-pure root with data-density="sm"
- THEN controls compute sm rows/hit/pad/text from the aliases with no
  JS, and used-value probes confirm the derived numbers

#### Scenario: the reverse scope survives the rebuild

- GIVEN a .no-jx-pure subtree inside a .jx-pure host
- THEN face rules step aside, host styles survive, and Part A classes
  keep working
