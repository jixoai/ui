import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({ script: true }),
  kit: {
    adapter: adapter({ pages: 'dist', assets: 'dist', strict: true }),
    // Flat multi-page artifact (index.html / components.html / tokens.html):
    // links point at real files and the registry JSON is copied into public/
    // after the build, so there is nothing to crawl.
    prerender: {
      crawl: false,
      entries: ['/', '/components', '/tokens'],
    },
  },
};

export default config;
