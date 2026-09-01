/**
 * Toast material/effect/adoption suite (test/toast.spec.ts, 2026-09-01;
 * D-fix wave 2026-09-02).
 *
 * The viewport does not float itself (the float-button law): inside a
 * website-scaffold it adopts into the top layer's float plane through
 * the jx-top-layer context (ScaffoldFloat), flowing inside the plane —
 * the fixed corner is the STANDALONE fallback only. Since the D-6
 * ruling the adoption test mounts the REAL WebsiteScaffold (no fake
 * adopt() stubs) and asserts the overlay pointer law against the real
 * css. The stack is a grid (rows stack naturally); each toast is a
 * lane grid (leading | body | trailing | dismiss). MATERIAL picks the
 * ground (popover solid | glass backdrop-filter), EFFECT picks the
 * loop (pulse | sweep), and the countdown companion drains the
 * duration in the trailing lane (sticky toasts get none). The D-wave
 * locks: expiry arms at FIRST VISIBILITY (D-2 — queued toasts never
 * die unseen), no ghost exit for never-seen toasts (D-3), exit frames
 * render in queue order (D-8). Deeper behavior (live regions, pause)
 * stays covered by batch3 and enhance-picker-feedback.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import ToastViewport from '../src/lib/ui/toast/toast-viewport.svelte';
import { createToastStore } from '../src/lib/toast-store';
import ToastAdoptHost from './fixtures/toast-adopt-host.svelte';
import ToastFeaturesHost from './fixtures/toast-features-host.svelte';

describe('toast — the viewport does not float itself', () => {
  it('inside a REAL website-scaffold it ADOPTS: wrapper in the float slot, flow mode, no fixed', async () => {
    const { container } = render(ToastAdoptHost);
    await tick();
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack).toBeTruthy();
    // the adoption path renders through ScaffoldFloat's content node,
    // which the real provider re-parented into .jx-float-slot with the
    // float role stamped
    const wrapper = stack.closest('[data-jx-float-content]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute('data-area')).toBe('float');
    expect(wrapper.closest('.jx-float-slot')).toBeTruthy();
    // and the stack FLOWS inside the plane — no self-floating
    expect(stack.className).not.toContain('fixed');
    // V1-1 defense: rows are min-content and packed to the end — the
    // dead `align-content-end` utility (align-content never applied)
    // is gone, real alignment utilities took its place
    expect(stack.className).not.toContain('align-content-end');
    expect(stack.className).toContain('content-end');
    expect(stack.className).toContain('auto-rows-min');
  });

  it('THE OVERLAY POINTER LAW (D-1): the float wrapper is transparent; the stack and cards opt in themselves', async () => {
    const { container } = render(ToastAdoptHost);
    await tick();
    const wrapper = container.querySelector('.jx-float-slot > [data-area="float"]') as HTMLElement;
    expect(wrapper).toBeTruthy();

    // the law as css-source: the exact transparent rule ships AFTER
    // the generic child grant (equal :where() specificity — source
    // order decides), and the wrapper is content-sized at the corner
    const css = readFileSync('src/lib/ui/website-scaffold/website-scaffold.css', 'utf8');
    const grant = css.indexOf(":where(.jx-float-slot > *){");
    const law = css.indexOf(":where(.jx-float-slot > [data-area='float']){");
    expect(grant).toBeGreaterThan(-1);
    expect(law).toBeGreaterThan(grant);
    expect(css).toContain(
      `:where(.jx-float-slot > [data-area='float']){\n  pointer-events: none;\n}`,
    );
    // the wrapper never stretches over the stage (V1-1): the float
    // area rule itself carries the corner placement
    const floatRule = css.indexOf(":where(.jx-top-layer [data-area='float']){");
    expect(floatRule).toBeGreaterThan(-1);
    expect(css.indexOf('place-self: end;')).toBeGreaterThan(floatRule);

    // the stack paints itself transparent; every CARD opts back in —
    // with the wrapper transparent, only the cards are interactive
    // (jsdom cannot cascade @layer rules from the imported css, so the
    // wrapper's computed pointer-events is asserted as css-source law
    // above; the content's half is the class contract on real nodes)
    const stack = wrapper.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack.className).toContain('pointer-events-none');
    const card = stack.querySelector('[data-jx-toast]') as HTMLElement;
    expect(card.className).toContain('pointer-events-auto');
  });

  it('standalone (no scaffold) keeps the legacy fixed corner fallback', () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack.className).toContain('fixed');
  });
});

describe('toast — the visibility handshake (D-2)', () => {
  it('a queued toast never expires unseen: expiry arms at FIRST visibility', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      const { container } = render(ToastViewport, { props: { store, maxVisible: 1 } });
      await tick();

      // 'a' is expiring; the sticky 'b' holds the only visible slot —
      // from b's arrival on, a is QUEUED (the slice favors the newest)
      store.api.push({ title: 'a', duration: 100 });
      await tick();
      store.api.push({ title: 'b', duration: 0 });
      await tick();

      // the queued toast's clock is HELD while invisible — the old
      // store would have silently expired it here
      await vi.advanceTimersByTimeAsync(500);
      expect(store.api.snapshot().map((t) => t.title)).toEqual(['a', 'b']);

      // dismissing b frees the slice: a becomes visible — its clock
      // ARMS now (full duration from first visibility)
      store.api.dismiss(store.api.snapshot()[1].id);
      await tick();
      await vi.advanceTimersByTimeAsync(50);
      expect(store.api.snapshot().map((t) => t.title)).toEqual(['a']);
      await vi.advanceTimersByTimeAsync(100);
      expect(store.api.snapshot()).toHaveLength(0);
      // let the exit sweeper run on the same fake clock, then the DOM
      // is fully drained
      await vi.advanceTimersByTimeAsync(300);
      expect(container.querySelectorAll('[data-jx-toast]')).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('toast — exit frames (D-3 ghost + D-8 order)', () => {
  it('a toast dismissed while OFF-SCREEN (queued out of the slice) paints NO ghost exit frame', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 1 } });
    await tick();
    store.api.push({ title: 'older', duration: 0 });
    await tick();
    // the newer arrival takes the only slot — 'older' is queued now
    store.api.push({ title: 'fresh', duration: 0 });
    await tick();
    expect(container.querySelector('[data-jx-toast]')!.textContent).toContain('fresh');

    // dismissing the off-screen toast must not conjure a 220ms exit
    // snapshot for pixels that are not on screen (D-3)
    store.api.dismiss(store.api.snapshot()[0].id);
    await tick();
    expect(container.textContent).not.toContain('older');
    expect(container.querySelectorAll('.jx-toast-leaving')).toHaveLength(0);
    expect(container.querySelector('[data-jx-toast]')!.textContent).toContain('fresh');
  });

  it('a leaving toast keeps its QUEUE position — it never jumps below newer arrivals', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 4 } });
    await tick();
    const a = store.api.push({ title: 'first', duration: 0 });
    store.api.push({ title: 'second', duration: 0 });
    await tick();

    // first leaves (exit window) while a new toast arrives — the exit
    // snapshot must stay ABOVE the new card (queue order, not append)
    store.api.dismiss(a);
    store.api.push({ title: 'third', duration: 0 });
    await tick();

    const titles = [...container.querySelectorAll('[data-jx-toast]')].map(
      (el) => el.querySelector('[data-jx-toast-title]')!.textContent,
    );
    expect(titles).toEqual(['first', 'second', 'third']);
    expect(container.querySelector('[data-jx-toast]')!.classList.contains('jx-toast-leaving')).toBe(
      true,
    );
  });
});

describe('toast — material × effect × countdown', () => {
  it('material picks the ground: glass rides backdrop-filter', () => {
    const { container } = render(ToastFeaturesHost);
    const glass = container.querySelector('[data-jx-toast][data-material="glass"]') as HTMLElement;
    expect(glass).toBeTruthy();
    expect(glass.className).toContain('backdrop-blur-md');
    // the default ground stays solid popover
    const plain = container.querySelector('[data-jx-toast][data-material="popover"]') as HTMLElement;
    expect(plain.className).toContain('bg-popover');
  });

  it('effect picks the loop: sweep and pulse land as valued hooks', () => {
    const { container } = render(ToastFeaturesHost);
    expect(container.querySelector('[data-jx-toast][data-effect="sweep"]')).toBeTruthy();
    expect(container.querySelector('[data-jx-toast][data-effect="pulse"]')).toBeTruthy();
    // none is the default: no hook on a plain toast
    const sticky = container.querySelectorAll('[data-jx-toast]')[2] as HTMLElement;
    expect(sticky.hasAttribute('data-effect')).toBe(false);
  });

  it('the countdown companion drains the duration in the trailing lane; sticky gets none', () => {
    const { container } = render(ToastFeaturesHost);
    const countdowns = container.querySelectorAll('[data-jx-toast-countdown]');
    expect(countdowns.length).toBe(1);
    expect((countdowns[0] as HTMLElement).style.getPropertyValue('--jx-toast-countdown')).toBe(
      '8000ms',
    );
    // rides the trailing lane of its toast
    expect(countdowns[0].closest('[data-jx-toast-trailing]')).toBeTruthy();
    // the sticky toast asked for a countdown and got none
    expect(container.querySelectorAll('[data-jx-toast]')[2].querySelector('[data-jx-toast-countdown]')).toBeNull();
  });

  it('each toast is a lane grid: leading | body | trailing | dismiss', () => {
    const { container } = render(ToastFeaturesHost);
    const toast = container.querySelector('[data-jx-toast]') as HTMLElement;
    expect(toast.className).toContain('grid-cols-[auto_minmax(0,1fr)_auto_auto]');
    // lanes absent by default (no leading/trailing authored)
    expect(toast.querySelector('[data-jx-toast-leading]')).toBeNull();
    expect(toast.querySelector('[data-jx-toast-body]')).toBeTruthy();
    expect(toast.querySelector('[data-jx-toast-dismiss]')).toBeTruthy();
  });
});
