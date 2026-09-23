/**
 * jixoai dialog defaults (registry/files/ui/dialog/dialog-defaults.svelte.ts,
 * context-defaults-economy task 2.2, 2026-09-03).
 *
 * The dialog family's Defaults contract — the family's SINGLE declared
 * ambient contract (one `*Defaults` object per family, per the
 * component-authoring Defaults 契约). Classification per the design's
 * coverage table:
 *
 *   variant  class b, the pilot's exemplar — the floating-surface
 *            paint has a declared own ('auto': acrylic unless the
 *            environment asks for reduced transparency) and NO axis
 *            yet, so the slot is a defineLiteralSlot, values tuple
 *            first: auditable today, promotable to an axis slot
 *            when an axis opens (the spec's "a style prop with no
 *            axis yet" scenario — this file is its carrier).
 *   density  class a, the open axis with NO family own — no opinion
 *            on VALUE (densityAxisSlot() unparameterized): a named
 *            rung rides the ambient css scope channel through the
 *            top-layered <dialog>, which stays a DOM descendant for
 *            cascade purposes, and the panel STAMPS the resolved rung
 *            as data-density (dialog.svelte's carrier row; the
 *            attribute omits for auto / number / query lanes —
 *            densityRungOf's undefined arm). The slot declares the
 *            family density-manageable without manufacturing an
 *            opinion.
 *   elevation (W3-C) the ONE own on the overlay surface: the modal's
 *            historic z-feel mapped onto the §7 level table — level4
 *            (8dp, M3's dialog rung). The consumption pair composes
 *            the theme's level table (shadow recipe + the paired
 *            ladder-rung surface); an explicit lane overrides, auto
 *            inherits the tree's opinion.
 *   size · shape · radius · color · theme · motion (W3-C): the other
 *            universal axes, all no-own — a modal panel takes its
 *            opinions from its ancestors and supplies them, resolved,
 *            downward through the top layer.
 *
 * zone/entity wiring stays OUT (the frozen pilot decision, X2-11):
 * Dialog's ghost ButtonVariantScope usage is untouched in place — the
 * zone side already dual-writes PAINT_ZONE_KEY through lib/paint.svelte
 * (task 1.2).
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

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (the values tuple IS the union; dialog.svelte's Props and this
 * contract share it).
 */
export const dialogSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type DialogSurfaceVariant = ReturnType<typeof dialogSurfaceVariantSlot>;

export const DialogDefaults = defineComponentDefaults({
  variant: dialogSurfaceVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot('level4'),
  motion: motionAxisSlot(),
});
