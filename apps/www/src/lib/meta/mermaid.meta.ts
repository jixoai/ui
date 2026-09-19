import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/mermaid/mermaid.svelte",
    "props": {
      "source": {
        "kind": "string"
      },
      "name": {
        "kind": "string"
      },
      "theme": {
        "kind": "opaque",
        "typeText": "MermaidThemeMode",
        "ambient": "own"
      },
      "backdrop": {
        "kind": "boolean",
        "default": true
      },
      "copyable": {
        "kind": "boolean",
        "default": true
      },
      "zoomable": {
        "kind": "boolean",
        "default": true
      },
      "labels": {
        "kind": "opaque",
        "typeText": "MermaidLabels"
      },
      "config": {
        "kind": "opaque",
        "typeText": "MermaidConfig"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-mermaid",
      "data-jx-mermaid-diagnostic",
      "data-jx-mermaid-error",
      "data-jx-mermaid-file",
      "data-jx-mermaid-floor",
      "data-jx-mermaid-foot",
      "data-jx-mermaid-head",
      "data-jx-mermaid-icon",
      "data-jx-mermaid-viewport",
      "data-jx-mermaid-zoom",
      "data-jx-mermaid-zoom-controls",
      "data-jx-mermaid-zoom-in",
      "data-jx-mermaid-zoom-out",
      "data-jx-mermaid-zoom-reset"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
