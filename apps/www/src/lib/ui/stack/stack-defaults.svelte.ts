/**
 * jixoai stack family Defaults — FIRST-TIME contract
 * (registry/files/ui/stack/stack-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The flow primitive's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN. The founding "never-ambient, no Defaults
 * contract" classification predates the eight-axis surface and named
 * only the STRUCTURAL props (direction/gap/align/justify stay
 * structural verbatim, outside this contract); the paint axes are
 * the prototype-flex posture (W3-D2's layout-primitive precedent):
 * the size axis scales the stack root (children reflow through
 * inheritance) and every axis forwards through the ambient chain
 * (§11 吃也供: explicit ?? ambient ?? own, 'auto' everywhere absent
 * an opinion — a row is a row because its consumer says so; what the
 * consumer now says can also be a size or a theme).
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

export const StackDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
