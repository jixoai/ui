/**
 * jixoai pattern-login family Defaults — FIRST-TIME contract
 * (registry/files/ui/pattern-login/pattern-login-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The `ssh user@host` login card's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN: a composition product (Input owns the
 * lanes, PressButton the submit), so the card carries no paint
 * opinions of its own — the size axis scales the card root and the
 * children's axis surfaces ride the ambient chain (§11 吃也供:
 * explicit ?? ambient ?? own, 'auto' everywhere absent an opinion).
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

export const PatternLoginDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
