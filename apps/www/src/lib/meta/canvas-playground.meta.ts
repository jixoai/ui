import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/component-canvas/canvas-playground.svelte",
    "props": {
      "title": {
        "kind": "string"
      },
      "theme": {
        "kind": "enum",
        "values": [
          "light",
          "dark"
        ]
      },
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "playground": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "rows": {
        "kind": "opaque",
        "typeText": "ControlRow[]"
      },
      "schemaDefaults": {
        "kind": "opaque",
        "typeText": "Record<string, unknown>"
      },
      "values": {
        "kind": "opaque",
        "typeText": "Record<string, unknown>"
      },
      "onvalue": {
        "kind": "opaque",
        "typeText": "(key: string, value: unknown) => void"
      },
      "onreset": {
        "kind": "opaque",
        "typeText": "() => void"
      },
      "output": {
        "kind": "opaque",
        "typeText": "readonly PlayOutput[]"
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-canvas-control",
      "data-jx-canvas-density-select",
      "data-jx-canvas-dock",
      "data-jx-canvas-dock-clip",
      "data-jx-canvas-dock-foot",
      "data-jx-canvas-dock-grip",
      "data-jx-canvas-dock-group",
      "data-jx-canvas-dock-head",
      "data-jx-canvas-dock-scroll",
      "data-jx-canvas-dock-toggle",
      "data-jx-canvas-output-row",
      "data-jx-canvas-reset",
      "data-jx-canvas-row",
      "data-jx-canvas-seg",
      "data-jx-canvas-select",
      "data-jx-canvas-slider",
      "data-jx-canvas-stepper",
      "data-jx-canvas-text",
      "data-jx-canvas-theme-toggle",
      "data-jx-canvas-toggle"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
