/**
 * jixoai component-canvas family Defaults
 * (registry/files/ui/component-canvas/component-canvas-defaults.svelte.ts,
 * canvas-playground-dock, 2026-09-08).
 *
 * The family's declared ambient contract (the A1 vocabulary economy):
 * the unified dock chrome (Owner ruling 2026-09-08) made `density` a
 * family style word — the dock's density select speaks the standard
 * Density union and the stage stamps data-density as a SCOPE
 * BOUNDARY for the demo subtree.
 *
 * THE STAGE-BOUNDARY POSTURE: the canvas's density is a page-owned
 * BINDABLE whose destructure default ('default') keeps the slot's
 * explicit lane permanently hot — the ambient zone never rides the
 * stage (a demo stage isolates its subtree; an unbound canvas shows
 * the default scope, today's shipped semantic, byte-identical). The
 * slot exists for the vocabulary economy and the single-read-point
 * law; consumers that want zone-tracking bind their own value.
 *
 * 惰性律: construction captures own only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const ComponentCanvasDefaults = defineComponentDefaults({
  density: densitySlot('default'),
});
