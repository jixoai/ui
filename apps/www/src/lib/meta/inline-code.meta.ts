import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/inline-code/inline-code.svelte",
    "props": {
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "InlineCodeVariant",
        "ambient": "zone"
      },
      "lang": {
        "kind": "string",
        "default": "auto"
      },
      "backend": {
        "kind": "opaque",
        "typeText": "HighlightBackend"
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
      "class": {
        "kind": "string",
        "default": ""
      },
      "children": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-inline-code"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
