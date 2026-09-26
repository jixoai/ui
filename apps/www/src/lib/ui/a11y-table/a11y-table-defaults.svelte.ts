/**
 * jixoai a11y-table family Defaults — FIRST-TIME contract
 * (apps/www/src/lib/ui/a11y-table/a11y-table-defaults.svelte.ts,
 * explicit-props W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The keyboard/ARIA reference table's SINGLE declared ambient contract
 * — all eight axes, ALL NO-OWN. The family is siteOnly docs infra
 * (ships no registry item; the inventory's siteOnly four): the size
 * axis scales the table root and every axis forwards through the
 * ambient chain (§11 吃也供: explicit ?? ambient ?? own, 'auto'
 * everywhere absent an opinion — an a11y reference renders the
 * caller's data at the caller's size if the caller says one).
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

export const A11yTableDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
