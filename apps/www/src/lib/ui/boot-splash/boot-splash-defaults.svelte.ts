/**
 * jixoai boot-splash family Defaults — FIRST-TIME contract
 * (registry/files/ui/boot-splash/boot-splash-defaults.svelte.ts,
 * explicit-props W3 batch D5 / task 3.4, 2026-09-21).
 *
 * The FOUC cover layer's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN. The zero-css-file law is untouched by this
 * surface: the §10 carriers are INLINE STYLE declarations (the
 * component's own element-styles idiom) and the density rung rides
 * the data-density attribute — no css file, no atoms, no tokens join
 * the tree. The theme axis stamps the .dark class on the layer (§6's
 * carrier — the head block's own .dark bridge vocabulary reacts to
 * ancestors; a self-stamp declares the subtree's opinion and the
 * hardcoded grounds keep their precedence). The layer exists to be
 * REPLACED by the page: an explicit lane (say a size number scaling
 * the boot copy) rides the same inline channel the exit duration
 * already uses — the merge law joins them.
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

export const BootSplashDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
