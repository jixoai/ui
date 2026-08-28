# native-contract — delta (V2: the .jx-html standard layer)

## ADDED Requirements

### Requirement: the standard layer is the single declaration source

The native form-control laws SHALL be declared exactly once, as the
`.jx-html-*` utility family authored with TW4 `@utility` inside the
theme sheet (jixoai.css — installing the theme IS installing the
plugin, the hue-injection precedent). Each utility carries its whole
law — static geometry, token paint, and the state machines as nested
variant blocks (`&:hover`, `&:focus-visible`, `&:checked::before`,
`& > label` subtree rules, `:has()` states). Pseudo spellings SHALL
use the compound form (`&:checked::before`); the descendant spelling
is locked out by probe. No component, folder sheet, or face rule
MAY re-declare a standard-layer law.

#### Scenario: a law change lands

- WHEN a visual change to a native law is made
- THEN the `.jx-html-*` utility is the only edited declaration site
  and both applications (registry markup classes, the face's bare
  element rules) pick it up through the same build

#### Scenario: the boundary stays probed

- GIVEN the tw probes (context/probe + standard-layer probe)
- THEN named-theme @apply in standalone folder css fails, cross-@import
  @apply compiles, markup-class consumption works, variant blocks
  transfer, and the anti-shape stays un-emitted — 5/5 + 4/4 green

### Requirement: two applications, one chain

The standard layer SHALL have exactly two applications. (1) The
registry: component markup carries the standard classes
(`class="jx-html-switch"`); folder css holds ONLY component extras
(slots, one-offs) — zero law copies. (2) The face: jx-pure.css's
bare-element rules APPLY the utilities through the entry @import
chain (`:where(.jx-pure) input:where(<13-type allowlist>) {
@apply jx-html-input }`); the allowlist rides the application
selector so checkbox/radio/range/color/hidden branches are never
captured by the text-lane law. jx-pure.css is pipeline-bound (the
zero-tailwind promise is retired by Owner ruling; a compiled literal
artifact may follow if a zero-build use case returns).

#### Scenario: the face applies the law

- GIVEN a .jx-pure scope with a bare text input
- THEN its computed paint equals the jx-html-input utility's
  declarations — one chain, no divergence possible

#### Scenario: the allowlist holds

- GIVEN a .jx-pure scope containing checkbox/radio/range/color inputs
- THEN each receives ITS utility's law (jx-html-checkbox/radio/
  range/color), never the text-lane law

### Requirement: DOM isomorphism is first-class

Per vocabulary row, the registry component and the face's bare DOM
SHALL render isomorphic trees: element tags, attribute sets (minus
caller-specific values), child order, and cardinality. The canonical
schema (design §11.2) is normative — notably the switch is ONE
`input[role=switch]` on BOTH sides (pseudo carriers are CSS-OM, not
DOM-AST, and are the one sanctioned exception); the select's chevron
is the CSS glyph on both sides (the inline-svg twin retires); the
tgroup subtree is bare `label` children. The parity gate SHALL
assert DOM-AST isomorphism BEFORE computed-style comparison.

#### Scenario: a component grows a wrapper

- GIVEN a vocabulary row whose registry render adds an element the
  canonical schema does not sanction
- WHEN the isomorphism gate runs
- THEN it fails naming the row, the extra node, and the schema clause

### Requirement: three budget objects

The size law SHALL be gated on three named objects — B-source (gzip
of the theme + face sources), B-face (gzip of the compiled face
rules in the canonical pipeline), B-consumer (gzip delta of a full
consumer bundle for one component) — each with baseline, threshold
(baseline +5%), tool version, and command recorded at V1 landing.

#### Scenario: the compiled face grows past its baseline

- GIVEN B-face baseline recorded at V1
- WHEN the compiled face gzip exceeds baseline +5%
- THEN the budget gate fails naming the object and the delta

### Requirement: the toggle-group native contract (unchanged from r1)

The toggle-group SHALL render label+input pairs — radio (single,
name REQUIRED) or checkbox (multiple) — DOM-checked as the
uncontrolled truth, native FormData (repeated entries, getAll), no
re-press clear, reset re-sync via the reset event, onValueChange
separate from native forwarding with internal handlers bound after
`{...rest}`, required forwarding in single mode, no interactive
descendants in label content. The paint law rides
`jx-html-tgroup` (the subtree utility).

#### Scenario: single mode submits natively

- GIVEN a single toggle-group inside a form with a name
- WHEN the user arrow-walks and presses a value, then submits
- THEN FormData carries exactly one entry and no bridge element
  exists in the DOM

#### Scenario: form reset restores state

- GIVEN a group whose value changed after mount
- WHEN form.reset() fires
- THEN inputs restore initial checked AND value re-syncs in the same
  task
