/**
 * jixoai float-button family Defaults
 * (registry/files/ui/float-button/float-button-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The float-button family's SINGLE declared ambient contract
 * (design.md Defaults 定位): one `FloatButtonDefaults` object whose
 * slots cover every vocabulary-hit style prop —
 *   - variant: class b, the dialog/sheet exemplar's twin — the MENU
 *     panel's floating-surface paint (the button itself keeps
 *     press-button physics; variant never touches it) has a declared
 *     own ('auto') and NO axis yet, so the slot is a
 *     defineLiteralSlot, values tuple first (kbd mode, r11:
 *     float-button is absent from the variant grammar's frozen
 *     availability table; a table row promotes this slot to a paint
 *     slot with the values carrier).
 *   - density: the no-opinion axis slot. The fab carries NO density
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
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (the values tuple IS the union; float-button.svelte's Props and
 * this contract share the one union; the menu panel paints it, the
 * button never does).
 */
export const floatButtonSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type FloatButtonSurfaceVariant = ReturnType<typeof floatButtonSurfaceVariantSlot>;

export const FloatButtonDefaults = defineComponentDefaults({
  variant: floatButtonSurfaceVariantSlot,
  density: densitySlot(),
});
