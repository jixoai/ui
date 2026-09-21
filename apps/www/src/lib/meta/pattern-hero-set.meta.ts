import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/pattern-hero-set/pattern-hero-set.svelte",
    "props": {
      "eyebrow": {
        "kind": "string"
      },
      "summary": {
        "kind": "string"
      },
      "copyCommand": {
        "kind": "string"
      },
      "copyLabel": {
        "kind": "string",
        "default": "copy"
      },
      "title": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "badges": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "secondary": {
        "kind": "snippet",
        "typeText": "Snippet"
      },
      "barTitle": {
        "kind": "string",
        "default": "quick-start — zsh"
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
        "default": "dark",
        "ambient": "scope"
      },
      "speed": {
        "kind": "number",
        "default": 1
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
      }
    },
    "hooks": [],
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
