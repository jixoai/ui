import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/component-canvas/canvas-playground.svelte",
    "props": {
      "title": {
        "kind": "string"
      },
      "theme": {
        "kind": "enum",
        "values": [
          "light",
          "dark"
        ]
      },
      "density": {
        "kind": "opaque",
        "typeText": "Density",
        "ambient": "scope"
      },
      "playground": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "rows": {
        "kind": "opaque",
        "typeText": "ControlRow[]"
      },
      "schemaDefaults": {
        "kind": "opaque",
        "typeText": "Record<string, unknown>"
      },
      "values": {
        "kind": "opaque",
        "typeText": "Record<string, unknown>"
      },
      "onvalue": {
        "kind": "opaque",
        "typeText": "(key: string, value: unknown) => void"
      },
      "onreset": {
        "kind": "opaque",
        "typeText": "() => void"
      },
      "output": {
        "kind": "opaque",
        "typeText": "readonly PlayOutput[]"
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-canvas-control",
      "data-jx-canvas-density-select",
      "data-jx-canvas-dock",
      "data-jx-canvas-dock-clip",
      "data-jx-canvas-dock-foot",
      "data-jx-canvas-dock-grip",
      "data-jx-canvas-dock-group",
      "data-jx-canvas-dock-head",
      "data-jx-canvas-dock-scroll",
      "data-jx-canvas-dock-toggle",
      "data-jx-canvas-output-row",
      "data-jx-canvas-reset",
      "data-jx-canvas-row",
      "data-jx-canvas-seg",
      "data-jx-canvas-select",
      "data-jx-canvas-slider",
      "data-jx-canvas-stepper",
      "data-jx-canvas-text",
      "data-jx-canvas-theme-toggle",
      "data-jx-canvas-toggle"
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
