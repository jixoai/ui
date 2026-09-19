import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/grid/grid.svelte",
    "props": {
      "cols": {
        "kind": "number",
        "minimum": 1,
        "maximum": 12
      },
      "rows": {
        "kind": "enum",
        "values": [
          "collapse",
          "open"
        ]
      },
      "gap": {
        "kind": "opaque",
        "typeText": "GridGap"
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
      "data-jx-grid"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
