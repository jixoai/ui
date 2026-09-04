/**
 * jixoai ghostty-term family Defaults
 * (registry/files/ui/ghostty-term/ghostty-term-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The ghostty-term family's SINGLE declared ambient contract
 * (design.md Defaults 定位): one `GhosttyTermDefaults` object whose
 * slots cover every vocabulary-hit style prop —
 *   - density: the axis slot WITH the family own 'default' (the
 *     design-frozen migration path: the terminal's cell math wants
 *     its concrete stamp — the sanctioned local fallback applies
 *     only when NO parent provider exists; a provider's opinion and
 *     the explicit prop both win over it). This is the always-concrete
 *     semantics the component was authored under (resolveDensity's
 *     third argument), moved from an inline component fallback into
 *     the family contract where it is auditable.
 *
 * 惰性律: construction captures own only; the ambient read happens
 * at resolve time inside the consumer's $derived window (the plugin
 * chain — print — rides the terminal value through resolveDensity's
 * full semantics inside the slot). This file is a member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const GhosttyTermDefaults = defineComponentDefaults({
  density: densitySlot('default'),
});
