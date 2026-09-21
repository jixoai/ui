/**
 * jixoai badge-indicator family Defaults
 * (registry/files/ui/badge-indicator/badge-indicator-defaults.svelte.ts,
 * explicit-props W3 batch B / task 3.2, 2026-09-21).
 *
 * The badge-indicator family's SINGLE declared ambient contract — the
 * overlay indicator joins the eight-axis surface (design §0/§11) with
 * every slot no-own ('auto' is the axis default everywhere: an
 * indicator takes its scale from the element it rides on, never an
 * opinion of its own):
 *   - density: the universal §4 axis slot, no own — 'auto' resolves
 *     unstamped, the ambient css scope channel keeps flowing (fleet
 *     law; the dot/count geometry rides the fixed micro scale).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     other universal axes, all no-own — carriers + broadcast only.
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

export const BadgeIndicatorDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
