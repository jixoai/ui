/**
 * jixoai combobox family Defaults
 * (registry/files/ui/combobox/combobox-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The combobox family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `ComboboxDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'auto', kbd mode, r11 #6 — the
 *     dialog/sheet precedent): the floating-surface paint has a
 *     declared own and NO axis yet, so the slot resolves
 *     `explicit ?? 'auto'` and never reads context; a surface axis
 *     opening promotes it. The union lives in the slot's values tuple
 *     here rather than imported into the component's Props because
 *     combobox's props interface feeds the GENERATED meta chain
 *     (component-metadata-gen → props-table-meta-drift), whose
 *     ambient-column extension is the doc batch's 先破再立 (task 4.3)
 *     — both spellings are pinned identical by the family spec.
 *   - density: the no-opinion axis slot — a DECLARATION, not a
 *     consumed slot (the combobox declares no density prop today; the
 *     dialog precedent: density-manageable without manufacturing an
 *     opinion).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * for the contract (the values tuple IS the union; combobox.svelte's
 * inline Props union is pinned identical; the meta-chain constraint
 * note is above).
 */
export const comboboxSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type ComboboxSurfaceVariant = ReturnType<typeof comboboxSurfaceVariantSlot>;

export const ComboboxDefaults = defineComponentDefaults({
  variant: comboboxSurfaceVariantSlot,
  density: densitySlot(),
});
