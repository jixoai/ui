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
        "default": "auto"
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
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
