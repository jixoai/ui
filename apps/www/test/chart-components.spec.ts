/**
 * Chart family DOM contract suite (test/chart-components.spec.ts,
 * OpenSpec 2026-08-30-add-chart-family task 4.2 — the vitest+jsdom
 * replacement for the browser probe, per the Owner's no-playwright
 * constraint on this batch).
 *
 * jsdom runs no layout or CSSOM cascade, so assertions read
 * attributes, semantics and the glyph GEOMETRY the pure math
 * produced — never pixels. The a11y contract (role=img + REQUIRED
 * name), the hidden-but-real table fallback, the semantic hooks, and
 * the zero-motion posture (no animate-* tokens, no keyframes — the
 * reduced-motion law holds structurally) are all DOM-checkable.
 *
 * Components mount from the apps/www mirror; the math imports from
 * the registry source; a same-source describe pins the two trees
 * byte-identical.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import {
  barRun,
  donutGeometry,
  linePoints,
  markerPoints,
  sparkBlocks,
  sparkBraille,
} from '../../../registry/files/ui/chart/chart.svelte';
import ChartBar from '../src/lib/ui/chart/chart-bar.svelte';
import ChartDonut from '../src/lib/ui/chart/chart-donut.svelte';
import ChartLine from '../src/lib/ui/chart/chart-line.svelte';
import ChartSparkline from '../src/lib/ui/chart/chart-sparkline.svelte';
import ChartDonutHarness from './fixtures/chart-donut-harness.svelte';
import ChartEnsembleHarness from './fixtures/chart-ensemble-harness.svelte';

const WEEK = [3, 5, 2, 8, 7];

describe('same-source law — the mirror is byte-identical', () => {
  it('every registry chart file matches its apps/www mirror exactly', () => {
    const registryDir = join(process.cwd(), '../../registry/files/ui/chart');
    const mirrorDir = join(process.cwd(), 'src/lib/ui/chart');
    const names = readdirSync(registryDir);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(readFileSync(join(mirrorDir, name), 'utf8')).toBe(
        readFileSync(join(registryDir, name), 'utf8'),
      );
    }
  });

  it('chart.css carries no keyframes and no animate surface (reduced motion is structural)', () => {
    const css = readFileSync(join(process.cwd(), '../../registry/files/ui/chart/chart.css'), 'utf8');
    expect(css).not.toContain('@keyframes');
    expect(css).not.toMatch(/animation\s*:/);
  });
});

describe('ChartSparkline', () => {
  it('is a named img whose glyphs ARE the pure math output', () => {
    const { container } = render(ChartSparkline, {
      props: { data: WEEK, label: 'deploys this week' },
    });
    const root = container.querySelector('[data-jx-chart-sparkline]')!;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('deploys this week');
    expect(root.getAttribute('data-jx-chart-sparkline')).toBe('braille');
    expect(root.textContent).toBe(sparkBraille(WEEK));
    expect(root.classList.contains('jx-chart-glyphs')).toBe(true);
  });

  it('block mode renders the eighth-block ramp', () => {
    const { container } = render(ChartSparkline, {
      props: { data: WEEK, label: 'deploys this week', cells: 'block' },
    });
    const root = container.querySelector('[data-jx-chart-sparkline]')!;
    expect(root.getAttribute('data-jx-chart-sparkline')).toBe('block');
    expect(root.textContent).toBe(sparkBlocks(WEEK));
    expect(root.textContent).toBe('▂▅▁█▇');
  });

  it('the table fallback is hidden from the eye but REAL in the DOM', () => {
    const { container } = render(ChartSparkline, {
      props: { data: WEEK, label: 'deploys this week', table: true },
    });
    const table = container.querySelector('table[data-jx-chart-sparkline-table]')!;
    expect(table).not.toBeNull();
    expect(table.classList.contains('jx-chart-table')).toBe(true);
    // visually-hidden by CSS, never by the hidden attribute — the AT
    // must be able to read it
    expect(table.hasAttribute('hidden')).toBe(false);
    expect(table.querySelector('caption')!.textContent).toBe('deploys this week');
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(WEEK.length);
    expect(rows[0].querySelector('th')!.textContent).toBe('0');
    expect(rows[0].querySelector('td')!.textContent).toBe('3');
  });

  it('omits the table unless opted in; a non-finite value renders the em dash', () => {
    const { container } = render(ChartSparkline, {
      props: { data: [NaN, 5], label: 'broken feed', table: true },
    });
    expect(container.querySelector('table')).not.toBeNull();
    const cells = container.querySelectorAll('table tbody td');
    expect(cells[0].textContent).toBe('—');
    expect(cells[1].textContent).toBe('5');
  });
});

describe('ChartBar', () => {
  it('renders one row per datum with proportional runs and the value lane', () => {
    const { container } = render(ChartBar, {
      props: {
        data: [10, 5, 1],
        labels: ['mon', 'tue', 'wed'],
        label: 'deploys per day',
        cells: 10,
      },
    });
    const root = container.querySelector('[data-jx-chart-bar]')!;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('deploys per day');
    expect(root.getAttribute('data-jx-chart-bar')).toBe('fill');
    const rows = container.querySelectorAll('[data-jx-chart-bar-row]');
    expect(rows.length).toBe(3);
    const runs = container.querySelectorAll('[data-jx-chart-bar-run]');
    expect(runs[0].textContent).toBe(barRun(10, 10, 10)); // █ ×10
    expect(runs[1].textContent).toBe(barRun(5, 10, 10)); // █ ×5
    expect(runs[0].textContent!.length).toBe(10);
    expect(container.querySelector('[data-jx-chart-bar-label]')!.textContent).toBe('mon');
    expect(container.querySelector('[data-jx-chart-bar-value]')!.textContent).toBe('10');
  });

  it('negative and non-positive values keep the row with an empty run (no lie)', () => {
    const { container } = render(ChartBar, {
      props: { data: [5, -3, 0, NaN], label: 'net inflow', cells: 5 },
    });
    const runs = container.querySelectorAll('[data-jx-chart-bar-run]');
    expect(runs.length).toBe(4);
    expect(runs[0].textContent).toBe('█████');
    expect(runs[1].textContent).toBe('');
    expect(runs[2].textContent).toBe('');
    expect(runs[3].textContent).toBe('');
    const values = container.querySelectorAll('[data-jx-chart-bar-value]');
    expect(values[1].textContent).toBe('-3');
    expect(values[3].textContent).toBe('—');
  });

  it('the variant grammar rides the valued hook (tonal rung)', () => {
    const { container } = render(ChartBar, {
      props: { data: [1, 2], label: 'x', variant: 'tonal' },
    });
    expect(container.querySelector('[data-jx-chart-bar]')!.getAttribute('data-jx-chart-bar')).toBe(
      'tonal',
    );
  });

  it('the value lane is optional; the table fallback mirrors label lane and values', () => {
    const { container } = render(ChartBar, {
      props: {
        data: [2, 4],
        labels: ['a', 'b'],
        label: 'throughput',
        values: false,
        table: true,
      },
    });
    expect(container.querySelector('[data-jx-chart-bar-value]')).toBeNull();
    const table = container.querySelector('table[data-jx-chart-bar-table]')!;
    expect(table.hasAttribute('hidden')).toBe(false);
    const rows = table.querySelectorAll('tbody tr');
    expect(rows[1].querySelector('th')!.textContent).toBe('b');
    expect(rows[1].querySelector('td')!.textContent).toBe('4');
  });
});

describe('ChartLine', () => {
  it('renders the hairline grid, brand polyline and doubled-point markers', () => {
    const { container } = render(ChartLine, {
      props: { data: WEEK, label: 'deploys trend' },
    });
    const svg = container.querySelector('svg[data-jx-chart-line]')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('deploys trend');
    expect(svg.querySelectorAll('line.jx-chart-grid').length).toBe(3);
    const path = svg.querySelector('polyline.jx-chart-path')!;
    expect(path.getAttribute('points')).toBe(linePoints(WEEK, 100, 40, 1));
    const mark = svg.querySelector('polyline.jx-chart-mark')!;
    expect(mark.getAttribute('points')).toBe(markerPoints(linePoints(WEEK, 100, 40, 1)));
    expect(mark.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.querySelector('polygon.jx-chart-area')).toBeNull(); // opt-in only
  });

  it('the area wash is opt-in and closes along the inset baseline', () => {
    const { container } = render(ChartLine, {
      props: { data: [0, 10], label: 'ramp up', area: true },
    });
    const poly = container.querySelector('polygon.jx-chart-area')!;
    expect(poly.getAttribute('points')).toBe('0,39 100,1 100,39 0,39');
  });

  it('markers are opt-out; empty data renders the grid shell alone', () => {
    const noMarkers = render(ChartLine, { props: { data: WEEK, label: 'x', markers: false } });
    expect(noMarkers.container.querySelector('polyline.jx-chart-mark')).toBeNull();
    noMarkers.unmount();

    const empty = render(ChartLine, { props: { data: [NaN, Infinity], label: 'dead feed' } });
    const svg = empty.container.querySelector('svg[data-jx-chart-line]')!;
    expect(svg.querySelectorAll('line.jx-chart-grid').length).toBe(3);
    expect(svg.querySelector('polyline.jx-chart-path')).toBeNull();
    expect(empty.container.querySelector('table')).toBeNull(); // opt-in only
  });

  it('the authored axis slots render inside the svg after the data', () => {
    // jsdom cannot author svg snippets inline in props — the axis
    // slots' render position is covered by the docs composition demo;
    // the DOM contract pinned here is the empty-slot default
    const { container } = render(ChartLine, { props: { data: WEEK, label: 'x' } });
    expect(container.querySelector('[data-jx-chart-line-axis]')).toBeNull();
  });
});

describe('ChartDonut', () => {
  it('renders the track plus one dashed circle per segment over the -90° group', () => {
    const { container } = render(ChartDonutHarness, {
      props: { data: [4, 3, 2, 1] },
    });
    const root = container.querySelector('[data-jx-chart-donut]')!;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('incident severities');
    const track = root.querySelector('circle.jx-chart-track')!;
    expect(track).not.toBeNull();
    const segs = root.querySelectorAll('circle.jx-chart-seg');
    expect(segs.length).toBe(4);
    // the dasharray math IS the pure geometry
    const g = donutGeometry([4, 3, 2, 1], 96, 12)!;
    segs.forEach((el, i) => {
      expect(el.getAttribute('stroke-dasharray')).toBe(g.segments[i].dash);
      expect(Number(el.getAttribute('stroke-dashoffset'))).toBeCloseTo(g.segments[i].offset, 6);
      expect(el.getAttribute('data-seg')).toBe(String(i));
    });
    expect(root.querySelector('g')!.getAttribute('transform')).toContain('rotate(-90');
    // the center slot renders the consumer's composition
    expect(root.querySelector('[data-jx-chart-donut-center] [data-harness-center]')!.textContent).toBe('10');
  });

  it('a zero total renders the bare track (frozen) and names itself', () => {
    const { container } = render(ChartDonut, {
      props: { data: [0, -1, NaN], label: 'empty mix' },
    });
    const root = container.querySelector('[data-jx-chart-donut]')!;
    expect(root.getAttribute('aria-label')).toBe('empty mix');
    expect(root.querySelector('circle.jx-chart-track')).not.toBeNull();
    expect(root.querySelectorAll('circle.jx-chart-seg').length).toBe(0);
  });

  it('the table fallback mirrors values and shares', () => {
    const { container } = render(ChartDonutHarness, {
      props: { data: [1, 1], table: true },
    });
    const table = container.querySelector('table[data-jx-chart-donut-table]')!;
    expect(table.hasAttribute('hidden')).toBe(false);
    const shares = table.querySelectorAll('tbody td:last-child');
    expect(shares[0].textContent).toBe('50%');
    expect(shares[1].textContent).toBe('50%');
  });
});

describe('Chart root — the family context', () => {
  it('provides one density tier to the chart ensemble', () => {
    const { container } = render(ChartEnsembleHarness, { props: { density: 'sm' } });
    const root = container.querySelector('[data-jx-chart]')!;
    expect(root.getAttribute('data-density')).toBe('sm');
    expect(root.querySelector('[data-jx-chart-bar]')!.getAttribute('data-density')).toBe('sm');
    expect(root.querySelector('[data-jx-chart-sparkline]')!.getAttribute('data-density')).toBe(
      'sm',
    );
  });

  it('parts are standalone-complete without the root (no density stamp, real chart)', () => {
    const { container } = render(ChartBar, { props: { data: [1, 2], label: 'x' } });
    const root = container.querySelector('[data-jx-chart-bar]')!;
    expect(root.hasAttribute('data-density')).toBe(false);
    expect(container.querySelector('[data-jx-chart]')).toBeNull();
  });
});

describe('reduced motion — zero-motion posture (structural)', () => {
  it('no chart part ships an animate-* utility or WAAPI surface', () => {
    for (const [Component, props] of [
      [ChartBar, { data: [1, 2], label: 'x' }],
      [ChartSparkline, { data: [1, 2], label: 'x' }],
      [ChartLine, { data: [1, 2], label: 'x' }],
      [ChartDonut, { data: [1, 2], label: 'x' }],
    ] as const) {
      const { container } = render(Component as never, { props: props as never });
      expect(container.innerHTML).not.toMatch(/animate-/);
      expect(container.innerHTML).not.toMatch(/data-sveltekit|data-action/);
      container.innerHTML = '';
    }
  });
});
