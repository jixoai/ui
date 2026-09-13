/**
 * Alert dismissal — grindstone #17-1, the lifecycle axis (orthogonal
 * to variant × assertive). Five locks:
 *
 *  1. persistent regression: no dismiss prop → no button node, and no
 *     timer EVER arms (the manual-clock law: advance a wall of virtual
 *     time, assert zero callbacks — the notice.ts technique, ported to
 *     vi's deterministic clock).
 *  2. manual: the × button exists with the toast-ruling label; a click
 *     fires onDismiss('button') exactly once; the component STAYS
 *     rendered (presence is the caller's).
 *  3. auto: the mount-armed timer fires onDismiss('timer') at
 *     dismissAfter; teardown cancels (an unmounted alert never fires);
 *     a dismissAfter change RE-ARMS (the old deadline is gone).
 *  4. aria: role stays status/alert across all three dismiss states;
 *     the button is a real type=button; dismissLabel overrides.
 *  5. paint orthogonality: the banner's surface classes are identical
 *     with and without dismissal (outline+manual, tonal+auto) — the
 *     ladder ink never learns about the lifecycle axis.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Host from './fixtures/alert-dismiss-host.svelte';

const reasonsOf = () => {
  const reasons: string[] = [];
  return { reasons, onreason: (how: string) => reasons.push(how) };
};

describe('alert dismissal — the persistent default', () => {
  it('no dismiss prop: no button node, and no timer ever arms', async () => {
    vi.useFakeTimers();
    try {
      const { reasons, onreason } = reasonsOf();
      const { container } = render(Host, { props: { onreason } });
      expect(container.querySelector('[data-jx-alert-dismiss]')).toBeNull();
      expect(container.querySelector('[data-jx-alert-dismiss-row]')).toBeNull();
      await vi.advanceTimersByTimeAsync(120_000);
      expect(reasons).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('alert dismissal — manual', () => {
  it('renders the × button inside the title row; click fires onDismiss(button) once and the alert stays', async () => {
    const { reasons, onreason } = reasonsOf();
    const { container } = render(Host, { props: { dismiss: 'manual', onreason } });
    const button = container.querySelector<HTMLButtonElement>('[data-jx-alert-dismiss]')!;
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('dismiss');
    // rides the title row's inline-end, never a bare fallback row
    expect(button.closest('[data-jx-alert-title]')).toBeTruthy();
    expect(container.querySelector('[data-jx-alert-dismiss-row]')).toBeNull();

    await fireEvent.click(button);
    await fireEvent.click(button);
    expect(reasons).toEqual(['button', 'button']);
    // presence is the caller's — the alert never unmounts itself
    expect(container.querySelector('[data-jx-alert]')).toBeTruthy();
  });

  it('title-less manual: a bare justify-end row carries the button', () => {
    const { container } = render(Host, { props: { dismiss: 'manual', withTitle: false } });
    const row = container.querySelector('[data-jx-alert-dismiss-row]')!;
    expect(row).toBeTruthy();
    expect(row.querySelector('[data-jx-alert-dismiss]')).toBeTruthy();
  });

  it('dismissLabel overrides the accessible name', () => {
    const { container } = render(Host, {
      props: { dismiss: 'manual', dismissLabel: 'close notification' },
    });
    expect(
      container.querySelector('[data-jx-alert-dismiss]')!.getAttribute('aria-label'),
    ).toBe('close notification');
  });
});

describe('alert dismissal — auto (the mount-armed clock)', () => {
  it('fires onDismiss(timer) at dismissAfter, exactly once', async () => {
    vi.useFakeTimers();
    try {
      const { reasons, onreason } = reasonsOf();
      render(Host, { props: { dismiss: 'auto', dismissAfter: 6000, onreason } });
      await vi.advanceTimersByTimeAsync(5999);
      expect(reasons).toEqual([]);
      await vi.advanceTimersByTimeAsync(1);
      expect(reasons).toEqual(['timer']);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(reasons).toEqual(['timer']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('manual never arms a timer (the × is the only exit)', async () => {
    vi.useFakeTimers();
    try {
      const { reasons, onreason } = reasonsOf();
      render(Host, { props: { dismiss: 'manual', onreason } });
      await vi.advanceTimersByTimeAsync(120_000);
      expect(reasons).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('teardown cancels the clock — an unmounted alert never fires', async () => {
    vi.useFakeTimers();
    try {
      const { reasons, onreason } = reasonsOf();
      const rendered = render(Host, { props: { dismiss: 'auto', dismissAfter: 6000, onreason } });
      await vi.advanceTimersByTimeAsync(3000);
      rendered.unmount();
      await vi.advanceTimersByTimeAsync(120_000);
      expect(reasons).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a dismissAfter change re-arms — the old deadline is gone', async () => {
    vi.useFakeTimers();
    try {
      const { reasons, onreason } = reasonsOf();
      const rendered = render(Host, {
        props: { dismiss: 'auto', dismissAfter: 6000, onreason },
      });
      await vi.advanceTimersByTimeAsync(3000);
      rendered.rerender({ dismiss: 'auto', dismissAfter: 10000, onreason });
      // the re-arm happened at t=3000 → the NEW deadline is t=13000;
      // t=8999 is past the OLD deadline (6000) yet must stay silent
      await vi.advanceTimersByTimeAsync(5999);
      expect(reasons).toEqual([]);
      await vi.advanceTimersByTimeAsync(4001); // t=13000 — the NEW deadline
      expect(reasons).toEqual(['timer']);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('alert dismissal — aria and paint orthogonality', () => {
  it('role stays status/alert across all three dismiss states', () => {
    for (const dismiss of [undefined, 'manual', 'auto'] as const) {
      const polite = render(Host, { props: { dismiss, onreason: () => {} } });
      expect(polite.container.querySelector('[data-jx-alert]')!.getAttribute('role')).toBe(
        'status',
      );
      polite.unmount();
      const assertive = render(Host, { props: { dismiss, assertive: true, onreason: () => {} } });
      expect(assertive.container.querySelector('[data-jx-alert]')!.getAttribute('role')).toBe(
        'alert',
      );
      assertive.unmount();
    }
  });

  it('the surface classes are identical with and without dismissal (per variant)', () => {
    for (const variant of ['outline', 'tonal'] as const) {
      const plain = render(Host, { props: { variant } });
      const manual = render(Host, { props: { variant, dismiss: 'manual' } });
      const auto = render(Host, { props: { variant, dismiss: 'auto' } });
      const surfaces = [plain, manual, auto].map((r) =>
        r.container.querySelector('[data-jx-alert]')!.getAttribute('class'),
      );
      expect(surfaces[1]).toBe(surfaces[0]);
      expect(surfaces[2]).toBe(surfaces[0]);
      // the ladder stamp never learns about the lifecycle axis
      for (const r of [plain, manual, auto])
        expect(r.container.querySelector('[data-jx-alert]')!.getAttribute('data-jx-alert')).toBe(
          variant,
        );
    }
  });
});
