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
 * THE W3-D5 SURFACE (explicit-props, the hole round): six axis
 * members join the contract — size · shape · radius · color ·
 * elevation · motion, ALL NO-OWN on the canvas's own workbench root
 * (the <section>). TWO AXES ARE DELIBERATELY LEFT OUT, both because
 * the STAGE-PREVIEW bindables own their prop names (the §13 no-rename
 * law; no rename without an Owner ruling): `theme` (the stage's
 * 'light'|'dark' preview projection — the value space overlaps
 * ThemeLane) and `density` (the stage's page-owned Density union,
 * consumed by the dock select through this same contract) — the
 * universal lanes forward ambient-only through inheritance, W6
 * dossier-flagged beside code-card/mermaid. W4's 4.2 wires the
 * per-axis controls onto whatever survives here.
 *
 * 惰性律: construction captures own only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
} from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const ComponentCanvasDefaults = defineComponentDefaults({
  density: densitySlot('default'),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
