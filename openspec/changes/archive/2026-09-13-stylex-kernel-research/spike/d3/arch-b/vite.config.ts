// vite.config.ts — d3/arch-b: @jixoai/ui-vite-plugin absorbs the StyleX
// wiring (channel-collapse §3 column B). The consumer's ENTIRE stylex
// wiring is the ONE plugin line below (+ the one package in
// package.json). The plugin (packages-stub/jixoai-ui-vite-plugin)
// generates: the unplugin transform preset, the F9 layer statement,
// and the dev-HMR wiring — the arch-a hand-copies, none of which the
// consumer can get wrong here.
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import jixoaiUI from 'jixoai-ui-vite-plugin';

export default defineConfig({
  plugins: [svelte(), jixoaiUI()],
});
