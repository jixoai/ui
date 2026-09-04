// toggle-group — pure barrel (tabs precedent): default = the canonical
// main; sub-parts as named defaults; export * carries module-level
// named exports/types. No logic lives here.
export { default } from './toggle-group.svelte';
export * from './toggle-group.svelte';
export { default as ToggleGroupItem } from './toggle-group-item.svelte';
export * from './toggle-group-item.svelte';
export { ToggleGroupDefaults } from './toggle-group-defaults.svelte';
