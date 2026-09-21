/**
 * jixoai pattern-faq family Defaults — FIRST-TIME contract
 * (registry/files/ui/pattern-faq/pattern-faq-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The man-page FAQ's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN: the framing is a composition product (Accordion
 * owns the disclosure, Icon the glyphs), so the article carries no
 * paint opinions of its own — the size axis scales the shell root
 * and the children's axis surfaces ride the ambient chain (§11 吃也供:
 * explicit ?? ambient ?? own, 'auto' everywhere absent an opinion).
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

export const PatternFaqDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
