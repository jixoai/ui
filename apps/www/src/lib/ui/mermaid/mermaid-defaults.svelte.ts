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
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
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
});
