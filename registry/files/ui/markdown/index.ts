// markdown — pure barrel (tw4-css-modularization D3): default =
// the canonical main; MarkdownNode as the named default (the override
// delegation seam); export * carries parse.ts's adapter + node types.
// No logic lives here.
export { default } from './markdown.svelte';
export { default as MarkdownNode } from './markdown-node.svelte';
export * from './parse';
