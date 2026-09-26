/**
 * jixoai sheet defaults (registry/files/ui/sheet/sheet-defaults.svelte.ts,
 * context-defaults-economy task 2.2, 2026-09-03).
 *
 * The sheet family's Defaults contract. The frozen pilot decision
 * (X2-11): ship the contract, wire NO zone/entity — sheet has no
 * footer button cluster, so no zone need; 不为接线而接线.
 * Classification per the design's coverage table:
 *
 *   variant  class b — the floating-surface paint, the same grammar
 *            as the dialog family: declared own 'auto', no axis yet
 *            (defineLiteralSlot, the values tuple the union's source).
 *   width    class b, the design table's other named example — a
 *            declared own ('24rem', the default drawer extent) over
 *            a free CSS length; no axis (defineOpenSlot<string>, the
 *            open-domain form [B1] — the explicit type argument is
 *            the only enforcement face). §13 RENAME (W3-C, Owner
 *            table ruling): the prop was `size` — a css WIDTH, never
 *            the scale axis; the rename frees the axis name, which
 *            the universal size lane below now owns.
 *   elevation (W3-C) the overlay surface's ONE own: the side drawer's
 *            historic z-feel mapped onto the §7 level table — level4
 *            (8dp, the dialog rung it docks beside).
 *   density · size · shape · radius · color · theme · motion (W3-C):
 *            the universal axes, all no-own — the panel takes its
 *            opinions from its ancestors and supplies them, resolved,
 *            downward through the top layer.
 */

import {
  colorAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  defineOpenSlot,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

export const sheetSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/** the OPEN-domain form ([B1]: the drawer extent is a free CSS length,
 *  no closed union to enumerate) — the explicit type argument is the
 *  only enforcement face (NoInfer + = never, the absentSlot
 *  discipline). §13: renamed from `size` — the css width lane, not
 *  the scale axis */
export const sheetWidthSlot = defineOpenSlot<string>('24rem');

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (sheet.svelte's Props and this contract share the one union; the
 * dialog family declares its own same-shaped union). ReturnType 反查 —
 * the slot's values tuple is the union's source.
 */
export type SheetSurfaceVariant = ReturnType<typeof sheetSurfaceVariantSlot>;

export const SheetDefaults = defineComponentDefaults({
  variant: sheetSurfaceVariantSlot,
  width: sheetWidthSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot('level4'),
  motion: motionAxisSlot(),
});
