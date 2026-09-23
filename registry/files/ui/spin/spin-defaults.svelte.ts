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
 *   interval the frame step in ms — number | 'auto' (round 4):
 *            unset/'auto' falls back to the spinner's HAND-TUNED
 *            catalog pair; a context/plugin default re-times every
 *            spinner at once. The svg lane ignores it (its clock is
 *            the SMIL document's own).
 *   linger   the frame linger duration — number | 'auto' (rounds
 *            2-4): unset/'auto' falls back to the HAND-TUNED pair;
 *            0 hides at the interval handoff; context/plugin
 *            injectable like the interval.
 *   density  class a, the universal §4 axis (W3-B — the legacy
 *            densitySlot semantics ride the bridged lane), no family
 *            opinion on RUNG DEFAULTS — but the composed root DOES
 *            stamp data-density with the resolved rung (measured lg@1280
 *            → sm@600 through the page's query seat, task 41); the
 *            slot keeps the channel OPEN without manufacturing rung
 *            opinions (fleet law — the ambient css scope channel keeps
 *            flowing).
 *   shape/radius/color/theme/elevation/motion — the other universal
 *            axes (W3-B, all no-own): the eight-axis surface minus
 *            the size axis (below), supply-forwarding only.
 *
 * W3-B / §13 mapping (task 3.6): `size: number` is the universal
 * size axis' NUMBER lane verbatim (px, same semantics — explicit
 * numbers additionally stamp the §1 carrier through the component);
 * the raw-string lane and the ABSENT state (the density ruler's
 * var(--jx-icon)) remain the family's own per the recorded absent
 * law — named/auto/query lanes are NOT adopted on the loader.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  absentSlot,
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

/** the svg posture's square edge — a free CSS length (px number or any
 *  valid CSS length string). ABSENT is the state (review R1,
 *  2026-09-12): unset resolves undefined and the component rides the
 *  density ruler's var(--jx-icon) instead — a slot config (explicit
 *  or ambient) still pins a concrete edge */
export const spinSizeSlot = absentSlot<number | string>();

/** the frame step in ms — number | 'auto' (round 4): ABSENT/'auto'
 *  falls back to the spinner's HAND-TUNED catalog pair; a
 *  context/plugin-injected default re-times every spinner at once,
 *  an explicit prop still wins per instance */
export const spinIntervalSlot = absentSlot<number | 'auto'>();

/** the frame linger duration — number | 'auto' (rounds 2-4): ABSENT/
 *  'auto' falls back to the spinner's HAND-TUNED catalog pair; 0 =
 *  hide at the interval handoff. Context/plugin-injectable like the
 *  interval */
export const spinLingerSlot = absentSlot<number | 'auto'>();

/** the opacity animation mode — ABSENT falls back to the spinner's
 *  tuned lingerType ('end' unless tuned otherwise, review round 5);
 *  context/plugin-injectable like the timings */
export const spinLingerTypeSlot = absentSlot<'end' | 'start' | 'both' | 'auto'>();

export const SpinDefaults = defineComponentDefaults({
  size: spinSizeSlot,
  interval: spinIntervalSlot,
  linger: spinLingerSlot,
  lingerType: spinLingerTypeSlot,
  density: densityAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
