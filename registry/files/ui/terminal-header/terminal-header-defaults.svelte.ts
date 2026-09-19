/**
 * jixoai terminal-header family Defaults
 * (registry/files/ui/terminal-header/terminal-header-defaults.svelte.ts,
 * context-defaults round 2, 2026-09-19).
 *
 * The family's SINGLE declared ambient contract: one
 * `TerminalHeaderDefaults` object whose slots cover every
 * vocabulary-hit style prop —
 *   - theme: the LITERAL family (own 'dark' — the bezel law, Owner
 *     2026-08-21: the bar is a CRT locked dark by default;
 *     theme='light' | 'system' unlocks). It is a literal slot, not a
 *     paint axis: the vocabulary names the SHELL, never a prominence
 *     rung; if a theme axis ever opens the slot promotes without any
 *     call-site change. The type derives from the slot's values
 *     tuple (ReturnType 反查) and the shared resolution lives in
 *     lib/terminal-scope.svelte.ts (one law, one implementation).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';

export const terminalHeaderThemeSlot = defineLiteralSlot(['dark', 'light', 'system'], 'dark');

/**
 * The bezel theme lock — dark (the named default: the CRT shell),
 * light (the light shell opt-in), system (follow the OS preference
 * live). ReturnType 反查 — the slot's values tuple is the union's
 * source; structurally identical to lib/terminal-scope's
 * TerminalTheme by construction (the tuple IS the vocabulary).
 */
export type TerminalHeaderTheme = ReturnType<typeof terminalHeaderThemeSlot>;

export const TerminalHeaderDefaults = defineComponentDefaults({
  theme: terminalHeaderThemeSlot,
});
