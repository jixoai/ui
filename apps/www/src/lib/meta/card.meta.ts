import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/card/card.svelte",
    "props": {
      "title": {
        "kind": "string"
      },
      "head": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "actions": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "foot": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "scroll": {
        "kind": "boolean",
        "default": true
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      }
    },
    "hooks": [
      "data-jx-card",
      "data-jx-card-foot",
      "data-jx-card-head",
      "data-jx-card-sep"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
