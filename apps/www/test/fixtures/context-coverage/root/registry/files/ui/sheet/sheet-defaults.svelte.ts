// SYNTHETIC GATE FIXTURE — the LEGAL sheet defaults shape (the pilot
// ruling: density slot + surface variant as a values-first literal
// slot constant; no zone wiring). The A3 violation lives in
// sheet.svelte's legacy chain. Designed to PASS its own slot checks.
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';
import { densitySlot } from '$lib/density.svelte';

export const sheetSurfaceSlot = defineLiteralSlot(['solid', 'auto'], 'auto');

export const SheetDefaults = defineComponentDefaults({
  surface: sheetSurfaceSlot,
  density: densitySlot(),
});
