import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/combobox/combobox.svelte",
    "props": {
      "options": {
        "kind": "opaque",
        "typeText": "ComboboxOption[]"
      },
      "value": {
        "kind": "opaque",
        "typeText": "Multiple extends true ? string[] : string"
      },
      "multiple": {
        "kind": "opaque",
        "typeText": "Multiple"
      },
      "placeholder": {
        "kind": "string",
        "default": "Search or type..."
      },
      "label": {
        "kind": "string"
      },
      "name": {
        "kind": "string"
      },
      "error": {
        "kind": "string"
      },
      "id": {
        "kind": "string"
      },
      "allowCustom": {
        "kind": "boolean",
        "default": true
      },
      "showClear": {
        "kind": "boolean",
        "default": false
      },
      "disabled": {
        "kind": "boolean",
        "default": false
      },
      "variant": {
        "kind": "enum",
        "values": [
          "solid",
          "acrylic",
          "auto"
        ],
        "default": "auto",
        "ambient": "own"
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
    "hooks": [
      "data-jx-combobox-active",
      "data-jx-combobox-chip",
      "data-jx-combobox-chip-label",
      "data-jx-combobox-disabled",
      "data-jx-combobox-empty",
      "data-jx-combobox-input",
      "data-jx-combobox-invalid",
      "data-jx-combobox-list",
      "data-jx-combobox-option-desc",
      "data-jx-combobox-option-label",
      "data-jx-combobox-panel-body",
      "data-jx-combobox-panel-shadow",
      "data-jx-combobox-scroll",
      "data-jx-combobox-selected",
      "data-jx-combobox-use",
      "data-jx-combobox-wrap"
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
