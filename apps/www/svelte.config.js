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
      entries: ['/', '/components/overview.html', '/components/dialog.html', '/components/popover.html', '/components/form.html', '/components/website-scaffold.html', '/components/scaffold-float.html', '/components/card-grid.html', '/components/section-card.html', '/components/code-card.html', '/components/table.html', '/components/tree-view.html', '/components/component-canvas.html', '/components/press-button.html', '/components/theme-toggle.html', '/components/language-switcher.html', '/components/terminal-card.html', '/components/terminal-header.html', '/components/terminal-footer.html', '/components/hero-section.html', '/components/badge.html', '/components/separator.html', '/components/skeleton.html', '/components/avatar.html', '/components/alert.html', '/components/accordion.html', '/components/tabs.html', '/tokens.html'],
    },
  },
};

export default config;
