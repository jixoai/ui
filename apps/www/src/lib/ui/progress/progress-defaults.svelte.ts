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
 *   density  the universal §4 axis slot (W3-D2 — the legacy
 *            densitySlot semantics ride the bridged lane), with NO
 *            family own — no opinion: the bar never stamped
 *            data-density for ambient lanes and does not start now;
 *            the slot declares the channel OPEN without manufacturing
 *            an opinion (fleet law — the ambient css scope channel
 *            keeps flowing).
 *   the seven other universal axes (§0/§11, W3-D2, all no-own):
 *   size · shape · radius · color · theme · elevation · motion —
 *   value/max/label stay data semantics (the zero-hit ruling); the
 *   size axis scales the readout root around the native bar.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

export const ProgressDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
