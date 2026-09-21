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

// ── the axis kinds (explicit-props W4 4.1: meta.universal → per-axis
// controls through the SAME lowering — one lane, three controls) ────
import { UNIVERSAL_AXES } from '$lib/universal-props.schema';
import { parseQuerySource, query } from '$lib/universal-props-query.svelte';
import { schemaDefaultsOf } from '$lib/schema/schema2form';

const themeDoc = UNIVERSAL_AXES.find((d) => d.axis === 'theme')!;

describe('toJSONSchema — the universal consumption path', () => {
  it('an axis-lane prop lowers as the lane grammar node, never required', () => {
    const meta = defineComponentMeta({
      source: 'fixture',
      props: {
        size: { kind: 'opaque', typeText: 'SizeLane | QueryResult<SizeLane>' },
        plain: { kind: 'string' },
      },
      universal: UNIVERSAL_AXES,
      hooks: [],
    });
    const lowered = toJSONSchema(meta);
    const node = lowered.properties.size;
    expect(node.type).toBe('string');
    expect(node.enum).toEqual(['auto', 'small', 'medium', 'large', 'number', 'query()']);
    expect(node.default).toBe('auto');
    expect(node['x-ui']).toMatchObject({ control: 'axis-enum', axis: 'size', unit: 'px' });
    expect(lowered.required).toEqual(['plain']); // the axis row defaults 'auto'
  });

  it('enum-only axes drop the number mode step; theme has no unit', () => {
    const meta = defineComponentMeta({
      source: 'fixture',
      props: { theme: { kind: 'opaque', typeText: 'ThemeLane | QueryResult<ThemeLane>' } },
      universal: UNIVERSAL_AXES,
      hooks: [],
    });
    const node = toJSONSchema(meta).properties.theme;
    expect(node.enum).toEqual(['auto', 'light', 'dark', 'system', 'query()']);
    expect(node['x-ui']?.unit).toBeUndefined();
    expect(themeDoc.numberUnit).toBeNull();
  });

  it('an axis whose prop is ABSENT (the seven-lane deviations) is untouched', () => {
    const meta = defineComponentMeta({
      source: 'fixture',
      props: { size: { kind: 'opaque', typeText: 'SizeLane | QueryResult<SizeLane>' } },
      universal: UNIVERSAL_AXES,
      hooks: [],
    });
    const lowered = toJSONSchema(meta);
    // theme/density have no prop here — nothing synthesized for them
    expect(Object.keys(lowered.properties)).toEqual(['size']);
    // and a NON-lane opaque named like an axis stays excluded
    const odd = defineComponentMeta({
      source: 'fixture',
      props: { size: { kind: 'opaque', typeText: 'number' } },
      universal: UNIVERSAL_AXES,
      hooks: [],
    });
    expect(toJSONSchema(odd).properties.size['x-ui']?.control).toBe('none');
  });
});

describe('controlsFor — the axis trio', () => {
  const axisSchema = toJSONSchema(
    defineComponentMeta({
      source: 'fixture',
      props: {
        size: { kind: 'opaque', typeText: 'SizeLane | QueryResult<SizeLane>' },
        theme: { kind: 'opaque', typeText: 'ThemeLane | QueryResult<ThemeLane>' },
      },
      universal: UNIVERSAL_AXES,
      hooks: [],
    }),
  );

  it('the enum row carries the grammar; :number/:query siblings follow', () => {
    const rows = controlsFor(axisSchema);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(byKey.size.control).toBe('axis-enum');
    expect(byKey.size.axis).toBe('size');
    expect(byKey.size.values).toEqual(['auto', 'small', 'medium', 'large', 'number', 'query()']);
    expect(byKey['size:number'].control).toBe('axis-number');
    expect(byKey['size:number'].axis).toBe('size');
    expect(byKey['size:number'].default).toBe(16); // the px seed
    expect(byKey['size:number'].minimum).toBe(0);
    expect(byKey['size:query'].control).toBe('query-editor');
    expect(byKey['size:query'].lane).toBe('block');
    expect(byKey['size:query'].axis).toBe('size');
  });

  it('enum-only axes get the query editor but no number stepper', () => {
    const rows = controlsFor(axisSchema);
    const keys = rows.map((r) => r.key);
    expect(keys).toContain('theme:query');
    expect(keys).not.toContain('theme:number');
    expect(byKeyOf(rows).theme.control).toBe('axis-enum');
  });

  it('schemaDefaultsOf seeds the enum rows auto (siblings start unset)', () => {
    const defaults = schemaDefaultsOf(axisSchema);
    expect(defaults).toEqual({ size: 'auto', theme: 'auto' });
  });

  function byKeyOf(rows: ReturnType<typeof controlsFor>) {
    return Object.fromEntries(rows.map((r) => [r.key, r]));
  }
});

describe('parseQuerySource — the query-editor grammar', () => {
  it('parses bare keys, @container keys with names, quoted values and numbers', () => {
    const { cases } = parseQuerySource("{ sm: 'large', '@sm/card': 20 }");
    expect(cases).toEqual({ sm: 'large', '@sm/card': 20 });
  });

  it('the cases feed query() which ladders them registered-scale order', () => {
    const { cases } = parseQuerySource("{ lg: 'large', sm: 'small', '@md': 18 }");
    const q = query(cases);
    expect(q.$query).toBe(true);
    // narrow → wide by THRESHOLD: container @md 28rem < viewport sm 40rem < lg 64rem
    expect(q.cases.map(([key]) => key)).toEqual(['@md', 'sm', 'lg']);
  });

  it('empty object is legal; drift throws a named offense', () => {
    expect(parseQuerySource('{}').cases).toEqual({});
    expect(() => parseQuerySource("sm: 'large'")).toThrow(/object literal/);
    expect(() => parseQuerySource('{ sm: large }')).toThrow(/number or quoted value/);
    expect(() => parseQuerySource("{ sm 'large' }")).toThrow(/`:`/);
    expect(() => parseQuerySource("{ sm: 'larg }")).toThrow(/unterminated/);
  });
});
