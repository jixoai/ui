/**
 * jixoai prototype-flex family Defaults — FIRST-TIME contract
 * (registry/files/ui/prototype-flex/prototype-flex-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The flex layout primitive's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: the alpha lane's zero-translation law keeps
 * direction/wrap/align/justify native and unopinionated, and the
 * paint axes are exactly the same posture — the size axis scales the
 * flex root (children reflow in em-inheriting units) and the rest
 * forward through the ambient chain (§11 吃也供: explicit ?? ambient
 * ?? own, 'auto' everywhere absent an opinion).
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

export const PrototypeFlexDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
