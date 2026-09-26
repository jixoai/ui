/**
 * jixoai icon family Defaults
 * (registry/files/ui/icon/icon-defaults.svelte.ts,
 * icon-component-pipeline E1, 2026-09-07;
 * explicit-props W3 batch B / task 3.6, 2026-09-21).
 *
 * The A1 context contract for the named-glyph family: `size` is a
 * vocabulary word, and the family's single audited read point is
 * this Defaults (the chart precedent — the literal family's OPEN
 * form): a free CSS length, no closed union to enumerate and no
 * ambient axis (a glyph's square edge is call-site business —
 * wrapper zones that want ambient icon sizing scope it through
 * their OWN family contracts, not through the glyph's); explicit
 * ?? own 16 (the old string-bag's baked edge, carried verbatim).
 * `strokeWidth` stays a plain prop — not a vocabulary word, no
 * slot (the same ruling shape as press-button's `raised` physics:
 * outside this economy by not being in the enumeration).
 *
 * W3-B / §13 mapping: `size: number` IS the universal size axis'
 * NUMBER lane verbatim (px, same semantics — numbers additionally
 * stamp the §1 carrier through the component); the raw-string lane
 * (any CSS length, e.g. '0.8em') and the absent state (the density
 * ruler's var(--jx-icon)) remain the family's own per the recorded
 * no-ambient-size law — named/auto/query lanes are NOT adopted on
 * the glyph. The seven other axes (density · shape · radius ·
 * color · theme · elevation · motion) join through their axis
 * slots, all no-own.
 *
 * 惰性律: construction captures the own once; the consumer's
 * resolve runs inside its $derived window. Member of the
 * registry:ui item (installs with the family, byte mirrored,
 * zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  defineOpenSlot,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

/** the glyph's square edge — a free CSS length (px number or any
 *  valid CSS length string), own 16 the string-bag default */
export const iconSizeSlot = defineOpenSlot<number | string>(16);

export const IconDefaults = defineComponentDefaults({
  size: iconSizeSlot,
  density: densityAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
