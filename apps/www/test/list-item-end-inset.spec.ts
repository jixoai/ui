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

describe('end-inset ownership — the sheet is source-pinned', () => {
  const sheet = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');
  it('the row yields its trailing inset to a terminal self-inset control', () => {
    expect(sheet).toMatch(/:has\(> \[data-slot='item-end'\] > \[data-self-inset\]:last-child\)/u);
    const block = sheet.slice(sheet.indexOf('[data-self-inset]:last-child'));
    expect(block.slice(0, block.indexOf('}') + 1)).toMatch(/padding-inline-end:\s*0/u);
  });
});
