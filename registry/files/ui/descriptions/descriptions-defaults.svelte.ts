/**
 * jixoai descriptions family Defaults
 * (registry/files/ui/descriptions/descriptions-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The descriptions family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `DescriptionsDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - bordered: the LITERAL family's boolean form (own false, values
 *     [false, true] — booleans are a closed domain, so they take the
 *     values form; kbd mode, r11 #6): the hairline frame is a
 *     declared grammar value with no axis — the slot resolves
 *     `explicit ?? false` and never reads context; auditable today,
 *     promotable when an axis opens.
 *   - density: the universal §4 axis slot (W3-D1 — the legacy
 *     densitySlot semantics ride the bridged lane). The dl grid
 *     carries NO density own: no provider and no explicit prop
 *     resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-D1, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the enterprise detail grid is flat content; the supply chain
 *     is the point.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
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

/** the hairline frame — a closed boolean domain (values form) */
export const descriptionsBorderedSlot = defineLiteralSlot([false, true], false);

export const DescriptionsDefaults = defineComponentDefaults({
  bordered: descriptionsBorderedSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
