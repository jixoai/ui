/**
 * jixoai token-table family Defaults — FIRST-TIME contract
 * (apps/www/src/lib/ui/token-table/token-table-defaults.svelte.ts,
 * explicit-props W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The token reference table's SINGLE declared ambient contract — all
 * eight axes, ALL NO-OWN. The family is siteOnly docs infra (ships no
 * registry item; the inventory's siteOnly four) and its universality
 * is site-side only: the size axis scales the table root (the scroller
 * and every cell reflow through inheritance — ONE number moves the
 * reference), and every axis forwards through the ambient chain
 * (§11 吃也供: explicit ?? ambient ?? own, 'auto' everywhere absent an
 * opinion — a token table renders the caller's data, the caller may
 * also say what size it renders at).
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

export const TokenTableDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
