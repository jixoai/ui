/**
 * NavigationMenuIndicator contract (2026-09-01) — the indicator tech
 * sunk into the navigation-menu family as an OPTIONAL part, with the
 * two motion laws of the Owner ruling:
 *
 *   navigation  a view-transition-name is stamped — page-level View
 *               Transitions morph the indicator across documents; the
 *               name is inert when the app never starts a transition;
 *               same-document moves animate via WAAPI
 *   waapi       pure Web Animations sliding, NO name — apps without
 *               View Transitions never pay for one
 *
 * The engine (both laws): one measured element; first placement,
 * resize/font remeasures and reduced-motion JUMP; aria-current flips
 * (the DOM-delegated route signal) animate. Entries inside an open
 * [popover] never steal the bar indicator. jsdom has no WAAPI and no
 * ResizeObserver — the guards degrade to direct style writes, which
 * is exactly what these locks read.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Host from './fixtures/navmenu-indicator-host.svelte';

const frames = (n: number) => new Promise((resolve) => {
  let i = 0;
  const tick = () => (++i >= n ? resolve(undefined) : requestAnimationFrame(tick));
  requestAnimationFrame(tick);
});

describe('NavigationMenuIndicator', () => {
  it('renders the measured element under the bar, styled to the current entry', async () => {
    const { getByTestId } = render(Host);
    const scope = getByTestId('navigation-motion');
    const bar = scope.querySelector('nav')!;
    const ind = scope.querySelector('[data-jx-navmenu-ind]') as HTMLElement;

    expect(ind).toBeTruthy();
    expect(ind.getAttribute('aria-hidden')).toBe('true');
    // the part stamps its measuring box: the bar becomes the
    // offsetParent for entries AND the containing block for the indicator
    expect(bar.style.position).toBe('relative');
    // geometry landed (jsdom offsets are 0 — the LAW is that the style
    // is written from the measurement, not the numbers)
    expect(ind.style.transform).toContain('translate(');
    expect(ind.style.width).toMatch(/px$/);
    expect(ind.style.height).toMatch(/px$/);
    expect(ind.style.opacity).toBe('1');
  });

  it('navigation motion stamps the view-transition-name; waapi never does', async () => {
    const { getByTestId } = render(Host);
    const nav = getByTestId('navigation-motion').querySelector('[data-jx-navmenu-ind]') as HTMLElement;
    const waapi = getByTestId('waapi-motion').querySelector('[data-jx-navmenu-ind]') as HTMLElement;

    expect(nav.getAttribute('data-motion')).toBe('navigation');
    expect(nav.style.viewTransitionName).toBe('jx-nav-indicator');
    expect(waapi.getAttribute('data-motion')).toBe('waapi');
    expect(waapi.style.viewTransitionName).toBe('');
  });

  it('aria-current flips repaint through the MutationObserver seam', async () => {
    const { getByTestId } = render(Host);
    const scope = getByTestId('waapi-motion');
    const ind = scope.querySelector('[data-jx-navmenu-ind]') as HTMLElement;
    const [a] = [...scope.querySelectorAll('[data-jx-navmenu-link]')] as HTMLElement[];

    expect(ind.style.opacity).toBe('1');
    // a route swap away from this bar (current leaves the entries) —
    // authored exactly the way the link part paints the flip
    a.setAttribute('aria-current', 'false');
    await waitFor(() => {
      expect(ind.style.opacity).toBe('0');
    });
    // …and back: the observer repaints the placement again
    a.setAttribute('aria-current', 'page');
    await waitFor(() => {
      expect(ind.style.opacity).toBe('1');
    });
  });

  it('hides when the only current entry lives inside a popover panel', async () => {
    const { getByTestId } = render(Host);
    const scope = getByTestId('excluded');
    const ind = scope.querySelector('[data-jx-navmenu-ind]') as HTMLElement;
    // the mega link carries its own current truth — the bar's
    // indicator stands down rather than marking a closed trigger
    expect(ind.style.opacity).toBe('0');
  });

  it('keeps the bar walk contract intact (the part adds no tab stops)', async () => {
    const { getByTestId } = render(Host);
    const scope = getByTestId('navigation-motion');
    // the indicator is decoration: nothing focusable was added
    expect(indicatorIsDecorative(scope.querySelector('[data-jx-navmenu-ind]')!)).toBe(true);
    // and the trigger still wires the panel (family regression lock)
    const trigger = scope.querySelector('[data-jx-navmenu-trigger]') as HTMLButtonElement;
    await fireEvent.click(trigger);
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(panel.matches(':popover-open')).toBe(true);
  });
});

function indicatorIsDecorative(el: HTMLElement): boolean {
  return el.getAttribute('aria-hidden') === 'true' && el.tabIndex === -1;
}
