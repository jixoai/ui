/**
 * tree-view caret override contract (test/kit/tree-view-caret.spec.ts,
 * design-studio #35, 2026-09-12) — validates the registry change on the
 * component branch (component/tree-view-caret) through the design
 * branch's own suite (same-source import; the www suite's equivalent
 * spec runs in CI on a clean install).
 *
 * Contracts: a `caret` snippet owns the glyph column for every node
 * (built-in chevron/plus gone), is driven per-node by the item ctx,
 * and keeps living inside the jx-tree-caret span (rotation CSS intact).
 */
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import CaretHost from './fixtures/tree-caret-host.svelte';

afterEach(cleanup);

describe('tree-view caret override (#35)', () => {
  it('the consumer glyph replaces the built-in chevron in the caret cell', () => {
    const { container } = render(CaretHost);
    const tree = container.querySelector('[role="tree"][aria-label="caret host"]')!;
    expect(tree).toBeTruthy();
    expect(tree.querySelectorAll('.jx-tree-caret').length).toBeGreaterThan(0);
    // the consumer's chevron paints; the built-in lucide svg does not
    expect(tree.querySelector('.host-chev')).toBeTruthy();
    expect(tree.querySelector('.jx-tree-caret svg.lucide')).toBeNull();
  });

  it('the glyph is per-node ctx — the loading folder spins, the ready one chevrons', () => {
    const { container } = render(CaretHost);
    const tree = container.querySelector('[role="tree"][aria-label="caret host"]')!;
    const loadingRow = tree.querySelector('li[data-path="loading"] .jx-tree-row')!;
    const readyRow = tree.querySelector('li[data-path="ready"] .jx-tree-row')!;
    expect(loadingRow.querySelector('.host-spin')).toBeTruthy();
    expect(loadingRow.querySelector('.host-chev')).toBeNull();
    expect(readyRow.querySelector('.host-chev')).toBeTruthy();
    expect(readyRow.querySelector('.host-spin')).toBeNull();
  });

  it('the caret cell keeps the jx-tree-caret span — collapse rotation CSS still applies', () => {
    const { container } = render(CaretHost);
    const tree = container.querySelector('[role="tree"][aria-label="caret host"]')!;
    const leafRow = tree.querySelector('li[data-path="leaf"] .jx-tree-row')!;
    expect(leafRow.querySelector('.jx-tree-caret')).toBeTruthy();
  });
});
