/**
 * jixoai input-group family Defaults
 * (registry/files/ui/input-group/input-group-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The input-group family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `InputGroupDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The group is a DENSITY
 *     PROVIDER (inherit-then-provide: addon children adopt the group's
 *     resolved tier), but it carries NO own — the provider lane feeds
 *     provideDensity the eager-captured resolution (the r11 provider
 *     contract, button-group precedent), and this contract is the
 *     group's own audited read point ON TOP of that lane.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const InputGroupDefaults = defineComponentDefaults({
  density: densitySlot(),
});
