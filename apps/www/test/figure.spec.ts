/**
 * figure/figure.svelte — batch 2 gates (design §2/§1.1/§1.1c/§1.2):
 * the counting matrix (multi-root parallel domains, kind series
 * independence, document-scope union + the mixed state, nested-domain
 * shadowing), the bare-use escape, the citedIn render/emit contract,
 * the caption-default shape, the empty-slot author error, and the id
 * registration whose number thunk reads through a keyed reorder
 * (numbers are display currency — ids never move).
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FigureHost from './fixtures/figure-host.svelte';
import type { TargetRegistry } from '../src/lib/ui/figure/numbering.svelte';

// a failing assertion mid-test skips the inline mockRestore, and
// vi.spyOn(console, 'warn') returns the SAME spy next time — leaked
// call records would bleed across cases. Restore unconditionally.
afterEach(() => {
  vi.restoreAllMocks();
});

/** observer bumps land in a microtask + rAF; two ticks flush the rederives */
const settle = async () => {
  await tick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await tick();
};

const figOf = (container: HTMLElement, key: string): HTMLElement =>
  container.querySelector(`[data-content="${key}"]`)!.closest('figure')! as HTMLElement;

const targets = () => (globalThis as Record<string, unknown>).__figureHostTargets as TargetRegistry;

describe('figure — the counting matrix (batch 2.3)', () => {
  it("multi-root parallel domains: the 4th domain's chapter equations read 4.1 / 4.2", async () => {
    const { container } = render(FigureHost, {
      props: {
        domains: [
          {},
          {},
          {},
          {
            figures: [
              { key: 'eq-a', kind: 'equation', id: 'eq-a' },
              { key: 'eq-b', kind: 'equation' },
            ],
          },
        ],
      },
    });
    await settle();
    expect(figOf(container, 'eq-a').getAttribute('data-number')).toBe('4.1');
    expect(figOf(container, 'eq-a').querySelector('figcaption')!.textContent).toBe('Equation 4.1');
    // no id still numbers (display currency) but never addresses
    expect(figOf(container, 'eq-b').getAttribute('data-number')).toBe('4.2');
    expect(figOf(container, 'eq-b').id).toBe('');
  });

  it('kind series independence: each kind counts its own series; labels from the single source', async () => {
    const { container } = render(FigureHost, {
      props: {
        domains: [
          {
            figures: [
              { key: 'e1', kind: 'equation' },
              { key: 't1', kind: 'table' },
              { key: 'e2', kind: 'equation' },
              { key: 'l1', kind: 'listing' },
              { key: 'f1', kind: 'figure' },
            ],
          },
        ],
      },
    });
    await settle();
    expect(figOf(container, 'e1').getAttribute('data-number')).toBe('1.1');
    expect(figOf(container, 't1').getAttribute('data-number')).toBe('1.1');
    expect(figOf(container, 'e2').getAttribute('data-number')).toBe('1.2');
    expect(figOf(container, 'l1').getAttribute('data-number')).toBe('1.1');
    expect(figOf(container, 'f1').getAttribute('data-jx-figure')).toBe('figure');
    expect(figOf(container, 'f1').querySelector('[data-jx-figure-label]')!.textContent).toBe('Figure');
    expect(figOf(container, 't1').querySelector('[data-jx-figure-label]')!.textContent).toBe('Table');
  });

  it('document scope: two domains join into one continuous series; unlisted kinds stay chapter (the mixed state)', async () => {
    const { container } = render(FigureHost, {
      props: {
        domains: [
          { floatScope: { equation: 'document' }, figures: [{ key: 'eq1', kind: 'equation' }] },
          {
            floatScope: { equation: 'document' },
            figures: [
              { key: 'eq2', kind: 'equation' },
              { key: 'tbl', kind: 'table' },
              { key: 'eq3', kind: 'equation' },
            ],
          },
        ],
      },
    });
    await settle();
    expect(figOf(container, 'eq1').getAttribute('data-number')).toBe('1');
    expect(figOf(container, 'eq2').getAttribute('data-number')).toBe('2');
    expect(figOf(container, 'eq3').getAttribute('data-number')).toBe('3');
    // the table kind never declared document: chapter form in its own domain
    expect(figOf(container, 'tbl').getAttribute('data-number')).toBe('2.1');
  });

  it('nested-domain shadowing: the inner series restarts at its own 1 and never consumes outer ordinals', async () => {
    const { container } = render(FigureHost, {
      props: {
        domains: [
          {
            figures: [
              { key: 'o1', kind: 'equation' },
              { key: 'o2', kind: 'equation' },
            ],
            nested: [{ figures: [{ key: 'i1', kind: 'equation' }] }],
          },
        ],
      },
    });
    await settle();
    expect(figOf(container, 'o1').getAttribute('data-number')).toBe('1.1');
    expect(figOf(container, 'o2').getAttribute('data-number')).toBe('1.2'); // i1 does not consume
    expect(figOf(container, 'i1').getAttribute('data-number')).toBe('1.1'); // the inner local restart
  });
});

