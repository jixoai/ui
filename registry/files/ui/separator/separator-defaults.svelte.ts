/**
 * jixoai separator family Defaults
 * (registry/files/ui/separator/separator-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The separator family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `SeparatorDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'fused'), deliberately NOT a
 *     paint axis slot: the vocabulary names the INK GEOMETRY (the
 *     default technique is now NAMED fused — the contrast ghost
 *     itself, not a mask over it; the masks dashed/dense/dotted/wavy
 *     shape the same ghost; solid is the plain-fill escape; or the
 *     blend engine for fade), never a prominence rung; it can never
 *     join the paint ladder's frozen table, so the slot stays a
 *     defineLiteralSlot forever (the kbd mode's terminal form: no
 *     upgrade path exists because none is meaningful).
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The separator
 *     carries NO density own: no provider and no explicit prop
 *     resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-B, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the eight-axis surface (a strip consumes little of it; the
 *     supply chain is the point).
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

export const separatorVariantSlot = defineLiteralSlot(
  ['fused', 'solid', 'dashed', 'dense', 'dotted', 'wavy', 'fade'],
  'fused',
);

/**
 * The ink geometry — fused (the named default: the contrast ghost
 * itself), solid (the plain-fill escape, the subtraction-ink
 * exception — Owner amendment 2026-09-08, `--border`), masks over
 * the ghost (dashed/dense/dotted/wavy) or the blend engine (fade);
 * length stays the consumer's job. ReturnType 反查 — the slot's
 * values tuple is the union's source.
 */
export type SeparatorVariant = ReturnType<typeof separatorVariantSlot>;

export const SeparatorDefaults = defineComponentDefaults({
  variant: separatorVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
