// component-canvas — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
// The dock (canvas-playground.svelte) and the schema kernel
// (canvas-schema.svelte.ts) joined with canvas-playground-dock
// (2026-09-08); the kernel's names flow through component-canvas.svelte's
// own star re-export, so the surface is additive only.
export { default } from './component-canvas.svelte';
export * from './component-canvas.svelte';
export { default as CanvasPlayground } from './canvas-playground.svelte';
export * from './canvas-playground.svelte';
