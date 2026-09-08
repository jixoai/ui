import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/code-card/code-card.svelte",
    "props": {
      "code": {
        "kind": "string"
      },
      "lang": {
        "kind": "string",
        "default": "ts"
      },
      "langDetector": {
        "kind": "opaque",
        "typeText": "LanguageDetector"
      },
      "theme": {
        "kind": "string",
        "default": "jixoai"
      },
      "backend": {
        "kind": "opaque",
        "typeText": "HighlightBackend"
      },
      "filename": {
        "kind": "string",
        "default": ""
      },
      "header": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "footer": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "copyable": {
        "kind": "boolean",
        "default": true
      },
      "maxHeight": {
        "kind": "string",
        "default": ""
      },
      "fill": {
        "kind": "boolean",
        "default": false
      },
      "minHeight": {
        "kind": "string",
        "default": ""
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-code-card-file",
      "data-jx-code-card-foot",
      "data-jx-code-card-head",
      "data-jx-code-card-icon",
      "data-jx-code-card-lang",
      "data-jx-code-card-pre",
      "data-jx-code-card-scroll",
      "data-jx-code-card-side"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
