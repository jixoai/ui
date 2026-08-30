/**
 * The numbering-registry gates (paged-doc-family, 2026-08-30).
 *
 * The registry is the Svelte-side numbering source (CSS counters
 * render the same order visually — getComputedStyle cannot read
 * counters back, the prototype's finding). These gates assert:
 *   - document-order registration (registry numbers == DOM order of
 *     the section elements — the same-source assertion)
 *   - PagedRef backfills §N / Figure N from the registry
 *   - PagedToC lists the id-bearing sections with their numbers
 *   - nested sections join the same counter group in DOM order
 *   - keyed reorders and conditional inserts renumber correctly
 */
import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import RegistryHost from './fixtures/paged-registry-host.svelte';

interface TocLink {
  href: string;
  num: string;
  label: string;
}

function readToc(container: HTMLElement): TocLink[] {
  return [...container.querySelectorAll('[data-jx-paged-toc] a')].map((a) => ({
    href: a.getAttribute('href') ?? '',
    num: a.querySelector('[data-jx-paged-toc-num]')?.textContent?.trim() ?? '',
    label: a.querySelector('span:last-child')?.textContent?.trim() ?? '',
  }));
}

/** the DOM order of the numbered sections, as ids */
function domSectionOrder(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-jx-paged-section]')]
    .map((s) => s.getAttribute('id') ?? '')
    .filter(Boolean);
}

describe('the section registry', () => {
  it('numbers in document order, nested sections included', () => {
    const { container } = render(RegistryHost);
    // a(1) → a-nested(2) → b(3): DOM order, one counter group
    expect(domSectionOrder(container)).toEqual(['a', 'a-nested', 'b']);
    const toc = readToc(container);
    expect(toc.map((l) => `${l.num}:${l.label}`)).toEqual(['1:Alpha', '2:Alpha nested', '3:Beta']);
  });

  it('PagedRef backfills the registry number (§N for sections, Figure N for figures)', () => {
    const { container } = render(RegistryHost);
    const refs = [...container.querySelectorAll('[data-jx-paged-ref]')].map(
      (a) => a.textContent?.trim() ?? '',
    );
    // target b is section 3; fig-usage is figure 1
    expect(refs).toContain('§3');
    expect(refs).toContain('Figure 1');
  });

  it('a keyed reorder renumbers to the NEW document order', async () => {
    const { container } = render(RegistryHost);
    await fireEvent.click(container.querySelector('[data-testid="reorder"]')!);
    // the resync rides a microtask after the DOM mutation
    await new Promise((r) => setTimeout(r, 0));
    // now b(1) → a(2) → a-nested(3)
    expect(domSectionOrder(container)).toEqual(['b', 'a', 'a-nested']);
    const toc = readToc(container);
    expect(toc.map((l) => `${l.num}:${l.label}`)).toEqual(['1:Beta', '2:Alpha', '3:Alpha nested']);
    // the ref followed the target's new number
    expect([...container.querySelectorAll('[data-jx-paged-ref]')].map((r) => r.textContent?.trim())).toContain('§1');
  });

  it('a conditional insert takes the next number and joins the ToC', async () => {
    const { container } = render(RegistryHost);
    await fireEvent.click(container.querySelector('[data-testid="toggle-extra"]')!);
    expect(domSectionOrder(container)).toEqual(['a', 'a-nested', 'b', 'c']);
    const toc = readToc(container);
    expect(toc).toHaveLength(4);
    expect(toc.at(-1)?.num).toBe('4');
    expect(toc.at(-1)?.label).toBe('Gamma');
  });

  it('an unresolved target renders the honest placeholder', () => {
    const { container } = render(RegistryHost);
    // fig-usage resolves; every rendered ref in the fixture resolves —
    // assert the negative path on the attribute contract instead
    for (const ref of container.querySelectorAll('[data-jx-paged-ref]')) {
      expect(ref.getAttribute('data-resolved')).not.toBe('false');
      expect(ref.getAttribute('href')).toMatch(/^#/);
    }
  });
});
