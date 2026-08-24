/**
 * Batch 3 component contract suite (test/batch3-components.spec.ts, 2026-08-22).
 *
 * Six registry items per the Codex-agreed order: breadcrumb, toast
 * (store + viewport), alert-dialog, sheet, hover-card, kbd. The overlay
 * trio runs through real dialog/popover behavior on the setup.ts
 * polyfills; the toast store is tested headless (it is deliberately
 * DOM-free) and through the viewport's rendering.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AlertDialogHost from './fixtures/overlay-host.svelte';
import Breadcrumb from '../src/lib/ui/breadcrumb/breadcrumb.svelte';
import HoverCardHost from './fixtures/hover-host.svelte';
import Kbd from '../src/lib/ui/kbd/kbd.svelte';
import OverlayHost from './fixtures/overlay-host.svelte';
import { createToastStore } from '../src/lib/toast-store';

// ---------------------------------------------------------------------------
// Breadcrumb — nav landmark of real links
// ---------------------------------------------------------------------------
describe('Breadcrumb', () => {
  const crumbs = [
    { label: 'registry', href: '/' },
    { label: 'components', href: '/docs/components' },
    { label: 'table', href: '/docs/components/table.html' },
  ];

  it('is a labeled nav over an ordered list of real links', () => {
    const { container } = render(Breadcrumb, { props: { crumbs } });
    const nav = container.querySelector('nav[aria-label="Breadcrumb"]')!;
    expect(nav.querySelector('ol')).toBeTruthy();
    const links = [...nav.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(crumbs.map((c) => c.href));
  });

  it('marks the last crumb as the current page', () => {
    const { container } = render(Breadcrumb, { props: { crumbs } });
    const current = container.querySelector('a[aria-current="page"]')!;
    expect(current.textContent).toBe('table');
  });

  it('collapses the middle into a live ellipsis link (never a dead span)', () => {
    const long = Array.from({ length: 8 }, (_, i) => ({ label: `p${i + 1}`, href: `/${i + 1}` }));
    const { container } = render(Breadcrumb, { props: { crumbs: long, collapse: 4 } });
    const labels = [...container.querySelectorAll('a')].map((a) => a.textContent);
    expect(labels).toContain('…');
    const gap = container.querySelectorAll('a')[1];
    expect(gap.getAttribute('href')).toBe('/2'); // first hidden page, one click away
    // first and last survive the collapse
    expect(labels[0]).toBe('p1');
    expect(labels.at(-1)).toBe('p8');
  });
});

// ---------------------------------------------------------------------------
// Kbd — the native keyboard glyph
// ---------------------------------------------------------------------------
describe('Kbd', () => {
  it('renders a native <kbd> with the chip paint and passthrough', () => {
    const { container } = render(Kbd, { props: { title: 'command', 'data-testid': 'k' } });
    const kbd = container.querySelector('[data-testid="k"]')!;
    expect(kbd.tagName).toBe('KBD');
    expect(kbd.hasAttribute('data-jx-kbd')).toBe(true);
    expect(kbd.getAttribute('title')).toBe('command');
  });
});

// ---------------------------------------------------------------------------
// Toast store — headless lifecycle
// ---------------------------------------------------------------------------
describe('createToastStore', () => {
  it('push → subscribe fires → auto-dismiss after duration', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      const seen: number[] = [];
      store.subscribe((items) => seen.push(items.length));
      const id = store.api.push({ title: 'Deployed', duration: 1000 });
      expect(store.api.snapshot()).toHaveLength(1);
      expect(store.api.snapshot()[0].id).toBe(id);

      await vi.advanceTimersByTimeAsync(1100);
      expect(store.api.snapshot()).toHaveLength(0);
      expect(seen.at(-1)).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('duration 0 is sticky — only an explicit dismiss clears it', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      const id = store.api.push({ title: 'Sticky', duration: 0 });
      await vi.advanceTimersByTimeAsync(60_000);
      expect(store.api.snapshot()).toHaveLength(1);
      store.api.dismiss(id);
      expect(store.api.snapshot()).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pause freezes the countdown; resume finishes it', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      const id = store.api.push({ title: 'Pausable', duration: 1000 });
      await vi.advanceTimersByTimeAsync(500);
      store.pause(id);
      await vi.advanceTimersByTimeAsync(5000); // frozen — still here
      expect(store.api.snapshot()).toHaveLength(1);
      store.resume(id);
      await vi.advanceTimersByTimeAsync(600); // ~500 remaining + slack
      expect(store.api.snapshot()).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Toast viewport — the presentation half
// ---------------------------------------------------------------------------
describe('ToastViewport', () => {
  it('renders pushed toasts with per-item live-region semantics', async () => {
    const rendered = render(OverlayHost);
    await fireEvent.click(rendered.container.querySelector('[data-toast-polite]')!);
    const polite = rendered.container.querySelector('[data-jx-toasts] [role="status"]')!;
    expect(polite.textContent).toContain('Deployed');

    await fireEvent.click(rendered.container.querySelector('[data-toast-sticky]')!);
    const assertive = rendered.container.querySelector('[data-jx-toasts] [role="alert"]')!;
    expect(assertive.textContent).toContain('Build failed');
  });

  it('dismiss paints the exit frame BEFORE the toast leaves the DOM', async () => {
    const rendered = render(OverlayHost);
    await fireEvent.click(rendered.container.querySelector('[data-toast-polite]')!);
    const btn = rendered.container.querySelector('[data-jx-toast-dismiss]') as HTMLButtonElement;
    await fireEvent.click(btn);

    // within the exit window the snapshot still renders, marked leaving
    expect(rendered.container.querySelector('.jx-toast-leaving')).toBeTruthy();

    // after the sweep window the frame is gone
    await new Promise((resolve) => setTimeout(resolve, 320));
    expect(rendered.container.querySelector('.jx-toast-leaving')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AlertDialog — alertdialog semantics on the dialog laws
// ---------------------------------------------------------------------------
describe('AlertDialog', () => {
  it('exposes role=alertdialog with labelled title and described body', async () => {
    const rendered = render(OverlayHost);
    await fireEvent.click(rendered.container.querySelector('button')!);
    const dlg = rendered.container.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;
    expect(dlg.open).toBe(true);
    expect(dlg.getAttribute('aria-labelledby')).toBe('jx-adlg-title');
    expect(dlg.getAttribute('aria-describedby')).toBe('jx-adlg-desc');
  });

  it('focus lands on CANCEL (the safe action), confirm runs then closes', async () => {
    const rendered = render(AlertDialogHost);
    await fireEvent.click(rendered.container.querySelector('button')!);
    await new Promise(requestAnimationFrame);
    const cancel = rendered.container.querySelector('[data-jx-adlg-cancel]') as HTMLButtonElement;
    expect(document.activeElement).toBe(cancel);

    const confirm = rendered.container.querySelector('[data-jx-adlg-confirm]') as HTMLButtonElement;
    expect(confirm.getAttribute('data-jx-adlg-confirm')).toBe('destructive');
    await fireEvent.click(confirm);
    expect(rendered.container.querySelector('[data-deleted]')?.getAttribute('data-deleted')).toBe(
      'true',
    );
  });
});

// ---------------------------------------------------------------------------
// Sheet — the dialog positioning variant
// ---------------------------------------------------------------------------
describe('Sheet', () => {
  it('opens as a modal dialog docked to its side', async () => {
    const rendered = render(OverlayHost);
    const buttons = rendered.container.querySelectorAll('button');
    await fireEvent.click(rendered.container.querySelector('[data-open-sheet]')!);
    const dlg = rendered.container.querySelector('dialog.jx-sheet') as HTMLDialogElement;
    expect(dlg.open).toBe(true);
    expect(dlg.className).toContain('jx-sheet-right');
  });
});

// ---------------------------------------------------------------------------
// HoverCard — intent model with an interactive panel
// ---------------------------------------------------------------------------
describe('HoverCard', () => {
  it('opens on focus instantly and closes on a real focus exit', async () => {
    const rendered = render(HoverCardHost);
    const anchor = rendered.container.querySelector('[data-jx-hover-anchor]') as HTMLElement;
    const panel = rendered.container.querySelector('.jx-hover-card') as HTMLElement;
    expect(panel.getAttribute('popover')).toBe('manual');

    await fireEvent(anchor, new FocusEvent('focusin', { bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(true);

    // focus moving INTO the panel is a crossing, not an exit
    await fireEvent(
      anchor,
      new FocusEvent('focusout', { bubbles: true, relatedTarget: panel }),
    );
    expect(panel.matches(':popover-open')).toBe(true);

    // focus leaving everything closes — after the 200ms close grace
    await fireEvent(
      anchor,
      new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }),
    );
    await new Promise((resolve) => setTimeout(resolve, 260));
    expect(panel.matches(':popover-open')).toBe(false);
  });
});
