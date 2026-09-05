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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
      'density-2xs',
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

describe('docs sections nav — the ONE-CELL LAYER GRID (source law, 2026-09-05 r3)', () => {
  // the sticky era retired: the rail grid is a single [stack] cell —
  // the groups scroller spans it in full, the head and the blur band
  // are OVERLAYS (z-10 over z-[5]); pinning is by construction. The
  // scroller pads nothing inline (a padded scroller clipped the
  // band's backdrop width); the head's clearance is the measured
  // --jx-dsn-head-h (the RO var, the scaffold's --jx-header-h
  // precedent); the band's reveal rides the named-timeline seam (the
  // scroller is the band's SIBLING — scroll(nearest) cannot see it)
  const source = readFileSync(
    resolve(process.cwd(), 'src/lib/ui/docs-sections-nav.svelte'),
    'utf8',
  );
  const container = () =>
    source.slice(source.indexOf('@container jx-shell (min-width: 1200px)'));

  it('the band mounts INSIDE the rail surface, in the grid dialect (dies with it below 1200px)', () => {
    const navStart = source.indexOf('<nav class="jx-dsn"');
    const railStart = source.indexOf('class="jx-dsn-rail"');
    const bandMount = source.indexOf('<ProgressiveBlur pin="grid" position="top" reveal="scroll" height="7.5rem"');
    expect(navStart).toBeGreaterThan(-1);
    expect(railStart).toBeGreaterThan(navStart);
    expect(bandMount).toBeGreaterThan(railStart); // inside the rail grid, not a nav sibling
  });

  it('ONE cell, three layers: head and groups share the [stack] area; the rail head carries no sticky', () => {
    const css = container();
    expect(css).toContain('grid-template-rows: [stack] minmax(0, 1fr)');
    expect(css).toContain('grid-area: stack / rail'); // head AND groups — same cell, overlay + scroller
    expect(css.match(/grid-area: stack \/ rail/g)?.length).toBe(2);
    expect(css).toContain('z-index: 10'); // the head rides above the band's z-[5]
    // the RAIL head is placement-only (the bar form's expand head keeps
    // its own sticky — a band INSIDE its own scroller, the honest pin)
    const headRule = css.match(/\.jx-dsn-head \{[\s\S]*?\}/)?.[0] ?? '';
    expect(headRule).not.toContain('sticky');
    expect(headRule).toContain('align-self: start');
  });

  it('the list IS the scroller: overflow + gutter + the timeline name moved inward', () => {
    const css = container();
    expect(css).toContain('overflow-y: auto');
    expect(css).toContain('scrollbar-gutter: stable both-edges');
    expect(css).toContain('scroll-timeline-name: --jx-dsn');
    expect(css).toContain('timeline-scope: --jx-dsn'); // the bridge: the band reads the sibling scroller
    expect(css).toContain('--jx-pblur-scroll-tl: --jx-dsn');
  });

  it('the band carries NO site className: [data-jx-pblur] is the anchor, and only the END edge steps aside (Owner, 2026-09-05)', () => {
    // the component's own attribute is the stable hook; the scrollbar
    // beneath the blur is noise to erase, not content to frost — the
    // start-side gutter strip paints nothing, so its blur is free
    expect(source).not.toContain('jx-dsn-band');
    const bandRule =
      container().match(/\.jx-dsn-rail :global\(\[data-jx-pblur\]\) \{[\s\S]*?\}/)?.[0] ?? '';
    expect(bandRule).not.toBe('');
    expect(bandRule).toContain('margin-inline-end: var(--jx-scrollbar-thin, 0px)');
    expect(bandRule).not.toContain('margin-inline:'); // end-only — never the both-edges retreat
  });

  it('the clearance is MEASURED (the RO var), never hardcoded — with a no-JS css fallback', () => {
    const css = container();
    expect(css).toContain('padding-block-start: var(--jx-dsn-head-h, 5.375rem)');
    expect(source).toContain("--jx-dsn-head-h");
    expect(source).toContain('ResizeObserver'); // the scaffold's --jx-header-h precedent
  });

  it('the inline insets align head and list on one line: outside the scroller max(inset, thin), inside inset−thin', () => {
    const css = container();
    expect(css).toContain('padding-left: max(1.25rem, var(--jx-scrollbar-thin, 0px))'); // the head
    expect(css).toContain('padding-left: max(1.25rem - var(--jx-scrollbar-thin, 0px), 0px)'); // the list
  });
});
