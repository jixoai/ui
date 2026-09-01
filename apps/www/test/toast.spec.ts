/**
 * Toast material/effect/adoption suite (test/toast.spec.ts, 2026-09-01).
 *
 * The viewport does not float itself (the float-button law): inside a
 * website-scaffold it adopts into the top layer's float plane through
 * the jx-top-layer context (ScaffoldFloat), flowing inside the plane —
 * the fixed corner is the STANDALONE fallback only. The stack is a
 * grid (rows stack naturally); each toast is a lane grid
 * (leading | body | trailing | dismiss). MATERIAL picks the ground
 * (popover solid | glass backdrop-filter), EFFECT picks the loop
 * (pulse | sweep), and the countdown companion drains the duration in
 * the trailing lane (sticky toasts get none). Deeper behavior (live
 * regions, pause, exit frames) stays covered by batch3 and
 * enhance-picker-feedback.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import ToastViewport from '../src/lib/ui/toast/toast-viewport.svelte';
import { createToastStore } from '../src/lib/toast-store';
import ToastAdoptHost from './fixtures/toast-adopt-host.svelte';
import ToastFeaturesHost from './fixtures/toast-features-host.svelte';

describe('toast — the viewport does not float itself', () => {
  it('inside a float plane (jx-top-layer context) it ADOPTS: flow mode, no fixed', () => {
    const { container } = render(ToastAdoptHost);
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack).toBeTruthy();
    // the adoption path renders through ScaffoldFloat's content node
    expect(stack.closest('[data-jx-float-content]')).toBeTruthy();
    // and the stack FLOWS inside the plane — no self-floating
    expect(stack.className).not.toContain('fixed');
    expect(stack.className).toContain('align-content-end');
  });

  it('standalone (no scaffold) keeps the legacy fixed corner fallback', () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack.className).toContain('fixed');
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
