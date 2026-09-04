// tour — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
export { default } from './tour.svelte';
export * from './tour.svelte';
export { TourDefaults, type TourSurfaceVariant } from './tour-defaults.svelte';
