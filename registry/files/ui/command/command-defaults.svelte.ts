/**
 * jixoai command family Defaults
 * (registry/files/ui/command/command-defaults.svelte.ts,
 * context-defaults-economy task 3.2, 2026-09-03).
 *
 * The command family's SINGLE declared ambient contract: one
 * `CommandDefaults` object whose slots cover every vocabulary-hit
 * style prop —
 *   - variant: class b, the dialog/sheet exemplar's twin — the
 *     floating-surface paint has a declared own ('auto') and NO axis
 *     yet, so the slot is a defineLiteralSlot, values tuple first
 *     (kbd mode, r11: command is absent from the variant grammar's
 *     frozen availability table; a table row promotes this slot to a
 *     paint slot with the values carrier).
 *   - density: the no-opinion axis slot AT THE CONTRACT — the family
 *     is a density PROVIDER (inherit-then-provide, the button-group
 *     lane; the CommandApi state context keeps exposing the resolved
 *     value unchanged), so the root resolves its own stamp through
 *     this slot ON TOP of the provider lane (the slot's ambient read
 *     resolves to the root's own write, whose getter is the
 *     eager-captured parent resolution — the chain terminates; see
 *     command.svelte), and the sub-parts (Input/List/Empty/Group/
 *     Item) resolve their re-stamps through the SAME contract (the
 *     family Defaults is the single read point).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (the values tuple IS the union; command.svelte's Props and this
 * contract share it).
 */
export const commandSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type CommandSurfaceVariant = ReturnType<typeof commandSurfaceVariantSlot>;

export const CommandDefaults = defineComponentDefaults({
  variant: commandSurfaceVariantSlot,
  density: densitySlot(),
});
