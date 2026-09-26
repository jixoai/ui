/**
 * jixoai select family Defaults
 * (registry/files/ui/select/select-defaults.svelte.ts,
 * context-defaults-economy task 3.1, 2026-09-03).
 *
 * The select family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `SelectDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - variant: the LITERAL family (own 'auto', kbd mode, r11 #6 — the
 *     dialog/sheet precedent): the floating-surface paint has a
 *     declared own and NO axis yet, so the slot resolves
 *     `explicit ?? 'auto'` and never reads context; a surface axis
 *     opening promotes it. The union rides the slot's values tuple
 *     here rather than being imported into the component's Props
 *     because select's props interface feeds the GENERATED meta chain
 *     (component-metadata-gen
 *     → props-table-meta-drift), whose ambient-column extension is the
 *     doc batch's 先破再立 (task 4.3) — both spellings are pinned
 *     identical by the family spec.
 *   - density: the universal §4 axis slot (W3-D3 — the legacy
 *     densitySlot semantics ride the bridged lane). The custom
 *     listbox carries NO density own: no provider and no explicit
 *     prop resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-D3): size · shape ·
 *     radius · color · theme · motion all no-own — the trigger
 *     surface (the .jx-field scaffold) and the PORTALED listbox
 *     panel both carry the resolved lanes (the batch C portal law:
 *     the panel stamps its own carriers, self-carried across the
 *     top-layer promotion); elevation carries the family own
 *     level2 — the anchored panel's historic z-feel (3dp, M3's menu
 *     rung — the dropdown-menu/popover law, batch C).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
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

export const selectSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * for the contract (select.svelte's inline Props union is pinned
 * identical; the meta-chain constraint note is above). ReturnType 反查 —
 * the slot's values tuple is the union's source.
 */
export type SelectSurfaceVariant = ReturnType<typeof selectSurfaceVariantSlot>;

export const SelectDefaults = defineComponentDefaults({
  variant: selectSurfaceVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot('level2'),
  motion: motionAxisSlot(),
});
