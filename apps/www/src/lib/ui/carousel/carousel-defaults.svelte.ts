/**
 * jixoai carousel family Defaults — FIRST-TIME contract
 * (registry/files/ui/carousel/carousel-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The carousel's SINGLE declared ambient contract — all eight axes,
 * ALL NO-OWN: the scroller is NATIVE chrome (CSS scroll-snap does the
 * paging, the platform's momentum does the motion), so the family
 * carries no surface opinions of its own — the contract exists for
 * the supply chain (§11 吃也供): explicit ?? ambient ?? own, 'auto'
 * everywhere absent an opinion.
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

export const CarouselDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
