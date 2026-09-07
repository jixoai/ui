// blockquote — pure barrel (tw4-css-modularization D3): default =
// the canonical main; sub-components as named defaults; export *
// carries module-level named exports/types. No logic lives here.
export { default } from './blockquote.svelte';
export * from './blockquote.svelte';
export {
  BlockquoteDefaults,
  type BlockquoteRule,
  type BlockquoteRuleSize,
  type BlockquoteVariant,
} from './blockquote-defaults.svelte';
