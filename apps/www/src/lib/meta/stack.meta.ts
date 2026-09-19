import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/stack/stack.svelte",
    "props": {
      "direction": {
        "kind": "enum",
        "values": [
          "row",
          "column"
        ],
        "default": "row"
      },
      "gap": {
        "kind": "opaque",
        "typeText": "StackGap"
      },
      "align": {
        "kind": "enum",
        "values": [
          "start",
          "center",
          "end",
          "baseline",
          "stretch"
        ]
      },
      "justify": {
        "kind": "enum",
        "values": [
          "start",
          "center",
          "end",
          "between",
          "stretch"
        ]
      },
      "wrap": {
        "kind": "boolean",
        "default": false
      },
      "inline": {
        "kind": "boolean",
        "default": false
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
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
      "data-jx-stack"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
