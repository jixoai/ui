import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/dialog/dialog.svelte",
    "props": {
      "title": {
        "kind": "string"
      },
      "open": {
        "kind": "boolean"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "DialogSurfaceVariant",
        "ambient": "own"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "head": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "footer": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "scroll": {
        "kind": "boolean",
        "default": true
      },
      "cancelGuard": {
        "kind": "opaque",
        "typeText": "() => boolean"
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
      "data-jx-card-sep",
      "data-jx-dialog-shadow",
      "data-jx-dialog-surface",
      "data-jx-entity"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
