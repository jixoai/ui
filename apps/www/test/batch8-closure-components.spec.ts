/**
 * Closure batch contract suite (test/batch8-closure-components.spec.ts,
 * 2026-08-22). The shared scroll-spy lib (drift-closure) and tour
 * (implemented against its recorded contract: lease anchoring,
 * shadow-hole, non-modal surface, per-step resolution).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import { createScrollSpy } from '../src/lib/scroll-spy';
import Tour from '../src/lib/ui/tour.svelte';
import TourHost from './fixtures/tour-host.svelte';

// ---------------------------------------------------------------------------
// scroll-spy — the ONE line pick (capture phase, rAF, teardown)
// ---------------------------------------------------------------------------
describe('createScrollSpy', () => {
  it('picks the last target past the line; nothing before the first', () => {
    const a = document.createElement('section');
    a.id = 'spy-a';
    const b = document.createElement('section');
    b.id = 'spy-b';
    document.body.append(a, b);
    a.getBoundingClientRect = () => ({ top: 400 } as DOMRect);
    b.getBoundingClientRect = () => ({ top: 20 } as DOMRect);

    const picks: string[] = [];
    const spy = createScrollSpy(
      () => [{ id: 'spy-a' }, { id: 'spy-b' }],
      (id) => picks.push(id),
    );
    expect(spy.current).toBe('spy-b'); // initial sync
    expect(picks).toEqual(['spy-b']);

    a.getBoundingClientRect = () => ({ top: 500 } as DOMRect);
    b.getBoundingClientRect = () => ({ top: 500 } as DOMRect); // none past 96
    spy.sync();
    expect(spy.current).toBe('');

    spy.destroy();
    a.remove();
    b.remove();
  });

  it('hears INNER-container scrolls (capture — the walkthrough-4 law)', async () => {
    vi.useFakeTimers();
    try {
      const shell = document.createElement('div');
      document.body.appendChild(shell);
      const t = document.createElement('section');
      t.id = 'spy-inner';
      shell.appendChild(t);
      t.getBoundingClientRect = () => ({ top: 10 } as DOMRect);

      const spy = createScrollSpy(() => [{ id: 'spy-inner' }], () => {});
      // element scroll does not bubble; capture must still hear it
      shell.dispatchEvent(new Event('scroll'));
      await vi.advanceTimersByTimeAsync(50);
      expect(spy.current).toBe('spy-inner');

      spy.destroy();
      shell.remove();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Tour — the contract, clause by clause
// ---------------------------------------------------------------------------
describe('Tour', () => {
  function setup() {
    const rendered = render(TourHost);
    const panel = () => rendered.container.querySelector('[role="dialog"]') as HTMLElement | null;
    return { rendered, panel };
  }

  it('renders NOTHING until open (SSR-honest)', () => {
    const { rendered } = setup();
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
    expect(rendered.container.querySelector('.jx-tour-hole')).toBeNull();
  });

  it('opening leases anchor-name on the target and shows the non-modal dialog', async () => {
    const { rendered, panel } = setup();
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();

    const dlg = panel()!;
    expect(dlg.getAttribute('aria-modal')).toBe('false');
    expect(dlg.getAttribute('popover')).toBe('manual');
    // the manual popover is actually OPEN in the top layer
    expect(dlg.matches(':popover-open')).toBe(true);

    const target = rendered.container.querySelector('[data-tour-step1]') as HTMLElement;
    expect(target.style.anchorName).toContain('--jx-tour-');
    expect(target.dataset.jxTourPriorAnchor).toBe('');
  });

  it('next() releases the old lease and leases the new target', async () => {
    const { rendered } = setup();
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    const first = rendered.container.querySelector('[data-tour-step1]') as HTMLElement;

    await fireEvent.click(rendered.container.querySelector('.jx-tour-next')!);
    flushSync();
    // the old lease is RESTORED (was absent originally → removed)
    expect(first.style.anchorName).toBe('');
    expect(first.hasAttribute('data-jx-tour-prior-anchor')).toBe(false);
    const second = rendered.container.querySelector('[data-tour-step2]') as HTMLElement;
    expect(second.style.anchorName).toContain('--jx-tour-');
    // progress meta follows
    expect(rendered.container.querySelector('.jx-tour-meta')!.textContent).toContain('2 / 2');
  });

  it('finishing on the last step restores the invoker focus + releases', async () => {
    const { rendered } = setup();
    const opener = rendered.container.querySelector('[data-tour-open]') as HTMLButtonElement;
    opener.focus();
    await fireEvent.click(opener);
    flushSync();
    await fireEvent.click(rendered.container.querySelector('.jx-tour-next')!);
    flushSync();
    const finishBtn = rendered.container.querySelector('.jx-tour-next') as HTMLButtonElement;
    expect(finishBtn.textContent).toContain('Finish');
    await fireEvent.click(finishBtn);
    flushSync();

    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(
      (rendered.container.querySelector('[data-tour-step2]') as HTMLElement).style.anchorName,
    ).toBe('');
    expect(rendered.container.querySelector('[data-finished]')?.getAttribute('data-finished')).toBe(
      '1',
    );
  });

  it('unavailable steps are skipped FORWARD deterministically', async () => {
    const rendered = render(TourHost, { props: { skipFirst: true } });
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    // step1 hidden → the tour entered at step2 directly
    expect(rendered.container.querySelector('.jx-tour-meta')!.textContent).toContain('2 / 2');
    const second = rendered.container.querySelector('[data-tour-step2]') as HTMLElement;
    expect(second.style.anchorName).toContain('--jx-tour-');
  });

  it('ALL steps unavailable → the tour finishes immediately', async () => {
    const rendered = render(TourHost, { props: { skipFirst: true, hideSecond: true } });
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
    expect(rendered.container.querySelector('[data-finished]')?.getAttribute('data-finished')).toBe(
      '1',
    );
  });

  it('Escape finishes from the panel keydown surface', async () => {
    const { rendered } = setup();
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    const dlg = rendered.container.querySelector('[role="dialog"]') as HTMLElement;
    await fireEvent.keyDown(dlg, { key: 'Escape' });
    flushSync();
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('open focuses NEXT (the contract landing spot)', async () => {
    const { rendered } = setup();
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const next = rendered.container.querySelector('.jx-tour-next') as HTMLButtonElement;
    expect(document.activeElement).toBe(next);
  });

  it('a NON-EMPTY prior anchor-name is restored verbatim (lease exactness)', async () => {
    const { rendered } = setup();
    const first = rendered.container.querySelector('[data-tour-step1]') as HTMLElement;
    first.style.anchorName = '--consumer-owned';
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    expect(first.style.anchorName).toContain('--jx-tour-'); // leased over
    await fireEvent.click(rendered.container.querySelector('.jx-tour-next')!);
    flushSync();
    expect(first.style.anchorName).toBe('--consumer-owned'); // restored verbatim
  });

  it('prev() skips BACKWARD past unavailable steps', async () => {
    const rendered = render(TourHost, { props: { skipFirst: true } });
    await fireEvent.click(rendered.container.querySelector('[data-tour-open]')!);
    flushSync();
    expect(rendered.container.querySelector('.jx-tour-meta')!.textContent).toContain('2 / 2');
    // step2's Back is disabled (step1 unavailable behind it) — prev
    // cannot strand the user on a hidden step
    const back = rendered.container.querySelector('.jx-tour-btn') as HTMLButtonElement;
    expect(back.disabled).toBe(true);
  });

  it('an invalid selector reads as unavailable (caught, not thrown)', async () => {
    const rendered = render(Tour, {
      props: {
        open: true,
        steps: [
          { target: '##invalid##', title: 'broken' },
          { target: () => null, title: 'also broken' },
        ],
      },
    });
    flushSync();
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
  });
});
