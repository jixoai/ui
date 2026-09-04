// pagination — pure barrel (composition-first, 2026-08-25; tabs law):
// default = the canonical main (the nav root); sub-parts as named
// defaults; export * carries module-level named exports/types (the
// pageRange helper rides the barrel through pagination-range). No
// logic lives here.
export { default } from './pagination.svelte';
export * from './pagination.svelte';
export { default as PaginationContent } from './pagination-content.svelte';
export * from './pagination-content.svelte';
export { default as PaginationItem } from './pagination-item.svelte';
export * from './pagination-item.svelte';
export { default as PaginationLink } from './pagination-link.svelte';
export * from './pagination-link.svelte';
export { default as PaginationPrevious } from './pagination-previous.svelte';
export * from './pagination-previous.svelte';
export { default as PaginationNext } from './pagination-next.svelte';
export * from './pagination-next.svelte';
export { default as PaginationEllipsis } from './pagination-ellipsis.svelte';
export * from './pagination-ellipsis.svelte';
export * from './pagination-range';
export { PaginationDefaults } from './pagination-defaults.svelte';
