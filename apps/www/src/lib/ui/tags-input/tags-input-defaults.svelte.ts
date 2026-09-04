/**
 * jixoai tags-input family Defaults
 * (registry/files/ui/tags-input/tags-input-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The tags-input family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TagsInputDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'auto', kbd mode, r11 #6 — the
 *     dialog/sheet precedent): the suggestion panel's floating-surface
 *     paint has a declared own and NO axis yet, so the slot resolves
 *     `explicit ?? 'auto'` and never reads context; a surface axis
 *     opening promotes it (tags-input.svelte's Props shares this
 *     union).
 *   - density: the no-opinion axis slot. The tag field carries NO
 *     density own: no provider and no explicit prop resolve undefined,
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const tagsInputSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/**
 * The suggestion panel's floating-surface paint — the family grammar,
 * single-sourced here (tags-input.svelte's Props and this contract
 * share the one union). ReturnType 反查 — the slot's values tuple is
 * the union's source.
 */
export type TagsInputSurfaceVariant = ReturnType<typeof tagsInputSurfaceVariantSlot>;

export const TagsInputDefaults = defineComponentDefaults({
  variant: tagsInputSurfaceVariantSlot,
  density: densitySlot(),
});
