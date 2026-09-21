/**
 * jixoai mermaid family Defaults
 * (registry/files/ui/mermaid/mermaid-defaults.svelte.ts,
 * context-defaults round 2, 2026-09-19).
 *
 * The family's SINGLE declared ambient contract: one
 * `MermaidDefaults` object whose slots cover every vocabulary-hit
 * style prop —
 *   - theme: the LITERAL family (own 'auto'): the diagram resolves
 *     its tokens against the figure's ENTIRE effective scope (a
 *     .jx-light canvas stage, a dark panel — never the page's frozen
 *     root), so 'auto' IS the meaningful default and the explicit
 *     'light' | 'dark' are opt-outs. The tuple mirrors
 *     lib/mermaid-engine's MermaidThemeMode (the values are the one
 *     source there; the slot re-states them as its own contract —
 *     Props ⊆ values is compile-checked at the resolve call site).
 *     W3-D2: the theme AXIS is left out — this engine-token literal
 *     owns the name ('system' has no engine meaning, and the pin
 *     semantics are engine-internal, never the axis' .dark class
 *     bridge; the code-card / terminal bezel precedent, §13 rules no
 *     rename). SEVEN axis lanes join below.
 *   - density · size · shape · radius · color · elevation · motion
 *     (W3-D2): the universal axes, all no-own — the axis surface
 *     rides the family's OWN figure root; the diagram ENGINE (the
 *     rendered SVG) is outside the supply set.
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
import type { MermaidThemeMode } from '$lib/mermaid-engine';

export const mermaidThemeSlot = defineLiteralSlot(['auto', 'light', 'dark'], 'auto');

/**
 * The diagram theme mode — auto (resolve against the figure's
 * effective scope), light, dark. ReturnType 反查 — the slot's values
 * tuple is the union's source; structurally identical to
 * mermaid-engine's MermaidThemeMode by construction.
 */
export type MermaidTheme = ReturnType<typeof mermaidThemeSlot>;

export const MermaidDefaults = defineComponentDefaults({
  theme: mermaidThemeSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
