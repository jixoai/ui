import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/checkbox/checkbox.svelte",
    "props": {
      "label": {
        "kind": "string"
      },
      "id": {
        "kind": "string"
      },
      "error": {
        "kind": "string"
      },
      "labelSide": {
        "kind": "enum",
        "values": [
          "left",
          "right"
        ],
        "default": "right"
      },
      "indeterminate": {
        "kind": "boolean",
        "default": false
      },
      "checked": {
        "kind": "boolean"
      },
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "data-density": {
        "kind": "string"
      },
      "'data-density'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-check",
      "data-jx-check-label",
      "data-jx-check-left"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
