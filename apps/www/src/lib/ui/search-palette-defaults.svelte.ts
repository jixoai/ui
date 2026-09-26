/**
 * jixoai search-palette family Defaults — FIRST-TIME contract
 * (registry/files/ui/search-palette-defaults.svelte.ts + its byte
 * mirror, explicit-props W3 batch D4 / task 3.4, 2026-09-21).
 *
 * The full-text search palette's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN. The palette COMPOSES the Dialog (r12)
 * and is overlay-ish: the PORTAL LAW rides the composition — the
 * palette root stamps its own resolved carriers AND supplies the
 * eight lanes downward (§11 吃也供), so the promoted <dialog> (a batch
 * C surface with its own machinery) resolves the lanes as AMBIENT and
 * stamps its own carriers self-carried across the top-layer boundary.
 * 'auto' everywhere absent an opinion — the palette as mounted today
 * stamps nothing and the Dialog resolves exactly as before.
 *
 * 惰性律: construction captures own only (here: nothing); context
 * reads happen at resolve time inside the consumer's $derived window.
 * Same-source pair (the search stream's pending classification rides
 * the manifest's unreferencedLib ledger).
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

export const SearchPaletteDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
