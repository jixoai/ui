/**
 * jixoai statistic family Defaults
 * (registry/files/ui/statistic/statistic-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The statistic family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `StatisticDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - density: the universal §4 axis slot (W3-D3 — the legacy
 *     densitySlot semantics ride the bridged lane). The metric
 *     readout carries NO density own: no provider and no explicit
 *     prop resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law). The readout's type scale
 *     rides the density tokens through the scope channel, never a
 *     local fallback.
 *   - the seven other universal axes (§0/§11, W3-D3, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the metric readout is flat content; the size axis scales the
 *     root and the supply chain is the point.
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

export const StatisticDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
