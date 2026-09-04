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
 *   size     class b, the design table's other named example — a
 *            declared own ('24rem', the default drawer extent) over
 *            a free CSS length; no axis (defineOpenSlot<string>, the
 *            open-domain form [B1] — the explicit type argument is
 *            the only enforcement face; a future size axis would
 *            first have to close the union, at which point this slot
 *            migrates back to the values form).
 *   density  class a, the open axis with NO family own — no opinion:
 *            the panel never stamped data-density and still does not;
 *            the ambient css scope channel keeps flowing through the
 *            top-layered <dialog>.
 */

import { defineComponentDefaults, defineLiteralSlot, defineOpenSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const sheetSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/** the OPEN-domain form ([B1]: the drawer extent is a free CSS length,
 *  no closed union to enumerate) — the explicit type argument is the
 *  only enforcement face (NoInfer + = never, the absentSlot
 *  discipline) */
export const sheetSizeSlot = defineOpenSlot<string>('24rem');

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (sheet.svelte's Props and this contract share the one union; the
 * dialog family declares its own same-shaped union). ReturnType 反查 —
 * the slot's values tuple is the union's source.
 */
export type SheetSurfaceVariant = ReturnType<typeof sheetSurfaceVariantSlot>;

export const SheetDefaults = defineComponentDefaults({
  variant: sheetSurfaceVariantSlot,
  density: densitySlot(),
  size: sheetSizeSlot,
});
