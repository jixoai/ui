/**
 * jixoai blockquote family Defaults
 * (registry/files/ui/blockquote/blockquote-defaults.svelte.ts,
 * markdown-coverage-components §1.1).
 *
 * The blockquote family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `BlockquoteDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - variant: the paint axis slot, availability exactly per the
 *     frozen table (the alert-shaped row: outline/tonal, own
 *     outline). The ladder is frozen at TWO rungs by the quote's
 *     readability law: fill buries long-form copy under saturated
 *     ground, and ghost is interactive-chrome vocabulary
 *     (rest-transparent, hover-tonal) which a static quote misuses —
 *     neither can ever join the row. The borderless manuscript
 *     indent is a future STRUCTURAL axis, never a paint rung.
 *     `blockquoteVariantSlot`'s values tuple IS the family union's
 *     source (slot-values-first D2: the gate asserts values ≡ the
 *     frozen row bidirectionally). The ambient domain is trusted
 *     (D3-A retired the runtime values guard — no clamp, no warn;
 *     ZonePaintVariant already excludes the out-of-union rungs at
 *     the provider).
 *   - density: the no-opinion axis slot. The blockquote carries NO
 *     density own: no provider and no explicit prop resolve
 *     undefined, stamp nothing, and the ambient css scope channel
 *     keeps flowing (fleet law).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the quote/admonition prominence ladder — the frozen table's
 *  Blockquote row (the alert two-rung shape: a quote never shouts
 *  from a fill, never gestures with hover chrome); the values tuple
 *  is the union's one declaration */
export const blockquoteVariantSlot = definePaintSlot(['outline', 'tonal'], 'outline');
export type BlockquoteVariant = ReturnType<typeof blockquoteVariantSlot>;

export const BlockquoteDefaults = defineComponentDefaults({
  variant: blockquoteVariantSlot,
  density: densitySlot(),
});
