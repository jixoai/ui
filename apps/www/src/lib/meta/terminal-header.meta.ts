import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/terminal-header/terminal-header.svelte",
    "props": {
      "brand": {
        "kind": "string"
      },
      "domain": {
        "kind": "string"
      },
      "subtitle": {
        "kind": "string"
      },
      "homeHref": {
        "kind": "string",
        "default": "/"
      },
      "theme": {
        "kind": "enum",
        "values": [
          "dark",
          "light",
          "system"
        ],
        "ambient": "own"
      },
      "logo": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "switcher": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "switcherFrame": {
        "kind": "boolean",
        "default": true
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "drawer": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "open": {
        "kind": "boolean"
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
      "data-jx-chrome",
      "data-jx-mobile-scroll"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
