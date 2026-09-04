// inline-code — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types (INLINE_LANGS,
// detectInlineLang, InlineCodeVariant). No logic lives here.
export { default } from './inline-code.svelte';
export * from './inline-code.svelte';
export { InlineCodeDefaults, type InlineCodeVariant } from './inline-code-defaults.svelte';
