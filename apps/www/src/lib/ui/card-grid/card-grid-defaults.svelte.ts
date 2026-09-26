/**
 * jixoai card-grid family Defaults
 * (registry/files/ui/card-grid/card-grid-defaults.svelte.ts,
 * explicit-props W3 batch B / task 3.2, 2026-09-21).
 *
 * The card-grid family's SINGLE declared ambient contract — the grid
 * landlord joins the eight-axis surface (design §0/§11), every slot
 * no-own ('auto' everywhere: the grid is a LAYOUT container — it
 * forwards its ancestors' opinions to the tenant cards and stamps
 * nothing itself):
 *   - density: the universal §4 axis slot, no own — 'auto' resolves
 *     unstamped, the ambient css scope channel keeps flowing (fleet
 *     law).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     other universal axes, all no-own — supply-forwarding only (the
 *     §11 broadcast; the paint belongs to the tenants).
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

export const CardGridDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
