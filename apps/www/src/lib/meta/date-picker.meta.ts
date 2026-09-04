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
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
