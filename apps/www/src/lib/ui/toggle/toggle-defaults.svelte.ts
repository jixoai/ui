/**
 * jixoai toggle family Defaults
 * (registry/files/ui/toggle/toggle-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03;
 * explicit-props W3 batch B, 2026-09-21).
 *
 * The toggle family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `ToggleDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The native
 *     switch carries NO density own: no provider and no explicit
 *     prop resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law). NOTE (§4's frozen exception
 *     list): the toggle's kernel formulas (--jx-toggle-track/width/
 *     knob) are EFFECTIVE-OPERAND compositions — they stay EXACTLY
 *     as-is; only the axis surface changed.
 *   - the seven other universal axes (§0/§11, W3-B, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the eight-axis surface (size/color are CONSUMED by the family:
 *     the native <input> never receives them, §1).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
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

export const ToggleDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});

