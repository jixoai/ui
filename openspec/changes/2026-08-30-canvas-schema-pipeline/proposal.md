# Proposal: canvas-schema-pipeline — jsonSchema is the canvas's native tongue

## Why

The docs site's playground is hand-authored per page: every docs page
copies option arrays, default snapshots and reset boilerplate by hand
(`press-button.html/+page.svelte:60-96` is the canonical 37-line
example). The same drift-prone copying feeds `PropsTable` rows. This
change makes **jsonSchema the interchange format for component
structure** and the canvas a **jsonSchema2Form consumer**, per the
Owner architecture ruling (2026-08-30):

- source of truth is the `.svelte` source itself — a
  `component-metadata-gen` build step extracts props metadata;
- the IR is zero-dependency, jsonSchema-shaped plain objects with
  `x-ui` annotations — zod is NOT a dependency (third parties may
  lower `z.toJSONSchema()` output into the same front door);
- ComponentCanvas grows an optional `schema` prop that renders
  control rows from that jsonSchema; the consumer-authored
  `playground` snippet remains the escape hatch (P1 protocol kept).

This decouples the two first-principles problems the Owner named:
structural extraction (solved here) and document typesetting
(Paged* — deliberately OUT of scope, research in flight at
`.agents/audit/2026-08-30-site-walkthrough/paged/`).

## What Changes

### 1. `scripts/component-metadata-gen.mjs` (new)

- CLI: `node scripts/component-metadata-gen.mjs <component-path…>`
  writes `apps/www/src/lib/meta/<name>.meta.ts`; `--check` exits 1
  listing stale outputs (the gen-mirror-manifest lock pattern);
  `--self-test` runs fixture extraction assertions (see verification).
- Extraction is AST-based, zero new dependencies: the `.svelte`
  instance + `<script module>` blocks are parsed with the existing
  `typescript` devDep; `svelte/compiler` parses the template for
  `data-jx-*` hooks. Covered prop shapes: literal unions → `enum`,
  `string`/`boolean`/`number` → primitives with `minimum`/`maximum`
  when numeric literal types constrain them, `$props()` destructure
  initializers → `default`, `Snippet` props → documented-but-panel-
  excluded, spread `...restProps` → documented passthrough row.
  Imported/opaque types degrade honestly to a typed-string node with
  the source type text — never silently dropped.
- The generated file has two zones: a GENERATED block (regenerated,
  never hand-edited) and a hand-authored `annotations` export
  (`x-ui` control hints, descriptions, rulings refs). `--check`
  fails if the generated zone drifted; annotations survive regen.

### 2. `$lib/schema/` (new www module, zero runtime deps)

- `ir.ts` — IR node types (`enum`/`string`/`boolean`/`number`/
  `opaque`/`snippet` kinds + `x-ui` annotation type).
- `lower.ts` — `toJSONSchema(meta)` lowering: IR vocabulary in,
  standard jsonSchema keywords out (`enum`, `type`, `minimum`,
  `maximum`, `default`, `required` = no-default props, `x-ui`
  passthrough). No internal vocabulary ever leaks into the export.
- `schema2form.ts` — `controlsFor(schema)` mapping: enum→segmented
  (≤5 values) or select, boolean→toggle, number with bounds→stepper,
  string→text (lane from `x-ui.lane`, block when long); `x-ui.control:
  "none"` or snippet/opaque kinds → excluded from the panel.

### 3. ComponentCanvas `schema` mode (registry item + mirror)

- New optional props: `schema?: JSONSchema` (the lowered export),
  `values?: Record<string, unknown>` (bindable; initialized from
  schema defaults), `onvalue?: (key, value) => void` change seam.
- In schema mode the canvas renders the control rows itself —
  self-contained compact rows (label / control / description), zero
  new dependencies (registry law). Reset falls back to schema
  defaults when `onreset` is absent. The `playground` snippet still
  wins when both are supplied (escape hatch precedence, documented).
- Stage consumers read `values` via `bind:values` — the page keeps
  owning exotic wiring (e.g. effect builders) next to schema-driven
  primitives.

### 4. Pilot page

- `press-button.html/+page.svelte` swaps its hand-written variant/
  effect playground state for: generated `press-button.meta.ts` →
  `toJSONSchema` → canvas `schema` + `bind:values`; the effect enum
  stays page-side via the `onvalue` seam mapping names→builders.

### 5. Gates

- `verify:meta` wired into `verify-all.mjs` [integrator-owned file].
- vitest unit tests for `lower.ts` + `schema2form.ts` (fixtures:
  press-button IR; enum/number/boolean/string lanes; leak checks —
  no `kind`/internal fields in exports).

## Impact

- Files: `scripts/component-metadata-gen.mjs`, `scripts/verify-meta.mjs`
  (or one script, two modes), `apps/www/src/lib/schema/*`,
  `apps/www/src/lib/meta/*` (generated, committed),
  `component-canvas.svelte`+`.css` (registry + mirror, byte-identical),
  pilot page. `package.json`/`verify-all.mjs` wiring is
  integrator-owned (shared-file law).
- No new dependencies anywhere. Registry zero-dep law intact.
- Coordination: `2026-08-30-canvas-floor-lab` (unimplemented) will
  restyle the canvas surface; its flagship-lab typed controls are
  THIS pipeline's consumer — the `schema`/`values` seam defined here
  is the contract that change builds on. PropsTable generation from
  the same meta is a follow-up, not in scope.
