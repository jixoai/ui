/**
 * jixoai highlight-detect-default family Defaults — FIRST-TIME
 * contract (registry/files/ui/highlight-detect-default/
 * highlight-detect-default-defaults.svelte.ts, explicit-props W3
 * batch D5 / task 3.4, 2026-09-21).
 *
 * The DLD context provider's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN, the NO-ROOT (fragment) dialect (the
 * scroll-chrome / pattern-hero-set precedent, W3-D2/D3): the wrapper
 * renders {@render children()} with NO element of its own, so the
 * family supplies the resolved lanes through CONTEXT only — every
 * component inside the wrapped subtree (the CodeCards the detector
 * serves, and anything else) resolves them as ambient and stamps its
 * own roots. No carriers and no query() anchor here (a fragment has
 * no element to bind; an @ query() addresses the consumer's own
 * containers). The HIGHLIGHT_DETECT_KEY write is family STATE, not an
 * axis lane — the two contexts coexist, each under its own key.
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

export const HighlightDetectDefaultDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
