/**
 * jixoai scroll-virtual family Defaults — FIRST-TIME contract
 * (registry/files/ui/scroll-virtual/scroll-virtual-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The virtualized list's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN, the ENGINE-WRAPPER dialect (the mermaid/
 * scroll-area posture): scroll-virtual owns no DOM root of its own —
 * it renders the composed ScrollArea, so the axis surface rides the
 * COMPOSED REGION (the resolved lanes forward verbatim; ScrollArea
 * stamps the carriers, supplies downward and anchors query() at ITS
 * root). This contract is the family's read point (the A3 law) and
 * unwraps query() media lanes at the boundary; the spacer and the
 * absolutely-positioned rows are TanStack engine internals,
 * documented outside the supply set.
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

export const ScrollVirtualDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
