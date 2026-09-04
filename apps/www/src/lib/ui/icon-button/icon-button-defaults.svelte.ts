/**
 * jixoai icon-button family Defaults
 * (registry/files/ui/icon-button/icon-button-defaults.svelte.ts,
 * context-defaults-economy task 2.1, 2026-09-03).
 *
 * The icon-button family's SINGLE declared ambient contract — the
 * X2-11 RESTATE decision (frozen): the button IS a press-button (the
 * composition ruling), so this contract restates the child's slots —
 * same value domain, same own, same density posture — keeping the
 * family's ambient capability visible and auditable at icon-button's
 * own face instead of hiding it inside press-button:
 *   - variant: the paint axis slot restating PressButtonDefaults'
 *     variant — own 'outline' (icon-button declares no variant of its
 *     own; its effective default has always been the child's frozen
 *     one, per the grammar's "IconButton forwards the new union (not
 *     a separate color decision)"), values = press-button's whole
 *     ladder including link (the interaction exception forwards
 *     verbatim). The component resolves here and passes the RESOLVED
 *     values down (the restate lane); the pilot reviews this form —
 *     X2-11's fallback is a documented exemption, only with evidence.
 *   - density: the no-opinion axis slot, restated — no own, undefined
 *     resolves unstamped (fleet law).
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
 * The restated ladder — press-button's whole five-value rung set as
 * the values tuple (slot-values-first D2: the tuple IS the family
 * union; the canonical union is lib/paint's PaintVariant, reaching
 * press-button as its re-exported alias). The availability assertion
 * checks it ⊆ PaintVariant and ≡ this family's frozen row.
 */
export const iconButtonVariantSlot = definePaintSlot(
  ['fill', 'tonal', 'outline', 'ghost', 'link'],
  'outline',
);
export type IconButtonVariant = ReturnType<typeof iconButtonVariantSlot>;

export const IconButtonDefaults = defineComponentDefaults({
  // the restate: the child's own, restated — never a local choice
  variant: iconButtonVariantSlot,
  density: densitySlot(),
});
