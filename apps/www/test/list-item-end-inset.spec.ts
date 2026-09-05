/**
 * The END-INSET OWNERSHIP law, lane edition (2026-09-05, Owner catch:
 * self-padding controls in the end lane made double tails). The
 * optical tail has ONE owner: a self-insetting control at the lane's
 * terminal position declares data-self-inset at its ROOT face; the
 * row drops its trailing inset for that row. Silent controls
 * (checkbox/toggle/plain input) keep the row's inset.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import EndInsetHost from './fixtures/end-inset-host.svelte';

const laneOf = (container: HTMLElement, title: string) =>
  [...container.querySelectorAll('.jx-item')]
    .find((r) => r.textContent.includes(title))!
    .querySelector('[data-slot="item-end"]')!;

describe('end-inset ownership stamps', () => {
  it('select always self-insets (the chevron reserve); plain input does not; clearable input does', () => {
    const { container } = render(EndInsetHost);
    expect(laneOf(container, 'select').firstElementChild.hasAttribute('data-self-inset')).toBe(true);
    expect(laneOf(container, 'input plain').firstElementChild.hasAttribute('data-self-inset')).toBe(false);
    expect(laneOf(container, 'input clearable').firstElementChild.hasAttribute('data-self-inset')).toBe(true);
  });

  it('toggle stays silent — the row keeps its inset', () => {
    const { container } = render(EndInsetHost);
    const row = [...container.querySelectorAll('.jx-item')].find((r) =>
      r.querySelector('[role=switch]'),
    )!;
    expect(row.querySelector('[data-self-inset]')).toBeNull();
  });
});

describe('the inset contract (r2 vocabulary: auto | number | boolean)', () => {
  it('stamps auto by default; on/off/set for boolean/number, with the px custom property', () => {
    const { container } = render(EndInsetHost);
    const laneByTitle = (title: string) =>
      [...container.querySelectorAll('.jx-item')]
        .find((r) => r.textContent.includes(title))!
        .querySelector('[data-slot="item-end"]')!;
    expect(laneByTitle('select').getAttribute('data-inset')).toBe('auto');
    expect(laneByTitle('forced on').getAttribute('data-inset')).toBe('on');
    expect(laneByTitle('forced off').getAttribute('data-inset')).toBe('off');
    const set = laneByTitle('explicit 12');
    expect(set.getAttribute('data-inset')).toBe('set');
    expect(set.getAttribute('style')).toContain('--jx-item-end-inset: 12px');
  });
});

describe('end-inset ownership — the sheet is source-pinned', () => {
  const sheet = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');
  it('the row yields its trailing inset to a terminal self-inset control (auto tier)', () => {
    expect(sheet).toMatch(/:has\(> \[data-slot='item-end'\]\[data-inset='auto'\] > \[data-self-inset\]:last-child\)/u);
    const block = sheet.slice(sheet.indexOf('[data-self-inset]:last-child'));
    expect(block.slice(0, block.indexOf('}') + 1)).toMatch(/padding-inline-end:\s*0/u);
  });

  it('on/set force the yield; set carries the explicit px; the narrow law suspends the contract', () => {
    expect(sheet).toMatch(/\[data-inset='on'\]/u);
    expect(sheet).toMatch(/\[data-inset='set'\]/u);
    expect(sheet).toMatch(/--jx-item-end-inset, 0px/u);
    // suspension: every 30rem block restores the default tail
    const restores = sheet.match(/padding-inline-end:\s*var\(--jx-inset\)/gu) ?? [];
    expect(restores.length).toBeGreaterThanOrEqual(2);
  });
});
