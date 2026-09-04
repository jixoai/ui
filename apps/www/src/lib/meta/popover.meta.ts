import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/popover/popover.svelte",
    "props": {
      "id": {
        "kind": "string"
      },
      "triggerLabel": {
        "kind": "string",
        "default": ""
      },
      "placement": {
        "kind": "enum",
        "values": [
          "bottom",
          "bottom-end",
          "bottom-start",
          "top",
          "top-end",
          "top-start",
          "left",
          "right",
          "center"
        ],
        "default": "bottom-end"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "PopoverSurfaceVariant",
        "ambient": "own"
      },
      "tryFallbacks": {
        "kind": "string",
        "default": ""
      },
      "gap": {
        "kind": "opaque",
        "typeText": "number | string"
      },
      "trigger": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "panelClass": {
        "kind": "string",
        "default": ""
      },
      "onToggle": {
        "kind": "opaque",
        "typeText": "(open: boolean) => void"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      }
    },
    "hooks": [
      "data-jx-pop-body",
      "data-jx-pop-scroll",
      "data-jx-pop-shadow",
      "data-jx-pop-trigger"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
