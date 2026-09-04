/**
 * docs sections nav — fuzzy filter lock (test/docs-nav-filter.spec.ts,
 * nav-fuzzy-filter change, 2026-09-02). The rail's filter rides the
 * nav-filter kernel (fuzzysort v4): fuzzy matching is a SUPERSET of
 * the old substring behavior — the truth table below encodes the REAL
 * engine hits against the live route model (probed, not guessed).
 *
 * Design §2's behavior retention list is asserted as the hard edge of
 * the upgrade: group order + empty-group hiding, the empty state
 * copy, Escape clear + stopPropagation, the dual input mounts (rail +
 * mobile bar), and BOTH clear paths (× button, emptying the input)
 * restoring the full list. Matched characters render as <mark> (the
 * search palette's own convention, transparent background + primary).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import DocsSectionsNav from '../src/lib/ui/docs-sections-nav.svelte';
import { page } from '../test/mocks/app-state';
import { CATALOG } from '../src/lib/catalog';

// the nav reads $app/state's `page`; the mock starts at /docs.html
// (sections mode) — components-mode tests re-point the URL before render

const railTitles = () =>
  [...document.querySelectorAll('.jx-dsn-rail .jx-dsn-link-title')].map((n) =>
    (n.textContent ?? '').trim(),
  );
const barTitles = () =>
  [...document.querySelectorAll('.jx-dsn-bar .jx-dsn-link-title')].map((n) =>
    (n.textContent ?? '').trim(),
  );
const railInput = () => document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;

/** type into the rail's input and let the derived tree flush */
async function type(value: string): Promise<void> {
  fireEvent.input(railInput(), { target: { value } });
  await tick();
}

/** the marks inside one page's link line ('title' | 'subtitle') */
const lineMarks = (page: string, line: 'title' | 'sub') =>
  [
    ...([...document.querySelectorAll('.jx-dsn-rail li')].find(
      (li) =>
        (li.querySelector('.jx-dsn-link-title')?.textContent ?? '').trim() === page,
    )?.querySelectorAll('.jx-dsn-' + (line === 'title' ? 'link-title' : 'sub') + ' mark') ?? []),
  ].map((m) => m.textContent);

