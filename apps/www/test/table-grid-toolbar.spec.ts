/**
 * table-grid-toolbar recipe suite (openspec change
 * 2026-08-30-table-grid-toolbar, 2026-08-30).
 *
 * The interactive laws the five docs pages demo, pinned through the
 * REAL registry components (fixtures mount the same compositions the
 * pages render):
 *
 *   table     sortable headers (aria-sort tri-state + single-column
 *             law), filter row (text contains + toggle-group facets),
 *             pagination footer (slice + page-size select), row
 *             selection (select-all indeterminate law + count
 *             readout), row actions (dropdown-menu open/act/close),
 *             column visibility (popover + checkbox)
 *   transfer  oneWay guard (removals bounce) + batch select-all
 *   tour      non-modal (body/documentElement never clamped, tint is
 *             pointer-events:none, aria-modal=false) + custom step
 *             indicators through card(api)
 *   statistic countdown (fake timers: the tick + finish law) and the
 *             precision matrix (Intl digits)
 *
 * jsdom runs no layout or container queries — assertions read
 * attributes, semantics and state projections only. CSS the engine
 * cannot apply (sticky header geometry, descriptions vertical stack)
 * is pinned as source guards on the page (the composition-a
 * convention).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import StatisticCountdownHost from './fixtures/statistic-countdown-host.svelte';
import TableRecipesHost from './fixtures/table-recipes-host.svelte';
import TourNonmodalHost from './fixtures/tour-nonmodal-host.svelte';
import TransferOnewayHost from './fixtures/transfer-oneway-host.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const tablePage = readFileSync(
  resolve(specDir, '../src/routes/docs/components/table.html/+page.svelte'),
  'utf8',
);

// ---------------------------------------------------------------------------
// sortable headers — aria-sort wiring + the single-column law
// ---------------------------------------------------------------------------
describe('table recipe: sortable headers', () => {
  function setup() {
    const rendered = render(TableRecipesHost);
    const host = () => rendered.container.querySelector('[data-tasks-host]')!;
    const header = (column: string) => host().querySelector(`th[data-column="${column}"]`)!;
    const caret = (column: string) => host().querySelector(`[data-sort-caret][data-sort-key="${column}"]`)!;
    const rowTitles = () =>
      [...host().querySelectorAll('tbody td[data-column="title"]')].map((td) => td.textContent);
    return { rendered, host, header, caret, rowTitles };
  }

  it('starts unsorted: no aria-sort, neutral carets', () => {
    const { header, caret } = setup();
    expect(header('title').getAttribute('aria-sort')).toBeNull();
    expect(header('status').getAttribute('aria-sort')).toBeNull();
    expect(caret('title').textContent).toBe('↕');
  });

  it('first press sorts ascending, second descending, third clears (tri-state)', async () => {
    const { header, caret } = setup();
    const btn = header('title').querySelector('button')!;

    await fireEvent.click(btn);
    flushSync();
    expect(header('title').getAttribute('aria-sort')).toBe('ascending');
    expect(caret('title').textContent).toBe('▲');

    await fireEvent.click(btn);
    flushSync();
    expect(header('title').getAttribute('aria-sort')).toBe('descending');
    expect(caret('title').textContent).toBe('▼');

    await fireEvent.click(btn);
    flushSync();
    expect(header('title').getAttribute('aria-sort')).toBeNull();
  });

  it('keeps ONE column sorted at a time — sorting status clears title', async () => {
    const { header } = setup();
    await fireEvent.click(header('title').querySelector('button')!);
    flushSync();
    await fireEvent.click(header('status').querySelector('button')!);
    flushSync();
    expect(header('status').getAttribute('aria-sort')).toBe('ascending');
    expect(header('title').getAttribute('aria-sort')).toBeNull();
  });

  it('reorders rows: descending title puts the z-leading row first', async () => {
    const { header, rowTitles } = setup();
    await fireEvent.click(header('title').querySelector('button')!); // asc
    flushSync();
    await fireEvent.click(header('title').querySelector('button')!); // desc
    flushSync();
    expect(rowTitles()[0]).toBe('select-all indeterminate');
  });
});

// ---------------------------------------------------------------------------
// filter row — text contains + faceted status via toggle-group
// ---------------------------------------------------------------------------
describe('table recipe: filter row', () => {
  it('text contains-filter narrows rows case-insensitively', async () => {
    const rendered = render(TableRecipesHost);
    const input = rendered.container.querySelector('thead input[type="search"]')!;
    await fireEvent.input(input, { target: { value: 'LEASE' } });
    flushSync();
    const titles = [...rendered.container.querySelectorAll('tbody td[data-column="title"]')].map(
      (td) => td.textContent,
    );
    expect(titles).toEqual(['anchor lease restore']);
  });

  it('faceted toggle-group filters to the checked statuses', async () => {
    const rendered = render(TableRecipesHost);
    const facet = (value: string) =>
      rendered.container.querySelector(`thead .jx-html-tgroup input[value="${value}"]`)!;
    await fireEvent.click(facet('done'));
    flushSync();
    let statuses = [
      ...rendered.container.querySelectorAll('tbody td[data-column="status"]'),
    ].map((td) => td.textContent);
    expect(statuses).toEqual(['done']);

    await fireEvent.click(facet('backlog'));
    flushSync();
    // facets are additive (OR): done stays checked
    statuses = [...rendered.container.querySelectorAll('tbody td[data-column="status"]')].map(
      (td) => td.textContent,
    );
    expect(statuses).toEqual(['done', 'backlog', 'backlog']);
  });
});

// ---------------------------------------------------------------------------
// row selection — the select-all indeterminate law + count readout
// ---------------------------------------------------------------------------
describe('table recipe: row selection', () => {
  function setup() {
    const rendered = render(TableRecipesHost);
    const host = () => rendered.container.querySelector('[data-tasks-host]')!;
    const selectAll = () =>
      host().querySelector('th[data-column="select"] input[type="checkbox"]') as HTMLInputElement;
    const rowBoxes = () =>
      [...host().querySelectorAll('tbody td[data-column="select"] input')] as HTMLInputElement[];
    const readout = () => host().querySelector('[data-selection-readout]')!;
    return { rendered, host, selectAll, rowBoxes, readout };
  }

  it('starts empty: select-all unchecked, not indeterminate, readout honest', () => {
    const { selectAll, readout } = setup();
    expect(selectAll().checked).toBe(false);
    expect(selectAll().indeterminate).toBe(false);
    expect(readout().textContent).toBe('0 of 7 selected');
  });

  it('partial selection drives the indeterminate state + count readout', async () => {
    const { rowBoxes, selectAll, readout } = setup();
    await fireEvent.click(rowBoxes()[0]);
    flushSync();
    await fireEvent.click(rowBoxes()[1]);
    flushSync();
    expect(selectAll().checked).toBe(false);
    expect(selectAll().indeterminate).toBe(true);
    expect(readout().textContent).toBe('2 of 7 selected');
  });

  it('indeterminate press selects every row on the page; full press clears', async () => {
    const { rowBoxes, selectAll, readout } = setup();
    await fireEvent.click(rowBoxes()[0]);
    flushSync();
    // indeterminate → press selects ALL page rows
    await fireEvent.click(selectAll());
    flushSync();
    expect(selectAll().checked).toBe(true);
    expect(selectAll().indeterminate).toBe(false);
    expect(readout().textContent).toBe('5 of 7 selected'); // page size 5

    // all selected → press clears
    await fireEvent.click(selectAll());
    flushSync();
    expect(selectAll().checked).toBe(false);
    expect(readout().textContent).toBe('0 of 7 selected');
  });
});

// ---------------------------------------------------------------------------
// row actions + column visibility — dropdown-menu and the popover
// ---------------------------------------------------------------------------
describe('table recipe: row actions and column visibility', () => {
  function setup() {
    const rendered = render(TableRecipesHost);
    const host = () => rendered.container.querySelector('[data-tasks-host]')!;
    const rowTitles = () =>
      [...host().querySelectorAll('tbody td[data-column="title"]')].map((td) => td.textContent);
    return { rendered, host, rowTitles };
  }

  it('the row dropdown opens as a popover menu, acts, then closes', async () => {
    const { rendered, host, rowTitles } = setup();
    const trigger = host().querySelector('tbody td[data-column="actions"] button[popovertarget]')!;
    await fireEvent.click(trigger);
    flushSync();
    const panel = rendered.container.querySelector('#row-menu-T-101')!;
    expect(panel.getAttribute('role')).toBe('menu');
    expect(panel.matches(':popover-open')).toBe(true);

    await fireEvent.click(panel.querySelectorAll('[role="menuitem"]')[0]!);
    flushSync();
    // acted: the duplicate row landed…
    expect(rowTitles().filter((title) => title === 'harden install integrity').length).toBe(2);
    // …selection-closed: the menu dismissed
    await waitFor(() => expect(panel.matches(':popover-open')).toBe(false));
    expect(host().getAttribute('data-last-action')).toBe('duplicate T-101');
  });

  it('the destructive item deletes the row', async () => {
    const { rendered, host, rowTitles } = setup();
    const trigger = host().querySelector('tbody td[data-column="actions"] button[popovertarget]')!;
    await fireEvent.click(trigger);
    flushSync();
    await fireEvent.click(
      rendered.container.querySelector('#row-menu-T-101 .jx-menu-item-destructive')!,
    );
    flushSync();
    expect(rowTitles().includes('harden install integrity')).toBe(false);
    expect(host().getAttribute('data-last-action')).toBe('delete T-101');
  });

  it('the column visibility popover toggles the priority column out of the DOM', async () => {
    const rendered = render(TableRecipesHost);
    const host = rendered.container.querySelector('[data-tasks-host]')!;
    expect(host.querySelectorAll('th[data-column="priority"]').length).toBe(1);

    await fireEvent.click(rendered.container.querySelector('[data-toolbar] button[popovertarget]')!);
    flushSync();
    const box = rendered.container.querySelector('[data-toolbar] input[type="checkbox"]')!;
    await fireEvent.click(box);
    flushSync();
    expect(host.querySelectorAll('th[data-column="priority"]').length).toBe(0);
    expect(host.querySelectorAll('td[data-column="priority"]').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// pagination footer — slice, page-size select, honest edge controls
// ---------------------------------------------------------------------------
describe('table recipe: pagination footer', () => {
  function setup() {
    const rendered = render(TableRecipesHost);
    const host = () => rendered.container.querySelector('[data-tasks-host]')!;
    const readout = () => host().querySelector('[data-page-readout]')!;
    return { rendered, host, readout };
  }

  it('slices to the page size and numbers the window', () => {
    const { host, readout } = setup();
    expect(host().querySelectorAll('tbody tr').length).toBe(5);
    expect(readout().textContent).toBe('page 1 / 2 · 5 rows');
  });

  it('the Next edge advances the slice; aria-current follows', async () => {
    const { host, readout } = setup();
    const next = [...host().querySelectorAll('[data-pagination-footer] button')]
      .find((button) => button.textContent?.includes('next'))!;
    await fireEvent.click(next);
    flushSync();
    expect(readout().textContent).toBe('page 2 / 2 · 2 rows');
    const current = host().querySelector('[data-pagination-footer] [aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('2');
  });

  it('the page-size select re-slices (7 rows → one page)', async () => {
    const rendered = render(TableRecipesHost);
    const host = rendered.container.querySelector('[data-tasks-host]')!;
    await fireEvent.click(rendered.container.querySelector('[data-pagination-footer] .jx-sel-trigger')!);
    flushSync();
    const option7 = [...rendered.container.querySelectorAll('[data-jx-sel-option-label]')]
      .find((label) => label.textContent === '7 rows')
      ?.closest('li') as HTMLElement;
    await fireEvent.click(option7);
    flushSync();
    expect(host.querySelectorAll('tbody tr').length).toBe(7);
    expect(host.querySelector('[data-page-readout]')!.textContent).toBe('page 1 / 1 · 7 rows');
  });
});

// ---------------------------------------------------------------------------
// transfer — oneWay guard + batch select-all
// ---------------------------------------------------------------------------
describe('transfer recipes: oneWay + batch select-all', () => {
  function setup() {
    const rendered = render(TransferOnewayHost);
    const host = () => rendered.container.querySelector('[data-transfer-host]')!;
    // panel rows carry no input[value] — the label IS the identity
    const rowBox = (legendIncludes: string, label: string) => {
      const fieldset = [...host().querySelectorAll('fieldset')].find((candidate) =>
        candidate.querySelector('legend')!.textContent!.includes(legendIncludes),
      )!;
      const row = [...fieldset.querySelectorAll('label.jx-tr-row')].find((candidate) =>
        candidate.querySelector('[data-jx-tr-label]')!.textContent === label,
      )!;
      return row.querySelector('input') as HTMLInputElement;
    };
    const mover = (to: string) =>
      [...host().querySelectorAll('.jx-tr-movers button')].find((button) =>
        button.getAttribute('aria-label')!.includes(to),
      )!;
    const committed = () => host().getAttribute('data-committed');
    return { rendered, host, rowBox, mover, committed };
  }

  it('forward moves commit through the oneWay guard', async () => {
    const { rowBox, mover, committed } = setup();
    await fireEvent.click(rowBox('available', 'alpha'));
    flushSync();
    await fireEvent.click(rowBox('available', 'beta'));
    flushSync();
    await fireEvent.click(mover('assigned'));
    flushSync();
    expect(committed()).toBe('a,b');
  });

  it('backward moves BOUNCE: the committed list never shrinks', async () => {
    const { host, rowBox, mover, committed } = setup();
    // move a + b forward first
    await fireEvent.click(rowBox('available', 'alpha'));
    flushSync();
    await fireEvent.click(mover('assigned'));
    flushSync();
    // then try to pull a back
    await fireEvent.click(rowBox('assigned', 'alpha'));
    flushSync();
    await fireEvent.click(mover('available'));
    flushSync();
    expect(committed()).toBe('a');
    expect(host().getAttribute('data-rejected')).toBe('1');
  });

  it('batch select-all commits every ENABLED option at once; return all clears', async () => {
    const rendered = render(TransferOnewayHost);
    const host = rendered.container.querySelector('[data-transfer-host]')!;
    await fireEvent.click(host.querySelector('[data-batch-controls] button')!);
    flushSync();
    // delta is disabled and stays behind
    expect(host.getAttribute('data-committed')).toBe('a,b,c,e');
    await fireEvent.click(host.querySelectorAll('[data-batch-controls] button')[1]!);
    flushSync();
    expect(host.getAttribute('data-committed')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// tour — non-modal law + custom indicators via card(api)
// ---------------------------------------------------------------------------
describe('tour recipes: non-modal + custom indicators', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.className = '';
  });

  it('an open tour never clamps body/documentElement scroll', async () => {
    const rendered = render(TourNonmodalHost);
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    const panel = rendered.container.querySelector('[role="dialog"]')!;
    expect(panel.getAttribute('aria-modal')).toBe('false');
    expect(panel.matches(':popover-open')).toBe(true);
    // THE non-modal law: no overflow clamp, no scroll-lock class anywhere
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.className).not.toContain('overflow');
    expect(document.documentElement.className).not.toContain('overflow');
    // the tint hints but never intercepts pointers
    const hole = rendered.container.querySelector('.jx-tour-hole')!;
    expect(hole.classList.contains('pointer-events-none')).toBe(true);
  });

  it('card(api) renders custom step indicators tracking the live index', async () => {
    const rendered = render(TourNonmodalHost);
    await fireEvent.click(rendered.container.querySelector('[data-tour-indicator-open]')!);
    flushSync();
    const dots = () => [...rendered.container.querySelectorAll('[data-tour-dot]')];
    expect(dots().length).toBe(2);
    expect(dots()[0].hasAttribute('data-tour-dot-active')).toBe(true);
    expect(dots()[1].hasAttribute('data-tour-dot-active')).toBe(false);

    await fireEvent.click(rendered.container.querySelector('[data-tour-card-next]')!);
    flushSync();
    expect(dots()[0].hasAttribute('data-tour-dot-active')).toBe(false);
    expect(dots()[1].hasAttribute('data-tour-dot-active')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// statistic — countdown (fake timers) + precision matrix
// ---------------------------------------------------------------------------
describe('statistic recipes: countdown + precision', () => {
  it('ticks once per second in mm:ss and finishes at 00:00', async () => {
    vi.useFakeTimers();
    try {
      const rendered = render(StatisticCountdownHost);
      const host = rendered.container.querySelector('[data-countdown-host]')!;
      const value = () => host.querySelector('[data-jx-stat-num]')!.textContent;

      await fireEvent.click(rendered.container.querySelector('[data-countdown-start]')!);
      flushSync();
      expect(value()).toBe('00:03');

      await vi.advanceTimersByTimeAsync(1_000);
      expect(value()).toBe('00:02');

      await vi.advanceTimersByTimeAsync(2_000);
      expect(value()).toBe('00:00');
      expect(host.getAttribute('data-finished')).toBe('yes');
      expect(host.getAttribute('data-running')).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('reset restores the window and clears the finished flag', async () => {
    vi.useFakeTimers();
    try {
      const rendered = render(StatisticCountdownHost);
      const host = rendered.container.querySelector('[data-countdown-host]')!;
      await fireEvent.click(rendered.container.querySelector('[data-countdown-start]')!);
      await vi.advanceTimersByTimeAsync(3_000);
      expect(host.getAttribute('data-finished')).toBe('yes');

      await fireEvent.click(rendered.container.querySelector('[data-countdown-reset]')!);
      flushSync();
      expect(host.querySelector('[data-jx-stat-num]')!.textContent).toBe('00:03');
      expect(host.getAttribute('data-finished')).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('the precision matrix formats one number at 0/2/3 digits', async () => {
    const rendered = render(StatisticCountdownHost);
    const host = rendered.container.querySelector('[data-precision-host]')!;
    const value = () => host.querySelector('[data-jx-stat-num]')!.textContent;
    expect(value()).toBe('1,234.50');

    await fireEvent.click(host.querySelector('[data-precision-btn="0"]')!);
    flushSync();
    expect(value()).toBe('1,235');

    await fireEvent.click(host.querySelector('[data-precision-btn="3"]')!);
    flushSync();
    expect(value()).toBe('1,234.500');
  });
});

// ---------------------------------------------------------------------------
// source guards — CSS laws jsdom cannot apply (the composition-a
// convention): the sticky-header recipe and its followup trail
// ---------------------------------------------------------------------------
describe('table recipe: sticky header (source guard)', () => {
  it('the page authors the consumer sticky law on the figure scrollport', () => {
    expect(tablePage).toContain('sticky-scroll');
    expect(tablePage).toMatch(/position:\s*sticky/);
    expect(tablePage).toMatch(/thead th/);
    expect(tablePage).toMatch(/max-block-size/);
  });

  it('the recipes keep stack={false} (the interactive layer demos the scroll law)', () => {
    expect(tablePage).toContain('stack={false}');
  });
});
