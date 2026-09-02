/**
 * The search client gates (search-corpus change; native-dialog
 * rewrite, r9): the shared tokenizer (Intl.Segmenter word granularity
 * — CJK 是词级, latin lowercase), the minisearch engine adapter over a
 * fixture corpus (section-granularity docs, prefix + fuzzy, code
 * labels searchable), and the palette's <dialog> contract —
 * showModal()/close() through the setup polyfill (jsdom 29 ships
 * HTMLDialogElement WITHOUT the modal methods; test/setup.ts
 * polyfills open/close-event semantics, so these specs drive the
 * platform paths: the cancel request is emulated as
 * dispatch('cancel') + close() — exactly the UA's unprevented-cancel
 * steps).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tokenize } from '../src/lib/search/tokenizer';
import { createMinisearchEngine, type CorpusPage } from '../src/lib/search/engine-minisearch';
import SearchPalette from '../src/lib/ui/search-palette.svelte';
import { mount, unmount } from 'svelte';

const FIXTURE: CorpusPage[] = [
  {
    url: '/docs/paged.html',
    title: 'paged print — one pipeline',
    description: 'the print pipeline',
    preset: null,
    sections: [
      {
        id: 'transaction',
        heading: 'The transaction',
        level: 2,
        summary: 'prepareSnapshot 是一个事务：预备媒介信号',
        blocks: [
          { kind: 'prose', text: 'the freeze verb pauses the world' },
          { kind: 'code', text: 'const prepare = snapshot();', lang: 'ts', label: 'the layer, assembled' },
        ],
      },
      {
        id: 'animation-protocol',
        heading: 'Animation protocol',
        level: 2,
        summary: 'CSS animations pause and resume',
        blocks: [{ kind: 'prose', text: 'per-slot frame transfer delayPrime formula' }],
      },
    ],
  },
];

describe('tokenize — one law, two callers', () => {
  it('CJK segments at word granularity and latin lowercases', () => {
    expect(tokenize('prepareSnapshot 是一个事务')).toContain('prepareSnapshot'.toLowerCase());
    expect(tokenize('prepareSnapshot 是一个事务')).toContain('事务');
    expect(tokenize('The Transaction')).toEqual(['the', 'transaction']);
  });
  it('the query and document paths are the same function (a match must be possible)', () => {
    const doc = tokenize('打印管线：prepareSnapshot 事务');
    const query = tokenize('打印管线 事务');
    for (const term of query) expect(doc).toContain(term);
  });
});

describe('the minisearch adapter', () => {
  it('matches Chinese prose, code labels, and prefixes — section-granularity hrefs', async () => {
    const engine = createMinisearchEngine(tokenize, async () => FIXTURE);
    const zh = await engine.search('打印管线 事务');
    expect(zh[0]?.href).toBe('/docs/paged.html#transaction');
    const label = await engine.search('assembled');
    expect(label[0]?.heading).toBe('The transaction');
    const prefix = await engine.search('anim');
    expect(prefix[0]?.href).toBe('/docs/paged.html#animation-protocol');
  });
  it('an empty query returns nothing without loading the corpus', async () => {
    const load = vi.fn(async () => FIXTURE);
    const engine = createMinisearchEngine(tokenize, load);
    expect(await engine.search('   ')).toEqual([]);
    expect(load).not.toHaveBeenCalled();
  });
});

describe('the palette', () => {
  // the palette's bind:this refs land with the mount-effect flush —
  // one microtask after mount() returns (a real user cannot click
  // inside the same synchronous tick, and neither may these specs)
  const flush = (): Promise<void> => Promise.resolve();

  it('the IME commit Enter does NOT navigate (composition-safe, the CJK-first law)', async () => {
    const load = vi.fn(async () => FIXTURE);
    const engine = createMinisearchEngine(tokenize, load);
    await engine.search('transaction'); // index warm, hits exist
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    await vi.waitFor(() => expect(target.querySelector('dialog[open]')).not.toBeNull());
    const input = target.querySelector<HTMLInputElement>('input')!;
    const before = window.location.href;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(window.location.href).toBe(before); // no navigation
    expect(target.querySelector('dialog[open]')).not.toBeNull(); // still open
    unmount(palette as never);
    target.remove();
  });

  it('a failed corpus load is retried on the next query (no poisoned cache)', async () => {
    let fail = true;
    const load = vi.fn(async () => {
      if (fail) throw new Error('corpus down');
      return FIXTURE;
    });
    const engine = createMinisearchEngine(tokenize, load);
    expect(await engine.search('transaction')).toEqual([]); // failure → empty
    fail = false;
    const hits = await engine.search('transaction'); // retry succeeds
    expect(hits[0]?.heading).toBe('The transaction');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('opens on the document trigger event: showModal, input focused, copy contract', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    // the native dialog ships closed (the UA hides it) — never a fixed overlay div
    const dialog = target.querySelector('dialog')!;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(false);
    expect(target.querySelector('.fixed')).toBeNull();
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    await vi.waitFor(() => expect(target.querySelector('dialog[open]')).not.toBeNull());
    // focus lands in the query input
    const input = target.querySelector<HTMLInputElement>('input')!;
    expect(document.activeElement).toBe(input);
    // the house copy: english placeholder/labels, the shared magnifier icon
    expect(input.placeholder).toBe('Search the docs…');
    expect(input.getAttribute('aria-label')).toBe('Search the docs');
    expect(dialog.getAttribute('aria-label')).toBe('Search the docs');
    const icon = dialog.querySelector('[data-jx-icon]');
    expect(icon).not.toBeNull();
    unmount(palette);
    target.remove();
  });

  it('Escape is the platform close request: cancel stays unprevented, close resets the query', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const dialog = target.querySelector('dialog')!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    const input = target.querySelector<HTMLInputElement>('input')!;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // the UA close request: a cancel event the palette must NOT
    // prevent, then the platform's close (jsdom needs the second step
    // spelled out — setup.ts polyfill only carries the close event)
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(false);
    dialog.close();
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    await vi.waitFor(() => expect(input.value).toBe('')); // the close handler resets the query
    unmount(palette);
    target.remove();
  });

  it('a click on the dialog itself (the backdrop idiom) closes; children do not', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const dialog = target.querySelector('dialog')!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    const input = target.querySelector('input')!;
    input.click(); // inside the panel — stays open
    expect(dialog.open).toBe(true);
    dialog.click(); // target === dialog — the backdrop hit
    expect(dialog.open).toBe(false);
    unmount(palette);
    target.remove();
  });

  it('close returns focus to the opener (the header trigger law)', async () => {
    const opener = document.createElement('button');
    opener.setAttribute('aria-label', 'Search the docs');
    document.body.appendChild(opener);
    opener.focus();
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const dialog = target.querySelector('dialog')!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    expect(document.activeElement).toBe(target.querySelector('input')); // palette holds it
    dialog.close();
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    expect(document.activeElement).toBe(opener); // handed back
    unmount(palette);
    target.remove();
    opener.remove();
  });

  it('⌘K / Ctrl-K toggles globally', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    const dialog = target.querySelector('dialog')!;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    unmount(palette);
    target.remove();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
