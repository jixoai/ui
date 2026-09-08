import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/button-bar/button-bar.svelte",
    "props": {
      "orientation": {
        "kind": "enum",
        "values": [
          "horizontal",
          "vertical"
        ],
        "default": "horizontal"
      },
      "justify": {
        "kind": "enum",
        "values": [
          "start",
          "center",
          "end",
          "between"
        ],
        "default": "end"
      },
      "label": {
        "kind": "string"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "ButtonBarVariant",
        "ambient": "zone"
      },
      "raised": {
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
      "role": {
        "kind": "string",
        "default": "group"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "'data-density'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "'aria-label'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-btnbar"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
