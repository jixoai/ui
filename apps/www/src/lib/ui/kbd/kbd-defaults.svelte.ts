/**
 * jixoai kbd family Defaults
 * (registry/files/ui/kbd/kbd-defaults.svelte.ts,
 * context-defaults-economy task 2.3, 2026-09-03).
 *
 * The kbd family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `KbdDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'tonal'), deliberately NOT a
 *     paint axis slot: kbd is absent from the variant grammar's
 *     frozen availability table (the engraved glyph's fill/tonal/
 *     outline ladder is its own), and a paint family must be frozen
 *     before it ships a paint slot. The slot resolves
 *     `explicit ?? own` and never reads context; ambient paint pends
 *     a future table freeze, at which point this slot promotes with
 *     the values carrier the same convention as badge/chip.
 *   - density: the no-opinion axis slot. The kbd carries NO density
 *     own: no provider and no explicit prop resolve undefined, stamp
 *     nothing, and the ambient css scope channel keeps flowing (fleet
 *     law).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const kbdVariantSlot = defineLiteralSlot(['fill', 'tonal', 'outline'], 'tonal');

/** the glyph's paint ladder — kbd's own vocabulary (not a frozen-table
 *  row; hue injects through jx-hue-* utilities, never as a variant);
 *  ReturnType 反查 — the values tuple above is the union's source */
export type KbdVariant = ReturnType<typeof kbdVariantSlot>;

export const KbdDefaults = defineComponentDefaults({
  variant: kbdVariantSlot,
  density: densitySlot(),
});
