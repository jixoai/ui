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
import { canvasPlugin, jixoai } from '@jixoai/ui-vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    svelte({ preprocess: vitePreprocess({ script: true }) }),
    // canvasPlugin (typography-context-and-parts §7): test/canvas-same-
    // source.spec.ts reads the pilot pages' virtual canvas modules
    // THROUGH the real pipeline. STANDALONE on purpose (design F3) —
    // the jixoai() umbrella defaults ghostty on, and a vitest wiring
    // must never drag wasm resolution into the suite.
    canvasPlugin(),
    // the stylex engine, tailwindless-site (2026-09-17, Wave 1 batch 3):
    // family atom modules (<fam>.stylex.ts) import @stylexjs/stylex,
    // which throws at runtime unless the babel transform compiles it —
    // the same kernel scope + pins the dev vite.config rides, wired as
    // the stylex-ONLY umbrella face (ghostty/icons/spinners off — the
    // standalone law above holds: no wasm, no icon graph in tests).
    ...jixoai({
      ghostty: false,
      icons: false,
      spinners: false,
      stylex: {
        include: [
          fileURLToPath(new URL('./src/lib', import.meta.url)),
          fileURLToPath(new URL('../../registry/files', import.meta.url)),
        ],
      },
    }),
  ],
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
      // same-source specs import registry-tree source (the math
      // modules under registry/files/**); since the W1 tailwindless
      // migration those graphs carry .stylex.ts modules whose COMPILED
      // dev output imports @stylexjs/stylex/lib/stylex-inject —
      // unresolvable by node_modules walk from the registry tree (the
      // repo root hoists nothing), and a bare package alias would
      // bypass the exports map (the subpath is virtual). One EXACT
      // alias pins the dev runtime to the www install's real file for
      // BOTH trees (tailwindless W1 batch 2, 2026-09-17)
      '@stylexjs/stylex/lib/stylex-inject': fileURLToPath(
        new URL('./node_modules/@stylexjs/stylex/lib/es/inject.mjs', import.meta.url),
      ),
      // the compiled output keeps the (now unused) namespace import of
      // the engine itself — same registry-tree walk problem, same fix
      '@stylexjs/stylex': fileURLToPath(
        new URL('./node_modules/@stylexjs/stylex/lib/es/stylex.mjs', import.meta.url),
      ),
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
