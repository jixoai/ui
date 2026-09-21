/**
 * jixoai breadcrumb family Defaults
 * (registry/files/ui/breadcrumb/breadcrumb-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The breadcrumb family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `BreadcrumbDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - density: the no-opinion axis slot. The trail carries NO density
 *     own: the root is a STRUCTURAL provider (inherit-then-provide by
 *     the frozen provider duties — the eager capture in
 *     breadcrumb.svelte feeds provideDensity; the legacy read stays
 *     confined there), the parts resolve their inherited stamp through
 *     this contract, and no opinion stamps nothing (fleet law) — the
 *     ambient css scope channel keeps flowing through the nav
 *     landmark's subtree.
 *   - size · shape · radius · color · theme · elevation · motion: the
 *     seven sibling axis members (explicit-props W3-D5, FIRST-TIME on
 *     this contract) — the trail root resolves the record and stamps
 *     the §10 carriers on the nav landmark; the parts (list, item,
 *     link, …) keep their ambient reads through this SAME contract
 *     (the one-contract-many-readers shape, each resolving the supply
 *     the root provides — 吃也供).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
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

export const BreadcrumbDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
