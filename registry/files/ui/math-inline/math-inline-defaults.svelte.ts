/**
 * jixoai math-inline family Defaults — FIRST-TIME contract
 * (registry/files/ui/math-inline/math-inline-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The inline math surface's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: the span inherits prose currentColor and
 * paints nothing itself (no chrome, no controls — the engine's em
 * scale is outside the supply set). The contract exists for the
 * supply chain (§11 吃也供): explicit ?? ambient ?? own, 'auto'
 * everywhere absent an opinion.
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

export const MathInlineDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
