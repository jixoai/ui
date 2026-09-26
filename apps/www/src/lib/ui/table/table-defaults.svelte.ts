/**
 * jixoai table family Defaults
 * (registry/files/ui/table/table-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The table family's SINGLE declared ambient contract (design.md
 * Defaults 定位 + 轴槽's named family-own migration): one
 * `TableDefaults` object whose slots cover every vocabulary-hit style
 * prop —
 *   - density: the universal §4 axis slot WITH the family own 'sm'
 *     (W3-D3 — the legacy densitySlot semantics ride the bridged
 *     lane) — the design table's named local-fallback migration (the
 *     retired inline `resolveDensity(density, inherited, 'sm')` third
 *     argument): a table with NO explicit prop and NO enclosing
 *     provider resolves 'sm' (dense tabular rows are the table's
 *     declared posture), an inherited provider still wins. The root
 *     remains a STRUCTURAL provider for its consumer-authored cells
 *     by the frozen provider duties (the eager capture in
 *     table.svelte feeds provideDensity; the legacy read stays
 *     confined there).
 *   - the seven other universal axes (§0/§11, W3-D3, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the frame is the family's own DOM root (the a11y semantics of
 *     the consumer-authored thead/tbody stay untouched); the
 *     consumer-authored cells ride the root's supply chain.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';

export const TableDefaults = defineComponentDefaults({
  density: densityAxisSlot('sm'),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
