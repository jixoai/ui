// pattern-hero-set — pure barrel (folder law): default = the canonical
// main (the terminal-window hero); the ascii and marquee variants as
// named defaults; export * carries module-level named exports/types.
// No logic lives here.
export { default } from './pattern-hero-set.svelte';
export * from './pattern-hero-set.svelte';
export { default as PatternHeroAscii } from './pattern-hero-ascii.svelte';
export * from './pattern-hero-ascii.svelte';
export { default as PatternHeroMarquee } from './pattern-hero-marquee.svelte';
export * from './pattern-hero-marquee.svelte';
