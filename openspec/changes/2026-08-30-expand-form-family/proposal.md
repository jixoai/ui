# Proposal: expand-form-family — the input era's missing P0s

## Why

Input is the highest-variant family in the market (reui 31 demos,
Origin UI 59 "with X" variants) and the highest-traffic one for real
apps. The 2026-08-30 research + walkthrough cross-check establishes
what jixoai's input already owns (clearable ×, start/end icon snippet
slots, error wiring, label[for]) and what it genuinely lacks. This
change closes the P0 gaps and adds the two missing composite
containers the market treats as core (reui Input-Group 40 demos;
shadcn shipped Button Group as a new official component).

## What Changes

### input (existing component, new capabilities)

- **Character count**: `count` prop (max optional) — live "n / max"
  readout in the hint lane, `aria-live` off by default (polite only
  near the limit), pairs with textarea.
- **Password reveal**: `type="password"` gains the eye toggle in the
  end-icon lane (start/end snippet slots stay consumer-owned; the
  toggle is opt-out via `reveal={false}` — DEFAULT ON, DECIDED in
  design.md), `aria-pressed` semantics, autocomplete passthrough
  untouched. End-lane ordering
  when the lane fills: `innerInlineEnd` snippet > clearable × >
  reveal eye (number steppers keep their dedicated edges per the
  END-INSET OWNERSHIP law) — the eye and clear × stack as edge-lane
  children in that order, each keeping the `--jx-hit` inset geometry.
  The eye/eye-off glyphs join the `gen-icons.mjs` manifest first
  (`verify:icons`).
- **Floating label**: new `labelMode="stacked" | "floating"` variant —
  the terminal translation is a BRACKET label (label rides the top
  border like a fieldset legend) rather than the SaaS in-field morph;
  documented as a recorded divergence from Origin UI's overlap style.

### input-group (new registry item)

- `InputGroup` / `InputGroupAddon` / `InputGroupInput` composition:
  joined prefix/suffix add-on lanes (text, icon, button, select) over
  the shared input shell — the Origin UI "Input with start inline
  add-on" family, terminal-bezel joint styling (1px hairline seams,
  no double borders), one disabled propagation rule.

### button-group (new registry item)

- `ButtonGroup` orientation/justify container joining press-buttons
  with hairline seams + the `ButtonGroupDivider`; per-market scope
  (shadcn Button Group), NOT a selection control — toggle-group stays
  the segmented-selection law; the docs cross-link the boundary.

### combobox (existing, two P0 abilities)

- **multiple + chips**: `multiple` mode binds `string[]`; submission
  goes through the FORM-FIELD BRIDGE's multivalue mode —
  the consumer hands `values: string[]` to the bridge element
  (`values` property / `setValues()`), which constructs
  `internals.setFormValue(FormData)` with repeated same-name entries —
  `getAll(name)` returns selected values in order, and form.reset() /
  disabled-fieldset lifecycle stay the bridge's job (NO hidden-input
  bypass; the transport is exclusively the lossless FormData payload —
  see design.md). Selection renders as chips in the trigger (chip
  law, remove ×), panel checkmark state, `aria-multiselectable`.
- **clear button**: `showClear` — × in the trigger lane, honest
  empty-value submit (the form-field bridge already handles empty).

### demos + docs

- Password-strength RECIPE (zod-based scorer + the existing hint lane
  — a recipe on the form recipes page, not a new component: market
  implementations are 90% product-specific rules).
- Combobox multiple/clear/groups demos; cascader
  multiple-ish limitations documented (chain-of-selects stays the law;
  the antd panel is the recorded upgrade route) + changeOnSelect demo;
  form validation demo (native-form + zod schema-first, a11y contract
  called out); form recipes page restructured to the
  docs-demo-standard skeleton.

## Layering

- `registry/files/ui/input/**`, `registry/files/ui/input-group/**`
  (new), `registry/files/ui/button-group/**` (new),
  `registry/files/ui/combobox/**`, `scripts/gen-icons.mjs` (eye
  glyphs).
- registry.json (two new items — integrator applies, batch order
  A → F → G → H) + build + mirrors.
- docs pages: input, input-group, button-group, combobox, cascader,
  form recipes.

## Decisions recorded

- **No shadcn-`Field` layout component**: label/control/error
  three-band semantics are covered by per-component label wiring +
  `ItemField` (list-item family) + the form-field bridge; a standalone
  Field composite is recorded as not-planned (revisit if the form
  recipes expose a real gap).
- **combobox multiple rides the BRIDGE, not hidden inputs**:
  `registry/files/lib/form-field.ts` gains a lossless multi-value
  channel (the exclusively-lossless FormData transport per design.md). This is a SHARED LIB FILE — integrator-coordinated,
  batch F1.
- **Password reveal default: ON** — password fields offer the reveal
  control by default (`reveal={false}` opts out); the VALUE is never
  revealed by default (toggle starts hidden). End-lane ordering:
  innerInlineEnd snippet > clearable × > reveal eye.

## Sequencing

Two parallel sub-batches:
- **F1**: input (count / reveal / floating) + combobox
  (multiple / clear) + their docs pages.
- **F2**: input-group + button-group (two new items) + their docs
  pages.

## Risks

- combobox `multiple` changes the value type — the $bindable contract
  needs a discriminated generic; NO backward-compat shim (breaking
  change allowed by the house law, called out in the docs).
- input floating label touches the shared shell css — the input
  family's Tier-1 lane is used by number-input/textarea/combobox;
  changes must stay additive (new modifier class, no default-paint
  shift).
