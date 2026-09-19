import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/terminal-card/terminal-card.svelte",
    "props": {
      "barTitle": {
        "kind": "string"
      },
      "command": {
        "kind": "string"
      },
      "outputs": {
        "kind": "opaque",
        "typeText": "readonly string[]"
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
      "speed": {
        "kind": "number",
        "default": 1
      }
    },
    "hooks": [
      "data-jx-light-dot",
      "data-jx-light-green",
      "data-jx-light-yellow",
      "data-jx-terminal",
      "data-jx-terminal-body",
      "data-jx-terminal-command",
      "data-jx-terminal-outputs"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
