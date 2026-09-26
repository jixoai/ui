/**
 * jixoai toc family Defaults — FIRST-TIME contract
 * (registry/files/ui/toc/toc-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The reading-progress rail's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: the rail is placement chrome (authored in
 * the scaffold's chrome slot or standalone in-flow); the size axis
 * scales the rail root (the spine, the desktop nodes and the mobile
 * glass row reflow through inheritance) and the List/Item/Link parts
 * ride the root's ambient chain (§11 吃也供 — the parts stay
 * prop-free, the composition supplies).
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

export const TocDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
