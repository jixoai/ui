/**
 * jixoai heading family Defaults
 * (registry/files/ui/heading/heading-defaults.svelte.ts,
 * explicit-props W3 batch B / task 3.2, 2026-09-21).
 *
 * The heading family's SINGLE declared ambient contract — born WITH
 * the eight-axis surface (design §0/§11; before W3-B heading shipped
 * no style props, so no Defaults existed). `level` stays a plain
 * structural prop (design §13: keep — no collision with any axis);
 * every slot here is no-own ('auto' everywhere):
 *   - density: the universal §4 axis slot, no own — 'auto' resolves
 *     unstamped, the ambient css scope channel keeps flowing (fleet
 *     law).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     other universal axes, all no-own — the em ladder scales with
 *     the ambient font-size, the size axis IS that ambient's lever.
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

export const HeadingDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
