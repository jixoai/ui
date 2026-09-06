// @vitest-environment node
/**
 * Markdown SSR snapshot parity — the SERVER side (test/markdown-ssr.spec.ts,
 * markdown-streaming — the codex-final minor, made real).
 *
 * This file runs in the NODE environment on purpose: the component must
 * compile through vite's server conditions for svelte/server's render to
 * produce the true prerender frame (a jsdom-env import yields the CLIENT
 * build and crashes the server renderer — the dual-graph trap). The
 * client side of the parity pair lives in markdown-render.spec.ts, which
 * mounts the same DOC and runs the SAME assertMarkdownDocShape — one
 * assertion path, two runtimes. svelte/server stays a DYNAMIC import
 * (a static one poisons cold dep optimization for other suites).
 */
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { assertMarkdownDocShape, SSR_DOC } from './helpers/markdown-doc-shape';

describe('markdown — SSR frames (renderToHtml)', () => {
  it('the streaming frame carries cursor + stamp; the static frame does not (the pure-function law)', async () => {
    // svelte 5.56 exports `render` returning { html, head } — renderToHtml is newer
    const { render } = await import('svelte/server');
    const { default: Markdown } = await import('$lib/ui/markdown/markdown.svelte');

    const streamingFrame = render(Markdown, { props: { source: SSR_DOC, streaming: true } }).html;
    const staticFrame = render(Markdown, { props: { source: SSR_DOC, streaming: false } }).html;

    for (const html of [streamingFrame, staticFrame]) {
      expect(html).toContain('data-jx-markdown'); // the root hook survives prerender
    }

    const dom = (html: string): Element => {
      const root = new JSDOM(`<body>${html}</body>`).window.document.querySelector('[data-jx-markdown]');
      if (!root) throw new Error('no markdown root in server frame');
      return root;
    };
    assertMarkdownDocShape(dom(streamingFrame), { streaming: true });
    assertMarkdownDocShape(dom(staticFrame), { streaming: false });
  });
});
