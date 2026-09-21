/**
 * jixoai density-demo family Defaults — FIRST-TIME contract
 * (apps/www/src/lib/ui/density-demo/density-demo-defaults.svelte.ts,
 * explicit-props W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The density demonstration wrapper's SINGLE declared ambient contract
 * — all eight axes, ALL NO-OWN. The family is siteOnly docs infra and
 * THE density showcase: its adoption DOGFOODS the axis — an explicit
 * density lane on the demo root stamps the rung for the demo's own
 * chrome (labels, row gaps — the visible §4 bridge), while the scope
 * boxes keep their per-rung stamps (explicit scope > ambient root,
 * the fleet law live inside the demo that teaches it). Every axis
 * forwards through the ambient chain (§11 吃也供: explicit ?? ambient
 * ?? own, 'auto' everywhere absent an opinion).
 *
 * 惰性律: construction captures own only (here: nothing); context
 * reads happen at resolve time inside the consumer's $derived window.
 * Site-only member — no registry twin (the mirror manifest's SITE_ONLY
 * ledger is the arbiter).
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

export const DensityDemoDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
