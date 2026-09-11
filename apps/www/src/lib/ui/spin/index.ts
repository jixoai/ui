// spin — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
// spin-ora-svg-lane C3 (2026-09-11): the text catalog is a FAMILY
// file (like spin-defaults) and rides the barrel; the generated
// artifact stays a DIRECT '$lib/spin-set.gen' import — the icon
// barrel precedent (artifacts never ride component barrels).
export { default } from './spin.svelte';
export * from './spin.svelte';
export { SpinDefaults } from './spin-defaults.svelte';
export * from './spin-catalog';
