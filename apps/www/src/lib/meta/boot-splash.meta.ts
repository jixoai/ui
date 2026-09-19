import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/boot-splash/boot-splash.svelte",
    "props": {
      "logo": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "loading": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "title": {
        "kind": "string"
      },
      "subtitle": {
        "kind": "string"
      },
      "description": {
        "kind": "string"
      },
      "exit": {
        "kind": "enum",
        "values": [
          "opacity-out",
          "blur-out",
          "none"
        ],
        "default": "opacity-out"
      },
      "revealOn": {
        "kind": "enum",
        "values": [
          "fonts",
          "load",
          "manual"
        ],
        "default": "fonts"
      },
      "timeoutMs": {
        "kind": "number",
        "default": 4000
      },
      "minMs": {
        "kind": "number",
        "default": 350
      },
      "durationMs": {
        "kind": "number",
        "default": 350
      },
      "open": {
        "kind": "boolean"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-boot-splash",
      "data-jx-boot-splash-noscript",
      "data-jx-splash"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
