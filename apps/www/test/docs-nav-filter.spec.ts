/**
 * docs sections nav — search filter lock (test/docs-nav-filter.spec.ts).
 * The rail's filter (Owner request, 2026-08-25) matches title OR
 * subtitle case-insensitively across every section, hides empty
 * sections, shows an empty state, and BOTH clear paths (× button and
 * emptying the input) restore the full list.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DocsSectionsNav from '../src/lib/ui/docs-sections-nav.svelte';

// the nav reads $app/state's `page` — jsdom URL defaults to localhost /

const titles = () => [...document.querySelectorAll('.jx-dsn-rail .jx-dsn-link-title')].map((n) => n.textContent?.trim());

describe('docs sections nav — search filter', () => {
  it('unfiltered: every section page is listed', () => {
    render(DocsSectionsNav);
    const list = titles();
    expect(list).toContain('theming & tokens');
    expect(list).toContain('recipes');
    expect(list).toContain('jx-pure');
    expect(list).toContain('all components');
    expect(list).toContain('Feedback');
    expect(list.length).toBeGreaterThanOrEqual(14);
  });

  it('matches subtitles: "wrapping" keeps only the recipes entry', async () => {
    render(DocsSectionsNav);
    const input = document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'wrapping' } });
    await new Promise((r) => setTimeout(r, 20));
    expect(titles()).toEqual(['recipes']);
  });

  it('matches titles: "jx" keeps only jx-pure; groups hide when their line drops', async () => {
    render(DocsSectionsNav);
    const input = document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'jx' } });
    await new Promise((r) => setTimeout(r, 20));
    expect(titles()).toEqual(['jx-pure']);
  });

  it('no matches: the empty state shows', async () => {
    render(DocsSectionsNav);
    const input = document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'zzzz' } });
    await new Promise((r) => setTimeout(r, 20));
    expect(titles()).toEqual([]);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(1);
  });

  it('the × button restores the full list', async () => {
    render(DocsSectionsNav);
    const input = document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'zzzz' } });
    await new Promise((r) => setTimeout(r, 20));
    fireEvent.click(document.querySelector('.jx-dsn-rail .jx-dsn-clear') as HTMLElement);
    await new Promise((r) => setTimeout(r, 20));
    expect(titles().length).toBeGreaterThanOrEqual(14);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(0);
  });

  it('emptying the input restores the full list', async () => {
    render(DocsSectionsNav);
    const input = document.querySelector('.jx-dsn-rail .jx-dsn-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'jx' } });
    await new Promise((r) => setTimeout(r, 20));
    fireEvent.input(input, { target: { value: '' } });
    await new Promise((r) => setTimeout(r, 20));
    expect(titles().length).toBeGreaterThanOrEqual(14);
    expect(document.querySelectorAll('.jx-dsn-rail .jx-dsn-empty').length).toBe(0);
  });
});
