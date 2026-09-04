/**
 * jixoai input-otp family Defaults
 * (registry/files/ui/input-otp/input-otp-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The input-otp family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `InputOtpDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The joined code slots carry NO
 *     density own: no provider and no explicit prop resolve undefined,
 *     stamp nothing, and the ambient css scope channel keeps flowing
 *     (fleet law).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const InputOtpDefaults = defineComponentDefaults({
  density: densitySlot(),
});
