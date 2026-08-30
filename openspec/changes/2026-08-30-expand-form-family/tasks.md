# Tasks: expand-form-family

File sets are disjoint per section — safe for parallel subagents
(input / input-group / button-group / combobox / docs-demos).

## 1. input capabilities

- [ ] 1.1 `count`: prop + hint-lane readout + near-limit polite live
      region; textarea passthrough; tests (typed past max clamps per
      maxlength law, counter tracks value length incl. CJK
      code points).
- [ ] 1.2 password reveal: FIRST add eye/eye-off to the
      `scripts/gen-icons.mjs` manifest (`verify:icons`), then the
      toggle in the end lane (ordering: innerInlineEnd snippet >
      clearable × > eye), `aria-pressed` + accessible name, opt-out
      prop.
- [ ] 1.3 floating label: `labelMode="floating"` bracket style (legend
      position on the shell border), focus/filled states pure CSS
      (`:placeholder-shown` + `:focus` + `:has`), error-state
      composition verified.

## 2. input-group (new item)

- [ ] 2.1 Author the folder (group + addon + input parts, css, barrel)
      per folder law; joint seam styling; disabled propagation.
- [ ] 2.2 registry.json item + build + mirror re-record.
- [ ] 2.3 Docs page: add-on demos (text / icon / button / select
      addon), form-submit demo, a11y notes.

## 3. button-group (new item)

- [ ] 3.1 Author the container (orientation, justify, divider part,
      aria-label role=group law — NOT a toolbar unless labeled so).
- [ ] 3.2 registry.json + build + mirror.
- [ ] 3.3 Docs page with the toggle-group boundary note.

## 4. combobox abilities

- [ ] 4.1 `multiple` + chips: discriminated value generic
      (`string[]`), chip rendering (chip law) in the trigger, panel
      check state, `aria-multiselectable`; SUBMISSION via the
      form-field bridge's multivalue mode — extend
      `registry/files/lib/form-field.ts` with the MULTIVALUE seam: a
      `values: string[]` property (and `setValues(values)`) on the
      jx-form-field element — bypassing the string `value` attribute —
      which then constructs `internals.setFormValue(FormData with
      repeated same-name entries)` — the exclusively-lossless decided
      transport (design.md); no alternative path exists; tests:
      selection-order getAll, chip removal, clear, form.reset() to
      initial array, component disabled, disabled-fieldset omission.
      [shared lib file — integrator-coordinated within F1]
- [ ] 4.2 `showClear`.
- [ ] 4.3 Demos: multiple chips / clear / groups / custom items.

## 5. Demos & docs

- [ ] 5.1 Password-strength recipe (zod scorer snippet) on the form
      recipes page.
- [ ] 5.2 Cascader changeOnSelect demo + the antd-panel upgrade-route
      note.
- [ ] 5.3 native-form + zod validation demo (schema-first, error
      summary, a11y contract).
- [ ] 5.4 All touched pages to the docs-demo-standard skeleton.

## Verification

- `npm run verify:all` green (mirror/deps/hook-law/laws).
- New-item add probe: `npx shadcn add @jixoai/input-group @jixoai/button-group`
  resolves.
- Unit: counter math, combobox multiple commit, password toggle state.
- Browser probe: floating label states, chips removal, clear button
  honest empty submit (FormData).
