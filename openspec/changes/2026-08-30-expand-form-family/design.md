# Design: expand-form-family — the multivalue transport decision

## Decision

`registry/files/lib/form-field.ts` multivalue mode uses the
`FormData` PAYLOAD form of `ElementInternals.setFormValue()` — the
union member the repo's DOM typings accept (`File | string |
FormData | null`):

```js
const fd = new FormData();
for (const v of values) fd.append(name, v); // repeated same-name entries
internals.setFormValue(fd);                 // lossless, ordered
```

The browser materializes the FormData as repeated same-name entries,
so `formData.getAll(name)` returns the committed values IN ORDER,
each entry byte-for-byte the committed string. **State handoff interface**: the combobox hands the array to the
bridge element via a `values: string[]` property (equivalently
`setValues(values: string[])`) on the `jx-form-field` custom element.
MULTIVALUE BYPASSES the existing string `value` attribute — reading
`value` in multivalue mode returns the joined display string for
`textContent` purposes only, never the submitted payload. There is NO
joined DOM-attribute channel; the value never crosses element
boundaries as a string.

- **No custom encoding.** Newline-bearing, quote-bearing, and arbitrary
  Unicode option values survive byte-for-byte because each value is a
  separate entry, never a joined string. The r1 "newline transport"
  concern applies only to the single-value joined channel and does not
  cross this boundary.
- **Lifecycle stays native.** form.reset() restores the form-associated
  element's initial value (the initial array), disabled-fieldset
  omission and disabled propagation are the platform's.
- **Runtime boundary**: `multiple` rejects non-string entries at the
  type level (`string[]`) and coerces nothing at runtime — a
  non-finite/foreign value is a programmer error and throws.

## Rejected alternative

A single joined entry with a custom separator/escape (or newline
transport) — rejected: it re-introduces the lossy-encoding class the
bridge exists to eliminate and forces every consumer to decode.

## Password reveal default (decided)

Default ON: `type="password"` renders the reveal toggle unless
`reveal={false}`. The VALUE is never revealed by default — the toggle
starts in the hidden state. End-lane order:
`innerInlineEnd` snippet > clearable × > reveal eye (each keeps the
`--jx-hit` inset geometry per the END-INSET OWNERSHIP law).
Autocomplete and password-manager behavior are untouched (the input's
`type` flips between `password`/`text` only while pressed).
