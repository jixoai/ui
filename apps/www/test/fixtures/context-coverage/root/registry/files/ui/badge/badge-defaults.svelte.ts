// SYNTHETIC GATE FIXTURE — A4 counterexample half: the values tuple
// includes 'link' (extra vs the frozen row [fill, tonal, outline]).
// Designed to FAIL verify-context-coverage.
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';

export const badgeVariantSlot = definePaintSlot(['fill', 'tonal', 'outline', 'link'], 'tonal');

export const BadgeDefaults = defineComponentDefaults({
  variant: badgeVariantSlot,
});
