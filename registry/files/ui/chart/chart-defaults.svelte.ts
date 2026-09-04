/**
 * jixoai chart family Defaults
 * (registry/files/ui/chart/chart-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The chart family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `ChartDefaults` object whose slots cover every
 * vocabulary-hit style prop across the family's five components —
 *   - variant: the LITERAL family (own 'fill'), deliberately NOT a
 *     paint axis slot: the chart is absent from the variant
 *     grammar's frozen availability table (the ink's prominence
 *     rung through the global hue slots is the family's own
 *     vocabulary), and a paint family must be frozen before it
 *     ships a paint slot. Resolves `explicit ?? own`, never reads
 *     context; a future table freeze promotes this slot the kbd
 *     convention (table row → definePaintSlot). The values tuple IS
 *     the union (slot-values-first D2); chart.svelte's module script
 *     re-exports it so the public surface keeps its shape.
 *   - density: the no-opinion axis slot. The chart ensemble
 *     (chart.svelte) is the family's density PROVIDER — it resolves
 *     the policy once (the r11 eager-capture provider form) and
 *     stamps data-density so glyph ensembles adopt one tier; the
 *     glyphs themselves carry NO own.
 *   - size: the literal family's OPEN form (defineOpenSlot, own 96 —
 *     the donut's default outer diameter in px): a free numeric
 *     length, no closed union to enumerate and no axis (the design
 *     table's size-class note — the explicit type argument is the
 *     only enforcement face; a future size axis would first have to
 *     close the union).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot, defineOpenSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/** the ink's prominence rung through the global hue slots */
export const chartVariantSlot = defineLiteralSlot(['fill', 'tonal', 'outline'], 'fill');
export type ChartVariant = ReturnType<typeof chartVariantSlot>;

/** the donut's default outer diameter in px — a free numeric length
 *  on the OPEN literal form (no closed union to enumerate; the
 *  explicit type argument is the only enforcement face) */
export const chartSizeSlot = defineOpenSlot<number>(96);

export const ChartDefaults = defineComponentDefaults({
  variant: chartVariantSlot,
  density: densitySlot(),
  size: chartSizeSlot,
});
