// vite.config.ts — d3/tw-baseline: the TW4-today consumer wiring.
// The ENTIRE styling-engine wiring is this one plugin line + the one
// css import in src/main.ts (src/app.css: @import 'tailwindcss' chain).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
});
