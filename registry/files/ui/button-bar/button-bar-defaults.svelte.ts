/**
 * jixoai button-bar family Defaults
 * (registry/files/ui/button-bar/button-bar-defaults.svelte.ts,
 * OpenSpec 2026-09-08-button-bar).
 *
 * The button-bar family's SINGLE declared ambient contract. The bar is
 * a STRUCTURAL zone provider (the free-floating action lane: the paint
 * zone with own ghost + the press texture zone with own flat + the
 * density provide), the button-group precedent's narrow consumer face:
 *   - variant: the paint axis slot over the ZONE value domain, own
 *     'ghost' — the lane's reason to exist (members fall to the
 *     ghost rung, the quietest interactive chrome: no border color,
 *     no wash). DECLARATION-FIRST like button-group's: the component
 *     resolves `variant ?? enclosing ?? 'ghost'` on its own provider
 *     lane; this slot's own is the frozen-availability mirror of that
 *     runtime own (both sides annotated against drift). fused is
 *     EXCLUDED — the button families (press-button/icon-button)
 *     carry no fused rung, and a zone writing fused would gate-fall
 *     back to each family's own (a silent no-op), so the four-value
 *     zone domain is the honest domain.
 *   - density: the no-opinion axis slot — the bar carries no own
 *     (explicit ?? inherited ?? undefined), resolving what it then
 *     PROVIDES to the subtree (the lane's members adopt the tier);
 *     no opinion stamps nothing (fleet law).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. Member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
 */
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';
import { definePaintSlot } from '$lib/paint.svelte';

/**
 * The family's literal spelling — the values tuple IS the union
 * (slot-values-first D1; four values: link is PressButton's
 * interaction exception and fused is outside the button families'
 * ladder — the component's variant prop is TYPED as this union, so a
 * lane varianting to either is a compile error, never a silent
 * runtime fallback).
 */
export const buttonBarVariantSlot = definePaintSlot(
  ['fill', 'tonal', 'outline', 'ghost'],
  'ghost',
);
export type ButtonBarVariant = ReturnType<typeof buttonBarVariantSlot>;

export const ButtonBarDefaults = defineComponentDefaults({
  variant: buttonBarVariantSlot,
  density: densitySlot(),
});
