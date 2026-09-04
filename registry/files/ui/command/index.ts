// command — pure barrel (tabs precedent, composition-first-apis):
// default = the canonical main (the dialog shell); sub-parts as named
// defaults; export * carries module-level named exports/types. No
// logic lives here.
export { default } from './command.svelte';
export * from './command.svelte';
export { default as CommandInput } from './command-input.svelte';
export * from './command-input.svelte';
export { default as CommandList } from './command-list.svelte';
export * from './command-list.svelte';
export { default as CommandEmpty } from './command-empty.svelte';
export * from './command-empty.svelte';
export { default as CommandGroup } from './command-group.svelte';
export * from './command-group.svelte';
export { default as CommandItem } from './command-item.svelte';
export * from './command-item.svelte';
export { CommandDefaults, type CommandSurfaceVariant } from './command-defaults.svelte';
