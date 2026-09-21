/**
 * jixoai terminal-card family Defaults
 * (registry/files/ui/terminal-card/terminal-card-defaults.svelte.ts,
 * context-defaults round 2, 2026-09-19).
 *
 * The family's SINGLE declared ambient contract: one
 * `TerminalCardDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - theme: the LITERAL family (own 'dark' — the bezel law, Owner
 *     2026-08-21: the Broadside hero terminal is dark-locked like
 *     the header; theme='light' | 'system' unlocks). A literal slot,
 *     not a paint axis, for the same reason as the header's: the
 *     vocabulary names the SHELL. Deliberately a SEPARATE slot
 *     constant from the header's — two families, two contracts; the
 *     shared vocabulary + resolution live in
 *     lib/terminal-scope.svelte.ts (one law, one implementation).
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
} from '$lib/defaults.svelte';

export const terminalCardThemeSlot = defineLiteralSlot(['dark', 'light', 'system'], 'dark');

/**
 * The bezel theme lock — dark (the named default: the CRT shell),
 * light (the light shell opt-in), system (follow the OS preference
 * live). ReturnType 反查 — the slot's values tuple is the union's
 * source.
 */
export type TerminalCardTheme = ReturnType<typeof terminalCardThemeSlot>;

export const TerminalCardDefaults = defineComponentDefaults({
  theme: terminalCardThemeSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  // W3-C: NO themeAxisSlot — the bezel theme literal owns the name
  // (the unruled-collision law, the ghostty-term precedent); the
  // theme axis forwards ambient, unadopted
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
