/**
 * jixoai spin family Defaults
 * (registry/files/ui/spin/spin-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03;
 * contract refresh spin-ora-svg-lane C3, 2026-09-11).
 *
 * The spin family's SINGLE declared ambient contract — no longer a
 * ZERO vocabulary-hit family: spin-ora-svg-lane joined `spinner` and
 * `size` to the surface, and the split is the icon ruling verbatim —
 * `spinner` is a NAME lane (icon's `name`), outside this economy by
 * not being a style word; `size` IS a vocabulary word and takes the
 * open literal form (the icon-defaults/chart precedent):
 *
 *   size     the svg posture's square edge — a free CSS length, no
 *            closed union to enumerate and no ambient axis (a loader's
 *            edge is call-site business); explicit ?? own 16, the
 *            icon-parity default. Text posture ignores the slot.
 *   density  class a, the open axis with NO family own — no opinion:
 *            the indicator never stamped data-density and does not
 *            start now; the slot declares the channel OPEN without
 *            manufacturing an opinion (fleet law — the ambient css
 *            scope channel keeps flowing).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineOpenSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the svg posture's square edge — a free CSS length (px number or any
 *  valid CSS length string), own 16 the icon-parity default */
export const spinSizeSlot = defineOpenSlot<number | string>(16);

export const SpinDefaults = defineComponentDefaults({
  size: spinSizeSlot,
  density: densitySlot(),
});
