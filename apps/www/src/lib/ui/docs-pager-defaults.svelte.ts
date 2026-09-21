/**
 * jixoai docs-pager family Defaults — FIRST-TIME contract
 * (apps/www/src/lib/ui/docs-pager-defaults.svelte.ts, explicit-props
 * W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The per-page prev/next pager's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN. The family is siteOnly docs-infra chrome
 * rendered BY THE LAYOUT (no per-page wiring): a NO-OWN CONTAINER
 * surface — the size axis scales the nav root (the chips and links
 * reflow through inheritance) and every axis forwards through the
 * ambient chain (§11 吃也供: explicit ?? ambient ?? own, 'auto'
 * everywhere absent an opinion — the layout may someday say what size
 * the pager renders at; until then nothing stamps).
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

export const DocsPagerDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
