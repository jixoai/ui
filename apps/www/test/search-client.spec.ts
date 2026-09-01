/**
 * The search client gates (search-corpus change): the shared
 * tokenizer (Intl.Segmenter word granularity — CJK 是词级, latin
 * lowercase), the minisearch engine adapter over a fixture corpus
 * (section-granularity docs, prefix + fuzzy, code labels
 * searchable), and the palette's open/close contract.
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
  it('opens on the document trigger event and closes on Escape', async () => {
    const fetchStub = vi.fn(async () => ({
      ok: true,
      json: async () => ({ pages: FIXTURE }),
    }));
    vi.stubGlobal('fetch', fetchStub);
    const target = document.createElement('div');
    document.body.appendChild(target);
    const palette = mount(SearchPalette, { target });
    expect(target.querySelector('[role="dialog"]')).toBeNull();
    document.dispatchEvent(new CustomEvent('jx-search-open'));
    await vi.waitFor(() => expect(target.querySelector('[role="dialog"]')).not.toBeNull());
    target.querySelector<HTMLInputElement>('input')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await vi.waitFor(() => expect(target.querySelector('[role="dialog"]')).toBeNull());
    unmount(palette);
    target.remove();
    vi.unstubAllGlobals();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
