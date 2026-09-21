/**
 * jixoai language-switcher family Defaults
 * (registry/files/ui/language-switcher/language-switcher-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The language-switcher family's SINGLE declared ambient contract
 * (design.md Defaults 定位): one `LanguageSwitcherDefaults` object
 * whose slots cover every vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'pair'), deliberately NOT a
 *     paint axis slot: pair/menu is a STRUCTURAL selector (the
 *     two-locale segmented group vs the popover menu), not a paint
 *     rung — the switcher is absent from the variant grammar's
 *     frozen availability table, and a paint family must be frozen
 *     before it ships a paint slot. Resolves `explicit ?? own`,
 *     never reads context; a future table freeze promotes this slot
 *     the kbd convention (table row → definePaintSlot).
 *   - the eight universal axes (§0/§11, W3-D1, all no-own): density
 *     joins FRESH here (the "no density prop — nothing to cover"
 *     era ends with the axis surface: a no-own axis member is not a
 *     dead declaration, it is the supply chain) · size · shape ·
 *     radius · color · theme · elevation · motion.
 *
 * 惰性律: construction captures own only; the literal slot never
 * reads context, the axis slots read lazily at resolve time inside
 * the consumer's $derived window. This file is a member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
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

export const languageSwitcherVariantSlot = defineLiteralSlot(['pair', 'menu'], 'pair');

/** the structural selector — segmented pair vs popover menu;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type LanguageSwitcherVariant = ReturnType<typeof languageSwitcherVariantSlot>;

export const LanguageSwitcherDefaults = defineComponentDefaults({
  variant: languageSwitcherVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
