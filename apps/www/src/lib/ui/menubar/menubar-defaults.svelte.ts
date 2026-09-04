/**
 * jixoai menubar family Defaults
 * (registry/files/ui/menubar/menubar-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The menubar family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `MenubarDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The bar is a STRUCTURAL
 *     provider (the panel registry + the roving walk) whose density
 *     lane is inherit-then-provide by the frozen provider duties (the
 *     eager capture in menubar.svelte feeds provideDensity; the legacy
 *     read stays confined there). The contract carries NO own: no
 *     provider and no explicit prop resolve undefined, stamp nothing,
 *     and the ambient css scope channel keeps flowing (fleet law).
 *   - variant: the LITERAL family (own 'auto') — the floating-surface
 *     paint, the same grammar as the dialog and sheet families
 *     (classification b: declared own, no axis yet; a surface axis
 *     would first have to freeze the union). The slot resolves
 *     `explicit ?? own` and never reads context.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const menubarSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (menubar.svelte's Props and this contract share the one union;
 * the dialog and sheet families declare their own same-shaped unions).
 * ReturnType 反查 — the slot's values tuple is the union's source.
 */
export type MenubarSurfaceVariant = ReturnType<typeof menubarSurfaceVariantSlot>;

export const MenubarDefaults = defineComponentDefaults({
  density: densitySlot(),
  variant: menubarSurfaceVariantSlot,
});
