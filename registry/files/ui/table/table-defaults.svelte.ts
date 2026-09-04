/**
 * jixoai table family Defaults
 * (registry/files/ui/table/table-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The table family's SINGLE declared ambient contract (design.md
 * Defaults 定位 + 轴槽's named family-own migration): one
 * `TableDefaults` object whose slots cover every vocabulary-hit style
 * prop —
 *   - density: the axis slot WITH the family own 'sm' — the design
 *     table's named local-fallback migration (the retired inline
 *     `resolveDensity(density, inherited, 'sm')` third argument):
 *     a table with NO explicit prop and NO enclosing provider resolves
 *     'sm' (dense tabular rows are the table's declared posture), an
 *     inherited provider still wins, and the slot wraps resolveDensity's
 *     full semantics (plugin chain included). The root remains a
 *     STRUCTURAL provider for its consumer-authored cells by the frozen
 *     provider duties (the eager capture in table.svelte feeds
 *     provideDensity; the legacy read stays confined there).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const TableDefaults = defineComponentDefaults({
  density: densitySlot('sm'),
});
