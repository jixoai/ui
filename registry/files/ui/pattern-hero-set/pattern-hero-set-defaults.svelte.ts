/**
 * jixoai pattern-hero-set family Defaults — FIRST-TIME contract
 * (registry/files/ui/pattern-hero-set/pattern-hero-set-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The terminal-window hero set's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN. The set's canonical main renders no
 * root of its own (HeroSection owns the DOM; TerminalCard the
 * bezel), so the contract exists for the supply chain (§11 吃也供) —
 * the resolved lanes flow to the composed children through the
 * ambient chain, and the size axis scales the HeroSection root the
 * children render. The two hero siblings (ascii, marquee) own their
 * section roots and stamp the carriers directly.
 *
 * UNRULED COLLISION on the CANONICAL MAIN, left out per the
 * no-improvisation law: pattern-hero-set.svelte's `theme` prop is
 * the terminal bezel pin forwarded VERBATIM to TerminalCard
 * (dark-locked shell-theme literal, the context round-2 passthrough
 * exemption) — not the axis' ambient-first law; §13 rules no rename,
 * so the MAIN carries seven lanes (the theme axis forwards ambient)
 * while the theme-less siblings carry the axis whole.
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

export const PatternHeroSetDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
