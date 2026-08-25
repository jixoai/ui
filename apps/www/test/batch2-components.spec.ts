/**
 * Batch 2 component contract suite (test/batch2-components.spec.ts, 2026-08-22).
 *
 * Four registry items in the Codex-recommended order: progress (native
 * <progress>), tooltip (popover=manual + hover/focus intent), pagination
 * (nav of real links + the page-window algorithm), dropdown-menu (the
 * ARIA menu pattern on the popover laws). Popover-API surfaces run on
 * the setup.ts polyfill; assertions read the DOM the way a user or
 * assistive tech sees it.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import DropdownMenu from '../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
import DropdownMenuItem from '../src/lib/ui/dropdown-menu/dropdown-menu-item.svelte';
import PaginationHost from './fixtures/pagination-host.svelte';
import { pageRange } from '../src/lib/ui/pagination/pagination-range';
import Progress from '../src/lib/ui/progress/progress.svelte';
import TooltipHost from './fixtures/tooltip-host.svelte';
import TooltipArrowHost from './fixtures/tooltip-arrow-host.svelte';
import MenuCustomTriggerHost from './fixtures/menu-custom-trigger-host.svelte';
import MenuHost from './fixtures/menu-host.svelte';

// ---------------------------------------------------------------------------
// Progress — native <progress> + jixoai paint
// ---------------------------------------------------------------------------
describe('Progress', () => {
  it('renders the native element with value semantics intact', () => {
    const { container } = render(Progress, { props: { value: 0.42, label: 'sync' } });
    const bar = container.querySelector('progress.jx-progress-bar')!;
    expect(bar.getAttribute('value')).toBe('0.42');
    expect(bar.getAttribute('max')).toBe('1'); // the element's spec default
    expect(bar.textContent).toBe('42%'); // fallback content for old engines
    expect(container.querySelector('[role="status"]')?.textContent).toBe('42%');
    expect(container.querySelector('[data-jx-progress-label]')?.textContent).toBe('sync');
  });

  it('clamps the readout at both bounds (negative and >max)', () => {
    const { container } = render(Progress, { props: { value: -3, label: 'oops' } });
    expect(container.querySelector('[role="status"]')?.textContent).toBe('0%');
    const over = render(Progress, { props: { value: 99, max: 10 } });
    expect(over.container.querySelector('[role="status"]')?.textContent).toBe('100%');
  });

  it('omits value ⇒ indeterminate (no aria-valuenow, no % readout)', () => {
    const { container } = render(Progress);
    const bar = container.querySelector('progress.jx-progress-bar')!;
    expect(bar.hasAttribute('value')).toBe(false);
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tooltip — popover=manual panel + hover/focus intent
// ---------------------------------------------------------------------------
describe('Tooltip', () => {
  function setup() {
    const rendered = render(TooltipHost);
    const anchor = rendered.container.querySelector('[data-jx-tip-anchor]') as HTMLElement;
    const panel = rendered.container.querySelector('[role="tooltip"]') as HTMLElement;
    return { anchor, panel };
  }

  it('pairs the trigger wrapper to the tip via aria-describedby', () => {
    const { anchor, panel } = setup();
    expect(anchor.getAttribute('aria-describedby')).toBe(panel.id);
    expect(panel.getAttribute('popover')).toBe('manual');
  });

  it('focus opens the tip immediately, focusout closes it', async () => {
    const { anchor, panel } = setup();
    await fireEvent(anchor, new FocusEvent('focusin', { bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(true);

    // focusout must bubble: Svelte delegates this event through the document
    await fireEvent(anchor, new FocusEvent('focusout', { bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('pending intent timers die with the component (no stale show)', async () => {
    vi.useFakeTimers();
    try {
      const rendered = render(TooltipHost);
      const anchor = rendered.container.querySelector('[data-jx-tip-anchor]') as HTMLElement;
      await fireEvent(anchor, new PointerEvent('pointerenter', { bubbles: true }));
      rendered.unmount();
      await vi.advanceTimersByTimeAsync(600);
      // no crash, no leaked popover — the assertion IS the clean advance
    } finally {
      vi.useRealTimers();
    }
  });

  it('hover opens immediately by default; openDelay opts into hover intent', async () => {
    // Owner ruling 2026-08-23: tips show immediately — no timer advance
    const { anchor, panel } = setup();
    await fireEvent(anchor, new PointerEvent('pointerenter', { bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(true);

    // dual-surface close seam (2026-08-25 r1→r4): the close is legal
    // only when the pointer holds NEITHER the anchor NOR the panel.
    // Chromium/WebKit switch siblings as out(old)→leave(old)→over(new)
    //→enter(new) (Codex r2's minimal repro) — the block below drives
    // EXACTLY that four-event order. The geometric verdict, the
    // stale-box transient and touch handling need real layout/pointers
    // — covered by the headed browser batteries, not jsdom (no coords
    // ever arrive here, so the flags fallback is what runs)
    vi.useFakeTimers();
    try {
      await fireEvent(anchor, new PointerEvent('pointerout', { bubbles: true }));
      await fireEvent(anchor, new PointerEvent('pointerleave', { bubbles: true }));
      await fireEvent(panel, new PointerEvent('pointerover', { bubbles: true }));
      await fireEvent(panel, new PointerEvent('pointerenter', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(300);
      expect(panel.matches(':popover-open')).toBe(true); // panel holds the pointer

      // leaving BOTH surfaces closes after the grace window
      await fireEvent(panel, new PointerEvent('pointerout', { bubbles: true }));
      await fireEvent(panel, new PointerEvent('pointerleave', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(300);
      expect(panel.matches(':popover-open')).toBe(false);
    } finally {
      vi.useRealTimers();
    }

    // opt-in delay: still closed right after enter, open after the window
    const delayed = render(TooltipHost, { props: { openDelay: 150 } });
    const dAnchor = delayed.container.querySelector('[data-jx-tip-anchor]') as HTMLElement;
    const dPanel = delayed.container.querySelector('[role="tooltip"]') as HTMLElement;
    vi.useFakeTimers();
    try {
      await fireEvent(dAnchor, new PointerEvent('pointerenter', { bubbles: true }));
      expect(dPanel.matches(':popover-open')).toBe(false); // still waiting
      await vi.advanceTimersByTimeAsync(200);
      expect(dPanel.matches(':popover-open')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('touch pointers never feed the geometric keep (no stuck-open after liftoff)', async () => {
    // Codex r3: a touch contact fires pointermove too — recording its
    // last coordinate would park the verdict inside the anchor halo
    // forever and the re-arm loop would never close. Only hover-capable
    // pointers (mouse/pen) may feed px/py, so a touch hover closes on
    // leave exactly like the no-coords fallback
    const { anchor, panel } = setup();
    await fireEvent(anchor, new PointerEvent('pointerenter', { bubbles: true, pointerType: 'touch' }));
    expect(panel.matches(':popover-open')).toBe(true);
    await fireEvent(
      window,
      new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', clientX: 0, clientY: 0 }),
    );
    vi.useFakeTimers();
    try {
      await fireEvent(anchor, new PointerEvent('pointerleave', { bubbles: true, pointerType: 'touch' }));
      await vi.advanceTimersByTimeAsync(300);
      expect(panel.matches(':popover-open')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('arrow is opt-in: absent unless asked, mask authored at open without anchor()', async () => {
    const rendered = render(TooltipArrowHost);
    await tick();
    const { container } = rendered;
    const [center, corner, start, bare] = [
      ...container.querySelectorAll('[role="tooltip"]'),
    ] as HTMLElement[];

    // no notch opt-in flags unless the consumer asks
    expect(bare.querySelector('.jx-tip-body')?.className).not.toContain('masked');
    expect(bare.hasAttribute('data-arrow')).toBe(false);
    expect(bare.hasAttribute('data-border-ring')).toBe(false);

    // Chromium constraint (component header): anchor() in a style
    // attribute never resolves inside a popover — the notch is authored
    // at open as plain data-URI masks on custom properties. The seam
    // geometry itself is verified in a real browser, not jsdom.
    for (const panel of [center, corner, start]) {
      expect(panel.hasAttribute('data-arrow')).toBe(true);
      expect(panel.hasAttribute('data-border-ring')).toBe(true);
      const body = panel.querySelector('.jx-tip-body') as HTMLElement;
      expect(panel.getAttribute('style') ?? '').not.toContain('anchor(');
      expect(body.getAttribute('style') ?? '').not.toContain('anchor(');
    }

    // the toggle seam authors the notch mask at open through the REAL
    // platform path (the polyfill fires toggle synchronously inside
    // showPopover): focus-in opens, the seam reads :popover-open live
    // and aimPin writes the silhouette + ring data-URI vars (jsdom rects
    // are all-zero, so the paths are degenerate — the contract is that
    // the masks were authored, no crash). jsdom lacks Anchor Positioning
    // (and even the global CSS namespace), so the capability guard must
    // be stubbed true for the aim to run
    const cssNS = globalThis as { CSS?: { supports?: (q: string) => boolean } };
    const real = cssNS.CSS?.supports?.bind(cssNS.CSS);
    const fake = (q: string) =>
      q.includes('anchor-name') ? true : real ? real(q) : false;
    const installedCSS = cssNS.CSS;
    if (installedCSS?.supports) {
      vi.spyOn(installedCSS, 'supports').mockImplementation(fake);
    } else {
      cssNS.CSS = { supports: fake };
    }
    try {
      const wrapper = document.querySelector(`[aria-describedby="${center.id}"]`);
      await fireEvent(wrapper, new FocusEvent('focusin', { bubbles: true }));
      await tick();
      expect(center.matches(':popover-open')).toBe(true);
      expect(center.style.getPropertyValue('--jx-tip-shape')).toContain('data:image/svg+xml');
      expect(center.style.getPropertyValue('--jx-surface-ring')).toContain('data:image/svg+xml');
      expect(center.style.getPropertyValue('--jx-surface-ring-inner')).toContain('data:image/svg+xml');
    } finally {
      vi.restoreAllMocks();
      if (!installedCSS?.supports) delete cssNS.CSS;
    }
  });
});

// ---------------------------------------------------------------------------
// Pagination — the window algorithm + the nav of real links
// ---------------------------------------------------------------------------
describe('pageRange (window algorithm, token law)', () => {
  // composition-first-apis: '…' became the typed tokens
  // 'ellipsis-start' | 'ellipsis-end'; deeper parity is locked by the
  // 3,125-case grid in composition-b.spec.ts.
  it('keeps the edges sticky and collapses the middle', () => {
    expect(pageRange({ current: 5, total: 20 })).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20]);
    expect(pageRange({ current: 1, total: 20 })).toEqual([1, 2, 'ellipsis-end', 20]);
    expect(pageRange({ current: 20, total: 20 })).toEqual([1, 'ellipsis-start', 19, 20]);
  });

  it('never grows ellipses for tiny page counts', () => {
    expect(pageRange({ current: 1, total: 1 })).toEqual([1]);
    expect(pageRange({ current: 1, total: 2 })).toEqual([1, 2]);
    expect(pageRange({ current: 1, total: 3 })).toEqual([1, 2, 3]);
    expect(pageRange({ current: 2, total: 4 })).toEqual([1, 2, 3, 4]);
  });

  it('siblings=0 collapses the neighbor run entirely', () => {
    expect(pageRange({ current: 5, total: 20, siblings: 0 })).toEqual([1, 'ellipsis-start', 5, 'ellipsis-end', 20]);
    expect(pageRange({ current: 1, total: 20, siblings: 0 })).toEqual([1, 'ellipsis-end', 20]);
    expect(pageRange({ current: 2, total: 20, siblings: 0 })).toEqual([1, 2, 'ellipsis-end', 20]);
  });
});

describe('Pagination', () => {
  // composition-first-apis: the closed compute-and-render component is
  // dead — the host composes the parts over pageRange (structure with
  // the consumer). Deeper locks (child() escape, onclick-only button)
  // live in composition-b.spec.ts.
  function setup(at: string) {
    const rendered = render(PaginationHost);
    const root = rendered.container.querySelector(`[data-testid="${at}"]`)!;
    const nav = root.querySelector('nav[aria-label="pagination"]')!;
    const links = [...nav.querySelectorAll('a')] as HTMLAnchorElement[];
    return { nav, links };
  }

  it('marks the current page with aria-current and real hrefs', () => {
    const { links } = setup('at-middle');
    const current = links.find((a) => a.getAttribute('aria-current') === 'page')!;
    expect(current.textContent).toBe('5');
    expect(current.getAttribute('href')).toBe('/items?page=5');
  });

  it('prev at the bound becomes an honest disabled span; next walks', () => {
    const { nav, links } = setup('at-first');
    const prev = nav.querySelector('[data-jx-page-edge-off]')!;
    expect(prev.tagName).toBe('SPAN'); // no dead link at page 1
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    const next = links.find((a) => a.textContent === 'next ›')!;
    expect(next.getAttribute('href')).toBe('/items?page=2');
  });

  it('ellipses are decoration only (aria-hidden)', () => {
    const { nav } = setup('at-middle');
    const gaps = nav.querySelectorAll('[data-jx-page-gap]');
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

// ---------------------------------------------------------------------------
// DropdownMenu — the ARIA menu on the popover laws
// ---------------------------------------------------------------------------
describe('DropdownMenu', () => {
  function setup() {
    const rendered = render(MenuHost);
    const trigger = rendered.container.querySelector(
      'button[popovertarget]',
    ) as HTMLButtonElement;
    const menu = rendered.container.querySelector('[role="menu"]') as HTMLElement;
    const items = [...menu.querySelectorAll('[role="menuitem"]')] as HTMLElement[];
    return { rendered, trigger, menu, items };
  }

  it('wires the trigger: popovertarget + aria-haspopup=menu', () => {
    const { trigger, menu } = setup();
    expect(trigger.getAttribute('popovertarget')).toBe(menu.id);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('opening focuses the first item (not the trigger)', async () => {
    const { trigger, items } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);
    expect(document.activeElement).toBe(items[0]);
    expect(items[0].getAttribute('aria-current')).toBe('true');
  });

  it('ArrowDown/Home/End walk the items, wrapping', async () => {
    const { trigger, items } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);

    await fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    await fireEvent.keyDown(items[1], { key: 'End' });
    expect(document.activeElement).toBe(items.at(-1));
    await fireEvent.keyDown(items.at(-1)!, { key: 'ArrowDown' }); // wraps
    expect(document.activeElement).toBe(items[0]);
  });

  it('typeahead jumps to the item starting with the typed char', async () => {
    const { trigger, items } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);

    await fireEvent.keyDown(items[0], { key: 'd' }); // "duplicate"
    expect(document.activeElement).toBe(items.find((i) => i.textContent === 'Duplicate'));
  });

  it('selection: caller onclick runs, menu closes, focus returns to trigger', async () => {
    const { rendered, trigger, items } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);

    await fireEvent.click(items.find((i) => i.textContent?.includes('Rename'))!);
    expect(rendered.container.querySelector('[data-last-action]')?.getAttribute('data-last-action')).toBe('rename');
    expect(trigger.matches(':popover-open')).toBe(false);
    // the menu panel itself is closed…
    expect(
      (rendered.container.querySelector('[role="menu"]') as HTMLElement).matches(':popover-open'),
    ).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape closes with focus restored (explicit decision, not heuristic)', async () => {
    const { trigger, items } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);
    expect(items[0].matches(':focus')).toBe(true);

    await fireEvent.keyDown(items[0], { key: 'Escape' });
    expect(
      document.activeElement === trigger || document.activeElement === document.body,
    ).toBe(true);
  });

  it('destructive items carry the destructive paint class', () => {
    const { items } = setup();
    const del = items.find((i) => i.textContent === 'Delete')!;
    expect(del.className).toContain('jx-menu-item-destructive');
  });

  // ---- custom trigger: adopted for aria + focus restoration ----------
  it('custom trigger: selection restores focus to the caller button', async () => {
    const rendered = render(MenuCustomTriggerHost);
    const trigger = rendered.container.querySelector('[data-custom-trigger]') as HTMLButtonElement;
    const menu = rendered.container.querySelector('[role="menu"]') as HTMLElement;
    expect(trigger.getAttribute('popovertarget')).toBe(menu.id);

    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);
    const item = menu.querySelector('[role="menuitem"]') as HTMLElement;
    await fireEvent.click(item);

    expect(
      rendered.container.querySelector('[data-last-action]')?.getAttribute('data-last-action'),
    ).toBe('renamed');
    expect(document.activeElement).toBe(trigger);
  });
});