describe('figure — bare use, citedIn, caption shapes (batch 2.1/2.2)', () => {
  it('bare use (no domain): renders + harvests the kind, never numbers, warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(FigureHost, {
      props: { bare: [{ key: 'bare-eq', kind: 'equation', caption: 'bare caption' }] },
    });
    const f = container.querySelector('[data-bare-zone] figure')! as HTMLElement;
    expect(f.getAttribute('data-jx-figure')).toBe('equation');
    expect(f.getAttribute('data-number')).toBeNull();
    expect(f.querySelector('[data-jx-number]')).toBeNull(); // the node itself is absent
    expect(f.querySelector('[data-jx-figure-label]')!.textContent).toBe('Equation');
    expect(f.querySelector('figcaption')!.textContent).toBe('Equation bare caption');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('escaped any numbering domain'));
    warn.mockRestore();
  });

  it('citedIn: renders the tail, emits the JSON array on both the figure and the span; omits on empty/absent', async () => {
    const { container } = render(FigureHost, {
      props: {
        domains: [
          {
            figures: [
              {
                key: 't1',
                kind: 'table',
                id: 'tbl-results',
                caption: '实测与预测对照',
                citedIn: ['§ 3.1', '§ 4.2'],
              },
              { key: 't2', kind: 'table', citedIn: [] },
              { key: 't3', kind: 'table' },
            ],
          },
        ],
      },
    });
    await settle();
    const f1 = figOf(container, 't1');
    expect(f1.getAttribute('data-cited-in')).toBe('["§ 3.1","§ 4.2"]');
    const span = f1.querySelector('[data-cited-in]')!;
    expect(span.getAttribute('data-cited-in')).toBe('["§ 3.1","§ 4.2"]');
    expect(f1.querySelector('figcaption')!.textContent).toBe('Table 1.1 实测与预测对照 · § 3.1 · § 4.2');
    expect(f1.querySelector('[data-jx-number]')!.textContent).toBe('1.1');
    // empty array and absence both leave NO node and NO attribute
    expect(figOf(container, 't2').getAttribute('data-cited-in')).toBeNull();
    expect(figOf(container, 't2').querySelector('[data-cited-in]')).toBeNull();
    expect(figOf(container, 't3').getAttribute('data-cited-in')).toBeNull();
    expect(figOf(container, 't3').querySelector('[data-cited-in]')).toBeNull();
  });

  it('caption default: absent caption leaves label + number only (no trailing space)', async () => {
    const { container } = render(FigureHost, {
      props: { domains: [{ figures: [{ key: 'l1', kind: 'listing' }] }] },
    });
    await settle();
    const cap = figOf(container, 'l1').querySelector('figcaption')!;
    expect(cap.textContent).toBe('Listing 1.1');
    expect(cap.children).toHaveLength(2); // exactly label + number
  });
});

describe('figure — registration and the display-currency gate (batch 2.1)', () => {
  it('id registration: a numbered id-carrying figure registers a live number thunk; a keyed reorder renumbers, ids stay', async () => {
    const domains = [
      {
        figures: [
          { key: 'eq-a', kind: 'equation', id: 'eq-a', caption: 'first' },
          { key: 'eq-b', kind: 'equation', id: 'eq-b', caption: 'second' },
        ],
      },
    ];
    const { container, rerender } = render(FigureHost, { props: { domains } });
    await settle();
    const reg = targets();
    expect(reg.getTarget('eq-a')).toBeTruthy();
    expect(reg.getTarget('eq-a')!.number()).toBe('1.1');
    expect(reg.getTarget('eq-b')!.number()).toBe('1.2');

    await rerender({ domains, order: ['eq-b', 'eq-a'] });
    await settle();
    const a = figOf(container, 'eq-a');
    expect(a.getAttribute('data-number')).toBe('1.2'); // renumbered
    expect(a.id).toBe('eq-a'); // the id never moves
    expect(a.querySelector('figcaption')!.textContent).toBe('Equation 1.2 first');
    expect(reg.getTarget('eq-a')!.number()).toBe('1.2'); // the thunk reads through
    expect(reg.getTarget('eq-b')!.number()).toBe('1.1');
  });

  it('empty content slot: exactly one dev warn (an author error)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(FigureHost, {
      props: {
        domains: [{ figures: [{ key: 'filled', kind: 'listing' }, { key: 'hollow', kind: 'listing', empty: true }] }],
      },
    });
    await settle();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('empty content slot'));
    warn.mockRestore();
  });
});
