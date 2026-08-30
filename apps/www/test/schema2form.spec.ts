/**
 * The controlsFor mapping gates (canvas-schema-pipeline, 2026-08-30).
 *
 * The mapping table (lowered jsonSchema → typed row descriptors):
 * enum ≤5 → segmented, enum >5 → select, boolean → toggle, number →
 * stepper (min/max clamp steps from multipleOf), string → text with the
 * lane rule; `control: 'none'` — which is exactly how snippet/opaque
 * nodes lower — is excluded from the panel. Imported through the kernel
 * surface ($lib/schema/schema2form); the implementation lives in the
 * mirrored canvas (registry law — one implementation, no second copy).
 */
import { describe, expect, it } from 'vitest';

import { defineComponentMeta } from '$lib/schema/ir';
import { toJSONSchema, type SchemaObject } from '$lib/schema/lower';
import { controlsFor } from '$lib/schema/schema2form';

/** small helper: a schema literal straight into the mapper */
const schema = (properties: SchemaObject['properties']): SchemaObject => ({
  type: 'object',
  properties,
  required: [],
});

describe('controlsFor mapping', () => {
  it('enum(4) → segmented, enum(9) → select', () => {
    const rows = controlsFor(
      schema({
        small: { enum: ['a', 'b', 'c', 'd'] },
        big: { enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
      }),
    );
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(byKey.small.control).toBe('segmented');
    expect(byKey.small.values).toEqual(['a', 'b', 'c', 'd']);
    expect(byKey.big.control).toBe('select');
    expect(byKey.big.values).toHaveLength(9);
  });

  it('boolean → toggle; the label defaults to the key', () => {
    const [row] = controlsFor(schema({ loading: { type: 'boolean', default: false } }));
    expect(row.control).toBe('toggle');
    expect(row.label).toBe('loading');
    expect(row.default).toBe(false);
  });

  it('bounded number → stepper carrying min/max clamp steps', () => {
    const [row] = controlsFor(
      schema({ depth: { type: 'number', minimum: 0, maximum: 4, multipleOf: 2, default: 2 } }),
    );
    expect(row.control).toBe('stepper');
    expect(row.minimum).toBe(0);
    expect(row.maximum).toBe(4);
    expect(row.step).toBe(2);
  });

  it('number without multipleOf steps by 1', () => {
    const [row] = controlsFor(schema({ n: { type: 'number' } }));
    expect(row.step).toBe(1);
  });

  it('explicit feasible x-ui control hints win over inference', () => {
    const rows = controlsFor(
      schema({
        depth: { type: 'number', minimum: 0, maximum: 10, 'x-ui': { control: 'slider' } },
        mode: { enum: ['x', 'y'], 'x-ui': { control: 'select' } },
        note: { type: 'string', 'x-ui': { control: 'none' } },
      }),
    );
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(byKey.depth.control).toBe('slider');
    expect(byKey.mode.control).toBe('select');
    expect(byKey.note).toBeUndefined(); // 'none' → no row at all
  });

  it('infeasible hints degrade to inference instead of breaking the row', () => {
    // a segmented hint on a non-enum falls through to the string → text
    const [row] = controlsFor(schema({ name: { type: 'string', 'x-ui': { control: 'segmented' } } }));
    expect(row.control).toBe('text');
  });
});

describe('controlsFor lanes and exclusions', () => {
  it("x-ui.lane 'block' switches the text row's lane", () => {
    const [block] = controlsFor(
      schema({ long: { type: 'string', 'x-ui': { lane: 'block' } } }),
    );
    const [end] = controlsFor(schema({ short: { type: 'string' } }));
    expect(block.lane).toBe('block');
    expect(end.lane).toBe('end');
  });

  it('a long text description flips the default lane to block', () => {
    const long = 'x'.repeat(49);
    const [row] = controlsFor(schema({ note: { type: 'string', 'x-ui': { description: long } } }));
    expect(row.lane).toBe('block');
  });

  it('unit rides along for steppers', () => {
    const [row] = controlsFor(
      schema({ depth: { type: 'number', 'x-ui': { unit: 'px' } } }),
    );
    expect(row.unit).toBe('px');
  });

  it("control 'none', snippet and opaque kinds are excluded — via the lowering", () => {
    // the real path: IR (snippet/opaque) → toJSONSchema marks them
    // control:'none' → no row renders, structure still exported
    const meta = defineComponentMeta({
      source: 'fixture',
      props: {
        variant: { kind: 'enum', values: ['a', 'b'] },
        children: { kind: 'snippet', typeText: 'Snippet' },
        helper: { kind: 'opaque', typeText: 'Density' },
        hidden: { kind: 'string', 'x-ui': { control: 'none' } },
      },
    });
    const lowered = toJSONSchema(meta);
    const rows = controlsFor(lowered);
    expect(rows.map((r) => r.key)).toEqual(['variant']);
    // documented, not dropped: the export still carries the nodes
    expect(lowered.properties.children['x-ui']).toEqual({
      control: 'none',
      sourceType: 'Snippet',
    });
    expect(lowered.properties.helper['x-ui']).toEqual({
      control: 'none',
      sourceType: 'Density',
    });
  });

  it('untyped / unrepresentable nodes render no row', () => {
    const rows = controlsFor(schema({ mystery: {} }));
    expect(rows).toEqual([]);
  });
});
