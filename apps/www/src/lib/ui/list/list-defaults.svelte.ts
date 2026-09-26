/**
 * jixoai list family Defaults — FIRST-TIME contract
 * (registry/files/ui/list/list-defaults.svelte.ts,
 * explicit-props W3 batch D1 / task 3.4, 2026-09-21).
 *
 * The PROSE list's SINGLE declared ambient contract — all eight axes,
 * ALL NO-OWN: the face's B8 marker channels and the no-margins rhythm
 * law own the paint; spacing/density deliberately never joined the
 * marker vocabulary (the recorded no-margins law — a spacing axis
 * would fight the container rhythm), and the universal axes follow
 * the same discipline as opinions: none of the family's own. The
 * contract exists for the supply chain (§11 吃也供): explicit ??
 * ambient ?? own, 'auto' everywhere absent an opinion — a list nested
 * in an axis tree stays continuous.
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

export const ListDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
