import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/toast/toast-viewport.svelte",
    "props": {
      "store": {
        "kind": "opaque",
        "typeText": "ToastStore"
      },
      "maxVisible": {
        "kind": "number",
        "default": 4
      },
      "pos": {
        "kind": "opaque",
        "typeText": "FloatPos"
      },
      "expand": {
        "kind": "boolean",
        "default": false
      },
      "gap": {
        "kind": "number",
        "default": 8
      },
      "swipeDirections": {
        "kind": "opaque",
        "typeText": "readonly SwipeDirection[]"
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-toast",
      "data-jx-toast-body",
      "data-jx-toast-desc",
      "data-jx-toast-dismiss",
      "data-jx-toast-leading",
      "data-jx-toast-queued",
      "data-jx-toast-title",
      "data-jx-toast-trailing",
      "data-jx-toasts"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
