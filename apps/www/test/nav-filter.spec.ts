/**
 * nav-filter kernel lock (test/nav-filter.spec.ts, nav-fuzzy-filter
 * change, 2026-09-02): the fuzzysort v4 adapter behind the left
 * rail's filter — the empty-query identity, group/intra-group order
 * preservation (fuzzy filters, never reorders), empty-group dropping,
 * title-vs-subtitle best-hit highlighting, the contiguous-run
 * segmenter, and the CommandMatch-compatible exit (command.svelte's
 * frozen contract). Expected hits are REAL probed fuzzysort results,
 * not substring guesses.
 */
import { describe, expect, it } from 'vitest';
import {
  navFilter,
  navHighlightSegments,
  toCommandMatch,
  type NavFilterSection,
} from '../src/lib/search/nav-filter';

interface TestPage {
  title: string;
  subtitle?: string;
  href: string;
  count?: number;
}
interface TestSection extends NavFilterSection<TestPage> {
  count?: number;
}

const sections: TestSection[] = [
  {
    id: 'alpha',
    label: 'Alpha',
    pages: [
      { title: 'jx-pure', subtitle: 'the componentless face', href: '/a' },
      { title: 'recipes', subtitle: 'where wrapping stops', href: '/b' },
    ],
  },
  {
    id: 'beta',
    label: 'Beta',
    count: 2,
    pages: [
      { title: 'demo-standard', subtitle: 'one skeleton, six sections', href: '/c', count: 7 },
      { title: 'unrelated', href: '/d' },
    ],
  },
];

describe('nav-filter — navFilter', () => {
  it('the empty query is the identity: the same tree back, zero highlights', () => {
    expect(navFilter(sections, '')).toBe(sections);
    expect(navFilter(sections, '   ')).toBe(sections);
    expect(sections[0]?.pages[0]).not.toHaveProperty('highlight');
  });

  it('group order and intra-group order ride the data source (no scoring sort)', () => {
    // 'e' hits pages in BOTH groups — the result keeps source order,
    // never score order
    const out = navFilter(sections, 'e');
    expect(out.map((s) => s.id)).toEqual(['alpha', 'beta']);
    expect(out[0]?.pages.map((p) => p.title)).toEqual(['jx-pure', 'recipes']);
    expect(out[1]?.pages.map((p) => p.title)).toEqual(['demo-standard', 'unrelated']);
  });

  it('a section whose pages all dropped is dropped; surviving props ride along', () => {
    // 'dt' hits only beta's demo-standard (a FUZZY hit — no 'dt'
    // substring anywhere); alpha drops entirely
    const out = navFilter(sections, 'dt');
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('beta');
    expect(out[0]?.count).toBe(2);
    expect(out[0]?.pages).toHaveLength(1);
    expect(out[0]?.pages[0]?.title).toBe('demo-standard');
    expect(out[0]?.pages[0]?.count).toBe(7);
    expect(out[0]?.pages[0]?.highlight).toEqual({ field: 'title', indexes: [0, 6] });
  });

  it('no hit anywhere returns an empty tree', () => {
    expect(navFilter(sections, 'zzzz')).toEqual([]);
  });

  it('subtitle matches highlight the subtitle field', () => {
    const out = navFilter(sections, 'wrapping');
    expect(out.map((s) => s.id)).toEqual(['alpha']);
    expect(out[0]?.pages[0]?.title).toBe('recipes');
    expect(out[0]?.pages[0]?.highlight?.field).toBe('subtitle');
    expect([...(out[0]?.pages[0]?.highlight?.indexes ?? [])]).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it('the better score wins the field; title takes ties', () => {
    // exact 'ab' (score 1) beats scattered title 'axb' (~0.36)
    const subtitleWins = navFilter(
      [{ id: 's', label: 'S', pages: [{ title: 'axb', subtitle: 'ab', href: '/x' }] }],
      'ab',
    );
    expect(subtitleWins[0]?.pages[0]?.highlight?.field).toBe('subtitle');

    const titleWins = navFilter(
      [{ id: 's', label: 'S', pages: [{ title: 'ab', subtitle: 'axb', href: '/x' }] }],
      'ab',
    );
    expect(titleWins[0]?.pages[0]?.highlight?.field).toBe('title');

    // identical fields score identically — the primary field takes it
    const tie = navFilter(
      [{ id: 's', label: 'S', pages: [{ title: 'ab', subtitle: 'ab', href: '/x' }] }],
      'ab',
    );
    expect(tie[0]?.pages[0]?.highlight?.field).toBe('title');
  });

  it('matching is case-insensitive and multi-word (fuzzysort internals)', () => {
    expect(navFilter(sections, 'JX')[0]?.pages.map((p) => p.title)).toEqual(['jx-pure']);
    // 'print pipe' matches the paged-style subtitle across its space
    const out = navFilter(
      [{ id: 's', label: 'S', pages: [{ title: 'paged', subtitle: 'the print pipeline', href: '/x' }] }],
      'print pipe',
    );
    expect(out[0]?.pages[0]?.highlight?.field).toBe('subtitle');
    expect([...(out[0]?.pages[0]?.highlight?.indexes ?? [])]).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
});

describe('nav-filter — navHighlightSegments', () => {
  it('groups contiguous indexes into one mark run', () => {
    expect(navHighlightSegments('jx-pure', [0, 1])).toEqual([
      { text: 'jx', hit: true },
      { text: '-pure', hit: false },
    ]);
  });

  it('scattered indexes split into alternating segments', () => {
    expect(navHighlightSegments('demo-standard', [0, 6])).toEqual([
      { text: 'd', hit: true },
      { text: 'emo-s', hit: false },
      { text: 't', hit: true },
      { text: 'andard', hit: false },
    ]);
  });

  it('a trailing hit run ends the segments; empty indexes stay plain', () => {
    expect(navHighlightSegments('recipes', [5, 6])).toEqual([
      { text: 'recip', hit: false },
      { text: 'es', hit: true },
    ]);
    expect(navHighlightSegments('recipes', [])).toEqual([{ text: 'recipes', hit: false }]);
  });

  it('is defensive about unsorted and duplicated indexes', () => {
    expect(navHighlightSegments('abc', [2, 0, 2, 1])).toEqual([{ text: 'abc', hit: true }]);
  });
});

describe('nav-filter — toCommandMatch (the CommandMatch exit)', () => {
  it('the empty query shows everything (defaultCommandMatch law)', () => {
    expect(toCommandMatch({ label: 'anything' }, '')).toBe(true);
    expect(toCommandMatch({ label: 'anything' }, '  ')).toBe(true);
  });

  it('label matches fuzzily — including non-substring hits', () => {
    expect(toCommandMatch({ label: 'date-picker' }, 'date')).toBe(true);
    // 'sel' is NOT a substring of skeleton — a fuzzy-only hit
    expect(toCommandMatch({ label: 'skeleton' }, 'sel')).toBe(true);
    expect(toCommandMatch({ label: 'jx-pure' }, 'JX')).toBe(true);
  });

  it('keywords widen the match; nothing matches returns false', () => {
    expect(toCommandMatch({ label: 'dialog', keywords: 'modal overlay' }, 'overlay')).toBe(true);
    expect(toCommandMatch({ label: 'dialog' }, 'dte')).toBe(false);
    expect(toCommandMatch({ label: 'dialog', keywords: 'modal' }, 'zzz')).toBe(false);
  });
});
