/**
 * jixoai file-input family Defaults
 * (registry/files/ui/file-input/file-input-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The file-input family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `FileInputDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'drop', kbd mode, r11 #6): the
 *     professional picker's two presentation modes (dashed drop zone /
 *     compact inline trigger) are a declared grammar value with NO
 *     axis — the slot resolves `explicit ?? 'drop'` and never reads
 *     context; auditable today, promotable when an axis opens
 *     (file-input.svelte's Props shares this union).
 *   - density: the no-opinion axis slot. The picker carries NO density
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

/**
 * The picker's presentation mode — the family grammar, single-sourced
 * here (the values tuple IS the union; file-input.svelte's Props and
 * this contract share it).
 */
export const fileInputVariantSlot = defineLiteralSlot(['drop', 'button'], 'drop');
export type FileInputVariant = ReturnType<typeof fileInputVariantSlot>;

export const FileInputDefaults = defineComponentDefaults({
  variant: fileInputVariantSlot,
  density: densitySlot(),
});