describe('docs sections nav — fuzzy filter (sections mode)', () => {
  it('unfiltered: every section page is listed, no marks', () => {
    render(DocsSectionsNav);
    const list = railTitles();
    expect(list).toContain('theming & tokens');
    expect(list).toContain('recipes');
    expect(list).toContain('jx-pure');
    expect(list).toContain('all components');
    expect(list).toContain('Feedback');
    expect(list.length).toBeGreaterThanOrEqual(14);
    expect(document.querySelectorAll('.jx-dsn-rail mark').length).toBe(0);
  });

  it('matches subtitles: "wrapping" keeps only the recipes entry, marked in the sub line', async () => {
    render(DocsSectionsNav);
    await type('wrapping');
    expect(railTitles()).toEqual(['recipes']);
    expect(lineMarks('recipes', 'sub')).toEqual(['wrapping']);
    expect(lineMarks('recipes', 'title')).toEqual([]);
  });

  it('matches titles: "jx" keeps only jx-pure; groups hide when their line drops', async () => {
    render(DocsSectionsNav);
    await type('jx');
    expect(railTitles()).toEqual(['jx-pure']);
    // the contiguous [0,1] indexes render as ONE mark run
    expect(lineMarks('jx-pure', 'title')).toEqual(['jx']);
  });

  it('fuzzy is a superset of substring: "dt" hits non-substring pages, group order intact', async () => {
    render(DocsSectionsNav);
    await type('dt');
    // 'dt' is a substring of NONE of these — pure fuzzy hits, in
    // data-source order (sections group first, then components; the
    // registry group empties and hides — and the components section
    // only carries groups WITH ui entries, so no 'Docs Tooling').
    // 'context & defaults' joined with the context-defaults-economy
    // guide page (dt spans "defaults" — same fuzzy class)
    expect(railTitles()).toEqual([
      'variant-grammar',
      'context & defaults',
      'demo-standard',
      'Data Entry',
      'Data Display',
    ]);
    const groups = [...document.querySelectorAll('.jx-dsn-rail .jx-dsn-group-label')].map(
      (n) => n.textContent,
    );
    expect(groups.join(' ')).toContain('Sections');
    expect(groups.join(' ')).toContain('Components');
    expect(groups.join(' ')).not.toContain('Registry');
    // scattered indexes split into separate marks; the hit field is
    // wherever the better score landed (title for demo-standard,
    // subtitle for variant-grammar)
    expect(lineMarks('demo-standard', 'title')).toEqual(['d', 't']);
    expect(lineMarks('variant-grammar', 'title')).toEqual([]);
    expect(lineMarks('variant-grammar', 'sub')).toEqual(['d', 't']);
  });

  it('multi-word queries ride spaces: "print pipe" hits the paged subtitle', async () => {
    render(DocsSectionsNav);
    await type('print pipe');
    expect(railTitles()).toEqual(['paged']);
    expect(lineMarks('paged', 'sub')).toEqual(['print pipe']);
  });

  it('no matches: the empty state shows', async () => {
    render(DocsSectionsNav);
    await type('zzzz');
    expect(railTitles()).toEqual([]);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(1);
  });

  it('the × button restores the full list', async () => {
    render(DocsSectionsNav);
    await type('zzzz');
    fireEvent.click(document.querySelector('.jx-dsn-rail .jx-dsn-clear') as HTMLElement);
    await tick();
    expect(railTitles().length).toBeGreaterThanOrEqual(14);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(0);
    expect(document.querySelectorAll('.jx-dsn-rail mark').length).toBe(0);
  });

  it('emptying the input restores the full list', async () => {
    render(DocsSectionsNav);
    await type('jx');
    await type('');
    expect(railTitles().length).toBeGreaterThanOrEqual(14);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(0);
  });

  it('Escape clears the filter and does not leak upward', async () => {
    render(DocsSectionsNav);
    await type('zzzz');
    const input = railInput();
    let leaked = 0;
    const onDocKey = () => {
      leaked += 1;
    };
    document.addEventListener('keydown', onDocKey);
    fireEvent.keyDown(input, { key: 'Escape' });
    document.removeEventListener('keydown', onDocKey);
    await tick();
    expect(input.value).toBe('');
    expect(railTitles().length).toBeGreaterThanOrEqual(14);
    // the page binds Escape for popover/disclosure closing — with text
    // in the field the key belongs to the filter (stopPropagation)
    expect(leaked).toBe(0);
  });

  it('Escape with an empty filter bubbles to the page', async () => {
    render(DocsSectionsNav);
    let reached = 0;
    const onDocKey = () => {
      reached += 1;
    };
    document.addEventListener('keydown', onDocKey);
    fireEvent.keyDown(railInput(), { key: 'Escape' });
    document.removeEventListener('keydown', onDocKey);
    expect(reached).toBe(1);
  });

  it('the mobile bar input shares the filter (dual mounts, one state)', async () => {
    render(DocsSectionsNav);
    const barInput = document.querySelector('.jx-dsn-bar .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(barInput, { target: { value: 'jx' } });
    await tick();
    expect(railTitles()).toEqual(['jx-pure']);
    expect(barTitles()).toEqual(['jx-pure']);
    // clearing from the rail's × empties the bar's field too
    fireEvent.click(document.querySelector('.jx-dsn-rail .jx-dsn-clear') as HTMLElement);
    await tick();
    expect(barInput.value).toBe('');
    expect(railTitles().length).toBeGreaterThanOrEqual(14);
  });
});

describe('docs sections nav — components-tree mode', () => {
  it('inside /docs/components* the rail IS the component catalog', async () => {
    page.url = new URL('http://localhost/docs/components/press-button.html');
    render(DocsSectionsNav);
    const titles = [...document.querySelectorAll('.jx-dsn-rail .jx-dsn-link-title')].map((n) =>
      (n.textContent ?? '').trim(),
    );
    expect(titles.length).toBe(CATALOG.filter((e) => e.type === 'registry:ui').length);
    expect(titles).toContain('press-button');
    expect(titles).toContain('dialog');
    expect(titles).toContain('scroll-virtual');
    // taxonomy groups with counts (8 since the terminal group, 2026-08-28)
    const groups = [...document.querySelectorAll('.jx-dsn-rail .jx-dsn-group-label')].map(
      (n) => n.textContent,
    );
    expect(groups.join(' ')).toContain('General');
    expect(document.querySelectorAll('.jx-dsn-rail [data-jx-dsn-gcount]').length).toBe(8);
    // the current module is marked
    const current = document.querySelector('.jx-dsn-rail a[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('press-button');
  });

  it('the filter searches component names: "date" keeps date-picker, marked', async () => {
    page.url = new URL('http://localhost/docs/components.html');
    render(DocsSectionsNav);
    await type('date');
    expect(railTitles()).toEqual(['date-picker']);
    expect(lineMarks('date-picker', 'title')).toEqual(['date']);
  });

  it('fuzzy hits keep taxonomy group order: "sel"', async () => {
    page.url = new URL('http://localhost/docs/components.html');
    render(DocsSectionsNav);
    await type('sel');
    // 'sel' is a substring of only select/native-select/carousel —
    // skeleton, website-scaffold and progressive-blur are FUZZY hits;
    // the order is group order × registry order, never score order
    expect(railTitles()).toEqual([
      'progressive-blur',
      'website-scaffold',
      'select',
      'native-select',
      'carousel',
      'skeleton',
    ]);
    expect(lineMarks('select', 'title')).toEqual(['sel']);
    // skeleton's indexes scatter ([0,2,3]) — 's' then 'el', two marks
    expect(lineMarks('skeleton', 'title')).toEqual(['s', 'el']);
  });
});
