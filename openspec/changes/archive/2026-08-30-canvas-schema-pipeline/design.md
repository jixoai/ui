# Design: canvas-schema-pipeline

## The three-layer ruling (Owner, 2026-08-30)

**zod = 唯一声明层之一，IR = 运行时规范形态，模板 = 纯载荷。**
For THIS repo the declaration layer is the `.svelte` source itself
(the component already exists and is typed); zod is not used at all —
third parties lower their own zod schemas with `z.toJSONSchema()` and
feed the same front door. The IR is zero-dependency plain objects,
jsonSchema-shaped with `x-ui` annotations; it is what the store holds,
what the panel consumes and what exports verbatim. "导出即消费，
承诺可审计" — the panel rows and the exported schema come from the
same lowering, never two hand-maintained copies.

## IR shape

```ts
type IRNode =
  | { kind: 'enum';    values: string[]; default?: string }
  | { kind: 'string';  default?: string }
  | { kind: 'boolean'; default?: boolean }
  | { kind: 'number';  minimum?: number; maximum?: number;
      multipleOf?: number; default?: number }
  | { kind: 'snippet'; typeText: string }   // documented, panel-excluded
  | { kind: 'opaque';  typeText: string };  // imported/unresolved, honest
interface XUI { control?: 'segmented'|'select'|'toggle'|'stepper'|
  'slider'|'text'|'none'; label?: string; description?: string;
  lane?: 'end'|'block'; unit?: string }
// meta file: { source, props: Record<string, IRNode & {x-ui?}>, hooks }
```

Lowering is a pure function per node kind; anything not in the
standard keyword set is dropped or carried under `x-ui` — internal
vocabulary (`kind`, `typeText`) never leaks into the export.

## Extraction (AST, zero new deps)

1. Read the `.svelte` source; split module + instance scripts.
2. Parse scripts with the `typescript` devDep API (the script bodies
   are TS). Collect: local `type`/`interface` declarations, the
   `Props`-shaped interface the `$props()` destructure names (or the
   inline type annotation), `$props()` destructure initializers
   (defaults).
3. Resolve prop types against same-file aliases only:
   - literal union → `enum`
   - `string|boolean|number` (with literal-numeric members) → primitive
   - `Snippet<…>` → `snippet` kind
   - anything imported/complex → `opaque` with `typeText`
4. Template pass via `svelte/compiler` `parse` + walk: collect
   `data-jx-*` attribute names (hooks list).
5. Emit `apps/www/src/lib/meta/<name>.meta.ts`:

```ts
// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta({ source, props, hooks });
// ===== hand-authored annotations survive regeneration =====
export const annotations = defineAnnotations({
  variant: { 'x-ui': { control: 'segmented', label: 'variant',
    description: 'Prominence ladder rung' } },
});
```

`defineComponentMeta`/`defineAnnotations` are identity-typed helpers
from `$lib/schema/ir.ts` (www-side import in the meta file). Merge
happens at consume time (`withAnnotations(meta, annotations)`), never
by writing into the generated zone.

## Why not svelte2tsx

svelte2tsx resolves types via the language-tools pipeline, but it is
not a current devDep and its output couples us to language-tools
internals. Our component-authoring law keeps prop types local and
literal-union-shaped, which same-file AST resolution covers; `opaque`
is the honest ceiling for the rest. If extraction gaps accumulate,
svelte2tsx is the documented upgrade path (design note, not a task).

## Canvas schema mode

```
ComponentCanvas schema={schema} bind:values {onvalue}
```

- `values` initializes from schema defaults; two-way bound.
- Rows render from `controlsFor(schema)`; compact single-line rows
  (label inline-end, control inline-end, description sub-line) with
  `lane: 'block'` switching label-above for text inputs — the layout
  grammar proven in the specs-block/paged-block prototypes.
- Precedence: `playground` snippet supplied ⇒ snippet renders (page
  keeps full control); `schema` alone ⇒ generated rows; both missing
  ⇒ today's plain canvas. Reset: `onreset` if given, else defaults.
- `onvalue(key, value)` is the escape seam for non-representable
  wiring (effect builders): the page intercepts, maps, and writes back
  into `bind:values` — schema drives the CONTROL, the page owns the
  VALUE semantics.
- Registry safety: control rendering is self-contained in the canvas
  (no `$lib/playground` import — the mirror would break); it reuses
  the canvas's existing press-physics and layer idioms.

## Drift gates

`--check` regenerates in memory and diffs the GENERATED zone; any
delta (source changed, meta stale) fails with the stale file list.
Meta files are committed (like the mirror manifest) so CI catches
"changed the component, forgot the meta". `--self-test` extracts four
fixture `.svelte` files covering: enum + default, numeric bounds,
snippet + opaque, `$props()` without annotation (inference fallback).

## Deliberately out of scope

- Paged*/print (research in flight), PropsTable generation, page
  sweep beyond the pilot, zod adapter code (pattern documented here
  only), `fromZod` implementation.
