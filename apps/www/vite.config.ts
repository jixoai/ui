import { sveltekit } from '@sveltejs/kit/vite';
import { jixoaiGhostty } from '@jixoai/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), ...jixoaiGhostty()],
});
