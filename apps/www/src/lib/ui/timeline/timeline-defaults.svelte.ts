/**
 * jixoai timeline family Defaults
 * (registry/files/ui/timeline/timeline-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The timeline family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TimelineDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the universal §4 axis slot (W3-D3 — the legacy
 *     densitySlot semantics ride the bridged lane). The ordered spine
 *     carries NO density own: no provider and no explicit prop
 *     resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-D3, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the ONE-CELL GRID HOST is the family's own DOM root; the
 *     measured spine (the drawn SVG) is engine geometry documented
 *     outside the supply set, the items ride the chain.
 *   - variant: the LITERAL family (own 'square'), deliberately NOT a
 *     paint axis slot: the dot's corner vocabulary (square · round ·
 *     ring) is timeline's own shape grammar, absent from the variant
 *     grammar's frozen availability table. The slot resolves
 *     `explicit ?? own` and never reads context; the SHAPE axis
 *     (§2, W3-D3) carries the ambient corner-geometry channel — this
 *     literal stays the DOT's own grammar beside it (the chip/badge
 *     silhouette precedent, no value-space collision: the axis is
 *     adopted whole).
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

export const timelineDotVariantSlot = defineLiteralSlot(['square', 'round', 'ring'], 'square');

/** the dot's corner grammar — square (default) · round · ring;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type TimelineDotVariant = ReturnType<typeof timelineDotVariantSlot>;

export const TimelineDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
  variant: timelineDotVariantSlot,
});
