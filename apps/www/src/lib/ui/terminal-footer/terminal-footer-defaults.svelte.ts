/**
 * jixoai terminal-footer family Defaults — FIRST-TIME contract
 * (registry/files/ui/terminal-footer/terminal-footer-defaults.svelte.ts,
 * explicit-props W3 batch C / task 3.3, 2026-09-21).
 *
 * The footer's SINGLE declared ambient contract — all eight axes,
 * ALL NO-OWN: the footer is FLAT page chrome (the ghost wordmark's
 * text-stroke recipe paints nothing a rung could step), so it
 * carries no surface opinions — the contract exists for the supply
 * chain (§11 吃也供): explicit ?? ambient ?? own, 'auto' everywhere
 * absent an opinion. NOTE the family split: unlike the terminal
 * bezel twins (header/card, whose shell-theme literal owns the
 * `theme` name), the footer carries NO theme literal — the theme
 * axis joins WHOLE here.
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

export const TerminalFooterDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
