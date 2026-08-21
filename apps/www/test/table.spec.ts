/**
 * Table component contract suite (test/table.spec.ts, 2026-08-22).
 *
 * Deepening round (original request: 参考 codepen.io/viki-code/pen/JjxGgmm
 * 改进 table 组件). The component owns ONLY the frame — thead/tbody/tfoot/
 * th/td/caption stay consumer-authored through a real snippet (mounted via
 * test/fixtures/table-harness.svelte) — so the contract under test is the
 * DOM shape the two container-query laws (scroll / stack) and the
 * --jx-table-* color surface hang off. jsdom runs no layout or container
 * queries, so assertions read attributes and semantics, never geometry.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TableHarness from './fixtures/table-harness.svelte';

describe('Table', () => {
  it('preserves the native semantic set inside the figure frame', () => {
    const { container } = render(TableHarness, { props: { caption: 'environment support' } });

    const figure = container.querySelector('figure.jx-table');
    const table = figure?.querySelector('table');
    expect(figure).not.toBeNull();
    expect(table).not.toBeNull();

    // the full semantic set stays real elements, consumer order intact
    for (const tag of ['caption', 'thead', 'tbody', 'tfoot']) {
      expect(table!.querySelector(tag), `<${tag}> must survive as a real element`).not.toBeNull();
    }
    expect(table!.querySelector('caption')!.textContent).toBe('environment support');
    expect(table!.querySelectorAll('thead th').length).toBe(3);
  });

  it('keeps the consumer cell opt-in attributes verbatim (data-label, data-sticky)', () => {
    const { container } = render(TableHarness);
    const table = container.querySelector('table')!;

    // the stack law reads td[data-label]; the scroll law reads [data-sticky]
    expect(table.querySelector('tbody td[data-label="Component"]')?.textContent).toBe('press-button');
    expect(table.querySelector('thead th[data-sticky="start"]')).not.toBeNull();
    expect(table.querySelector('tbody td[data-sticky="end"][data-label="Files"]')).not.toBeNull();
  });

  it('stacks by default; stack=false pins the scroll law via data-stack="off"', () => {
    const stacked = render(TableHarness, { props: { stack: true } });
    expect(stacked.container.querySelector('table')!.hasAttribute('data-stack')).toBe(false);
    stacked.unmount();

    const scrolled = render(TableHarness, { props: { stack: false } });
    expect(scrolled.container.querySelector('table')!.getAttribute('data-stack')).toBe('off');
  });

  it('dense toggles the compact class on the table element', () => {
    const normal = render(TableHarness, { props: { dense: false } });
    expect(normal.container.querySelector('table')!.classList.contains('dense')).toBe(false);
    normal.unmount();

    const dense = render(TableHarness, { props: { dense: true } });
    expect(dense.container.querySelector('table')!.classList.contains('dense')).toBe(true);
  });

  it('passes extra classes through to the figure frame', () => {
    const { container } = render(TableHarness, { props: { frameClass: 'w-full extra' } });
    const figure = container.querySelector('figure')!;
    expect(figure.classList.contains('jx-table')).toBe(true);
    expect(figure.classList.contains('w-full')).toBe(true);
    expect(figure.classList.contains('extra')).toBe(true);
  });
});
