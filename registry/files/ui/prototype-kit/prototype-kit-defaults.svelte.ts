/**
 * jixoai prototype-kit family Defaults — FIRST-TIME contract
 * (registry/files/ui/prototype-kit/prototype-kit-defaults.svelte.ts,
 * explicit-props W3 batch D2 / task 3.4, 2026-09-21).
 *
 * The design-studio prototype standard's SINGLE declared ambient
 * contract — all eight axes, ALL NO-OWN, carried by the CANVAS root
 * (prototype-canvas.svelte — the family's one container face). The
 * ENGINE half (PrototypePage/PrototypeComponent frames, frame-view,
 * the URL contract) is documented OUTSIDE the supply set: a frame's
 * content is a SEPARATE iframe document — neither the CSS carriers
 * nor the Svelte context chain cross the frame boundary, and the
 * frames' `theme` prop is the FRAMED document's environment channel
 * (the context round-2 no-style/passthrough exemptions, untouched).
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

export const PrototypeKitDefaults = defineComponentDefaults({
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
