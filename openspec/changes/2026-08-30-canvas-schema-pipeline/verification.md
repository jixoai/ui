# Verification: canvas-schema-pipeline

## Unit gates (vitest)

- `lower.test.ts`: press-button fixture meta → `toJSONSchema` equals
  the canonical export (type object, per-kind keywords, `required`
  derivation); asserts the strings `kind` and `typeText` do NOT
  appear anywhere in serialized output.
- `schema2form.test.ts`: enum(4)→segmented, enum(9)→select,
  boolean→toggle, bounded number→stepper with min/max clamp steps,
  `x-ui.lane:'block'` text row, `control:'none'` + snippet + opaque
  excluded from rows.

## Extractor gates

- `node scripts/component-metadata-gen.mjs --self-test` green: four
  fixtures (enum+default / numeric bounds / snippet+opaque /
  annotation-less `$props`) produce the expected IR.
- `node scripts/component-metadata-gen.mjs --check` green on a clean
  tree; red (stale list names the file) after mutating
  `registry/files/ui/press-button/press-button.svelte` props without
  regenerating.

## Canvas + pilot gates

- `press-button.html/+page.svelte` carries no hand-written variant/
  effect option arrays; the playground rows render from the schema;
  reset returns schema defaults; the usage code overlay still tracks
  live values.
- Mirror: `verify:mirror` green after integrator manifest regen;
  canvas bundle adds zero new imports outside its folder (registry
  zero-dep law — checked by `verify:deps` ownership resolution).
- Full `verify:all` green including the new `verify:meta`.

## Manual spot check

- Pilot page in dev: flip variant/size/loading/radius rows; stage
  updates live; effect select still drives builders via `onvalue`.
