/**
 * jixoai tour family Defaults
 * (registry/files/ui/tour/tour-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The tour family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TourDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'auto'), the same
 *     floating-surface grammar as the dialog/sheet families
 *     (solid | acrylic | auto): declared own (defineLiteralSlot, the
 *     values tuple the union's source — class b per the design's
 *     coverage table).
 *   - the EIGHT universal axes (§0/§11, W3-D3): density · size ·
 *     shape · radius · color · theme · motion all no-own, elevation
 *     carrying the family own level2 — the anchored card's historic
 *     z-feel (3dp, M3's menu rung — the popover/dropdown-menu law,
 *     batch C). The card rides popover="manual" (a top-layer
 *     promotion): the carriers stamp the CARD root itself,
 *     self-carried across the promotion (the batch C portal law).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

export const tourSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/** the floating-surface paint — the dialog/sheet family grammar;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type TourSurfaceVariant = ReturnType<typeof tourSurfaceVariantSlot>;

export const TourDefaults = defineComponentDefaults({
  variant: tourSurfaceVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot('level2'),
  motion: motionAxisSlot(),
});
