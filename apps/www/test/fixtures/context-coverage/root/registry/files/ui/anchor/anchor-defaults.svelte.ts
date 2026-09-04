// SYNTHETIC GATE FIXTURE — the LEGAL anchor defaults shape
// (slot-values-first: a named exported slot constant wired by
// reference — the A2 one-hop resolution target; the A3 violation
// lives in anchor.svelte's bare-statement call). Designed to PASS
// its own slot checks.
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';

export const anchorVariantSlot = defineLiteralSlot(['tonal', 'outline'], 'tonal');

export const AnchorDefaults = defineComponentDefaults({
  variant: anchorVariantSlot,
});
