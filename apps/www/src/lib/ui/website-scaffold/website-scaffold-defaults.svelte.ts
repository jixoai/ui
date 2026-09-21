/**
 * jixoai website-scaffold family Defaults — FIRST-TIME contract
 * (registry/files/ui/website-scaffold/website-scaffold-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The site chrome's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN, a NO-OWN CONTAINER surface: the scaffold's
 * zones/regions (header band, chrome slot, page main, float plane)
 * stay structural; the size axis scales the HOST root (the whole
 * scaffold reads at one number — the site-level type-scale seam), and
 * every axis supplies downward through the ambient chain (§11 吃也供
 * — header, toc rail and page content are the consumers).
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

export const WebsiteScaffoldDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
