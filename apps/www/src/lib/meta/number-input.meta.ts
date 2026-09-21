import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/number-input/number-input.svelte",
    "props": {
      "value": {
        "kind": "number"
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
      "theme": {
        "kind": "opaque",
        "typeText": "ThemeLane | QueryResult<ThemeLane>",
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
      "min": {
        "kind": "number"
      },
      "max": {
        "kind": "number"
      },
      "step": {
        "kind": "number",
        "default": 1
      },
      "label": {
        "kind": "string"
      },
      "id": {
        "kind": "string"
      },
      "error": {
        "kind": "string"
      },
      "aria-invalid": {
        "kind": "opaque",
        "typeText": "'true' | 'false' | undefined"
      },
      "aria-describedby": {
        "kind": "opaque",
        "typeText": "string | undefined"
      },
      "'data-density'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "'aria-invalid'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "'aria-describedby'": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "disabled": {
        "kind": "boolean",
        "default": false
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "chrome": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "rest": {
        "kind": "opaque",
        "typeText": "unknown (spread passthrough)"
      }
    },
    "hooks": [
      "data-jx-num-invalid",
      "data-jx-num-minus",
      "data-jx-num-plus"
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
