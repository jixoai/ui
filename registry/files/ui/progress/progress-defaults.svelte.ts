/**
 * jixoai progress family Defaults
 * (registry/files/ui/progress/progress-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The progress family's SINGLE declared ambient contract — a ZERO
 * vocabulary-hit family (value/max/label are data semantics, not
 * style props; the bar's paint is fixed by the terminal stripe law).
 * The contract declares the family density-manageable (the task's
 * zero-hit ruling: a density declaration slot, not an exemption):
 *
 *   density  class a, the open axis with NO family own — no opinion:
 *            the bar never stamped data-density and does not start
 *            now; the slot declares the channel OPEN without
 *            manufacturing an opinion (fleet law — the ambient css
 *            scope channel keeps flowing).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const ProgressDefaults = defineComponentDefaults({
  density: densitySlot(),
});
