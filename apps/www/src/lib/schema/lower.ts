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
 * defaults (an explicitly-undefined default is no default).
 */
export function toJSONSchema(meta: ComponentMeta): SchemaObject {
  const properties: Record<string, SchemaPropNode> = {};
  const required: string[] = [];
  for (const [key, node] of Object.entries(meta.props)) {
    properties[key] = lowerNode(node);
    if (node.default === undefined) required.push(key);
  }
  return { type: 'object', properties, required };
}
