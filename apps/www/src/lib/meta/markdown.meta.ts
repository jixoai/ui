import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/markdown/markdown.svelte",
    "props": {
      "source": {
        "kind": "string"
      },
      "streaming": {
        "kind": "boolean",
        "default": false
      },
      "components": {
        "kind": "opaque",
        "typeText": "MarkdownComponents"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "style": {
        "kind": "opaque",
        "typeText": "unknown"
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
      "data-jx-markdown",
      "data-jx-markdown-cursor",
      "data-jx-markdown-streaming"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
