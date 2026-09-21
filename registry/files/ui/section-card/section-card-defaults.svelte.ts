/**
 * jixoai section-card family Defaults
 * (registry/files/ui/section-card/section-card-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The section-card family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `SectionCardDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - tone: the LITERAL family (own 'default'), deliberately NOT a
 *     paint axis slot: the tone ladder ('default' bordered section vs
 *     'hero' head) is section-card's own typographic vocabulary, absent
 *     from the variant grammar's frozen availability table. The slot
 *     resolves `explicit ?? own` and never reads context; ambient tone
 *     pends a future table freeze, at which point this slot promotes
 *     to a paint slot the badge convention (the kbd pattern,
 *     classification b), values carried over.
 *   - the EIGHT universal axes (§0/§11, W3-D3, all no-own): density ·
 *     size · shape · radius · color · theme · elevation · motion —
 *     the bordered section is a no-own container surface: the size
 *     axis scales the section root and the supply chain is the point
 *     (the content atom's density ADOPTION keeps resolving through
 *     the ambient css scope channel — an explicit lane now stamps
 *     the rung on the section root itself).
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

export const sectionCardToneSlot = defineLiteralSlot(['default', 'hero'], 'default');

/** the section's typographic register — everyday bordered body vs
 *  inner-page hero head (a layout decision, never a paint rung);
 *  ReturnType 反查 — the values tuple above is the union's source */
export type SectionCardTone = ReturnType<typeof sectionCardToneSlot>;

export const SectionCardDefaults = defineComponentDefaults({
  tone: sectionCardToneSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
