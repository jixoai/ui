# jx-pure — delta

## MODIFIED Requirements

### Requirement: Part B — element defaults on the density interface

Part B SHALL remain `@layer components`, `:where(.jx-pure)` scoped:
typography, links, buttons (the press variable contract — default
interactive lanes DERIVED from the inherited `--jx-*` aliases, never
a hard-coded 40px), type-allowlist text lanes, checkbox/radio
repaints, the slider law (pill fill via cqw shadow + ringed disc
thumb; rail = `--jx-slider-track`, thumb = `--jx-icon`), the switch
(pill + round knob, [role=switch]; track = `--jx-toggle-width` ×
`--jx-toggle-track`), color repaints (select = jx chevron by
default; Firefox keeps its platform arrow), number keeps the
PLATFORM stepper, fieldset/legend, details/summary, nav/ol/ul/dl,
tables, progress/meter/output, figure/figcaption + media, the
aria-invalid matrix on the SEMANTIC palette (success/error), the
zero-class STRUCTURAL input group (label:has(> text-like control)
:has(> span), child rules share the allowlist), and the reverse
scope: every face rule carries :not(.no-jx-pure, .no-jx-pure *) —
the face steps aside inside no-jx-pure subtrees while the HOST's own
styles survive and the Part A opt-in classes keep working.
`.jx-pure` sets scoped `font-size: var(--jx-text)` + `line-height:
var(--jx-leading)`; `body` remains untouched. `.jx-field`'s stack
gap = the density stack gap; label/error ride the secondary voice
aliases (`--jx-text-secondary` / `--jx-line-secondary`).

#### Scenario: the static face follows density

- GIVEN a `.jx-pure` subtree at any data-density scope
- WHEN the scope changes
- THEN Part B geometry and type re-resolve through the inherited
  `--jx-*` aliases (never hard-coded px) and the face repaints

#### Scenario: the reverse scope survives the rebuild

- GIVEN a host with its own styles inside `.no-jx-pure`
- WHEN the Part B rules apply
- THEN every face rule's :not(.no-jx-pure, .no-jx-pure *) guard steps
  aside while the HOST's own styles and the Part A opt-in classes
  keep working
