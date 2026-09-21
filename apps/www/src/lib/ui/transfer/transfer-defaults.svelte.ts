/**
 * jixoai transfer family Defaults — FIRST-TIME contract
 * (registry/files/ui/transfer/transfer-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The dual-list mover's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: the composite is a no-own container surface (the
 * two lists, the search inputs and the mover chips are the family's
 * own parts — they ride the root's ambient chain, §11 吃也供); the
 * size axis scales the transfer root (one number moves both panes).
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

export const TransferDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
