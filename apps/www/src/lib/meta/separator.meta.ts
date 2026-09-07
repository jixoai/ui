import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/separator/separator.svelte",
    "props": {
      "orientation": {
        "kind": "enum",
        "values": [
          "horizontal",
          "vertical"
        ],
        "default": "horizontal"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "SeparatorVariant",
        "ambient": "own"
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
      "data-jx-separator"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
