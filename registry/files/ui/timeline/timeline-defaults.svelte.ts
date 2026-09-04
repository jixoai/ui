/**
 * jixoai timeline family Defaults
 * (registry/files/ui/timeline/timeline-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The timeline family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TimelineDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The ordered spine carries NO
 *     density own: no provider and no explicit prop resolve undefined,
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
 *   - variant: the LITERAL family (own 'square'), deliberately NOT a
 *     paint axis slot: the dot's corner vocabulary (square · round ·
 *     ring) is timeline's own shape grammar, absent from the variant
 *     grammar's frozen availability table. The slot resolves
 *     `explicit ?? own` and never reads context; ambient shape pends a
 *     future shape axis (the appendix protocol), at which point this
 *     slot promotes to a paint-family slot the badge convention (the
 *     kbd pattern, classification b), values carried over.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const timelineDotVariantSlot = defineLiteralSlot(['square', 'round', 'ring'], 'square');

/** the dot's corner grammar — square (default) · round · ring;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type TimelineDotVariant = ReturnType<typeof timelineDotVariantSlot>;

export const TimelineDefaults = defineComponentDefaults({
  density: densitySlot(),
  variant: timelineDotVariantSlot,
});
