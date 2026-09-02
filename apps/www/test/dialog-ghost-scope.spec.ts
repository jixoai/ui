import { describe, expect, it } from 'vitest';
import Host from '../test/fixtures/dialog-ghost-host.svelte';
import { mount } from 'svelte';

describe('the dialog ghost scope (r14-2)', () => {
  it('footer and actions buttons default to ghost via Context; explicit wins', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    mount(Host, { target });
    const stamps = [...target.querySelectorAll('[data-jx-press-button]')].map(
      (b) => ({ label: b.textContent?.trim(), variant: b.getAttribute('data-variant') ?? b.getAttribute('data-jx-variant') ?? (b.dataset as Record<string, string>) }),
    );
    const byLabel = Object.fromEntries(
      [...target.querySelectorAll('[data-jx-press-button]')].map((b) => [b.textContent?.trim(), b]),
    );
    const variantOf = (el?: Element) => el?.getAttribute('data-jx-press-button'); // the stamp carries the resolved variant
    expect(byLabel['legacy-foot-button']).toBeTruthy();
    expect(variantOf(byLabel['legacy-foot-button'])).toBe('ghost');
    expect(variantOf(byLabel['action-one'])).toBe('ghost');
    expect(variantOf(byLabel['explicit-wins'])).toBe('outline'); // explicit wins, always
    target.remove();
  });
});
