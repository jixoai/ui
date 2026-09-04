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
 *     promotable when that axis opens).
 *   - density: the no-opinion axis slot. The chip carries NO density
 *     own (the badge-twin law rides the secondary line at every
 *     density): no provider and no explicit prop resolve undefined,
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';
import { densitySlot } from '$lib/density.svelte';

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
  density: densitySlot(),
});
