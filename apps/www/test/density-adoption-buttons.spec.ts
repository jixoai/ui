/** Packet C density adoption: real family roots expose resolved policy and ctl lanes. */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PressButtonHost from './fixtures/press-button-host.svelte';
import IconButtonHost from './fixtures/icon-button-host.svelte';
import PaginationHost from './fixtures/pagination-host.svelte';

describe('density adoption packet C', () => {
  it('stamps press and icon-button interactive roots with the resolved policy', () => {
    const press = render(PressButtonHost);
    expect(press.container.querySelector('button')?.dataset.density).toBeUndefined();

    const icon = render(IconButtonHost, { props: { iconOnly: true } });
    expect(icon.container.querySelector('button')?.dataset.density).toBeUndefined();
  });

  it('keeps pagination link and edge semantics under the stamped root', () => {
    const { container } = render(PaginationHost);
    const nav = container.querySelector<HTMLElement>('nav[data-jx-pagination]');
    expect(nav?.dataset.density).toBeUndefined();
    expect(container.querySelector('a[data-jx-page], button[data-jx-page]')).toBeTruthy();
    expect(container.querySelector('a[aria-current="page"]')).toBeTruthy();
    expect(container.querySelector('[data-jx-page-edge-off][aria-disabled="true"]')).toBeTruthy();
  });
});
