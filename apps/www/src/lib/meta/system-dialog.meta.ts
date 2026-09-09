import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/system-dialog/system-dialog.svelte",
    "props": {
      "open": {
        "kind": "boolean"
      },
      "onconfirm": {
        "kind": "opaque",
        "typeText": "() => void"
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      }
    },
    "hooks": []
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
