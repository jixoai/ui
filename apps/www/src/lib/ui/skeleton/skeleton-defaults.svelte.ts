/**
 * jixoai skeleton family Defaults
 * (registry/files/ui/skeleton/skeleton-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The skeleton family's SINGLE declared ambient contract — a ZERO
 * vocabulary-hit family (pure CSS, zero JS; the component exposes no
 * props beyond class — geometry is the consumer's). The contract
 * declares the family density-manageable (the task's zero-hit
 * ruling: a density declaration slot, not an exemption):
 *
 *   density  class a, the open axis with NO family own — no opinion:
 *            the placeholder block never stamped data-density and
 *            does not start now; the slot declares the channel OPEN
 *            without manufacturing an opinion (fleet law — the
 *            ambient css scope channel keeps flowing).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     seven sibling axis members (explicit-props W3-D5, FIRST-TIME on
 *     this contract — the component's surface wires in with them): the
 *     placeholder is a no-own scenery block; every axis forwards
 *     through the ambient chain, an explicit lane stamps the §10
 *     carriers on the block root (吃也供). Geometry stays the
 *     consumer's — the axis surface never manufactures width/height.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
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

export const SkeletonDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
