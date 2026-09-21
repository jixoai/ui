/**
 * jixoai theme-toggle family Defaults
 * (registry/files/ui/theme-toggle/theme-toggle-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The theme-toggle family's SINGLE declared ambient contract
 * (design.md Defaults 定位): one `ThemeToggleDefaults` object whose
 * slots cover every vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'compact'), deliberately NOT
 *     a paint axis slot: full/compact/icon/text is a STRUCTURAL
 *     selector (how much of the mode UI to render), not a paint rung
 *     — theme-toggle is absent from the variant grammar's frozen
 *     availability table, and a paint family must be frozen before
 *     it ships a paint slot. Resolves `explicit ?? own`, never reads
 *     context; a future table freeze promotes this slot the kbd
 *     convention (table row → definePaintSlot).
 *
 * No density slot: the toggle carries no density prop — its type
 * scale rides the bezel utilities fixed, nothing to cover.
 *
 * THE W3-D5 SURFACE (explicit-props, the hole round): eight axis
 * members join the contract beside the structural variant — ALL
 * NO-OWN. The toggle's GLOBAL flip (§6's JS-mutable `system` lane —
 * the localStorage write, the html.dark + colorScheme root stamps)
 * is deliberately NOT the theme axis: the axis is tree-scoped paint
 * (class:dark on the control's own root), the flip is the global
 * source — the two never entangle (the axis surface does not touch
 * the set/cycle machinery).
 *
 * 惰性律: construction captures own only; this literal slot never
 * reads context at all. This file is a member of the registry:ui
 * item (installs with the family, byte mirrored, zero kernel
 * imports).
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

export const themeToggleVariantSlot = defineLiteralSlot(['full', 'compact', 'icon', 'text'], 'compact');

/** the structural selector — how much of the mode UI renders;
 *  ReturnType 反查 — the values tuple above is the union's source */
export type ThemeToggleVariant = ReturnType<typeof themeToggleVariantSlot>;

export const ThemeToggleDefaults = defineComponentDefaults({
  variant: themeToggleVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
