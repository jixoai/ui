/**
 * jixoai markdown family Defaults — FIRST-TIME contract
 * (registry/files/ui/markdown/markdown-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The markdown root's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: the typography presets (compact/standard/
 * relaxed) own the prose scale through their OWN tokens (deliberately
 * not the UI-density ladder — the family's founding law), and the
 * legacy density bridge below keeps feeding the CONTEXT-consuming
 * nested chrome (tables etc.) from the preset. The universal axes are
 * additive on top: an explicit density lane stamps the §4 carriers
 * for the universal channel without touching the preset's own
 * typography mapping.
 *
 * 惰性律: construction captures own only (here: nothing); context
 * reads happen at resolve time inside the consumer's $derived window.
 * This file is a member of the registry:ui item (installs with the
 * family, byte mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

export const MarkdownDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
