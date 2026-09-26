/**
 * jixoai scroll-run family Defaults — FIRST-TIME contract
 * (registry/files/ui/scroll-run/scroll-run-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The ONE scrollable-region contract's SINGLE declared ambient
 * surface — all eight axes, ALL NO-OWN, the NO-ROOT (fragment)
 * dialect (the pattern-hero-set precedent, W3-D2): ScrollChrome
 * renders a FRAGMENT (the optional veil layer + the two chevron
 * chips — every root conditional, NOTHING guaranteed), so the family
 * supplies the resolved lanes through CONTEXT only — the veil's
 * composed ProgressiveBlur children stamp their own roots through
 * the ambient chain. No carriers and no query() anchor here (a
 * fragment has no single element to bind; the run and its one-cell
 * host are consumer-authored per the raw contract — an @ query()
 * addresses the consumer's own containers). The stamp machine, the
 * RTL engine and the law sheet are engine internals documented
 * outside the supply set.
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

export const ScrollRunDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
