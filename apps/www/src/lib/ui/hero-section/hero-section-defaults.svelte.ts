/**
 * jixoai hero-section family Defaults — FIRST-TIME contract
 * (registry/files/ui/hero-section/hero-section-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The Broadside hero's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: the hero's typography is its OWN law (the cm
 * measure + the entrance cascade — brand statement scale, never the
 * UI size ladder), so the family carries no axis opinions — the
 * contract exists for the supply chain (§11 吃也供): explicit ??
 * ambient ?? own, 'auto' everywhere absent an opinion. An explicit
 * lane (e.g. size on the section, density for the composed CTAs)
 * still stamps and supplies.
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

export const HeroSectionDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
