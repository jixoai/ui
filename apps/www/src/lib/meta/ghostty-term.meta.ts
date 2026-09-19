import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/ghostty-term/ghostty-term.svelte",
    "props": {
      "cols": {
        "kind": "number"
      },
      "rows": {
        "kind": "number"
      },
      "auto": {
        "kind": "boolean",
        "default": true
      },
      "fontSize": {
        "kind": "number"
      },
      "wasmUrl": {
        "kind": "string"
      },
      "theme": {
        "kind": "opaque",
        "typeText": "GhosttyTermTheme",
        "ambient": "own"
      },
      "onData": {
        "kind": "opaque",
        "typeText": "(bytes: Uint8Array) => void"
      },
      "fontFamily": {
        "kind": "string"
      },
      "onKeyDown": {
        "kind": "opaque",
        "typeText": "(event: KeyboardEvent) => boolean | void"
      },
      "clipboard": {
        "kind": "opaque",
        "typeText": "boolean | { copy?: boolean; paste?: boolean }"
      },
      "clipboardWrite": {
        "kind": "opaque",
        "typeText": "boolean | { maxSize?: number }"
      },
      "clipboardReadFrom": {
        "kind": "boolean",
        "default": false
      },
      "onTitleChange": {
        "kind": "opaque",
        "typeText": "(title: string) => void"
      },
      "cursor": {
        "kind": "opaque",
        "typeText": "boolean | { blink?: boolean; style?: 'bar' | 'block' | 'underline' }"
      },
      "selection": {
        "kind": "boolean",
        "default": true
      },
      "mouse": {
        "kind": "boolean",
        "default": true
      },
      "onResize": {
        "kind": "opaque",
        "typeText": "(detail: GhosttyTermResizeDetail) => void"
      },
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-ghostty-term"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
