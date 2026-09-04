// anchor — pure barrel (composition-first, 2026-08-25; tabs law):
// default = the canonical main (the nav root); sub-parts as named
// defaults; export * carries module-level named exports/types (the
// AnchorApi context surface + ANCHOR_KEY). No logic lives here.
export { default } from './anchor.svelte';
export * from './anchor.svelte';
export { default as AnchorItem } from './anchor-item.svelte';
export * from './anchor-item.svelte';
export { AnchorDefaults } from './anchor-defaults.svelte';
