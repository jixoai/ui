// SYNTHETIC GATE FIXTURE — the LEGAL table defaults shape (the family
// fallback migrates into the slot's own argument: densitySlot('sm')).
// The A3 violations live in table.svelte's out-of-subtree reads.
import { defineComponentDefaults } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const TableDefaults = defineComponentDefaults({
  density: densitySlot('sm'),
});
