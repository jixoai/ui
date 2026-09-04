/**
 * jixoai tour family Defaults
 * (registry/files/ui/tour/tour-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The tour family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TourDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'auto'), the same
 *     floating-surface grammar as the dialog/sheet families
 *     (solid | acrylic | auto): declared own, no axis yet
 *     (defineLiteralSlot, the values tuple the union's source —
 *     class b per the design's coverage table). A future
 *     floating-surface axis would first have to freeze the
 *     cross-family union.
 *
 * No density slot: the tour card carries no density prop — its type
 * scale rides the floating-surface tokens, nothing to cover (a dead
 * declaration slot is 为接线而接线, sheet X2-11 spirit).
 *
 * 惰性律: construction captures own only; this literal slot never
 * reads context at all. This file is a member of the registry:ui
 * item (installs with the family, byte mirrored, zero kernel
 * imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';

export const tourSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/** the floating-surface paint — the dialog/sheet family grammar;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type TourSurfaceVariant = ReturnType<typeof tourSurfaceVariantSlot>;

export const TourDefaults = defineComponentDefaults({
  variant: tourSurfaceVariantSlot,
});
