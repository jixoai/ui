// SYNTHETIC GATE FIXTURE — A2 boundary counterexample: defineAxisSlot
// (the lib-only cross-module construction protocol) imported and invoked
// from a ui-side family file. Designed to FAIL the lib-only boundary
// check. The slots themselves are legal. Never imported.
import { defineAxisSlot, defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';

export const tooltipToneSlot = defineLiteralSlot(['neutral', 'invert'], 'neutral');

// ILLEGAL: the registration entry exists only inside registry/files/lib/**
const fixtureAxis = defineAxisSlot('tooltip', (explicit, ambient) => explicit ?? ambient());

export const TooltipDefaults = defineComponentDefaults({
  tone: tooltipToneSlot,
});

export const _axisWitness = fixtureAxis;
