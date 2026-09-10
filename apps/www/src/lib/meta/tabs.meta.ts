import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/tabs/tabs.svelte",
    "props": {
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "value": {
        "kind": "string"
      },
      "onchange": {
        "kind": "opaque",
        "typeText": "(value: string) => void"
      },
      "activation": {
        "kind": "enum",
        "values": [
          "automatic",
          "manual"
        ],
        "default": "automatic"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      }
    },
    "hooks": [
      "data-jx-tabs"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
