/**
 * jixoai canvas schema kernel (registry/files/ui/component-canvas/
 * canvas-schema.svelte.ts — canvas-playground-dock, 2026-09-08).
 *
 * WHAT: the jsonSchema control-row vocabulary the canvas family shares
 * — the lowered-schema types (CanvasXUI/CanvasSchemaProp/CanvasSchema),
 * the ControlKind/ControlRow row descriptors, the SEGMENTED_MAX/
 * BLOCK_DESCRIPTION_LENGTH constants, the controlsFor lowering and the
 * schemaDefaultsOf reset seed, PLUS PlayOutput (the read-only state
 * projection type the playground surface renders at its foot — a
 * playground concern since the dock extraction).
 *
 * WHY a file of its own: the module script of component-canvas.svelte
 * owned this kernel so it was statically importable and registry-safe
 * (no $lib/schema import — the mirror would break), but the dock
 * (canvas-playground.svelte) also needs ControlRow/PlayOutput without
 * importing the whole canvas component. The extraction keeps ONE
 * implementation: the canvas re-exports the kernel (`export * from
 * './canvas-schema.svelte'` — public surface byte-stable for
 * consumers), $lib/schema/schema2form.ts points here, the dock imports
 * here. No circularity: the kernel is dependency-free.
 *
 * The input type below is structurally lower.ts's SchemaObject: same
 * shape, no import (mirror law).
 */

/** x-ui annotation block as the canvas reads it (kernel XUI, by shape). */
export interface CanvasXUI {
  control?: 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text' | 'none';
  label?: string;
  description?: string;
  lane?: 'end' | 'block';
  unit?: string;
  sourceType?: string;
}

/** One lowered prop node: standard jsonSchema keywords + x-ui passthrough. */
export interface CanvasSchemaProp {
  type?: 'string' | 'boolean' | 'number';
  enum?: string[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  default?: string | number | boolean;
  'x-ui'?: CanvasXUI;
}

/** The lowered schema the canvas consumes (lower.ts SchemaObject, by shape). */
export interface CanvasSchema {
  type: 'object';
  properties: Record<string, CanvasSchemaProp>;
  required?: string[];
}

export type ControlKind = 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text';

/** Typed row descriptor the schema pane renders. */
export interface ControlRow {
  key: string;
  control: ControlKind;
  label: string;
  description?: string;
  lane: 'end' | 'block';
  unit?: string;
  /** segmented/select options — the labels ARE the values */
  values?: string[];
  minimum?: number;
  maximum?: number;
  /** stepper/slider step: multipleOf when the schema constrains it, else 1 */
  step: number;
  default?: string | number | boolean;
}

/** enum length at/below which the segmented control renders */
const SEGMENTED_MAX = 5;
/** text rows switch to the block lane when the description runs long */
const BLOCK_DESCRIPTION_LENGTH = 48;

/** Read-only playground state projection; never a live region. */
export interface PlayOutput {
  label: string;
  value: string | number | boolean | null | undefined | readonly unknown[];
}

function feasibleControl(hint: string, node: CanvasSchemaProp): boolean {
  switch (hint) {
    case 'segmented':
    case 'select':
      return Array.isArray(node.enum);
    case 'toggle':
      return node.type === 'boolean';
    case 'stepper':
      return node.type === 'number';
    case 'slider':
      return (
        node.type === 'number' &&
        typeof node.minimum === 'number' &&
        typeof node.maximum === 'number'
      );
    case 'text':
      return node.type === 'string';
    default:
      return false;
  }
}

/**
 * Lowered schema → panel rows. `x-ui.control: 'none'` (the lowering's
 * mark for snippet/opaque nodes) and unrepresentable shapes are
 * excluded; an explicit, feasible x-ui hint wins over inference.
 */
export function controlsFor(schema: CanvasSchema | undefined | null): ControlRow[] {
  const rows: ControlRow[] = [];
  for (const [key, node] of Object.entries(schema?.properties ?? {})) {
    const hint = node['x-ui']?.control;
    if (hint === 'none') continue;
    let control: ControlKind | undefined;
    if (hint !== undefined && feasibleControl(hint, node)) {
      control = hint;
    } else if (Array.isArray(node.enum)) {
      control = node.enum.length <= SEGMENTED_MAX ? 'segmented' : 'select';
    } else if (node.type === 'boolean') {
      control = 'toggle';
    } else if (node.type === 'number') {
      control = 'stepper';
    } else if (node.type === 'string') {
      control = 'text';
    }
    if (control === undefined) continue;
    const description = node['x-ui']?.description;
    const row: ControlRow = {
      key,
      control,
      label: node['x-ui']?.label ?? key,
      lane:
        node['x-ui']?.lane ??
        (control === 'text' && (description?.length ?? 0) > BLOCK_DESCRIPTION_LENGTH ? 'block' : 'end'),
      step: typeof node.multipleOf === 'number' && node.multipleOf > 0 ? node.multipleOf : 1,
    };
    if (description !== undefined) row.description = description;
    if (node['x-ui']?.unit !== undefined) row.unit = node['x-ui'].unit;
    if (Array.isArray(node.enum)) row.values = [...node.enum];
    if (typeof node.minimum === 'number') row.minimum = node.minimum;
    if (typeof node.maximum === 'number') row.maximum = node.maximum;
    if (node.default !== undefined) row.default = node.default;
    rows.push(row);
  }
  return rows;
}

/** The schema-defaults record an unbound `values` initializes to. */
export function schemaDefaultsOf(schema: CanvasSchema): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, node] of Object.entries(schema.properties)) {
    if (node.default !== undefined) out[key] = node.default;
  }
  return out;
}
