/**
 * PlayRow bridge lock (openspec list-item-systemization task 4):
 * the field scaffold is ItemField's now, and every leaf control's
 * aria-labelledby resolves to a REAL label node (the prelude bug
 * class — a pointer at nothing — must stay dead).
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/playground-bridge-host.svelte';

describe('PlayRow ↔ ItemField bridge', () => {
  it('leaf controls label real nodes through the field scaffold', () => {
    const { container } = render(Host);
    const labelled = [...container.querySelectorAll('[aria-labelledby]')];
    expect(labelled.length).toBeGreaterThanOrEqual(2);
    for (const el of labelled) {
      const target = container.querySelector(`[id="${el.getAttribute('aria-labelledby')}"]`);
      expect(target, `missing label node for ${el.outerHTML.slice(0, 40)}`).toBeTruthy();
      expect((target as HTMLElement).textContent).toBeTruthy();
    }
    // the scaffold is the field's: label + description ride ItemField
    expect(container.querySelectorAll('.jx-item-field-label').length).toBe(2);
    expect(container.querySelector('.jx-item-field-description')!.textContent).toContain('runs on mount');
  });
});
