/**
 * jixoai props-table family Defaults — FIRST-TIME contract
 * (apps/www/src/lib/ui/props-table/props-table-defaults.svelte.ts,
 * explicit-props W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The API reference table's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN. The family is siteOnly docs infra AND
 * load-bearing: it RENDERS the shared Universal props section on every
 * doc page (task 4.3, live since batch A). Its own adoption is the
 * same minimal no-own container surface as the readouts — the size
 * axis scales the table root, every axis forwards through the ambient
 * chain (§11 吃也供: explicit ?? ambient ?? own, 'auto' everywhere
 * absent an opinion; with no lane passed NOTHING stamps and the
 * section renders byte-identically to its pre-D4 form).
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

export const PropsTableDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
