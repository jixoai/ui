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

  it('the pending state names the flight (debounce + engine await), then lands', async () => {
    let release: (() => void) | undefined;
    vi.stubGlobal(
      'fetch',
      () => new Promise((resolve) => { release = () => resolve({ ok: true, json: async () => ({ pages: [] }) }); }),
    );
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const input = target.querySelector<HTMLInputElement>('input')!;
    input.value = 'gutter';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // debounce (120ms) + the held fetch: pending is the visible state
    await vi.waitFor(() => expect(target.querySelector('[data-jx-search-pending]')).not.toBeNull());
    // the fetch fires once the debounce lands — release only exists then
    await vi.waitFor(() => expect(release).toBeTypeOf('function'));
    release!();
    // the flight ends in the empty state (empty corpus ⇒ no hits)
    await vi.waitFor(() => expect(target.querySelector('[data-jx-search-empty]')).not.toBeNull());
    expect(target.querySelector('[data-jx-search-pending]')).toBeNull();
    unmount(palette);
    target.remove();
    (document.activeElement as HTMLElement | null)?.blur();
    vi.unstubAllGlobals();
  });

  it('the no-result state echoes the query as a real empty state', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ pages: [] }) }));
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const input = target.querySelector<HTMLInputElement>('input')!;
    input.value = 'zz-no-such-term';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.waitFor(() => {
      const empty = target.querySelector('[data-jx-search-empty]');
      expect(empty).not.toBeNull();
      expect(empty!.textContent).toContain('zz-no-such-term');
    });
    unmount(palette);
    target.remove();
    (document.activeElement as HTMLElement | null)?.blur();
    vi.unstubAllGlobals();
  });

  it('composes the Dialog component: the surface law rides inside it, geometry overrides outside', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    mount(SearchPalette, { target });
    await flush();
    const dialog = target.querySelector('dialog')!;
    // the three-layer contract comes FROM the Dialog component now
    expect(dialog.classList.contains('jx-dialog')).toBe(true);
    expect(dialog.classList.contains('jx-surface')).toBe(true);
    expect(dialog.querySelector(':scope > .jx-surface-shadow')).not.toBeNull();
    expect(dialog.querySelector(':scope > .jx-surface-body')).not.toBeNull();
    // jsdom has no CSS.registerProperty: the kernel gate stays OFF
    expect(dialog.classList.contains('jx-waapi')).toBe(false);
    // the palette's geometry-only platform overrides ride the class list
    expect(dialog.className).toContain('mt-[14vh]');
    expect(dialog.className).toContain('w-[min(92vw,44rem)]');
    // r13 grid ruler: the palette's head snippet rides the head zone and
    // its separator track; no footer face is passed → no foot zone/stamp
    const scroll = dialog.querySelector('[data-jx-dialog-scroll]')!;
    expect(scroll.hasAttribute('data-sep-head')).toBe(true);
    expect(scroll.hasAttribute('data-sep-foot')).toBe(false);
    const headZone = dialog.querySelector('[data-jx-dialog-head]')!;
    expect(headZone.querySelector('input')).not.toBeNull(); // the snippet still lands
    expect(dialog.querySelector('[data-jx-dialog-sep="head"]')!.tagName).toBe('HR');
    expect(dialog.querySelector('[data-jx-dialog-foot]')).toBeNull();
    target.remove();
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

  it('Escape routes through Dialog: the cancel is claimed (preventDefault) and the animated shut closes', async () => {
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
    // Dialog's handleCancel claims the request and runs its own shut
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true); // claimed, never the raw UA path
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    await vi.waitFor(() => expect(input.value).toBe('')); // the close edge resets the query
    unmount(palette);
    target.remove();
  });

  it('a cancel request during an IME composition is claimed AND held — the commit key belongs to the IME', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const dialog = target.querySelector('dialog')!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    const input = target.querySelector<HTMLInputElement>('input')!;
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true); // Dialog claims it…
    await new Promise((r) => setTimeout(r, 50));
    expect(dialog.open).toBe(true); // …and the cancelGuard holds the shut through the composition
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    const cancel2 = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel2);
    await vi.waitFor(() => expect(dialog.open).toBe(false)); // composition over: the animated shut runs
    unmount(palette);
    target.remove();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('a click on the dialog itself (the backdrop idiom) closes; children do not', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    await flush();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    const dialog = target.querySelector('dialog')!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await vi.waitFor(() => expect((target.querySelector('input') as HTMLInputElement) !== null));
    const input = target.querySelector('input')!;
    input.click(); // inside the panel — stays open
    expect(dialog.open).toBe(true);
    // the platform click (target IS the dialog) arms after the open
    // effect — wait for the listener, then the falling edge shuts
    await vi.waitFor(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: false }));
      expect(dialog.open).toBe(false);
    });
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
