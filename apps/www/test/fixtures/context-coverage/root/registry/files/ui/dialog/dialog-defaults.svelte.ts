// SYNTHETIC GATE FIXTURE — A2 counterexample: a factory with no values
// tuple to infer from carries NO explicit type arguments (the =never
// default is the compile-time second lock; the AST face catches
// absentSlot and defineOpenSlot in this shape — literal/paint slots
// retired from this assertion face: their values inference replaces
// it). Designed to FAIL verify-context-coverage.
import { defineComponentDefaults, absentSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const DialogDefaults = defineComponentDefaults({
  variant: absentSlot(),
  density: densitySlot(),
});
