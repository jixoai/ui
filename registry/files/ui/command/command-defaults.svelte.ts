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
 *   - density: the universal §4 axis slot AT THE CONTRACT (W3-D1 —
 *     the legacy densitySlot semantics ride the bridged lane) — the
 *     family is a density PROVIDER (inherit-then-provide, the
 *     button-group lane; the CommandApi state context keeps exposing
 *     the resolved value unchanged), so the root resolves its own
 *     stamp through this slot ON TOP of the provider lane (the
 *     slot's ambient read resolves to the root's own write, whose
 *     getter is the eager-captured parent resolution — the chain
 *     terminates; see command.svelte), and the sub-parts (Input/
 *     List/Empty/Group/Item) resolve their re-stamps through the
 *     SAME contract (the family Defaults is the single read point).
 *   - the seven other universal axes (§0/§11, W3-D1): size · shape ·
 *     radius · color · theme · motion all no-own; elevation carries
 *     the palette's OWN level4 (8dp, the modal rung — the batch C
 *     dialog law: the palette is a native showModal() dialog, the
 *     same z-feel as its Dialog twin).
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
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
  themeAxisSlot,
} from '$lib/defaults.svelte';

/**
 * The floating-surface paint variant — the family grammar, single-sourced
 * here (the values tuple IS the union; command.svelte's Props and this
 * contract share it).
 */
export const commandSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
export type CommandSurfaceVariant = ReturnType<typeof commandSurfaceVariantSlot>;

export const CommandDefaults = defineComponentDefaults({
  variant: commandSurfaceVariantSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  // the palette is a MODAL (the native <dialog> twin): own level4 =
  // the modal rung's historic z-feel (8dp), the batch C dialog law
  elevation: elevationAxisSlot('level4'),
  motion: motionAxisSlot(),
});
