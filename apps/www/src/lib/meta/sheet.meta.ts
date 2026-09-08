import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/sheet/sheet.svelte",
    "props": {
      "open": {
        "kind": "boolean"
      },
      "side": {
        "kind": "enum",
        "values": [
          "left",
          "right",
          "top",
          "bottom"
        ],
        "default": "right"
      },
      "title": {
        "kind": "string"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "header": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "footer": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "size": {
        "kind": "string",
        "ambient": "own"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "SheetSurfaceVariant",
        "ambient": "own"
      }
    },
    "hooks": [
      "data-jx-card",
      "data-jx-card-foot",
      "data-jx-card-head",
      "data-jx-card-sep",
      "data-jx-sheet-head-extra",
      "data-jx-sheet-surface",
      "data-jx-sheet-title"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
