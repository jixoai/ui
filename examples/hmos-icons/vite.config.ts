import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
// the umbrella entry carries the jixoai() factory; the channel rides
// its OWN sub-entry (the per-entry purity law)
import { jixoai } from '@jixoai/ui-vite-plugin';
import { hmos } from './src/lib/icons/hmos';

export default defineConfig({
  plugins: [
    svelte(),
    ...jixoai({
      icons: {
        library: {
          // lucide stays default-registered (includeDefaults); the
          // custom namespace joins it — everything below is opt-in by
          // this one array
          channels: [hmos()],
          // the config lane: a ref whose FILENAME carries a space —
          // legal in library.icons refs (only source scanning
          // requires space-free values)
          icons: { editGroup: 'hmos:ic_Edit Group_filled' },
          // write the generated artifact into the source tree (the
          // committed src/lib/icon-set.gen.ts); dev and build both
          // keep it fresh, so drift fails loudly instead of silently
          write: true,
        },
      },
    }),
  ],
  resolve: {
    // the icon registry item imports '$lib/icon-set.gen' (the
    // SvelteKit-shaped consumer contract); a plain vite app aliases
    // the same way shadcn-svelte consumers do
    alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) },
  },
  build: { target: 'esnext' },
});
