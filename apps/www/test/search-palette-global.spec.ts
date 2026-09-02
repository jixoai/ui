/**
 * The site-wide ⌘K wiring gates (nav-fuzzy-filter change, N2 / batch
 * B2): the search palette rides the ROOT layout — ONE mount for every
 * route — and the docs subtree keeps no second instance behind.
 *
 * Three gates:
 *
 * 1. the WIRING (source-level): the single <SearchPalette /> mount
 *    sits in routes/+layout.svelte and NOWHERE under routes/docs/ —
 *    the property is layout wiring, so it is asserted on the layout
 *    sources (the house's readFileSync precedent, e.g.
 *    color-picker.spec.ts).
 * 2. the BEHAVIOR off docs (runtime): the palette answers ⌘K and the
 *    header trigger's jx-search-open document event on a non-docs
 *    page ('/') — the exact pair that used to be dead there. The
 *    corpus needs no stub: it is fetched lazily on the first QUERY
 *    (root-absolute /search/corpus.json, route-independent), and
 *    these gates never type one.
 * 3. the NO-DOUBLE-OPEN composition (runtime): the REAL docs layout
 *    (mountable under the bare runner — its only SvelteKit import is
 *    the aliased $app/state) renders beside the root-level singleton
 *    and contributes ZERO palette instances; one trigger event opens
 *    exactly one dialog. A reintroduced docs-side mount goes red on
 *    both counts.
 *
 * The root layout ITSELF is not importable here: it pulls
 * $app/navigation, which the bare vitest setup cannot resolve (a
 * vi.mock factory cannot intercept vite's import-analysis, which
 * throws at transform time — only a config alias, as $app/state has,
 * would unlock mounting the full layout; left to the integrator as a
 * shared-file change).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import DocsLayout from '../src/routes/docs/+layout.svelte';
import SearchPalette from '../src/lib/ui/search-palette.svelte';
import { page } from './mocks/app-state';

// the palette's one addressable affordance (the header trigger button
// carries the same aria-label string — scope by tag when both exist)
const PALETTE_INPUT = 'input[aria-label="Search the docs"]';
const openPalettes = (): Element[] =>
  [...document.querySelectorAll('dialog[open]')].filter(
    (dialog) => dialog.querySelector(PALETTE_INPUT) !== null,
  );

// the shared $app/state mock re-pointed per scenario (the
// docs-nav-filter precedent); both layouts read page.url/page.data
const pageMock = page as { url: URL; data?: Record<string, unknown> };
const at = (pathname: string): void => {
  pageMock.url = new URL(pathname, 'http://localhost');
  pageMock.data = {};
};

const walkSources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walkSources(path) : [path];
  });

describe('the ⌘K hoist — wiring (one mount, at the root)', () => {
  const rootLayout = readFileSync(join(process.cwd(), 'src/routes/+layout.svelte'), 'utf8');

  it('the root layout imports and mounts the palette exactly once', () => {
    expect(rootLayout).toContain("import SearchPalette from '$lib/ui/search-palette.svelte'");
    expect(rootLayout.match(/<SearchPalette\s*\/>/g)?.length).toBe(1);
  });

  it('the docs subtree ships no second instance (no import, no listener)', () => {
    const docsTree = walkSources(join(process.cwd(), 'src/routes/docs'));
    expect(docsTree.length).toBeGreaterThan(0);
    for (const path of docsTree) {
      expect(readFileSync(path, 'utf8'), path).not.toContain('SearchPalette');
    }
  });
});

describe('the ⌘K hoist — behavior on a non-docs page', () => {
  it('⌘K opens the palette on /, Ctrl-K closes it (both edges of the global key)', async () => {
    at('/');
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await tick();
    expect(document.querySelector(PALETTE_INPUT)).not.toBeNull(); // mounted off docs
    expect(document.querySelector('dialog[open]')).toBeNull(); // ships closed
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    await vi.waitFor(() => expect(openPalettes().length).toBe(1));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await vi.waitFor(() => expect(openPalettes().length).toBe(0));
    unmount(palette);
    target.remove();
  });

  it('the header trigger contract: jx-search-open opens the palette on /', async () => {
    at('/');
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await tick();
    // the root layout's header button dispatches exactly this event —
    // off docs it used to fall on a document with no listener
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    await vi.waitFor(() => expect(openPalettes().length).toBe(1));
    expect(document.activeElement).toBe(document.querySelector(PALETTE_INPUT)); // input focused
    unmount(palette);
    target.remove();
    (document.activeElement as HTMLElement | null)?.blur();
  });
});

describe('the ⌘K hoist — docs composition (no double instance)', () => {
  it('the real docs layout beside the root singleton: one palette, one open face', async () => {
    at('/docs.html');
    const paletteTarget = document.createElement('div');
    document.body.appendChild(paletteTarget);
    const palette = mount(SearchPalette, { target: paletteTarget });
    const docsTarget = document.createElement('div');
    document.body.appendChild(docsTarget);
    const docs = mount(DocsLayout, {
      target: docsTarget,
      props: { children: () => {} }, // a no-op snippet: the page body is not under test
    });
    await tick();
    expect(docsTarget.querySelector('[data-print-source]')).not.toBeNull(); // the real layer mounted
    expect(docsTarget.querySelector(PALETTE_INPUT)).toBeNull(); // the subtree contributes nothing
    expect(document.querySelectorAll(PALETTE_INPUT).length).toBe(1); // ONE instance site-wide
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    await vi.waitFor(() => expect(openPalettes().length).toBe(1)); // exactly one opens
    unmount(docs);
    unmount(palette);
    docsTarget.remove();
    paletteTarget.remove();
    (document.activeElement as HTMLElement | null)?.blur();
  });
});
