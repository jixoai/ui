/**
 * composition-regressions (test/composition-regressions.spec.ts, 2026-08-25).
 * The Codex impl-r4 non-blocking locks: the own-rail law under a
 * NESTED Toc (outer paint/click never touches inner links) and the
 * UNCLOBPERABLE deterministic wire (derived id/aria-controls/
 * aria-expanded/tabindex survive hostile ...rest attributes).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import NestedTocHost from './fixtures/composition-nested-toc.svelte';
import WireClobberHost from './fixtures/composition-wire-clobber.svelte';

describe('own-rail law (nested Toc)', () => {
  it('the nested rail keeps its own root; outer links stay outer', () => {
    const { container } = render(NestedTocHost);
    const roots = container.querySelectorAll('[data-jx-toc-root]');
    // the toc renders its tree into BOTH surfaces (desktop + mobile
    // viewport — the duplicate-DOM law): outer ×1 + inner ×2 copies
    expect(roots.length).toBe(3);
    // double-render × nested instantiation multiplies copies — the LAW
    // is nearest-root ownership, not counts
    const links = [...container.querySelectorAll('a[data-jx-toc-link]')];
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      const nearest = link.closest('[data-jx-toc-root]');
      expect(roots).toContain(nearest);
    }
    // every inner link's nearest root is an INNER root, never the outer
    const outer = roots[0]!;
    for (const inner of links.filter((a) => a.textContent === 'inner a')) {
      expect(inner.closest('[data-jx-toc-root]')).not.toBe(outer);
    }
  });
});

describe('unclobberable wire', () => {
  it('menubar trigger: hostile rest cannot override the derived wire', async () => {
    const { container } = render(WireClobberHost);
    const trigger = container.querySelector('[data-jx-menubar-trigger]') as HTMLElement;
    expect(trigger.id).toMatch(/-trigger$/); // derived, not "consumer-id"
    expect(trigger.getAttribute('aria-controls')).toMatch(/-panel$/); // not "consumer-controls"
    expect(trigger.getAttribute('tabindex')).not.toBe('9'); // roving law wins
    // aria-expanded is LIVE state: 'false' at rest only because nothing
    // is open — clicking must flip it (a static consumer 'false' could
    // never flip)
    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('command input: aria-controls stays the derived list id', () => {
    const { container } = render(WireClobberHost);
    const input = container.querySelector('[data-jx-command-input]') as HTMLElement;
    expect(input.getAttribute('aria-controls')).not.toBe('consumer-list');
    expect(input.getAttribute('aria-controls')).toMatch(/-list$/);
  });
});
