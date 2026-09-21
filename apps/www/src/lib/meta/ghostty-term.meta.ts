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
        "typeText": "DensityLane | QueryResult<DensityLane>",
        "ambient": "scope"
      },
      "size": {
        "kind": "opaque",
        "typeText": "SizeLane | QueryResult<SizeLane>",
        "ambient": "scope"
      },
      "shape": {
        "kind": "opaque",
        "typeText": "ShapeLane | QueryResult<ShapeLane>",
        "ambient": "scope"
      },
      "radius": {
        "kind": "opaque",
        "typeText": "RadiusLane | QueryResult<RadiusLane>",
        "ambient": "scope"
      },
      "color": {
        "kind": "opaque",
        "typeText": "ColorLane | QueryResult<ColorLane>",
        "ambient": "scope"
      },
      "elevation": {
        "kind": "opaque",
        "typeText": "ElevationLane | QueryResult<ElevationLane>",
        "ambient": "scope"
      },
      "motion": {
        "kind": "opaque",
        "typeText": "MotionLane | QueryResult<MotionLane>",
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
    ],
    "universal": [
      {
        "axis": "size",
        "label": "Size",
        "description": "the base scale — root font-size; parts size in em",
        "namedSteps": [
          "small",
          "medium",
          "large"
        ],
        "numberUnit": "px",
        "rawLane": false
      },
      {
        "axis": "shape",
        "label": "Shape",
        "description": "corner geometry (CSS corner-shape; §14 degrade table)",
        "namedSteps": [
          "round",
          "scoop",
          "bevel",
          "notch",
          "square",
          "squircle"
        ],
        "numberUnit": null,
        "rawLane": false
      },
      {
        "axis": "radius",
        "label": "Radius",
        "description": "corner size; auto = the concentric broadcast (§3)",
        "namedSteps": [
          "small",
          "medium",
          "large"
        ],
        "numberUnit": "px",
        "rawLane": false
      },
      {
        "axis": "density",
        "label": "Density",
        "description": "spacing/leading scale over the kernel channels (§4)",
        "namedSteps": [
          "small",
          "medium",
          "large"
        ],
        "numberUnit": "coefficient",
        "rawLane": false
      },
      {
        "axis": "color",
        "label": "Color",
        "description": "the hue axis of the fixed oklch primary system (§5)",
        "namedSteps": [
          "primary",
          "secondary",
          "error",
          "warn",
          "success",
          "info"
        ],
        "numberUnit": "hue",
        "rawLane": true
      },
      {
        "axis": "theme",
        "label": "Theme",
        "description": "light/dark profile; system = the JS-mutable global (§6)",
        "namedSteps": [
          "light",
          "dark",
          "system"
        ],
        "numberUnit": null,
        "rawLane": false
      },
      {
        "axis": "elevation",
        "label": "Elevation",
        "description": "official M3 levels over the surface ladder (§7)",
        "namedSteps": [
          "level-1",
          "level0",
          "level1",
          "level2",
          "level3",
          "level4",
          "level5"
        ],
        "numberUnit": "dp",
        "rawLane": false
      },
      {
        "axis": "motion",
        "label": "Motion",
        "description": "intensity across the motion kernels (§8)",
        "namedSteps": [
          "reduced",
          "subtle",
          "normal",
          "expressive"
        ],
        "numberUnit": "coefficient",
        "rawLane": false
      }
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
