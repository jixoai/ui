/**
 * jixoai tabs family Defaults
 * (registry/files/ui/tabs/tabs-defaults.svelte.ts,
 * context-defaults-economy task 3.3, 2026-09-03).
 *
 * The tabs family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `TabsDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - density: the universal §4 axis slot (W3-D3 — the legacy
 *     densitySlot semantics ride the bridged lane), NO own. The tabs
 *     root is a STRUCTURAL provider (the shared selection state)
 *     whose density lane is inherit-then-provide by the frozen
 *     provider duties (r11 first contract — the eager capture in
 *     tabs.svelte feeds provideDensity; the legacy read stays
 *     confined there): no provider and no explicit prop resolve
 *     'auto', stamp nothing, and the ambient css scope channel keeps
 *     flowing (fleet law) — the tablist strip and panels ride the
 *     surrounding tier together.
 *   - the seven other universal axes (§0/§11, W3-D3, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the root div is the family's own DOM root; the indicator
 *     machinery (the sliding bar, the veils, the chevrons) stays
 *     untouched by the migration, the parts ride the supply chain.
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

export const TabsDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
