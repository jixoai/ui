/**
 * jixoai accordion family Defaults — FIRST-TIME contract
 * (registry/files/ui/accordion/accordion-defaults.svelte.ts,
 * explicit-props W3 batch D5 / task 3.4, 2026-09-21).
 *
 * The disclosure pair's SINGLE declared ambient contract — all eight
 * axes, ALL NO-OWN, resolved ONCE at the GROUP root (accordion.svelte
 * — the frame div): the parts ride the supply chain. accordion-item
 * has no surface of its own; its <details>/<summary> content inherits
 * the group root's stamped carriers through the plain cascade (the
 * content is IN-FLOW inside the frame — no portal boundary exists in
 * the native-details architecture, so the portal law has nothing to
 * self-carry here), and any future part-level resolve reads the same
 * ambient (the breadcrumb-parts shape: one contract, many ambient
 * readers). The size axis scales the whole set (ONE number moves
 * summary + body); every axis forwards through the ambient chain
 * (§11 吃也供: explicit ?? ambient ?? own, 'auto' everywhere absent
 * an opinion — the fleet law).
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

export const AccordionDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
