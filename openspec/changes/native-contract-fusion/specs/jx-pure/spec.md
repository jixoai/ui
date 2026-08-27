# jx-pure — delta (V2: the face applies the standard layer)

## MODIFIED Requirements

### Requirement: Part A — the opt-in class vocabulary (standard-layer applications)

The opt-in class vocabulary (`.jx-control` / `.jx-control-shell` /
`.jx-control-lane` / `.jx-slider` / `.jx-color-shell` /
`.jx-color-swatch` / `.jx-color-expand` / `.jx-field` /
`.jx-label` / `.jx-error` / `.jx-tgroup`) SHALL be APPLICATIONS of
the standard layer, not independent law texts: each posture class
applies its `.jx-html-*` utility through the entry @import chain
(`.jx-control { @apply jx-html-control }`; `.jx-tgroup { @apply
jx-html-tgroup }`), with the r1 v2-class rename history intact (no
legacy aliases). The declarations live ONCE in the theme's standard
layer (see the native-contract spec); jx-pure.css declares no law
twice. The old byte-exact jx-native-contract extract RETIRES
(item, generator, markers, and gate — the deletion matrix).

#### Scenario: a consumer writes an old class name

- GIVEN the rebuilt sheet
- WHEN markup uses .jx-input or .jx-range
- THEN no rule matches — old names are gone by contract

#### Scenario: the opt-in classes carry the standard law

- GIVEN `.jx-control` on a bare input and the same element carrying
  `jx-html-input` from the registry side
- THEN their computed paints are identical — one declaration chain

#### Scenario: the tgroup law paints classlessly

- GIVEN `.jx-tgroup` wrapping label>input+span pairs under .jx-pure
- WHEN an input checks, focuses, or disables
- THEN the active segment, inset focus ring, and dim paint follow
  from the jx-html-tgroup subtree utility — zero JS, one source

### Requirement: Part B — element defaults apply the standard layer

Part B SHALL remain `@layer components`, `:where(.jx-pure)` scoped,
and SHALL apply the standard utilities through the entry @import
chain with the allowlist riding the APPLICATION selector
(`:where(.jx-pure) input:where(<13-type allowlist>) { @apply
jx-html-input }`); checkbox/radio/range/color/switch receive their
own utilities via their type/role selectors. `.jx-pure` sets scoped
`font-size: var(--jx-text)` + `line-height: var(--jx-leading)`;
`body` remains untouched. Typography (headings/prose), links,
buttons (the press variable contract), fieldset/legend,
details/summary, lists, tables, progress/meter/output,
figure/media, the aria-invalid matrix, the zero-class structural
input group, and the reverse scope (`:not(.no-jx-pure,
.no-jx-pure *)`) remain face-authored laws (they are not
form-control laws). jx-pure.css is PIPELINE-BOUND: its @apply rules
compile behind the consumer's entry (the zero-tailwind promise is
retired by Owner ruling; a compiled literal artifact may follow).

#### Scenario: the static face follows density

- GIVEN a .jx-pure root with data-density="sm"
- THEN controls compute sm rows/hit/pad/text from the standard
  utilities' density-alias declarations with no JS

#### Scenario: the reverse scope survives the rebuild

- GIVEN a .no-jx-pure subtree inside a .jx-pure host
- THEN face rules step aside, host styles survive, and the opt-in
  classes keep working

#### Scenario: the allowlist rides the application selector

- GIVEN a .jx-pure scope containing checkbox/radio/range/color
  inputs and a bare text input
- THEN the text input receives jx-html-input and each typed input
  receives ITS utility — a bare `input {}` application never exists
