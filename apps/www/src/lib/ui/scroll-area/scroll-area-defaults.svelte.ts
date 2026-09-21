/**
 * jixoai scroll-area family Defaults
 * (registry/files/ui/scroll-area/scroll-area-defaults.svelte.ts,
 * tailwindless one-shot W4-r2, 2026-09-19 — the A1 debt the context
 * gate caught: the W1b migration introduced the `radius` style prop
 * without the family's Defaults contract).
 *
 * The scroll-area family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `ScrollAreaDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - radius: the thumb corner, ABSENT-MEANINGFUL (absentSlot, the
 *     alert-model): absence IS the state — undefined resolves
 *     undefined and the sheet's 0px default paints the square-cut
 *     r2 look; any px number or 'full' (the capsule, Owner r2) rides
 *     the explicit lane. No closed tuple exists — the value domain is
 *     free, so the literal-absent factory, not defineLiteralSlot.
 *     W3-D2: the radius AXIS is left out — this chrome param owns the
 *     name ('full' is outside RadiusLane and the target is the THUMB,
 *     never the region root's concentric corner; the chip/badge shape
 *     precedent, §13 rules no rename). SEVEN axis lanes join below.
 *     The NUMBER lane rides BOTH (the chart §13 analogy, D1's
 *     census-recorded precedent): a px number is load-bearing thumb
 *     chrome AND the axis' exact-px lane verbatim — the component
 *     stamps the carrier with `typeof radius === 'number' ? radius :
 *     undefined`, making the region the concentric ANCHOR for
 *     descendants at radius='auto'.
 *   - density · size · shape · color · theme · elevation · motion
 *     (W3-D2): the universal axes, all no-own — the axis surface
 *     rides the family's OWN region root; the ENGINE half (the kit's
 *     hand-drawn chrome, the thumb geometry) is outside the supply
 *     set.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  absentSlot,
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

/** the thumb corner — absent = square-cut (the sheet's 0px), else a
 *  px number or 'full' (the capsule) */
export const scrollThumbRadiusSlot = absentSlot<number | 'full'>();

export const ScrollAreaDefaults = defineComponentDefaults({
  radius: scrollThumbRadiusSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
