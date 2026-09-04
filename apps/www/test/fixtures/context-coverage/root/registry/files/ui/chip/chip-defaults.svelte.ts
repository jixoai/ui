// SYNTHETIC GATE FIXTURE — A2 counterexample ("a bare function sneaks
// into slots"): the slot value is an arrow function, not a branded
// factory product. Designed to FAIL the AST slot-legality check.
import { defineComponentDefaults } from '$lib/defaults.svelte';

export const ChipDefaults = defineComponentDefaults({
  variant: (v) => v ?? 'tonal',
});
