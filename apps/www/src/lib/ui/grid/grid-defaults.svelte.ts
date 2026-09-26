/**
 * jixoai grid family Defaults — FIRST-TIME contract
 * (registry/files/ui/grid/grid-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The layout GRID primitive's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: cols/rows/gap stay STRUCTURAL props (the
 * stack twin's classification, unchanged); the universal axes are the
 * paint/kinetic surface a layout container can still carry opinions
 * on — and this family simply has none of its own. The contract
 * exists for the supply chain (§11 吃也供): explicit ?? ambient ??
 * own, 'auto' everywhere absent an opinion.
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

export const GridDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
