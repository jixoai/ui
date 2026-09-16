import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/timeline/timeline.svelte",
    "props": {
      "axis": {
        "kind": "enum",
        "values": [
          "vertical",
          "horizontal"
        ],
        "default": "vertical"
      },
      "direction": {
        "kind": "enum",
        "values": [
          "ltr",
          "revert",
          "interlaced"
        ],
        "default": "ltr"
      },
      "animation": {
        "kind": "enum",
        "values": [
          "none",
          "view",
          "scroll"
        ],
        "default": "none"
      },
      "spine": {
        "kind": "opaque",
        "typeText": "TimelineSpinePreset | Snippet<[TimelineSpineGeometry]>"
      },
      "defaultValue": {
        "kind": "number",
        "default": 1
      },
      "value": {
        "kind": "number"
      },
      "onValueChange": {
        "kind": "opaque",
        "typeText": "(v: number) => void"
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
      "data-jx-spine",
      "data-jx-timeline",
      "data-jx-tl-base",
      "data-jx-tl-beam",
      "data-jx-tl-dashed",
      "data-jx-tl-host",
      "data-jx-tl-list",
      "data-jx-tl-progress",
      "data-jx-tl-seg",
      "data-jx-tl-spine"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
