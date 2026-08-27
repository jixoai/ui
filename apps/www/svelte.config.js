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
      entries: ['/', '/probe-folder-css', '/docs.html', '/docs/components.html', '/docs/components/accordion.html', '/docs/components/alert-dialog.html', '/docs/components/alert.html', '/docs/components/anchor.html', '/docs/components/avatar.html', '/docs/components/badge-indicator.html', '/docs/components/badge.html', '/docs/components/breadcrumb.html', '/docs/components/card-grid.html', '/docs/components/carousel.html', '/docs/components/cascader.html', '/docs/components/checkbox.html', '/docs/components/chip.html', '/docs/components/code-card.html', '/docs/components/color-picker.html', '/docs/components/combobox.html', '/docs/components/command.html', '/docs/components/component-canvas.html', '/docs/components/date-picker.html', '/docs/components/descriptions.html', '/docs/components/dialog.html', '/docs/components/dropdown-menu.html', '/docs/components/empty.html', '/docs/components/file-input.html', '/docs/components/float-button.html', '/docs/components/hero-section.html', '/docs/components/hover-card.html', '/docs/components/icon-button.html', '/docs/components/image.html', '/docs/components/inline-code.html', '/docs/components/input-otp.html', '/docs/components/input.html', '/docs/components/kbd.html', '/docs/components/language-switcher.html', '/docs/components/list-item.html', '/docs/components/menubar.html', '/docs/components/native-select.html', '/docs/components/navigation-menu.html', '/docs/components/number-input.html', '/docs/components/pagination.html', '/docs/components/popconfirm.html', '/docs/components/popover.html', '/docs/components/press-button.html', '/docs/components/progress.html', '/docs/components/progressive-blur.html', '/docs/components/radio.html', '/docs/components/range.html', '/docs/components/result.html', '/docs/components/scaffold-float.html', '/docs/components/scroll-area.html', '/docs/components/scroll-virtual.html', '/docs/components/section-card.html', '/docs/components/select.html', '/docs/components/separator.html', '/docs/components/sheet.html', '/docs/components/skeleton.html', '/docs/components/spin.html', '/docs/components/statistic.html', '/docs/components/steps.html', '/docs/components/table.html', '/docs/components/tabs.html', '/docs/components/tags-input.html', '/docs/components/form.html', '/docs/components/terminal-card.html', '/docs/components/terminal-footer.html', '/docs/components/terminal-header.html', '/docs/components/textarea.html', '/docs/components/theme-toggle.html', '/docs/components/timeline.html', '/docs/components/toast.html', '/docs/components/toc.html', '/docs/components/toggle-group.html', '/docs/components/toggle.html', '/docs/components/tooltip.html', '/docs/components/tour.html', '/docs/components/transfer.html', '/docs/components/tree-view.html', '/docs/components/website-scaffold.html', '/docs/registry.html', '/docs/recipes.html', '/docs/jx-pure.html', '/docs/variant-grammar.html', '/docs/llms-txt.html', '/tokens.html', '/parity.html', '/blueprints.html'],
    },
  },
};

export default config;
