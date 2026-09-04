// kbd — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
export { default } from './kbd.svelte';
export * from './kbd.svelte';
export { KbdDefaults, type KbdVariant } from './kbd-defaults.svelte';
