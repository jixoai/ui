# component-authoring delta — form family abilities

## ADDED Requirements

### Requirement: combobox multiple commits an array through the bridge

`combobox` SHALL support `multiple`, binding `string[]`; submission
goes through the form-field bridge's MULTIVALUE mode: the consumer
sets `values: string[]` (a property on the jx-form-field element, or
its `setValues(values: string[])` setter) — MULTIVALUE bypasses the
string `value` attribute entirely; the bridge then constructs
`internals.setFormValue(FormData)` with repeated same-name entries in
selection order (`getAll(name)`), preserving form.reset() (back to
the initial array) and disabled-fieldset omission. No joined-string
channel exists in this mode — the FormData payload is the ONLY
transport, and no value-rejection path exists. Selection renders via
the chip law with per-chip removal;
the panel declares `aria-multiselectable`.

#### Scenario: a multi-select combobox in a submitted form

- GIVEN `<Combobox multiple value={[]} options={[...]} name="tags" />`
- WHEN two options are picked and the form submits
- THEN `FormData.getAll("tags")` returns the two values in selection
  order, the trigger shows two removable chips, and a later
  form.reset() restores the initial empty array

### Requirement: the input shell carries count, reveal, and the floating bracket

- `count` SHALL render a live "n / max" readout in the hint lane.
- `type="password"` SHALL offer the reveal toggle (opt-out
  `reveal={false}`) with `aria-pressed` semantics.
- `labelMode="floating"` SHALL paint the label as a fieldset-bracket
  on the shell border (the terminal divergence from in-field label
  morphs), pure-CSS state driven.

#### Scenario: counting a textarea

- GIVEN `<Input count maxlength={120} textarea />`
- WHEN the value is 118 code points
- THEN the readout shows "118 / 120" and the live region stays silent
  until the polite threshold
