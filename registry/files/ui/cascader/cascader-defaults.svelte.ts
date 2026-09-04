/**
 * jixoai cascader family Defaults
 * (registry/files/ui/cascader/cascader-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The cascader family's SINGLE declared ambient contract (design.md
 * Defaults 定位). The chain of native selects declares ZERO
 * vocabulary-hit style props today — no variant, no density prop — so
 * this contract is the density-manageability DECLARATION the coverage
 * law requires of every family (the dialog precedent: the slot declares
 * the family density-manageable without manufacturing an opinion):
 *   - density: the no-opinion axis slot. No provider and no explicit
 *     prop resolve undefined, stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law). A future density prop on the
 *     family resolves through this contract day one.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const CascaderDefaults = defineComponentDefaults({
  density: densitySlot(),
});
