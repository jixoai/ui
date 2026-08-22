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
      // '/blueprints.html' is the satori render farm (internal, noindex) —
      // keep it last so the docs pages stay the diff-noise-free prefix.
      entries: ['/', '/components/overview.html', '/components/dialog.html', '/components/popover.html', '/components/form.html', '/components/website-scaffold.html', '/components/scaffold-float.html', '/components/card-grid.html', '/components/section-card.html', '/components/code-card.html', '/components/table.html', '/components/tree-view.html', '/components/component-canvas.html', '/components/press-button.html', '/components/theme-toggle.html', '/components/language-switcher.html', '/components/terminal-card.html', '/components/terminal-header.html', '/components/terminal-footer.html', '/components/hero-section.html', '/components/badge.html', '/components/separator.html', '/components/skeleton.html', '/components/avatar.html', '/components/alert.html', '/components/accordion.html', '/components/tabs.html', '/components/progress.html', '/components/tooltip.html', '/components/pagination.html', '/components/dropdown-menu.html', '/components/toc.html', '/components/breadcrumb.html', '/components/kbd.html', '/components/toast.html', '/components/alert-dialog.html', '/components/sheet.html', '/components/hover-card.html', '/components/command.html', '/components/input-otp.html', '/components/toggle-group.html', '/components/carousel.html', '/components/navigation-menu.html', '/components/menubar.html', '/components/recipes.html', '/components/popconfirm.html', '/components/empty.html', '/components/descriptions.html', '/components/steps.html', '/components/spin.html', '/components/statistic.html', '/components/timeline.html', '/components/result.html', '/components/transfer.html', '/components/cascader.html', '/components/image.html', '/components/float-button.html', '/components/badge-indicator.html', '/components/anchor.html', '/components/tour.html', '/tokens.html', '/blueprints.html'],
    },
  },
};

export default config;
