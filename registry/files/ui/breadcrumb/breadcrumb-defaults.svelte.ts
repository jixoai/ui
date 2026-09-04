/**
 * jixoai breadcrumb family Defaults
 * (registry/files/ui/breadcrumb/breadcrumb-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The breadcrumb family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `BreadcrumbDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The trail carries NO density
 *     own: the root is a STRUCTURAL provider (inherit-then-provide by
 *     the frozen provider duties — the eager capture in
 *     breadcrumb.svelte feeds provideDensity; the legacy read stays
 *     confined there), the parts resolve their inherited stamp through
 *     this contract, and no opinion stamps nothing (fleet law) — the
 *     ambient css scope channel keeps flowing through the nav
 *     landmark's subtree.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const BreadcrumbDefaults = defineComponentDefaults({
  density: densitySlot(),
});
