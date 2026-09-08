// button-bar — pure barrel (tabs precedent): default = the canonical
// main; export * carries module-level named exports/types. No logic
// lives here.
export { default } from './button-bar.svelte';
export * from './button-bar.svelte';
export { ButtonBarDefaults, type ButtonBarVariant } from './button-bar-defaults.svelte';
