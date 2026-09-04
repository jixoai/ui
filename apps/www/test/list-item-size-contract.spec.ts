/**
 * The size contract (list-item-size-contract, 2026-09-05) — declared
 * responsive width ladders for the end lane: ItemEnd stamps its typed
 * size prop, field adapters forward it (a fitted field lane relaxes its
 * never-split stance), the fixed semantic (wrap="never") and a ladder
 * are mutually exclusive, and the family sheet carries the ladder +
 * the subgrid narrow fold for declared lanes. Source-pinned sections
 * guard the css law itself (the family's sheet, not a consumer copy).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ItemSizeHost from './fixtures/item-size-host.svelte';
import ItemEndConflictHost from './fixtures/item-end-conflict-host.svelte';

const lanes = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-slot="item-end"]')] as HTMLElement[];

describe('list-item size contract', () => {
  it('ItemEnd stamps the ladder: md/lg/full, absent when undeclared, wrap stays separate', () => {
    const { container } = render(ItemSizeHost);
    const stamped = lanes(container).map((el) => el.getAttribute('data-fit'));
    expect(stamped).toEqual(['md', 'lg', 'full', null, null, 'lg', 'md', 'md']);
    // undeclared + fixed lanes keep their wrap posture untouched
    expect(lanes(container)[3].getAttribute('data-wrap')).toBe('auto');
    expect(lanes(container)[4].getAttribute('data-wrap')).toBe('never');
  });

  it('field adapters forward size and a fitted field lane relaxes wrap="never"', () => {
    const { container } = render(ItemSizeHost);
    const [mdLane, lgLane, fullLane, bareLane, fixedLane, adapterText, adapterNumber, adapterSelect] =
      lanes(container);
    // bare ItemField (none here) keeps never; sized adapters go auto + stamped
    expect(adapterText.getAttribute('data-wrap')).toBe('auto');
    expect(adapterText.getAttribute('data-fit')).toBe('lg');
    expect(adapterNumber.getAttribute('data-fit')).toBe('md');
    expect(adapterSelect.getAttribute('data-fit')).toBe('md');
    void [mdLane, lgLane, fullLane, bareLane, fixedLane];
  });

  it('size + wrap="never" is a contract contradiction and throws at init', () => {
    expect(() => render(ItemEndConflictHost)).toThrow(/mutually exclusive/u);
  });
});

describe('list-item size contract — the sheet is source-pinned', () => {
  const sheet = readFileSync(
    resolve(__dirname, '../src/lib/ui/list-item/item.css'),
    'utf8',
  );

  it('carries the ladder rungs and the flex-fill contract on the family token', () => {
    expect(sheet).toContain("[data-slot='item-end'][data-fit='md']");
    expect(sheet).toMatch(/\[data-fit\][^\{]*\{[^}]*flex: 1 1 auto/su);
    expect(sheet).toContain("[data-slot='item-end'][data-fit='lg']");
    expect(sheet).toContain("[data-slot='item-end'][data-fit='full']");
    expect(sheet).toMatch(/--jx-item-end-w:\s*10rem/u);
    expect(sheet).toMatch(/--jx-item-end-w:\s*7rem/u);
    expect(sheet).toMatch(/--jx-item-end-w:\s*16rem/u);
    expect(sheet).toMatch(/--jx-item-end-w:\s*11rem/u);
  });

  it('steps down at the mid tier and folds declared lanes at 30rem, per ruler, subgrid intact', () => {
    expect(sheet).toMatch(/@container jx-items \(max-width: 44rem\)/u);
    // the subgrid narrow fold consumes the declared stamp in BOTH rulers
    const rulerFolds = sheet.match(/\[data-ruler='[a-z-]+'\][^{}]*:has\(> \[data-slot='item-end'\]\[data-fit\]\)/gu) ?? [];
    expect(new Set(rulerFolds.map((s) => s.match(/data-ruler='([a-z-]+)'/u)![1])).size).toBe(2);
    // the fold keeps the subgrid columns (B1: areas-only, never a column
    // reset) — checked per fold RULE BLOCK, not per file section
    const foldBlocks = sheet.match(/:has\(> \[data-slot='item-end'\]\[data-fit\]\)[^{]*\{[^}]*\}/gu) ?? [];
    for (const block of foldBlocks) expect(block).not.toContain('grid-template-columns');
  });
});
