/**
 * jixoai button-group family Defaults
 * (registry/files/ui/button-group/button-group-defaults.svelte.ts,
 * context-defaults-economy task 2.1, 2026-09-03).
 *
 * The button-group family's SINGLE declared ambient contract. The
 * group is a STRUCTURAL provider (the layout half + the seam policy +
 * the dual paint-zone write), so this contract's consumer face is
 * deliberately narrow:
 *   - variant: the paint axis slot over the ZONE value domain
 *     (ZonePaintVariant — link excluded; the group's variant prop
 *     itself was narrowed there in 1.2), own 'outline' = the family's
 *     effective silent rung (a group with no variant and no enclosing
 *     scope leaves its children on the ladder's frozen default —
 *     PressButton's 'outline'; the slot declares that rung as this
 *     family's own). SINGLE-KEY (Owner 2026-09-04): the component's
 *     own inherit-then-provide rides the paint zone lane
 *     (getPaintZone eager capture — no second key exists), and the
 *     variant slot stays declaration-first: ButtonGroup resolves its
 *     density through this contract, while the group's zone write
 *     carries the variant (one lane, audited from both sides).
 *   - density: the no-opinion axis slot — the group carries no own
 *     (explicit ?? inherited ?? undefined), resolving what it then
 *     PROVIDES to the subtree (the joined buttons adopt the tier);
 *     no opinion stamps nothing (fleet law).
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     seven sibling axis members (explicit-props W3-D5, FIRST-TIME on
 *     this contract — the family deferred from batch B lands here):
 *     the group root is a LAYOUT container that paints no bezel of
 *     its own, so every axis is no-own — an explicit lane stamps the
 *     §10 carriers on the group root (font-size flows to the joined
 *     buttons through inheritance; the radius anchor supplies the
 *     concentric chain) and forwards through the ambient chain to
 *     the composed members (吃也供 — the wrapped press-buttons stamp
 *     their own roots).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. Member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
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
import { definePaintSlot } from '$lib/paint.svelte';

/**
 * The zone domain's literal spelling — the values tuple IS the
 * family union (slot-values-first D2; the canonical type is
 * lib/paint's ZonePaintVariant = Exclude<PaintVariant, 'link'>).
 * Four values: link is PressButton's interaction exception, never a
 * zone default — a group varianting to link is a compile error, not
 * a runtime clamp.
 */
export const buttonGroupVariantSlot = definePaintSlot(
  ['fill', 'tonal', 'outline', 'ghost'],
  'outline',
);
export type ButtonGroupVariant = ReturnType<typeof buttonGroupVariantSlot>;

export const ButtonGroupDefaults = defineComponentDefaults({
  variant: buttonGroupVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
