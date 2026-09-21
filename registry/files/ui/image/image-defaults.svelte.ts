/**
 * jixoai image family Defaults — FIRST-TIME contract
 * (registry/files/ui/image/image-defaults.svelte.ts,
 * explicit-props W3 batch D5 / task 3.4, 2026-09-21).
 *
 * The general-purpose picture's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN, the native-collision batch A rule: the
 * root is a native <img> and the family owns ONLY the axis names it
 * destructures — everything else keeps forwarding through the rest
 * spread (width/height stay the no-CLS contract's own; the axis
 * surface never touches them). The carriers stamp the <img> root and
 * JOIN the failure panel's dimension literals (the merge law): the
 * surface survives a broken source — an explicit size lane keeps
 * scaling whatever the failure state renders.
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

export const ImageDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
