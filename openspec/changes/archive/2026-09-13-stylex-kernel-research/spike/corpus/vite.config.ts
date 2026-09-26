// vite.config.ts — spike/corpus: the frozen 8-family re-authoring lab
// (L3b). Pure vite+svelte — NOT SvelteKit: the corpus measures
// AUTHORING ergonomics (D5), not delivery; SSG/prerender/no-JS facts
// are spike/ssg's job (already PASS). A hash-routed SPA keeps one
// entry, one mount, 8 route pages, zero kit dependency surface.
//
// Toolchain: byte-equivalent to spike/minimal's proven config (the
// L3a conclusions are REUSED, not re-derived): enforce:undefined
// spread, dev/runtimeInjection on serve, propertyValidationMode
// 'throw' (the silent-shorthand-drop guard), debug pinned BOTH modes
// (D1-06 contract), CSS entry mandatory (§5.2 finding).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import stylex from '@stylexjs/unplugin';

export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    {
      ...stylex.vite({
        debug: true,
        propertyValidationMode: 'throw',
        dev: command === 'serve',
        runtimeInjection: command === 'serve',
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: process.cwd(),
        },
      }),
      enforce: undefined,
    },
  ],
}));
