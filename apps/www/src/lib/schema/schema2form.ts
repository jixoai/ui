/**
 * jsonSchema → panel row mapping (canvas-schema-pipeline, 2026-08-30;
 * kernel file since canvas-playground-dock, 2026-09-08).
 *
 * `controlsFor` maps a LOWERED schema (toJSONSchema output) onto typed
 * row descriptors: enum ≤5 → segmented, enum >5 → select, boolean →
 * toggle, number → stepper (slider when annotated), string → text;
 * `x-ui.control: 'none'` (which is how snippet/opaque nodes lower) is
 * excluded from the panel.
 *
 * IMPLEMENTATION LIVES IN THE CANVAS KERNEL (registry law): the mapping
 * is the canvas family's own rendering vocabulary, so it sits in the
 * mirrored registry item (`registry/files/ui/component-canvas/`,
 * canvas-schema.svelte.ts since the dock extraction — the canvas
 * re-exports it from component-canvas.svelte's module script) —
 * importing it from this www-only module would break the mirror. This
 * module is the kernel's canonical surface: one implementation,
 * re-exported for tests and future consumers (flagship-lab typed
 * controls). The kernel's `CanvasSchema` input type is structurally the
 * `SchemaObject` lower.ts exports — same shape, no import (mirror law).
 */
export {
  controlsFor,
  schemaDefaultsOf,
  type CanvasSchema,
  type CanvasSchemaProp,
  type CanvasXUI,
  type ControlKind,
  type ControlRow,
} from '$lib/ui/component-canvas/canvas-schema.svelte';
