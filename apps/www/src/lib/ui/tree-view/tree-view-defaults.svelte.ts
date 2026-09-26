/**
 * jixoai tree-view family Defaults — FIRST-TIME contract
 * (registry/files/ui/tree-view/tree-view-defaults.svelte.ts,
 * explicit-props W3 batch D3 / task 3.4, 2026-09-21).
 *
 * The ARIA tree's SINGLE declared ambient contract — all eight axes,
 * ALL NO-OWN: the family's own DOM root is the ul[role=tree] (the
 * multiselect sibling composes it and forwards verbatim — the
 * composition law); the rows, carets and language dots are family
 * internals documented outside the supply set, riding the root's
 * ambient chain (§11 吃也供). The size axis scales the tree root (a
 * dense file tree at size={12} is the use case).
 *
 * 惰性律: construction captures own only (here: nothing); context
 * reads happen at resolve time inside the consumer's $derived window.
 * This file is a member of the registry:ui item (installs with the
 * family, byte mirrored, zero kernel imports).
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

export const TreeViewDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
