/**
 * jixoai progressive-blur family Defaults — FIRST-TIME contract
 * (registry/files/ui/progressive-blur/progressive-blur-defaults.svelte.ts,
 * explicit-props W3 batch C / task 3.3, 2026-09-21).
 *
 * The band's SINGLE declared ambient contract — all eight axes, ALL
 * NO-OWN: the progressive-blur band is a FLAT subtractive veil by
 * design (the 减色墨律's own child — backdrop-filter ladder, zero
 * ink of its own), so it carries NO surface opinions: no elevation
 * rung, no density scope, nothing to stamp absent an explicit lane.
 * The contract exists for the supply chain (§11 吃也供): the band's
 * root resolves `explicit ?? ambient ?? own` — 'auto' everywhere
 * absent an opinion — stamps the carriers, and supplies downward, so
 * the axis tree stays continuous through a band.
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

export const ProgressiveBlurDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
