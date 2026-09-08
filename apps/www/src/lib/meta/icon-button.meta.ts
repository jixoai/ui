import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/icon-button/icon-button.svelte",
    "props": {
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "icon": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "text": {
        "kind": "string"
      },
      "variant": {
        "kind": "opaque",
        "typeText": "PressButtonVariant",
        "ambient": "zone"
      },
      "raised": {
        "kind": "boolean"
      },
      "iconOnly": {
        "kind": "boolean",
        "default": false
      },
      "placement": {
        "kind": "enum",
        "values": [
          "top",
          "bottom",
          "top-start",
          "bottom-start",
          "top-end",
          "bottom-end"
        ]
      },
      "tip": {
        "kind": "boolean",
        "default": true
      },
      "arrow": {
        "kind": "boolean",
        "default": true
      },
      "effect": {
        "kind": "opaque",
        "typeText": "PressEffect"
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
      "popovertarget": {
        "kind": "string"
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
    "hooks": []
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
