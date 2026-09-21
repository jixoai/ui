/**
 * IR → standard jsonSchema lowering (canvas-schema-pipeline, 2026-08-30).
 *
 * The one hand that writes exports: IR vocabulary in, standard jsonSchema
 * keywords out (`type`, `enum`, `minimum`, `maximum`, `multipleOf`,
 * `default`, `required`), `x-ui` passed through. Internal vocabulary
 * (`kind`, `typeText`) NEVER leaks — snippet/opaque nodes surface under
 * `x-ui` as `control: "none"` + `sourceType` (documented, panel-excluded,
 * never silently dropped). The panel rows and the exported schema come
 * from this same lowering — never two hand-maintained copies.
 */
import type { ComponentMeta, PropNode, XUI } from './ir';
import type { UniversalAxisDoc } from '../universal-props.schema';

/** Export annotation block — structurally the IR's `XUI`, carried verbatim. */
export type SchemaXUI = XUI;

/** One prop's lowered node: standard keywords + the `x-ui` passthrough. */
export interface SchemaPropNode {
  type?: 'string' | 'boolean' | 'number';
  enum?: string[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  default?: string | number | boolean;
  'x-ui'?: SchemaXUI;
}

/** The lowered export: a jsonSchema type-object. */
export interface SchemaObject {
  type: 'object';
  properties: Record<string, SchemaPropNode>;
  /** exactly the props without defaults */
  required: string[];
}

function finite(n: number | undefined): number | undefined {
  return n !== undefined && Number.isFinite(n) ? n : undefined;
}

/** The excluded-but-documented shape snippet/opaque nodes lower to. */
function excludedNode(node: Extract<PropNode, { typeText: string }>): SchemaPropNode {
  return {
    'x-ui': { ...node['x-ui'], control: 'none', sourceType: node.typeText },
  };
}

// ── the universal-props consumption path (explicit-props W4 4.1) ────
//
// meta.universal turns the family's AXIS props from excluded opaques
// (`SizeLane | QueryResult<SizeLane>` — unrepresentable pre-W4) into
// panel rows: each axis lowers as ONE string node whose enum is the
// lane grammar — 'auto', the named steps, then the `number` and
// `query()` MODE steps (present per the axis' numberUnit / always for
// query) — annotated `control: 'axis-enum'` + `axis` + `unit`. The
// canvas kernel's controlsFor synthesizes the `:number` (axis-number)
// and `:query` (query-editor) sibling rows from the same annotation;
// the dock gates them on the axis' selected mode. Families whose
// props do NOT carry the axis name (the seven-lane deviations, the
// exempt) are untouched — their axis props keep lowering as excluded.

/** does this opaque node speak the axis-lane union (the §9.1 form)? */
function isAxisLaneNode(node: PropNode): boolean {
  return node.kind === 'opaque' && node.typeText.includes('QueryResult<');
}

/** the axis lane-grammar node: 'auto' + named steps + the mode steps */
function axisNode(doc: UniversalAxisDoc, node: PropNode): SchemaPropNode {
  const xui = node['x-ui'];
  const enumValues = ['auto', ...doc.namedSteps];
  if (doc.numberUnit !== null) enumValues.push('number');
  enumValues.push('query()');
  return {
    type: 'string',
    enum: enumValues,
    default: 'auto',
    'x-ui': {
      ...xui,
      control: 'axis-enum',
      axis: doc.axis,
      label: xui?.label ?? doc.label,
      description: xui?.description ?? doc.description,
      ...(doc.numberUnit !== null ? { unit: doc.numberUnit } : {}),
    },
  };
}

/** Lower one IR node; unknown kinds degrade to the excluded node. */
export function lowerNode(node: PropNode): SchemaPropNode {
  const xui = node['x-ui'];
  switch (node.kind) {
    case 'enum': {
      const out: SchemaPropNode = { enum: [...node.values] };
      if (node.default !== undefined) out.default = node.default;
      if (xui) out['x-ui'] = { ...xui };
      return out;
    }
    case 'string': {
      const out: SchemaPropNode = { type: 'string' };
      if (node.default !== undefined) out.default = node.default;
      if (xui) out['x-ui'] = { ...xui };
      return out;
    }
    case 'boolean': {
      const out: SchemaPropNode = { type: 'boolean' };
      if (node.default !== undefined) out.default = node.default;
      if (xui) out['x-ui'] = { ...xui };
      return out;
    }
    case 'number': {
      const out: SchemaPropNode = { type: 'number' };
      const minimum = finite(node.minimum);
      const maximum = finite(node.maximum);
      const multipleOf = finite(node.multipleOf);
      if (minimum !== undefined) out.minimum = minimum;
      if (maximum !== undefined) out.maximum = maximum;
      if (multipleOf !== undefined && multipleOf > 0) out.multipleOf = multipleOf;
      if (node.default !== undefined) out.default = node.default;
      if (xui) out['x-ui'] = { ...xui };
      return out;
    }
    case 'snippet':
    case 'opaque':
      return excludedNode(node);
    default:
      // unreachable with the closed IR union; honest degradation anyway
      return excludedNode({ kind: 'opaque', typeText: 'unknown' });
  }
}

/**
 * Lower a whole meta. `required` lists exactly the props without
 * defaults (an explicitly-undefined default is no default). When the
 * meta carries `universal` (the §17 merge block), axis-lane props
 * lower through the axis path instead of the excluded one.
 */
export function toJSONSchema(meta: ComponentMeta): SchemaObject {
  const axisDocs = new Map((meta.universal ?? []).map((doc) => [doc.axis, doc]));
  const properties: Record<string, SchemaPropNode> = {};
  const required: string[] = [];
  for (const [key, node] of Object.entries(meta.props)) {
    // membership-checked: the map is keyed by the eight axis names, so
    // only an axis-named prop can hit (the cast narrows string → the
    // axis union for the lookup alone)
    const axisDoc = axisDocs.get(key as UniversalAxisDoc['axis']);
    if (axisDoc !== undefined && isAxisLaneNode(node)) {
      properties[key] = axisNode(axisDoc, node);
      continue; // default 'auto' — never a required row
    }
    properties[key] = lowerNode(node);
    if (!('default' in node) || node.default === undefined) required.push(key);
  }
  return { type: 'object', properties, required };
}
