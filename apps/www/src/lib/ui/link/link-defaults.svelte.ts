/**
 * jixoai link family Defaults
 * (registry/files/ui/link/link-defaults.svelte.ts,
 * explicit-props W3 batch B / task 3.2, 2026-09-21).
 *
 * The link family's SINGLE declared ambient contract — born WITH the
 * eight-axis surface (design §0/§11; before W3-B the family declared
 * no style props, so no Defaults existed — the heading/list
 * precedent). Every slot no-own ('auto' everywhere: a prose link
 * flows with its context):
 *   - density: the universal §4 axis slot, no own — 'auto' resolves
 *     unstamped, the ambient css scope channel keeps flowing (fleet
 *     law).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     other universal axes, all no-own — supply-forwarding + carriers
 *     on the anchor root.
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

export const LinkDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
