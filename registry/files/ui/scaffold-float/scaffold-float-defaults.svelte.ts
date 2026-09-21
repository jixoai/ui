/**
 * jixoai scaffold-float family Defaults — FIRST-TIME contract
 * (registry/files/ui/scaffold-float/scaffold-float-defaults.svelte.ts,
 * explicit-props W3 batch C / task 3.3, 2026-09-21).
 *
 * The portal wrapper's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: the float wrapper is PLACEMENT CHROME, never a
 * surface (it paints nothing, floats nothing of its own — the
 * website-scaffold's float plane and the adopted content own the
 * visuals). The contract exists for the PORTAL LAW (batch C's gate):
 * CSS custom-property inheritance does NOT cross the adoption
 * boundary, so the wrapper resolves `explicit ?? ambient ?? own`
 * here — 'auto' everywhere absent an opinion — and re-stamps the
 * carriers on the portal root, making the tree's axis opinions
 * SELF-CARRIED into the top layer.
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

export const ScaffoldFloatDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
