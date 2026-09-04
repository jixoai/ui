/**
 * jixoai descriptions family Defaults
 * (registry/files/ui/descriptions/descriptions-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The descriptions family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `DescriptionsDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - bordered: the LITERAL family's boolean form (own false, values
 *     [false, true] — booleans are a closed domain, so they take the
 *     values form; kbd mode, r11 #6): the hairline frame is a
 *     declared grammar value with no axis — the slot resolves
 *     `explicit ?? false` and never reads context; auditable today,
 *     promotable when an axis opens.
 *   - density: the no-opinion axis slot. The dl grid carries NO density
 *     own: no provider and no explicit prop resolve undefined, stamp
 *     nothing, and the ambient css scope channel keeps flowing (fleet
 *     law).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the hairline frame — a closed boolean domain (values form) */
export const descriptionsBorderedSlot = defineLiteralSlot([false, true], false);

export const DescriptionsDefaults = defineComponentDefaults({
  bordered: descriptionsBorderedSlot,
  density: densitySlot(),
});
