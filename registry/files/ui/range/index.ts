// range — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
export { default } from './range.svelte';
export { default as RangeTick } from './range-tick.svelte';
export * from './range.svelte';
