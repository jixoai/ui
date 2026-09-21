/**
 * jixoai math-block family Defaults — FIRST-TIME contract
 * (registry/files/ui/math-block/math-block-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The display math surface's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN: the KaTeX engine's internals (the em-based
 * formula scale, the fit-mode font-size compensation) are OUTSIDE the
 * supply set — the axis surface rides the family's OWN <figure> root
 * only (the §1 size lane scales the shell's chrome — the footer bar's
 * copy control and labels — while the formula keeps its engine-owned
 * em scale). The contract exists for the supply chain (§11 吃也供):
 * explicit ?? ambient ?? own, 'auto' everywhere absent an opinion.
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

export const MathBlockDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
