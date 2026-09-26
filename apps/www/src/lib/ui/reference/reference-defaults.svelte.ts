/**
 * jixoai reference family Defaults — FIRST-TIME contract
 * (registry/files/ui/reference/reference-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The citation primitive's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: the reference is an inline anchor (a
 * native fragment link, or the loud degrade span), never a paint
 * surface — the size axis scales the anchor root (inline font-size
 * inheritance) and the rest forward through the ambient chain
 * (§11 吃也供: explicit ?? ambient ?? own, 'auto' everywhere absent
 * an opinion). The document-ontology machinery (the registry, the
 * settle criterion) is structural context, orthogonal to the axes.
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

export const ReferenceDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
