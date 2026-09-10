import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/chip/chip.svelte",
    "props": {
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "ChipVariant",
        "ambient": "zone"
      },
      "shape": {
        "kind": "opaque",
        "typeText": "ChipShape",
        "ambient": "own"
      },
      "href": {
        "kind": "string"
      },
      "external": {
        "kind": "boolean"
      },
      "onclick": {
        "kind": "opaque",
        "typeText": "() => void"
      },
      "type": {
        "kind": "enum",
        "values": [
          "button",
          "submit"
        ],
        "default": "button"
      },
      "ariaLabel": {
        "kind": "string"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "slotStart": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "slotEnd": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-attach",
      "data-jx-chip"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
