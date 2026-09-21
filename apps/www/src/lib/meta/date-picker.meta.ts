import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/date-picker/date-picker.svelte",
    "props": {
      "value": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "range": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "mode": {
        "kind": "string",
        "default": "single"
      },
      "showTime": {
        "kind": "boolean",
        "default": false
      },
      "label": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "error": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "placeholder": {
        "kind": "string",
        "default": "Select date..."
      },
      "min": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "max": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "format": {
        "kind": "string",
        "default": "iso"
      },
      "locale": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "presets": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "preset": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "isDisabled": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "id": {
        "kind": "opaque",
        "typeText": "unknown"
      },
      "variant": {
        "kind": "string",
        "default": "auto",
        "ambient": "own"
      },
      "class": {
        "kind": "string",
        "default": ""
      }
    },
    "hooks": [
      "data-jx-date-error-mark",
      "data-jx-date-field",
      "data-jx-date-placeholder",
      "data-jx-date-preset",
      "data-jx-date-presets",
      "data-jx-date-shadow",
      "data-jx-date-surface",
      "data-jx-date-timerow",
      "data-jx-date-value",
      "data-jx-date-wrap"
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
