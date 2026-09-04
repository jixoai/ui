/**
 * jixoai hover-card family Defaults
 * (registry/files/ui/hover-card/hover-card-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The hover-card family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `HoverCardDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - variant: class b, the dialog/sheet exemplar's twin — the
 *     floating-surface paint has a declared own ('auto': acrylic unless
 *     the environment asks for reduced transparency) and NO axis yet,
 *     so the slot is a defineLiteralSlot, values tuple first:
 *     auditable today, promotable to an axis slot when an axis opens.
 *     (kbd mode, r11: hover-card is absent from the variant grammar's
 *     frozen availability table — a paint family must be frozen
 *     before it ships a paint slot; the table gaining a HoverCard row
 *     promotes this slot with the values carrier the badge/chip
 *     convention.)
 *   - density: class a, the open axis with NO family own — no
 *     opinion: the panel never stamped data-density and still does
 *     not; the slot declares the family density-manageable without
 *     manufacturing an opinion (the ambient css scope channel keeps
 *     flowing through the top-layered popover panel).
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
 * here (the values tuple IS the union; hover-card.svelte's Props and
 * this contract share the one union; the dialog/sheet/popover families
 * declare their own same-shaped unions).
 */
export const hoverCardSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type HoverCardSurfaceVariant = ReturnType<typeof hoverCardSurfaceVariantSlot>;

export const HoverCardDefaults = defineComponentDefaults({
  variant: hoverCardSurfaceVariantSlot,
  density: densitySlot(),
});
