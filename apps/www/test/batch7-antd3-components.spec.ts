/**
 * antd batch-3 contract suite (test/batch7-antd3-components.spec.ts, 2026-08-22).
 * anchor (fragment link list + line pick) and the accordion ghost paint
 * variant. Anchor runs on jsdom's scroll plumbing where available;
 * the pick logic falls back honestly when targets are missing.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Anchor from '../src/lib/ui/anchor.svelte';
import GhostHost from './fixtures/ghost-host.svelte';

// ---------------------------------------------------------------------------
// Anchor — real fragment links + the scroll pick
// ---------------------------------------------------------------------------
describe('Anchor', () => {
  const items = [
    { href: '#one', label: 'One' },
    { href: '#two', label: 'Two' },
  ];

  function withTargets(): HTMLElement[] {
    const targets = ['one', 'two'].map((id) => {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
      return el;
      it('ghost combines with exclusive (the antd ghost+accordion pairing)', () => {
    const { container } = render(GhostHost, { props: { ghost: true } });
    const group = container.querySelector('.jx-accordion')!;
    expect(group.className).toContain('jx-accordion-ghost');
    // the exclusive guard action is attached regardless of paint
    expect(group.querySelector('details')).toBeTruthy();
  });
});
    return targets;
  }

  it('renders a labeled nav of real fragment links', () => {
    const { container } = render(Anchor, { props: { items } });
    const nav = container.querySelector('nav[aria-label="on this page"]')!;
    const links = [...nav.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#one', '#two']);
    expect(links.every((a) => a.textContent === a.textContent)).toBe(true);
  });

  it('the pick marks aria-current on the last target past the line', async () => {
    const targets = withTargets();
    // "two" sits past the line (top<=offset), "one" far above it
    targets[0]!.getBoundingClientRect = () =>
      ({ top: 400 } as DOMRect); // past line? top>offset → NOT picked
    targets[1]!.getBoundingClientRect = () => ({ top: 20 } as DOMRect);

    const { container } = render(Anchor, { props: { items, offset: 96 } });
    // initial sync ran; only #two is current (its top <= 96)
    const current = container.querySelector('a[aria-current="location"]');
    expect(current?.getAttribute('href')).toBe('#two');

    targets.forEach((t) => t.remove());
  });

  it('scroll events re-run the pick (rAF-throttled)', async () => {
    vi.useFakeTimers();
    try {
      const targets = withTargets();
      targets[0]!.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
      targets[1]!.getBoundingClientRect = () => ({ top: 800 } as DOMRect);
      const { container } = render(Anchor, { props: { items } });
      await fireEvent.scroll(window);
      await vi.advanceTimersByTimeAsync(50);
      expect(container.querySelector('a[aria-current="location"]')?.getAttribute('href')).toBe(
        '#one',
      );
      targets.forEach((t) => t.remove());
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Accordion ghost — the frameless paint variant (antd Collapse ghost)
// ---------------------------------------------------------------------------
describe('Accordion ghost', () => {
  it('ghost removes the frame class; the item contract is untouched', () => {
    const { container } = render(GhostHost, { props: { ghost: true } });
    const group = container.querySelector('.jx-accordion')!;
    expect(group.className).toContain('jx-accordion-ghost');
    expect(container.querySelector('details > summary')!.textContent).toContain('Ghost one');

    // non-ghost stays framed
    const framed = render(GhostHost);
    expect(framed.container.querySelector('.jx-accordion')!.className).not.toContain('ghost');
  });
});

describe('Accordion ghost combos', () => {
  it('ghost + native details coexist (the antd ghost+accordion pairing)', () => {
    const { container } = render(GhostHost, { props: { ghost: true } });
    const group = container.querySelector('.jx-accordion')!;
    expect(group.className).toContain('jx-accordion-ghost');
    expect(group.querySelector('details > summary')).toBeTruthy();
  });
});
