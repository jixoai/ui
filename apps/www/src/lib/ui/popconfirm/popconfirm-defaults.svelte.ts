/**
 * jixoai popconfirm family Defaults
 * (registry/files/ui/popconfirm/popconfirm-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The popconfirm family's SINGLE declared ambient contract: one
 * `PopconfirmDefaults` object whose slots cover every vocabulary-hit
 * style prop —
 *   - variant: class b, the dialog/sheet exemplar's twin — the
 *     floating-surface paint has a declared own ('auto') and NO axis
 *     yet, so the slot is a defineLiteralSlot whose values tuple
 *     declares the union (kbd mode, r11: popconfirm is absent from
 *     the variant grammar's frozen availability table; a table row
 *     promotes this slot to a paint slot, values carried over).
 *   - density: the no-opinion axis slot AT THE CONTRACT — the family
 *     is a density PROVIDER (inherit-then-provide, the button-group
 *     lane), so the root resolves its own stamp through this slot ON
 *     TOP of the provider lane (the slot's ambient read resolves to
 *     the root's own write, whose getter is the eager-captured parent
 *     resolution — the chain terminates; see popconfirm.svelte).
 *     The provider lane itself keeps the legacy helpers by the frozen
 *     provider duties (the kind:provider exemption carries it).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const popconfirmSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (popconfirm.svelte's Props and this contract share the one union).
 * ReturnType 反查 — the slot's values tuple is the union's source.
 */
export type PopconfirmSurfaceVariant = ReturnType<typeof popconfirmSurfaceVariantSlot>;

export const PopconfirmDefaults = defineComponentDefaults({
  variant: popconfirmSurfaceVariantSlot,
  density: densitySlot(),
});
