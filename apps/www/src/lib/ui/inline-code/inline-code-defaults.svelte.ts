/**
 * jixoai inline-code family Defaults
 * (registry/files/ui/inline-code/inline-code-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The inline-code family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `InlineCodeDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - variant: the paint axis slot, availability exactly per the
 *     frozen table (variant-grammar §4: tonal/outline, own tonal —
 *     the inline chip is the ladder's low rung pair). The values
 *     tuple IS the union's one declaration (slot-values-first D2);
 *     the component's Props and the public re-export in
 *     inline-code.svelte's module script reference it through the
 *     reverse-lookup type. The gate asserts values ≡ the frozen row
 *     bidirectionally. The ambient domain is trusted (D3-A retired
 *     the runtime values guard — no clamp, no warn;
 *     ZonePaintVariant already excludes the out-of-union rungs at
 *     the provider).
 *   - density: the no-opinion axis slot. The chip carries NO density
 *     own: no provider and no explicit prop resolve undefined, stamp
 *     nothing, and the ambient css scope channel keeps flowing (fleet
 *     law).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the ladder paint ids InlineCode ships (design.md §1/§4 — the
 *  frozen table's inline-code row; the same declaration the family's
 *  public surface re-exports via the reverse-lookup type) */
export const inlineCodeVariantSlot = definePaintSlot(['tonal', 'outline'], 'tonal');
export type InlineCodeVariant = ReturnType<typeof inlineCodeVariantSlot>;

export const InlineCodeDefaults = defineComponentDefaults({
  variant: inlineCodeVariantSlot,
  density: densitySlot(),
});
