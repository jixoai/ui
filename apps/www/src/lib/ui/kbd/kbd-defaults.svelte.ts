/**
 * jixoai kbd family Defaults
 * (registry/files/ui/kbd/kbd-defaults.svelte.ts,
 * context-defaults-economy task 2.3, 2026-09-03).
 *
 * The kbd family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `KbdDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'tonal'), deliberately NOT a
 *     paint axis slot: kbd is absent from the variant grammar's
 *     frozen availability table (the engraved glyph's fill/tonal/
 *     outline ladder is its own), and a paint family must be frozen
 *     before it ships a paint slot. The slot resolves
 *     `explicit ?? own` and never reads context; ambient paint pends
 *     a future table freeze, at which point this slot promotes with
 *     the values carrier the same convention as badge/chip.
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The kbd carries
 *     NO density own: no provider and no explicit prop resolve
 *     'auto', stamp nothing, and the ambient css scope channel keeps
 *     flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-B, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the eight-axis surface (the engraved glyph's 2px corner is its
 *     own geometry; an explicit radius lane supplies through the
 *     carriers for descendants).
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

export const kbdVariantSlot = defineLiteralSlot(['fill', 'tonal', 'outline'], 'tonal');

/** the glyph's paint ladder — kbd's own vocabulary (not a frozen-table
 *  row; hue injects through jx-hue-* utilities, never as a variant);
 *  ReturnType 反查 — the values tuple above is the union's source */
export type KbdVariant = ReturnType<typeof kbdVariantSlot>;

export const KbdDefaults = defineComponentDefaults({
  variant: kbdVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
