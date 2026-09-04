/*
  Test config for @jixoai/www (2026-08-20).

  The site is a SvelteKit app, but the components under test are plain
  Svelte 5 files with zero SvelteKit runtime imports — so the runner uses
  the bare svelte plugin + a $lib alias instead of the sveltekit() plugin
  (no virtual $app modules are involved in the form family).

  jsdom lacks the Popover API, ToggleEvent and scrollIntoView that the
  select/combobox/tags/date family orchestrates on; test/setup.ts
  polyfills exactly that surface.
*/
import { fileURLToPath } from 'node:url';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess({ script: true }) })],
  // test/llms-txt*.spec.ts imports the canonical generator straight from
  // the REPO root's registry/files/ (same-source law — no copy); that
  // directory must be served for the import to resolve.
  server: {
    fs: {
      allow: [fileURLToPath(new URL('../../', import.meta.url))],
    },
  },
  resolve: {
    // Svelte 5: without the browser condition vite resolves the server
    // runtime (index-server.js) where mount() is unavailable
    conditions: ['browser'],
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      // components reading the SvelteKit page state get a static URL —
      // the filter behavior under test does not navigate
      '$app/state': fileURLToPath(new URL('./test/mocks/app-state.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    typecheck: {
      checker: 'tsc',
      include: ['test/**/*.spec-d.ts'],
      // 1.0 carrier scope: assert the FIXTURE files' types only — the
      // codebase's ~693 pre-existing source errors are not this gate's
      // duty (surfaced 2026-09-03, first-ever repo typecheck).
      ignoreSourceErrors: true,
    },
  },
});
