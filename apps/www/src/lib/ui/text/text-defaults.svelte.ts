/**
 * jixoai text family Defaults
 * (registry/files/ui/text/text-defaults.svelte.ts,
 * markdown-coverage change §1.5, 2026-09-07).
 *
 * The text family's SINGLE declared ambient contract (the alert/kbd
 * Defaults anatomy): one `TextDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - mark: the LITERAL family (own 'p'), deliberately NOT a paint
 *     axis slot: mark is ELEMENT vocabulary — one word = prop value =
 *     sugar name = HTML element, never prominence (the kbd variant
 *     precedent: a closed own vocabulary resolved `explicit ?? own`).
 *     The slot never reads context; an element choice is never
 *     zone-ambient by nature.
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The text family
 *     carries NO density own: no provider and no explicit prop
 *     resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law — the ambient scale law owns
 *     the type ramp).
 *   - the seven other universal axes (§0/§11, W3-B, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the eight-axis surface. NOTE: the modifier kernel's own
 *     `fontSize` prop is a DIFFERENT name (no §1 collision); the
 *     size axis is the root font-size lane.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

/** the element vocabulary — the ONE word that is prop value, sugar
 *  name, and HTML element; the values tuple is the union's source */
export const textMarkSlot = defineLiteralSlot(
  ['p', 'strong', 'em', 'del', 'mark', 'ins', 'sub', 'sup'],
  'p',
);

/** the reading-content family's element vocabulary; ReturnType 反查 —
 *  the values tuple above is the union's source */
export type TextMark = ReturnType<typeof textMarkSlot>;

export const TextDefaults = defineComponentDefaults({
  mark: textMarkSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
