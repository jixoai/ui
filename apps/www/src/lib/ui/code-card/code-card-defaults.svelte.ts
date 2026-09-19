/**
 * jixoai code-card family Defaults
 * (registry/files/ui/code-card/code-card-defaults.svelte.ts,
 * context-defaults round 2, 2026-09-19).
 *
 * The family's SINGLE declared ambient contract: one
 * `CodeCardDefaults` object whose slots cover every vocabulary-hit
 * style prop —
 *   - theme: the OPEN scalar family (own 'jixoai' — the
 *     zero-download css-variables theme). defineOpenSlot, not a
 *     literal slot: the shiki theme vocabulary is OPEN (any theme
 *     registered in lib/shiki rides; non-shiki backends map it into
 *     their own vocabulary) — no closed union exists to enumerate,
 *     so the explicit type argument carries the domain (the
 *     absentSlot discipline's open cousin).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is a
 * member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineOpenSlot } from '$lib/defaults.svelte';

export const codeCardThemeSlot = defineOpenSlot<string>('jixoai');

export const CodeCardDefaults = defineComponentDefaults({
  theme: codeCardThemeSlot,
});
