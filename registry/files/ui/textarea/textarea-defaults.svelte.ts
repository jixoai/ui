/**
 * jixoai textarea family Defaults
 * (registry/files/ui/textarea/textarea-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The textarea family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TextareaDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The native field carries NO
 *     density own: no provider and no explicit prop resolve undefined,
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
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

export const TextareaDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
