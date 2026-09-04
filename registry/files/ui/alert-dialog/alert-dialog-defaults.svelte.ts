/**
 * jixoai alert-dialog family Defaults
 * (registry/files/ui/alert-dialog/alert-dialog-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The alert-dialog family's SINGLE declared ambient contract — one
 * `AlertDialogDefaults` object covering every vocabulary-hit style
 * prop. The family carries TWO distinct `variant` vocabularies (the
 * gate's name-matched slot model is one-union-per-name; this file is
 * the honest carrier of the split, see the header note on each slot):
 *
 *   variant       the CONTENT panel's floating-surface paint — the
 *                 dialog/sheet family grammar (own 'auto', no axis
 *                 yet → defineLiteralSlot, values tuple first
 *                 (slot-values-first D2); auditable today, promotable
 *                 when an axis opens).
 *                 `variant` keeps the overlay-family convention
 *                 (dialog/sheet/tooltip/popover/hover-card all name
 *                 the panel's surface variant).
 *   actionVariant the ACTION button's confirm ladder (fill | tonal |
 *                 outline, own 'fill' with the destructive pair) —
 *                 the kbd mode (r11): alert-dialog-action is absent
 *                 from the variant grammar's frozen availability
 *                 table, so the slot is a defineLiteralSlot with the
 *                 upgrade path noted (a table row promotes it to a
 *                 paint slot with the values carrier).
 *   density       class a, the open axis with NO family own — no
 *                 opinion: neither the panel nor the actions ever
 *                 stamped data-density; the slot declares the family
 *                 density-manageable without manufacturing an
 *                 opinion (fleet law).
 *
 * Consumer mapping: alert-dialog-content resolves { variant };
 * alert-dialog-action resolves { actionVariant: variant } — each
 * prop reaches its OWN slot's union (the A1 gate's name match sees
 * the `variant` slot; the two-vocabulary split is this file's
 * documented contract, a W2 friction point reported for the gate's
 * one-union-per-name model).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/**
 * The CONTENT panel's floating-surface paint — the dialog family's
 * grammar, single-sourced here (the values tuple IS the union;
 * alert-dialog-content.svelte's Props and this contract share it).
 */
export const alertDialogSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type AlertDialogSurfaceVariant = ReturnType<typeof alertDialogSurfaceVariantSlot>;

/**
 * The ACTION button's confirm ladder — own 'fill' ships with the
 * destructive pair as the component's default injection (the closed
 * component's confirmTone law, carried into the grammar).
 */
export const alertDialogActionVariantSlot = defineLiteralSlot(['fill', 'tonal', 'outline'], 'fill');
export type AlertDialogActionVariant = ReturnType<typeof alertDialogActionVariantSlot>;

export const AlertDialogDefaults = defineComponentDefaults({
  variant: alertDialogSurfaceVariantSlot,
  actionVariant: alertDialogActionVariantSlot,
  density: densitySlot(),
});
