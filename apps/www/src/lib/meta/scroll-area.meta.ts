import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/scroll-area/scroll-area.svelte",
    "props": {
      "orientation": {
        "kind": "enum",
        "values": [
          "vertical",
          "horizontal",
          "both"
        ],
        "default": "vertical"
      },
      "label": {
        "kind": "string",
        "default": "scrollable content"
      },
      "pad": {
        "kind": "string"
      },
      "radius": {
        "kind": "opaque",
        "typeText": "number | 'full'",
        "ambient": "own"
      },
      "width": {
        "kind": "enum",
        "values": [
          "auto",
          "thin",
          "wide"
        ],
        "default": "auto"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "style": {
        "kind": "string"
      },
      "onscroll": {
        "kind": "opaque",
        "typeText": "(event: ViewportScrollEvent) => void"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "restProps": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-scroll-content"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
