// SYNTHETIC GATE FIXTURE — the LEGAL defaults shape (task 1.4;
// slot-values-first task 2.4): the family contract as one object, a
// named exported paint slot constant (values tuple first, own second
// — the values ARE the family union), a no-opinion density slot.
// Designed to PASS verify-context-coverage. Not the real tool — the
// real registry/files/lib/defaults.svelte.ts is task 1.1 (parallel
// batch).
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';
import { densitySlot } from '$lib/density.svelte';

export const pressButtonVariantSlot = definePaintSlot(
  ['fill', 'tonal', 'outline', 'ghost', 'link'],
  'outline',
);

export const PressButtonDefaults = defineComponentDefaults({
  variant: pressButtonVariantSlot,
  density: densitySlot(),
});
