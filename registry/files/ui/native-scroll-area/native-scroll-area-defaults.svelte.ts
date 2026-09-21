/**
 * jixoai native-scroll-area family Defaults — FIRST-TIME contract
 * (registry/files/ui/native-scroll-area/native-scroll-area-defaults.svelte.ts,
 * explicit-props W3 batch D5 / task 3.4, 2026-09-21).
 *
 * The platform-scrollbar region's SINGLE declared ambient contract —
 * all eight axes, ALL NO-OWN, the native-wrapper batch A rule: the
 * family owns ONLY the axis names it destructures on the OUTER root
 * (.jx-native-scroll-area); everything the viewport accepts keeps
 * forwarding through its own restProps spread (the consumer `style`
 * stays the viewport's channel — the carriers stamp the family root,
 * never the scrollport). No native size-like attribute collides with
 * the axis surface here (a div carries none; the scrollbar tiers ride
 * their own data-width hook). The size axis scales the region's
 * content; the scheme observer (the stage-scope alignment) is family
 * STATE and never reads an axis lane.
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

export const NativeScrollAreaDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
