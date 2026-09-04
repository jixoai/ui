// menubar — pure barrel (tabs precedent): default = the canonical
// main; sub-parts as named defaults; export * carries module-level
// named exports/types. No logic lives here.
export { default } from './menubar.svelte';
export * from './menubar.svelte';
export { default as MenubarItem } from './menubar-item.svelte';
export * from './menubar-item.svelte';
export { default as MenubarTrigger } from './menubar-trigger.svelte';
export * from './menubar-trigger.svelte';
export { default as MenubarPanel } from './menubar-panel.svelte';
export * from './menubar-panel.svelte';
export { default as MenubarMenuItem } from './menubar-menu-item.svelte';
export * from './menubar-menu-item.svelte';
export { MenubarDefaults, type MenubarSurfaceVariant } from './menubar-defaults.svelte';
