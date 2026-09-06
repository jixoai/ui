/**
 * theme-toggle.spec.ts — the localization payload law
 * (consumer-feedback-fixes P0-1, 2026-09-06).
 *
 * Contracts under test:
 *  - the OPTIONAL `labels` prop ({ light, dark, system, groupAriaLabel? })
 *    localizes the mode vocabulary (segmented labels, cycling labels,
 *    hideLabels aria fallback) and the full variant's group aria name;
 *  - absent labels = the shipped English, byte-identical behavior
 *    (no prop, no change — the pre-prop component verbatim);
 *  - the VALUE domain is never localized: clicking a localized 系统
 *    still writes `theme=system` and toggles the shared theme contract
 *    (.dark class + colorScheme on the root) exactly like the English
 *    toggle does.
 *
 * jsdom ships no matchMedia — the toggle's system-mode listener needs
 * the listener pair only (the composition-f precedent).
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import ThemeToggle from '../src/lib/ui/theme-toggle/theme-toggle.svelte';

beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  }
});

beforeEach(() => {
  localStorage.removeItem('theme');
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = '';
});

const zh = { light: '浅色', dark: '深色', system: '系统', groupAriaLabel: '配色主题' };

const segButtons = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLButtonElement>('[data-jx-theme-seg]'),
];

describe('theme-toggle default vocabulary (labels absent = English, unchanged)', () => {
  it('full variant renders the English literals and the Color theme group name', () => {
    const { container } = render(ThemeToggle, { props: { variant: 'full' } });
    const group = container.querySelector('[data-jx-theme-segmented]')!;
    expect(group.getAttribute('aria-label')).toBe('Color theme');
    // textContent spans icon + label nodes — the label is the trimmed text
    const labels = segButtons(container).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['light', 'dark', 'system']);
  });

  it('compact variant cycles the English words', () => {
    const { container } = render(ThemeToggle, { props: { variant: 'compact' } });
    // mount resolves to the stored-or-system mode: 'system' with a clean
    // localStorage
    expect(container.querySelector('[data-jx-theme-btn]')!.textContent).toContain('system');
  });
});

describe('theme-toggle localization payload (labels prop)', () => {
  it('full variant renders the localized labels and group aria name', () => {
    const { container } = render(ThemeToggle, { props: { variant: 'full', labels: zh } });
    const group = container.querySelector('[data-jx-theme-segmented]')!;
    expect(group.getAttribute('aria-label')).toBe('配色主题');
    const labels = segButtons(container).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['浅色', '深色', '系统']);
  });

  it('hideLabels aria fallback carries the localized mode name', () => {
    const { container } = render(ThemeToggle, {
      props: { variant: 'full', hideLabels: true, labels: zh },
    });
    const arias = segButtons(container).map((b) => b.getAttribute('aria-label'));
    expect(arias).toEqual(['浅色', '深色', '系统']);
  });

  it('compact variant shows the localized current mode', () => {
    const { container } = render(ThemeToggle, { props: { variant: 'compact', labels: zh } });
    expect(container.querySelector('[data-jx-theme-btn]')!.textContent).toContain('系统');
  });

  it('clicking a localized mode writes the UNLOCALIZED value domain', async () => {
    const { container } = render(ThemeToggle, { props: { variant: 'full', labels: zh } });
    const system = segButtons(container)[2]!;
    fireEvent.click(system);
    expect(localStorage.getItem('theme')).toBe('system');
    // the shared theme contract fires like the English toggle's:
    // system + light-preferred media = light root
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('the dark mode still toggles the .dark class under localized labels', () => {
    const { container } = render(ThemeToggle, { props: { variant: 'full', labels: zh } });
    fireEvent.click(segButtons(container)[1]!); // 深色
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
