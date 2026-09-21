/**
 * jixoai chip family Defaults
 * (registry/files/ui/chip/chip-defaults.svelte.ts,
 * context-defaults-economy task 2.3, 2026-09-03).
 *
 * The chip family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `ChipDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the paint axis slot, availability exactly per the
 *     frozen table (variant-grammar §4: Chip carries all four rungs,
 *     own tonal). `chipVariantSlot`'s values tuple IS the family
 *     union's source (slot-values-first D2: the gate asserts values
 *     ≡ the frozen row bidirectionally). The ambient domain is
 *     trusted (D3-A retired the runtime values guard — no clamp, no
 *     warn; ZonePaintVariant already excludes the out-of-union rungs
 *     at the provider).
 *   - shape: the literal family (own 'square' declared, ambient
 *     capability pends a future shape axis — auditable today,
 *     promotable when that axis opens). W3-B NOTE: the universal
 *     §2 shape axis is NOT adopted here — the silhouette vocabulary
 *     (square|pill) collides with the axis name and design §13 rules
 *     no mapping for it; an unruled rename/absorption is out of
 *     bounds (the orchestrator folds the ruling). The other seven
 *     axes landed (below).
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The chip carries
 *     NO density own (the badge-twin law rides the secondary line at
 *     every density): no provider and no explicit prop resolve 'auto',
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
 *   - the other universal axes (§0/§11, W3-B, all no-own): size ·
 *     radius · color · theme · elevation · motion — the eight-axis
 *     surface minus the collided shape name.
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
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
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';

/** the grammar's four-step ladder — the frozen table's Chip row
 *  (all four rungs; link never reaches Chip); the values tuple is
 *  the union's one declaration */
export const chipVariantSlot = definePaintSlot(['fill', 'tonal', 'outline', 'ghost'], 'tonal');
export type ChipVariant = ReturnType<typeof chipVariantSlot>;

/** the silhouette vocabulary: site radius (square) or fully round (pill) */
export const chipShapeSlot = defineLiteralSlot(['square', 'pill'], 'square');
export type ChipShape = ReturnType<typeof chipShapeSlot>;

export const ChipDefaults = defineComponentDefaults({
  variant: chipVariantSlot,
  shape: chipShapeSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
