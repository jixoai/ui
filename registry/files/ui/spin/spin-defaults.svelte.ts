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
 *            edge is call-site business). The slot is an ABSENT slot
 *            (review R1, 2026-09-12): unset resolves undefined and
 *            the component rides the density ruler's var(--jx-icon)
 *            — so density rungs size the glyph; explicit values (or
 *            an ambient slot config) pin a concrete edge. Text
 *            posture ignores the slot (it paints var(--jx-text)).
 *   interval the frame step in ms — an absent slot (review R7):
 *            unset falls back to the spinner's CATALOG interval
 *            (line 130ms, simpleDots 400ms…); a context/plugin
 *            default re-times every spinner at once. The svg lane
 *            ignores it (its clock is the SMIL document's own).
 *   ghost    the text trail's linear fade-out in ms — an absent
 *            slot (review R6/R7): unset is OFF; context/plugin
 *            injectable like the interval.
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
import { absentSlot, defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the svg posture's square edge — a free CSS length (px number or any
 *  valid CSS length string). ABSENT is the state (review R1,
 *  2026-09-12): unset resolves undefined and the component rides the
 *  density ruler's var(--jx-icon) instead — a slot config (explicit
 *  or ambient) still pins a concrete edge */
export const spinSizeSlot = absentSlot<number | string>();

/** the frame step in ms — ABSENT falls back to the spinner's catalog
 *  interval (review R7): a context/plugin-injected default re-times
 *  every spinner at once, an explicit prop still wins per instance */
export const spinIntervalSlot = absentSlot<number>();

/** the ghost trail's linear fade-out duration in ms — ABSENT is off
 *  (review R6/R7); context/plugin-injectable like the interval */
export const spinGhostSlot = absentSlot<number>();

export const SpinDefaults = defineComponentDefaults({
  size: spinSizeSlot,
  interval: spinIntervalSlot,
  ghost: spinGhostSlot,
  density: densitySlot(),
});
