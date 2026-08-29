import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), ...jixoai()],
});
