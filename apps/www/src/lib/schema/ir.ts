/**
 * The component-structure IR (canvas-schema-pipeline, 2026-08-30).
 *
 * Zero-dependency plain objects, jsonSchema-shaped with `x-ui`
 * annotations. The IR is what the store holds, what the panel consumes
 * and what exports verbatim (via lower.ts) — "导出即消费，承诺可审计".
 * zod is NOT a dependency: third parties lower `z.toJSONSchema()` output
 * into the same front door (toJSONSchema accepts anything structurally
 * compatible with ComponentMeta).
 *
 * Internal vocabulary (`kind`, `typeText`) lives ONLY here; lower.ts
 * guarantees it never reaches an export.
 */

/** Control hints the panel understands; `'none'` excludes the row. */
export type ControlHint =
  | 'segmented'
  | 'select'
  | 'toggle'
  | 'stepper'
  | 'slider'
  | 'text'
  | 'none';

/**
 * Panel-facing annotation vocabulary. Carried verbatim into exports
 * under the `x-ui` keyword. `sourceType` is written by the lowering for
 * snippet/opaque nodes (their honest source type text, documented but
 * panel-excluded) — it is descriptive, never internal vocabulary.
 */
export interface XUI {
  control?: ControlHint;
  label?: string;
  description?: string;
  lane?: 'end' | 'block';
  unit?: string;
  /** source type text for snippet/opaque nodes (lowering output only) */
  sourceType?: string;
}

/** A representable enum: string literal unions. */
export interface IREnumNode {
  kind: 'enum';
  values: string[];
  default?: string;
}
export interface IRStringNode {
  kind: 'string';
  default?: string;
}
export interface IRBooleanNode {
  kind: 'boolean';
  default?: boolean;
}
export interface IRNumberNode {
  kind: 'number';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  default?: number;
}
/** Snippet props: documented with their source type text, panel-excluded. */
export interface IRSnippetNode {
  kind: 'snippet';
  typeText: string;
}
/** Imported/unresolved types: the honest ceiling, never silently dropped. */
export interface IROpaqueNode {
  kind: 'opaque';
  typeText: string;
}

export type IRNode =
  | IREnumNode
  | IRStringNode
  | IRBooleanNode
  | IRNumberNode
  | IRSnippetNode
  | IROpaqueNode;

/** One prop: an IR node plus optional hand-authored `x-ui` hints. */
export type PropNode = IRNode & { 'x-ui'?: XUI };

/** The component meta a `.meta.ts` file exports. */
export interface ComponentMeta {
  /** registry source path the metadata was extracted from */
  source: string;
  props: Record<string, PropNode>;
  /** `data-jx-*` hook attribute names found in the template */
  hooks: readonly string[];
}

/** Hand-authored zone shape: `x-ui` hints keyed by prop name. */
export interface PropAnnotation {
  'x-ui'?: XUI;
}
export interface Annotations {
  [prop: string]: PropAnnotation;
}

/** Identity-typed helper — the GENERATED zone's entry point. */
export function defineComponentMeta(meta: ComponentMeta): ComponentMeta {
  return meta;
}

/** Identity-typed helper — the hand-authored annotations zone. */
export function defineAnnotations(annotations: Annotations): Annotations {
  return annotations;
}

/**
 * Consume-time merge of hand annotations into a meta. Annotation keys
 * outside `props` are a TYPE ERROR at consume time (the mapped `never`
 * arm). Per-field, the annotation wins over the node's own `x-ui`.
 */
export function withAnnotations<
  M extends ComponentMeta,
  A extends Annotations,
>(meta: M, annotations: A & { [K in keyof A]: K extends keyof M['props'] ? PropAnnotation : never }): ComponentMeta {
  const props: Record<string, PropNode> = {};
  for (const [key, node] of Object.entries(meta.props)) {
    const hint = annotations[key]?.['x-ui'];
    props[key] = hint
      ? { ...node, 'x-ui': { ...node['x-ui'], ...hint } }
      : node;
  }
  return { ...meta, props };
}
