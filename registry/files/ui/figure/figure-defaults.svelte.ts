/**
 * jixoai figure family Defaults — FIRST-TIME contract
 * (registry/files/ui/figure/figure-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The float primitive's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: a <figure> is document content (the numbering
 * machinery is structural context, never paint), so the family
 * carries no surface opinions — the contract exists for the supply
 * chain (§11 吃也供): explicit ?? ambient ?? own, 'auto' everywhere
 * absent an opinion.
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

export const FigureDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
