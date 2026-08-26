/**
 * Composition-first-apis — Batch D contract suite
 * (test/composition-d.spec.ts, 2026-08-25).
 *
 * The five redesigned families' composition locks per
 * openspec/changes/composition-first-apis/verification.md:
 * - toc: outline SSR rail shell (the DECLARED auto-mode exception —
 *   empty rail pre-hydrate, links derived on hydrate) + manual
 *   composed tree render (SSR-complete markup);
 * - tour: the card(api) surface — index/total/step wired to the same
 *   lifecycle (next/prev/skip);
 * - alert-dialog: the composed family — Trigger opens, Title/
 *   Description carry the aria wiring, Escape (the native cancel
 *   request) cancels, Action confirms through the onconfirm seam;
 * - popconfirm: default rendering + content/actions snippet overrides.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import Host from './fixtures/composition-d-host.svelte';

/** jsdom has no rAF-driven engine ticks of its own — wait real frames */
const frames = (n = 1) =>
  new Promise<void>((done) => {
    let left = n;
    const step = () => (--left ? requestAnimationFrame(step) : done());
    requestAnimationFrame(step);
  });

// ---------------------------------------------------------------------------
// Toc — outline SSR shell + manual composed tree
// ---------------------------------------------------------------------------
describe('toc (composition-first)', () => {
  it('OUTLINE mode paints the rail shell only when no DOM is scannable (the declared SSR exception shape)', () => {
    // The server has no DOM at all; an outline root that resolves to
    // nothing exercises the identical code path (document.querySelector
    // misses → outlineSections stays [] → shell only). This is the exact
    // shape SSR paints: nav landmark + both surfaces, ZERO links.
    const rendered = render(Host, { props: { scenario: 'toc-outline', outlineRoot: '#cd-absent' } });
    const { container } = rendered;
    expect(container.querySelector('nav.jx-toc-desktop[aria-label="Table of contents"]')).toBeTruthy();
    expect(container.querySelector('.jx-toc-mobile')).toBeTruthy();
    expect(container.querySelector('.jx-toggle')).toBeTruthy();
    // the empty lists still render (the rail shell structure)
    expect(container.querySelectorAll('ul[data-jx-toc-list]')).toHaveLength(2);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('MANUAL mode paints the composed list tree in the markup (SSR-complete)', () => {
    const { container } = render(Host, { props: { scenario: 'toc-manual' } });

    // no derivation involved — the links exist in the painted markup,
    // synchronously, in both surfaces
    const desktopLinks = [...container.querySelectorAll<HTMLElement>('.jx-toc-desktop a[data-jx-toc-link]')];
    expect(desktopLinks.map((a) => a.getAttribute('href'))).toEqual([
      '#cd-alpha',
      '#cd-alpha-one',
      '#cd-beta',
    ]);
    expect(container.querySelectorAll('.jx-viewport a[data-jx-toc-link]')).toHaveLength(3);
    // the family anatomy: TocList ul > TocItem li > TocLink a; nesting via
    // a nested TocList inside a TocItem — anchors never nest
    const rootList = container.querySelector('.jx-toc-desktop > ul[data-jx-toc-list]');
    expect(rootList).toBeTruthy();
    expect(rootList!.children.length).toBe(2);
    const firstItem = rootList!.children[0]!;
    expect(firstItem.tagName).toBe('LI');
    expect(firstItem.querySelector(':scope > a[data-jx-toc-link]')!.textContent?.trim()).toBe('Alpha');
    const nested = firstItem.querySelector(':scope > ul[data-jx-toc-list]');
    expect(nested?.querySelector('li > a[data-jx-toc-link]')!.getAttribute('href')).toBe('#cd-alpha-one');
    // never <a><a>
    expect(container.querySelector('.jx-toc-desktop a a')).toBeNull();
  });

  it('OUTLINE mode derives its links on hydrate, rendered through the same parts', async () => {
    const rendered = render(Host, { props: { scenario: 'toc-outline' } });
    const { container } = rendered;

    // hydrate: the outline derives from the content root's headings —
    // two level-1 sections, one nested level-2 child, rendered through
    // the SAME parts in BOTH surfaces
    await frames(3);
    const desktopLinks = [...container.querySelectorAll<HTMLElement>('.jx-toc-desktop a[data-jx-toc-link]')];
    expect(desktopLinks.map((a) => a.getAttribute('href'))).toEqual([
      '#alpha-law',
      '#alpha-detail',
      '#beta-law',
    ]);
    expect(desktopLinks.map((a) => a.textContent?.trim())).toEqual([
      'Alpha Law',
      'Alpha detail',
      'Beta Law',
    ]);
    // structure law: nesting is a nested <ul> inside the parent <li>
    const nestedList = container.querySelector('.jx-toc-desktop li li');
    expect(nestedList?.querySelector(':scope > a')?.getAttribute('href')).toBe('#alpha-detail');
    // the derived ids are stamped back onto the headings (real anchors)
    expect(container.querySelector('#cd-outline-root h2')!.id).toBe('alpha-law');
    // the mobile rail mirrors the same tree
    expect(container.querySelectorAll('.jx-viewport a[data-jx-toc-link]')).toHaveLength(3);
  });

  it('MANUAL mode spies through the hrefs (aria-current = root behavior)', async () => {
    const { container } = render(Host, { props: { scenario: 'toc-manual' } });
    await frames(3);
    // jsdom has no layout: every extent rect reads 0 → nothing crosses
    // the line → the LAST target keeps the pick (the engine's
    // past-every-region law), deterministically
    const current = container.querySelectorAll('.jx-viewport a[aria-current="true"]');
    expect(current).toHaveLength(1);
    expect(current[0]!.getAttribute('href')).toBe('#cd-beta');
    const activeItem = container.querySelector('.jx-toc-desktop li.active > a');
    expect(activeItem?.getAttribute('href')).toBe('#cd-beta');
  });
});

// ---------------------------------------------------------------------------
// Tour — the card(api) snippet surface
// ---------------------------------------------------------------------------
describe('tour card(api) (composition-first)', () => {
  it('exposes index/total/step and wires next/prev/skip to the lifecycle', async () => {
    const rendered = render(Host, { props: { scenario: 'tour-card' } });
    const { container } = rendered;

    await fireEvent.click(container.querySelector('[data-tour-open-btn]')!);
    await frames(2);

    const api = () => container.querySelector('[data-tour-card-api]')!;
    expect(api().getAttribute('data-index')).toBe('0');
    expect(api().getAttribute('data-total')).toBe('2');
    expect(api().getAttribute('data-step-title')).toBe('Step A');
    expect(api().textContent?.trim()).toBe('0/2: Step A');
    // the authored card replaces the default one — no default controls
    expect(container.querySelector('[data-jx-tour-next]')).toBeNull();
    expect(container.querySelector('[data-jx-tour-meta]')).toBeNull();

    // next: authored button → step 1 (the lease + focus ride the same path)
    await fireEvent.click(container.querySelector('[data-tour-card-next]')!);
    await frames(2);
    expect(api().getAttribute('data-index')).toBe('1');
    expect(api().getAttribute('data-step-title')).toBe('Step B');

    // prev: authored button → back to step 0
    await fireEvent.click(container.querySelector('[data-tour-card-prev]')!);
    await frames(2);
    expect(api().getAttribute('data-index')).toBe('0');

    // skip: authored button → finish(stoppedAt) + bind:open goes false
    await fireEvent.click(container.querySelector('[data-tour-card-skip]')!);
    await frames(2);
    expect(container.querySelector('[data-host="tour-card"]')!.getAttribute('data-open')).toBe('false');
    expect(container.querySelector('[data-host="tour-card"]')!.getAttribute('data-finished')).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// AlertDialog — the composed family
// ---------------------------------------------------------------------------
describe('alert-dialog family (composition-first)', () => {
  it('Trigger opens; Title/Description carry the aria wiring through derived ids', async () => {
    const rendered = render(Host, { props: { scenario: 'alert-dialog' } });
    const { container } = rendered;

    const trigger = container.querySelector('[data-jx-adlg-trigger]') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await fireEvent.click(trigger);
    const dialog = container.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('[data-host="alert-dialog"]')!.getAttribute('data-open')).toBe('true');

    // deterministic derived ids — the wire never depends on render order
    const title = container.querySelector('[data-jx-adlg-title]')!;
    const desc = container.querySelector('[data-jx-adlg-desc]')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(desc.id);
    expect(title.textContent?.trim()).toBe('delete repo?');
    expect(desc.textContent?.trim()).toBe('no undo');
  });

  it('focus lands on CANCEL (the safe action) on open', async () => {
    const rendered = render(Host, { props: { scenario: 'alert-dialog' } });
    const { container } = rendered;
    await fireEvent.click(container.querySelector('[data-jx-adlg-trigger]')!);
    await frames(2);
    const cancel = container.querySelector('[data-jx-adlg-cancel]') as HTMLButtonElement;
    expect(document.activeElement).toBe(cancel);
  });

  it('Escape (the native cancel request) cancels: prevented + animated shut + state adopted', async () => {
    const rendered = render(Host, { props: { scenario: 'alert-dialog' } });
    const { container } = rendered;
    await fireEvent.click(container.querySelector('[data-jx-adlg-trigger]')!);
    const dialog = container.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    // the platform fires a cancelable `cancel` event on Escape —
    // dispatch it directly (jsdom has no Escape→cancel pipeline)
    const cancelEvent = new Event('cancel', { cancelable: true, bubbles: false });
    dialog.dispatchEvent(cancelEvent);
    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
    await tick(); // the close event adopts the state into bind:open
    expect(container.querySelector('[data-host="alert-dialog"]')!.getAttribute('data-open')).toBe('false');
    // cancel is NOT confirm
    expect(container.querySelector('[data-host="alert-dialog"]')!.getAttribute('data-deleted')).toBe('false');
  });

  it('Action confirms through the onconfirm seam, then closes', async () => {
    const rendered = render(Host, { props: { scenario: 'alert-dialog' } });
    const { container } = rendered;
    await fireEvent.click(container.querySelector('[data-jx-adlg-trigger]')!);
    const dialog = container.querySelector('dialog[role="alertdialog"]') as HTMLDialogElement;

    const action = container.querySelector('[data-jx-adlg-action]') as HTMLButtonElement;
    // loud by default: fill + the destructive pair as the part's default injection
    expect(action.getAttribute('data-jx-alert-dialog-action')).toBe('fill');
    expect(action.className).toContain('jx-pair-destructive');
    await fireEvent.click(action);
    expect(container.querySelector('[data-host="alert-dialog"]')!.getAttribute('data-deleted')).toBe('true');
    expect(dialog.open).toBe(false);
    expect(container.querySelector('[data-host="alert-dialog"]')!.getAttribute('data-open')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Popconfirm — default rendering + snippet overrides
// ---------------------------------------------------------------------------
describe('popconfirm (composition-first)', () => {
  it('DEFAULT rendering: title/description strings + confirm/cancel row', async () => {
    const rendered = render(Host, { props: { scenario: 'popconfirm-default' } });
    const { container } = rendered;

    const panel = container.querySelector('[data-jx-pc-title]')!.closest('[popover]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
    expect(container.querySelector('[data-jx-pc-title]')!.textContent?.trim()).toBe('Delete this row?');
    expect(container.querySelector('[data-jx-pc-desc]')!.textContent?.trim()).toBe(
      'The history goes with it.',
    );
    expect(container.querySelector('[data-jx-pc-cancel]')!.textContent?.trim()).toBe('Cancel');
    expect(container.querySelector('[data-jx-pc-confirm]')!.textContent?.trim()).toBe('Delete');

    // open → focus lands on cancel; confirm runs through the seam
    await fireEvent.click(container.querySelector('[data-pc-trigger]')!);
    await frames(2);
    expect(panel.matches(':popover-open')).toBe(true);
    expect(document.activeElement).toBe(container.querySelector('[data-jx-pc-cancel]'));
    await fireEvent.click(container.querySelector('[data-jx-pc-confirm]')!);
    expect(container.querySelector('[data-host="popconfirm-default"]')!.getAttribute('data-outcome')).toBe(
      'confirmed',
    );
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('OVERRIDE rendering: content/actions snippets replace the default areas', async () => {
    const rendered = render(Host, { props: { scenario: 'popconfirm-override' } });
    const { container } = rendered;

    // the default title/description block and the default action row are
    // GONE — the snippets own those areas
    expect(container.querySelector('[data-jx-pc-title]')).toBeNull();
    expect(container.querySelector('[data-jx-pc-desc]')).toBeNull();
    expect(container.querySelector('[data-jx-pc-cancel]')).toBeNull();
    expect(container.querySelector('[data-jx-pc-confirm]')).toBeNull();
    expect(container.querySelector('[data-pc-custom-content]')!.textContent?.trim()).toBe(
      'merge this branch?',
    );

    // the trigger still opens; the authored merge button still runs
    await fireEvent.click(container.querySelector('[data-pc-trigger]')!);
    await frames(2);
    await fireEvent.click(container.querySelector('[data-pc-custom-merge]')!);
    expect(container.querySelector('[data-host="popconfirm-override"]')!.getAttribute('data-outcome')).toBe(
      'confirmed',
    );
  });
});
