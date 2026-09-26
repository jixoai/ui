/**
 * jixoai card family Defaults
 * (registry/files/ui/card/card-defaults.svelte.ts,
 * explicit-props W3 batch B / task 3.2, 2026-09-21).
 *
 * The card family's SINGLE declared ambient contract — the structural
 * surface joins the eight-axis surface (design §0/§11), every slot
 * no-own ('auto' everywhere: a card is a CONTAINER, the §3 concentric
 * anchor — it takes radius/shape/density opinions from ITS ancestors
 * and supplies them, resolved, downward):
 *   - density: the universal §4 axis slot, no own — 'auto' resolves
 *     unstamped, the ambient css scope channel keeps flowing (fleet
 *     law).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     other universal axes, all no-own. radius is §3's anchor: an
 *     explicit lane SUPPLIES --jx-radius-effective (the carrier stamp)
 *     while card.css supplies --jx-inset-effective (the ruler's inline
 *     inset track) — descendants resolving auto compute the concentric
 *     max(0px, R − P).
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

export const CardDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
