import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';

// ===== GENERATED — do not edit (component-metadata-gen) =====
export const meta = defineComponentMeta(
  {
    "source": "registry/files/ui/press-button/press-button.svelte",
    "props": {
      "density": {
        "kind": "opaque",
        "typeText": "Density"
      },
      "variant": {
        "kind": "enum",
        "values": [
          "fill",
          "tonal",
          "outline",
          "ghost",
          "link"
        ]
      },
      "effect": {
        "kind": "opaque",
        "typeText": "PressEffect"
      },
      "href": {
        "kind": "string"
      },
      "external": {
        "kind": "boolean"
      },
      "loading": {
        "kind": "boolean",
        "default": false
      },
      "onclick": {
        "kind": "opaque",
        "typeText": "() => void"
      },
      "type": {
        "kind": "enum",
        "values": [
          "button",
          "submit"
        ],
        "default": "button"
      },
      "popovertarget": {
        "kind": "string"
      },
      "ariaLabel": {
        "kind": "string"
      },
      "square": {
        "kind": "boolean",
        "default": false
      },
      "raised": {
        "kind": "boolean",
        "default": true
      },
      "class": {
        "kind": "string",
        "default": ""
      },
      "children": {
        "kind": "snippet",
        "typeText": "Snippet"
      }
    },
    "hooks": [
      "data-jx-press-button",
      "data-jx-press-check",
      "data-jx-press-spin",
      "data-jx-press-state",
      "data-jx-pulse-host",
      "data-jx-ripple-host",
      "data-jx-shimmer-host"
    ]
  }
);
// ===== end GENERATED — annotations below survive regeneration =====

// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
// Rows the pilot playground shows: variant / effect / loading; the props
// that would only add noise to the pane opt out with control: "none"
// (snippet/opaque kinds are excluded by the lowering already).
export const annotations = defineAnnotations({
  variant: {
    'x-ui': {
      control: 'segmented',
      label: 'variant',
      description: 'Prominence ladder rung — one physics for every rung; semantic hue injects through classes at the call site, never the variant.',
    },
  },
  effect: {
    'x-ui': {
      control: 'segmented',
      label: 'effect',
      description: 'One opt-in attention loop — the enum speaks NAMES; the page maps them to typed builders via the onvalue seam.',
    },
  },
  loading: {
    'x-ui': {
      control: 'toggle',
      label: 'loading',
      description: 'The async pose: aria-disabled, pointer AND keyboard activation suppressed, spinner in the leading lane.',
    },
  },
  type: { 'x-ui': { control: 'none' } },
  square: { 'x-ui': { control: 'none' } },
  href: { 'x-ui': { control: 'none' } },
  external: { 'x-ui': { control: 'none' } },
  ariaLabel: { 'x-ui': { control: 'none' } },
  class: { 'x-ui': { control: 'none' } },
});
