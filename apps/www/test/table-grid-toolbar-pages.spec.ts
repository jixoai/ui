/**
 * table-grid-toolbar PAGE smoke suite (openspec change
 * 2026-08-30-table-grid-toolbar, 2026-08-30).
 *
 * The recipe LOGIC is pinned by table-grid-toolbar.spec.ts through
 * fixtures; this suite pins the five PAGES themselves: each mounts in
 * jsdom (compile + SSR smoke through the real component tree — the
 * full-page mount is the docs-structure lint's prerequisite) and keeps
 * the docs-demo-standard skeleton contract — Intro → Install → Usage
 * (exactly one) → Examples → API → See also — plus the recipe sections
 * the change ships.
 *
 * The route components take no props (the toc ships as page data to
 * the LAYOUT), so a bare render is the honest mount.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import DescriptionsPage from '../src/routes/docs/components/descriptions.html/+page.svelte';
import StatisticPage from '../src/routes/docs/components/statistic.html/+page.svelte';
import TablePage from '../src/routes/docs/components/table.html/+page.svelte';
import TourPage from '../src/routes/docs/components/tour.html/+page.svelte';
import TransferPage from '../src/routes/docs/components/transfer.html/+page.svelte';

/** the skeleton contract every docs-demo-standard page keeps */
function expectSkeleton(container: HTMLElement, sections: string[]): void {
  for (const id of sections) {
    expect(
      container.querySelector(`#${id}`),
      `page section #${id} must render`,
    ).not.toBeNull();
  }
  // exactly one Usage h2 (the docs-structure law: case-drift seeds here)
  const usageHeadings = [...container.querySelectorAll('h2')].filter(
    (h2) => h2.textContent?.trim() === 'Usage',
  );
  expect(usageHeadings.length, 'exactly ONE Usage h2').toBe(1);
  // every mounted canvas carries its playground pane (the structure lint)
  const canvases = container.querySelectorAll('[data-jx-canvas]');
  expect(canvases.length).toBeGreaterThan(0);
  for (const canvas of canvases) {
    expect(
      canvas.querySelector('[data-jx-canvas-playground-title]'),
      'every canvas ships a playground pane',
    ).not.toBeNull();
  }
}

describe('docs pages: table-grid-toolbar (mount + skeleton)', () => {
  it('table — the recipe suite renders end to end', () => {
    const { container, unmount } = render(TablePage);
    expectSkeleton(container, [
      'install',
      'usage',
      'examples',
      'table-sortable',
      'table-filter-row',
      'table-pagination',
      'table-selection',
      'table-row-actions',
      'table-sticky-header',
      'table-tasks',
      'api',
      'see-also',
    ]);
    // the sort wiring is live on the page itself: sortable th mounts a
    // real button, the tasks table renders its toolbar + footer
    expect(container.querySelector('#table-sortable th button')).not.toBeNull();
    expect(container.querySelector('#table-tasks [data-jx-tgroup]')).not.toBeNull();
    unmount();
  });

  it('transfer — oneWay + batch select-all sections render', () => {
    const { container, unmount } = render(TransferPage);
    expectSkeleton(container, [
      'install',
      'usage',
      'examples',
      'transfer-one-way',
      'transfer-select-all',
      'api',
      'see-also',
    ]);
    unmount();
  });

  it('tour — non-modal + placement + indicators sections render', () => {
    const { container, unmount } = render(TourPage);
    expectSkeleton(container, [
      'install',
      'usage',
      'examples',
      'tour-non-modal',
      'tour-placement',
      'tour-placement-table',
      'tour-indicators',
      'api',
      'see-also',
    ]);
    // the 12-placement reference table renders its full matrix
    expect(container.querySelectorAll('#tour-placement-table tbody tr').length).toBe(12);
    unmount();
  });

  it('descriptions — vertical + responsive + extra sections render', () => {
    const { container, unmount } = render(DescriptionsPage);
    expectSkeleton(container, [
      'install',
      'usage',
      'examples',
      'descriptions-vertical',
      'descriptions-responsive',
      'descriptions-extra',
      'api',
      'see-also',
    ]);
    // vertical recipe: the Item grid override class landed on cells
    expect(container.querySelectorAll('#descriptions-vertical .grid-cols-1\\!').length).toBeGreaterThan(0);
    unmount();
  });

  it('statistic — countdown + affix/precision sections render', () => {
    const { container, unmount } = render(StatisticPage);
    expectSkeleton(container, [
      'install',
      'usage',
      'examples',
      'statistic-countdown',
      'statistic-affix-precision',
      'api',
      'see-also',
    ]);
    unmount();
  });
});
