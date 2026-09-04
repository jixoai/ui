/**
 * jixoai anchor family Defaults
 * (registry/files/ui/anchor/anchor-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The anchor family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `AnchorDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The anchor nav carries NO
 *     density own: no provider and no explicit prop resolve
 *     undefined, stamp nothing, and the ambient css scope channel
 *     keeps flowing (fleet law). (The ANCHOR_KEY context surface is
 *     family STATE — the active pick — and stays outside the
 *     contract; this file never touches it.)
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const AnchorDefaults = defineComponentDefaults({
  density: densitySlot(),
});
