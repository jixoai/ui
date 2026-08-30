/**
 * The pilot-page gates (paged-doc-family, 2026-08-30).
 *
 * /docs/paged.html is the Owner acceptance surface: the publication
 * primitives must all be really present — section numbering, the
 * ToC, cross references, the aside poses, the sim preview loop, the
 * print-law probe strip — and the staged docs skeleton keeps its
 * shape and order (Intro → Install → Usage → Examples → API → See
 * Also) even though this route is outside the lint's scanned
 * /docs/components/ directory.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import Page from '../src/routes/docs/paged.html/+page.svelte';

describe('the pilot page', () => {
  it('keeps the docs skeleton in order', () => {
    const { container } = render(Page);
    const html = container.innerHTML;
    const pos = {
      intro: html.indexOf('<h1'),
      install: html.indexOf('data-doc-install'),
      usage: (() => {
        const headings = [...container.querySelectorAll('h2')];
        const usage = headings.find((h) => h.textContent?.toLowerCase() === 'usage');
        return usage ? html.indexOf(usage.outerHTML) : -1;
      })(),
      examples: html.indexOf('data-jx-canvas-stage'),
      api: html.indexOf('data-doc-props-table'),
      seeAlso: html.indexOf('data-doc-see-also'),
    };
    expect(pos.intro).toBeGreaterThanOrEqual(0);
    expect(pos.install).toBeGreaterThan(pos.intro);
    expect(pos.usage).toBeGreaterThan(pos.install);
    expect(pos.examples).toBeGreaterThan(pos.usage);
    expect(pos.api).toBeGreaterThan(pos.examples);
    expect(pos.seeAlso).toBeGreaterThan(pos.api);
    // exactly one Usage H2
    expect(
      [...container.querySelectorAll('h2')].filter((h) => h.textContent?.toLowerCase() === 'usage'),
    ).toHaveLength(1);
  });

  it('carries the full publication primitive set', () => {
    const { container } = render(Page);
    // numbered sections + ToC + refs + asides + figures + counters root
    expect(container.querySelectorAll('[data-jx-paged-section]').length).toBeGreaterThanOrEqual(10);
    expect(container.querySelector('[data-jx-paged-toc]')).not.toBeNull();
    expect(container.querySelectorAll('[data-jx-paged-ref]').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll('[data-jx-paged-aside]').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelectorAll('[data-jx-paged-fig]').length).toBeGreaterThanOrEqual(5);
    // the ToC entries pair numbers with labels
    const nums = [...container.querySelectorAll('[data-jx-paged-toc-num]')].map(
      (n) => n.textContent?.trim(),
    );
    expect(nums.length).toBeGreaterThan(5);
    expect(nums[0]).toBe('1');
  });

  it('drives the sim preview loop from the toolbar', async () => {
    const { container } = render(Page);
    const doc = container.querySelector('[data-jx-paged-doc]')!;
    expect(doc.getAttribute('data-jx-medium')).toBe('screen');

    const simButton = [...container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('打印预览'),
    )!;
    await fireEvent.click(simButton);
    expect(doc.hasAttribute('data-jx-print-sim')).toBe(true);
    expect(doc.getAttribute('data-jx-medium')).toBe('sim');

    window.dispatchEvent(new Event('beforeprint'));
    flushSync();
    expect(doc.getAttribute('data-jx-medium')).toBe('print');

    window.dispatchEvent(new Event('afterprint'));
    flushSync();
    // the stamp survives → sim again (the re-evaluation semantics)
    expect(doc.getAttribute('data-jx-medium')).toBe('sim');
  });

  it('ships the print-law probe strip with all three utilities + every hook', () => {
    const { container } = render(Page);
    const items = [...container.querySelectorAll('[data-jx-print-probe-item]')];
    expect(items).toHaveLength(5);
    for (const item of items) {
      // the three utilities riding the same node (flex / overflow-auto
      // / the arbitrary max-block-size) — the fight the whitelist wins
      expect(item.classList.contains('flex')).toBe(true);
      expect(item.classList.contains('overflow-auto')).toBe(true);
      expect(
        [...item.classList].some((c) => c.startsWith('[max-block-size:')),
      ).toBe(true);
    }
    const kinds = items.map((i) => i.getAttribute('data-jx-print-probe-item'));
    expect(kinds).toContain('hide');
    expect(kinds).toContain('flatten');
    expect(kinds).toContain('canvas-scroll');
    expect(kinds).toContain('code-card-pre');
    expect(kinds).toContain('props-table-scroll');
  });

  it('the freeze protocol: canvas subtree frozen, controls hidden, readout persists', () => {
    const { container } = render(Page);
    // the freeze wrapper carries the canvas
    const freeze = container.querySelector('[data-jx-print="freeze"]')!;
    expect(freeze.querySelector('[data-jx-canvas]')).not.toBeNull();
    // the page-owned control strip hides under print
    const strip = container.querySelector('[data-jx-paged-control-row]')?.closest('[data-jx-print="hide"]');
    expect(strip).not.toBeNull();
    // the readout rows carry no print verb — they persist
    const readout = container.querySelector('[data-jx-paged-readout]')!;
    expect(readout.closest('[data-jx-print]')).toBeNull();
  });
});
