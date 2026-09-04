import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/select/select.svelte",
    "props": {
      "options": {
        "kind": "opaque",
        "typeText": "SelectOption[]"
      },
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "value": {
        "kind": "string"
      },
      "placeholder": {
        "kind": "string",
        "default": "Select..."
      },
      "label": {
        "kind": "string"
      },
      "name": {
        "kind": "string"
      },
      "id": {
        "kind": "string"
      },
      "error": {
        "kind": "string"
      },
      "multiple": {
        "kind": "boolean",
        "default": false
      },
      "variant": {
        "kind": "enum",
        "values": [
          "solid",
          "acrylic",
          "auto"
        ],
        "default": "auto",
        "ambient": "own"
      },
      "'data-density'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "disabled": {
        "kind": "boolean",
        "default": false
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
      "data-jx-sel-active",
      "data-jx-sel-disabled",
      "data-jx-sel-option-desc",
      "data-jx-sel-option-label",
      "data-jx-sel-panel-body",
      "data-jx-sel-panel-shadow",
      "data-jx-sel-placeholder",
      "data-jx-sel-scroll",
      "data-jx-sel-selected",
      "data-jx-sel-value",
      "data-jx-sel-wrap"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
