import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/component-canvas/component-canvas.svelte",
    "props": {
      "title": {
        "kind": "string"
      },
      "description": {
        "kind": "string"
      },
      "sourceUrl": {
        "kind": "string"
      },
      "install": {
        "kind": "string"
      },
      "files": {
        "kind": "opaque",
        "typeText": "TreeFile[]"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "stage": {
        "kind": "enum",
        "values": [
          "fill",
          "center",
          "start"
        ],
        "default": "fill"
      },
      "scroll": {
        "kind": "enum",
        "values": [
          "capped",
          "grow"
        ],
        "default": "capped"
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
      "schema": {
        "kind": "opaque",
        "typeText": "CanvasSchema"
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
      "resolveFileContent": {
        "kind": "opaque",
        "typeText": "(file: TreeFile) => string"
      },
      "id": {
        "kind": "string"
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-canvas",
      "data-jx-canvas-code-actions",
      "data-jx-canvas-code-bar",
      "data-jx-canvas-code-clip",
      "data-jx-canvas-description",
      "data-jx-canvas-head",
      "data-jx-canvas-head-actions",
      "data-jx-canvas-install",
      "data-jx-canvas-scroll",
      "data-jx-canvas-source",
      "data-jx-canvas-stage",
      "data-jx-canvas-stage-row",
      "data-jx-canvas-title",
      "data-jx-chrome"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
