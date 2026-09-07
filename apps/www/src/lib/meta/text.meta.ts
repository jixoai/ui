import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/text/text.svelte",
    "props": {
      "mark": {
        "kind": "opaque",
        "typeText": "TextMark",
        "ambient": "own"
      },
      "lineHeight": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "weight": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "italic": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "tracking": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "family": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "fontSize": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "children": {
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
      "data-jx-text"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
