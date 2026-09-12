/*
  prototype-kit suite config (packages/design-tool/test/kit, 2026-09-11).

  Lives in the design-tool package (TRACKED lane) — registry/test/ is a
  gitignored dev-syncer lane, so a suite placed there never commits.
  STANDALONE on purpose — do not fold into registry/vitest.config.ts:
  the shared config imports { canvasPlugin } from
  '@jixoai/ui-vite-plugin', whose file: symlink currently resolves
  outside the repo (an out-of-repo husk with no package.json — the
  node_modules baseline this worktree inherited), so the shared config
  fails to LOAD. The prototype-kit suite needs no canvas plugin: the
  kit is dependency-free (svelte + $lib/utils only). Run with:

      cd packages/design-tool && \
        ../../../registry/node_modules/.bin/vitest run \
          --config test/kit/vitest.config.ts
*/
import { fileURLToPath } from 'node:url';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess({ script: true }) })],
  resolve: {
    // Svelte 5: mount() needs the browser runtime, not index-server.js
    conditions: ['browser'],
    // ordered, longest-prefix first: `$lib/ui/*` → the registry's ui
    // items (tree-view's own icon import), then the generic `$lib` →
    // the shared lib (the kit's cn())
    alias: [
      { find: '$lib/ui', replacement: fileURLToPath(new URL('../../../../registry/files/ui', import.meta.url)) },
      { find: '$lib', replacement: fileURLToPath(new URL('../../../../registry/files/lib', import.meta.url)) },
    ],
  },
  test: {
    environment: 'jsdom',
    // root = the WORKTREE root so the kit (registry/files/ui) resolves
    // inside the vite root (a package-local root kept the suite's
    // relative imports outside fs scope)
    root: fileURLToPath(new URL('../../../../', import.meta.url)),
    include: ['packages/design-tool/test/kit/**/*.spec.ts'],
    // @testing-library/svelte-core ships SOURCE (.svelte.js props) —
    // force it through the transform pipeline instead of the dep
    // shortcut; its raw $state otherwise throws rune_outside_svelte
    // at mount time (the registry-rooted suite never hit this because
    // its deps resolved through the root-local node_modules symlink)
    server: {
      deps: {
        inline: [/@testing-library/],
      },
    },
  },
});
