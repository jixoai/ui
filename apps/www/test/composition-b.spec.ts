/**
 * composition-first batch B contract suite (test/composition-b.spec.ts,
 * 2026-08-25).
 *
 * The four Batch B families — breadcrumb, pagination (+ the pageRange
 * helper), anchor, terminal-footer — redesigned from prop-driven to
 * composed parts. Locks:
 *
 *   pageRange   exact parity with the closed pagination's pageWindow
 *               math (old algorithm ported below, grid-compared), plus
 *               the frozen-signature expectations renamed to tokens
 *   breadcrumb  the composed trail semantics + the opt-in
 *               BreadcrumbCollapse fold (hidden middle, live ellipsis
 *               link) + the Link child() class-merge law
 *   pagination  the composed nav: aria-current, honest disabled spans
 *               at the bounds, aria-hidden ellipses, the onclick-only
 *               button form, Previous child() escape
 *   anchor      the DOM-delegated scrollspy: real fragment links,
 *               aria-current=location picks, scroll re-picks, and
 *               conditionally inserted items joining the spy with zero
 *               registration. (The spy is the shared scroll-event
 *               implementation from $lib/scroll-spy — there is no
 *               IntersectionObserver anywhere in this family, so the
 *               "mock the observer" note resolves to stubbing
 *               getBoundingClientRect per target, the batch-7
 *               pattern.)
 *   terminal-footer  the composed column meta row over the ghost chrome
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { pageRange } from '../src/lib/ui/pagination/pagination-range';
import AnchorHost from './fixtures/anchor-host.svelte';
import BreadcrumbHost from './fixtures/breadcrumb-host.svelte';
import PaginationHost from './fixtures/pagination-host.svelte';
import TerminalFooterHost from './fixtures/terminal-footer-host.svelte';

// ---------------------------------------------------------------------------
// pageRange — parity with the closed component's window math
// ---------------------------------------------------------------------------

/** the OLD algorithm, ported VERBATIM from pagination.svelte (pre
 *  2026-08-25 closed form) — the parity oracle */
type OldPageItem = number | '…';
function oldPageWindow(page: number, pageCount: number, siblings = 1): OldPageItem[] {
  const s = Math.max(0, Math.trunc(siblings));
  const items: OldPageItem[] = [1];
  const from = Math.max(2, page - s);
  const to = Math.min(pageCount - 1, page + s);
  if (from > 2) items.push('…');
  for (let p = from; p <= to; p++) items.push(p);
  if (to < pageCount - 1) items.push('…');
  if (pageCount > 1) items.push(pageCount);
  return items;
}

/** tokens → the old '…' glyph (order-stable: at most one of each) */
function asOldWindow(items: ReturnType<typeof pageRange>): OldPageItem[] {
  return items.map((item) => (typeof item === 'number' ? item : '…'));
}

describe('pageRange', () => {
  it('matches the old window math exactly across the grid', () => {
    for (let total = 1; total <= 25; total++) {
      for (let current = 1; current <= 25; current++) {
        for (const siblings of [undefined, 0, 1, 2, 5, -3, 1.7]) {
          expect(asOldWindow(pageRange({ current, total, siblings }))).toEqual(
            oldPageWindow(current, total, siblings ?? 1),
          );
        }
      }
    }
  });

  it('returns the two ellipsis TOKENS (consumers branch on them)', () => {
    expect(pageRange({ current: 5, total: 20 })).toEqual([
      1,
      'ellipsis-start',
      4,
      5,
      6,
      'ellipsis-end',
      20,
    ]);
    expect(pageRange({ current: 1, total: 20 })).toEqual([1, 2, 'ellipsis-end', 20]);
    expect(pageRange({ current: 20, total: 20 })).toEqual([1, 'ellipsis-start', 19, 20]);
  });

  it('never grows ellipses for tiny page counts', () => {
    expect(pageRange({ current: 1, total: 1 })).toEqual([1]);
    expect(pageRange({ current: 1, total: 2 })).toEqual([1, 2]);
    expect(pageRange({ current: 1, total: 3 })).toEqual([1, 2, 3]);
    expect(pageRange({ current: 2, total: 4 })).toEqual([1, 2, 3, 4]);
  });

  it('siblings=0 collapses the neighbor run entirely (old expectations ported)', () => {
    expect(pageRange({ current: 5, total: 20, siblings: 0 })).toEqual([
      1,
      'ellipsis-start',
      5,
      'ellipsis-end',
      20,
    ]);
    expect(pageRange({ current: 1, total: 20, siblings: 0 })).toEqual([
      1,
      'ellipsis-end',
      20,
    ]);
    expect(pageRange({ current: 2, total: 20, siblings: 0 })).toEqual([
      1,
      2,
      'ellipsis-end',
      20,
    ]);
  });
});

// ---------------------------------------------------------------------------
// Breadcrumb — the composed trail
// ---------------------------------------------------------------------------
describe('Breadcrumb family', () => {
  it('is a labeled nav over an ordered list of real links with separators', async () => {
    const { getByTestId } = await render(BreadcrumbHost);
    const nav = getByTestId('plain').querySelector('nav[aria-label="Breadcrumb"]')!;
    expect(nav.querySelector('ol')).toBeTruthy();
    const links = [...nav.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/leaf']);
    expect(nav.querySelectorAll('[data-jx-breadcrumb-separator]')).toHaveLength(1);
  });

  it('marks the page part as the current page', async () => {
    const { getByTestId } = await render(BreadcrumbHost);
    const current = getByTestId('plain').querySelector('[aria-current="page"]')!;
    expect(current.textContent).toBe('leaf');
    expect(current.hasAttribute('data-jx-breadcrumb-current')).toBe(true);
  });

  it('BreadcrumbCollapse hides the wrapped middle and keeps the ellipsis a live link', async () => {
    const { getByTestId } = await render(BreadcrumbHost);
    const scope = getByTestId('folded');

    // the wrapped items self-hide (platform `hidden` + the fold hook)
    const folded = [...scope.querySelectorAll('[data-jx-breadcrumb-collapsed]')];
    expect(folded).toHaveLength(5);
    expect(folded.every((li) => li.hasAttribute('hidden'))).toBe(true);

    // the ellipsis derives its destination from the first hidden page
    const ellipsis = scope.querySelector('[data-jx-breadcrumb-collapse]')!;
    expect(ellipsis.getAttribute('href')).toBe('/2');

    // first and last survive the fold (old expectations ported)
    const visible = [...scope.querySelectorAll('a')]
      .filter((a) => a.closest('li')?.hasAttribute('hidden') !== true)
      .map((a) => a.textContent);
    expect(visible).toEqual(['p1', '…', 'p8']);
  });

  it('BreadcrumbEllipsis is the manual aria-hidden gap glyph', async () => {
    const { getByTestId } = await render(BreadcrumbHost);
    const gap = getByTestId('manual-gap').querySelector('[data-jx-breadcrumb-ellipsis]')!;
    expect(gap.getAttribute('aria-hidden')).toBe('true');
    expect(gap.textContent).toBe('…');
  });

  it('Link child(): consumer element renders with merged classes, consumer wins', async () => {
    const { getByTestId } = await render(BreadcrumbHost);
    const escape = getByTestId('child-escape');
    const link = escape.querySelector('a')!;

    // the part did NOT render its own element — the consumer's did
    expect(link.hasAttribute('data-jx-breadcrumb-link')).toBe(false);
    // props carried href verbatim
    expect(link.getAttribute('href')).toBe('/');
    // merge law: part classes are in props.class, the consumer's own
    // utilities appended LAST win the conflict set (tailwind-merge)
    expect(link.className).toContain('text-primary');
    expect(link.className).not.toContain('text-muted-foreground');
    expect(link.className).not.toContain('text-accent');
    // the part's non-conflicting paint survives the merge
    expect(link.className).toContain('hover:text-primary');
  });
});

// ---------------------------------------------------------------------------
// Pagination — the composed nav
// ---------------------------------------------------------------------------
describe('Pagination family', () => {
  it('marks the active link with aria-current and real hrefs', async () => {
    const { getByTestId } = await render(PaginationHost);
    const nav = getByTestId('at-middle').querySelector('nav')!;
    const current = nav.querySelector('[aria-current="page"]') as HTMLAnchorElement;
    expect(current.textContent?.trim()).toBe('5');
    expect(current.getAttribute('href')).toBe('/items?page=5');
    expect(current.hasAttribute('data-jx-page-current')).toBe(true);
  });

  it('prev/next walk; at the bounds they become honest disabled spans', async () => {
    const { getByTestId } = await render(PaginationHost);
    const atFirst = getByTestId('at-first');
    const prev = atFirst.querySelector('[data-jx-page-edge]')!;
    expect(prev.tagName).toBe('SPAN'); // no dead link at page 1
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    const next = [...atFirst.querySelectorAll('a')].find((a) => a.textContent === 'next ›')!;
    expect(next.getAttribute('href')).toBe('/items?page=2');
  });

  it('ellipses are decoration only (aria-hidden)', async () => {
    const { getByTestId } = await render(PaginationHost);
    for (const gap of getByTestId('at-middle').querySelectorAll('[data-jx-page-gap]')) {
      expect(gap.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('an onclick-only link renders a button, never a dead anchor', async () => {
    const { getByTestId } = await render(PaginationHost);
    const control = getByTestId('button-form').querySelector('[data-jx-page]')!;
    expect(control.tagName).toBe('BUTTON');
    expect(control.getAttribute('href')).toBe(null);
    await fireEvent.click(control);
    expect(control.textContent?.trim()).toBe('two'); // label override survives
  });

  it('Previous child(): consumer element receives merged props', async () => {
    const { getByTestId } = await render(PaginationHost);
    const link = getByTestId('child-escape').querySelector('a')!;
    expect(link.hasAttribute('data-jx-page-edge')).toBe(false);
    expect(link.getAttribute('href')).toBe('/items?page=4');
    expect(link.className).toContain('text-primary');
    expect(link.className).not.toContain('text-muted-foreground');
    expect(link.className).toContain('jx-press');
  });
});

// ---------------------------------------------------------------------------
// Anchor — the DOM-delegated scrollspy family
// ---------------------------------------------------------------------------
describe('Anchor family', () => {
  function withTargets(): HTMLElement[] {
    const targets = ['one', 'two'].map((id) => {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
      return el;
    });
    return targets;
  }

  it('renders a labeled nav of real fragment links', async () => {
    const { getByTestId } = await render(AnchorHost);
    const nav = getByTestId('rail').querySelector('nav[aria-label="on this page"]')!;
    const links = [...nav.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#one', '#two']);
    expect(links[0]!.textContent).toBe('One');
  });

  it('the pick marks aria-current=location on the last target past the line', async () => {
    const targets = withTargets();
    targets[0]!.getBoundingClientRect = () => ({ top: 400 } as DOMRect); // below the line
    targets[1]!.getBoundingClientRect = () => ({ top: 20 } as DOMRect); // at/past it

    const { getByTestId } = await render(AnchorHost);
    const current = getByTestId('rail').querySelector('a[aria-current="location"]');
    expect(current?.getAttribute('href')).toBe('#two');

    targets.forEach((t) => t.remove());
  });

  it('scroll events re-run the pick (rAF-throttled) — spy lifecycle', async () => {
    vi.useFakeTimers();
    try {
      const targets = withTargets();
      targets[0]!.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
      targets[1]!.getBoundingClientRect = () => ({ top: 800 } as DOMRect);
      const { getByTestId, unmount } = await render(AnchorHost);
      await fireEvent.scroll(window);
      await vi.advanceTimersByTimeAsync(50);
      expect(
        getByTestId('rail').querySelector('a[aria-current="location"]')?.getAttribute('href'),
      ).toBe('#one');

      // lifecycle: destroy removes the listeners — later scrolls are no-ops
      unmount();
      targets.forEach((t) => t.remove());
    } finally {
      vi.useRealTimers();
    }
  });

  it('the scroll-margin lease is restored on unmount', async () => {
    const targets = withTargets();
    targets[0]!.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
    targets[1]!.getBoundingClientRect = () => ({ top: 800 } as DOMRect);

    const { unmount } = await render(AnchorHost);
    expect(targets[0]!.style.scrollMarginTop).toBe('96px');
    unmount();
    expect(targets[0]!.style.scrollMarginTop).toBe('');
    expect(targets[0]!.dataset.jxAnchorPriorMargin).toBeUndefined();

    targets.forEach((t) => t.remove());
  });

  it('conditionally inserted items join the spy with zero registration', async () => {
    const targets = withTargets();
    const third = document.createElement('section');
    third.id = 'three';
    document.body.appendChild(third);

    const { getByTestId } = await render(AnchorHost);
    // before the toggle the third item does not exist in the rail
    expect(getByTestId('rail').querySelectorAll('a')).toHaveLength(2);

    third.getBoundingClientRect = () => ({ top: 5 } as DOMRect); // owns the line
    targets[0]!.getBoundingClientRect = () => ({ top: 300 } as DOMRect);
    targets[1]!.getBoundingClientRect = () => ({ top: 600 } as DOMRect);

    await fireEvent.click(getByTestId('toggle'));
    // DOM-delegated: the new child a[href^="#"] is picked up (MutationObserver
    // re-derives targets) — the pick follows the next scroll sync
    await vi.waitFor(() => {
      expect(getByTestId('rail').querySelectorAll('a')).toHaveLength(3);
    });
    await fireEvent.scroll(window);
    await vi.waitFor(() => {
      expect(
        getByTestId('rail').querySelector('a[aria-current="location"]')?.getAttribute('href'),
      ).toBe('#three');
    });

    targets.forEach((t) => t.remove());
    third.remove();
  });

  it('AnchorItem child(): consumer element receives merged props incl. active state', async () => {
    const targets = withTargets();
    targets[0]!.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
    targets[1]!.getBoundingClientRect = () => ({ top: 900 } as DOMRect);

    const { getByTestId } = await render(AnchorHost);
    const link = getByTestId('child-escape').querySelector('a')!;
    // the consumer's element rendered (via child), and the part's
    // STATE hooks ride props: the spy's active markers follow the
    // element wherever the consumer puts them
    expect(link.getAttribute('data-jx-anchor-active')).toBe('');
    expect(link.getAttribute('href')).toBe('#one');
    expect(link.getAttribute('aria-current')).toBe('location'); // state rides props
    expect(link.className).toContain('text-primary'); // consumer's utility wins
    expect(link.className).not.toContain('text-muted-foreground');
    expect(link.className).toContain('border-l-primary'); // active paint from the part

    targets.forEach((t) => t.remove());
  });
});

// ---------------------------------------------------------------------------
// TerminalFooter — the composed column meta row
// ---------------------------------------------------------------------------
describe('TerminalFooter family', () => {
  it('renders the ghost chrome and the © row over composed columns', async () => {
    const { container } = await render(TerminalFooterHost);
    const footer = container.querySelector('footer[data-jx-terminal-footer]')!;

    // the ghost word is decorative by declaration
    const ghost = footer.querySelector('.jx-footer-ghost')!;
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.textContent).toBe('JIXOAI');

    // columns compose: title + free links (authored children)
    const columns = [...footer.querySelectorAll('[data-jx-terminal-footer-column]')];
    expect(columns).toHaveLength(2);
    // titled: heading span first, then the free-links stack
    expect(columns[0]!.children[0]!.tagName).toBe('SPAN');
    expect(columns[0]!.children[0]!.textContent).toBe('project');
    expect(columns[0]!.querySelectorAll('a[href="https://github.com/jixoai/ui"]')).toHaveLength(1);
    // untitled stack: no heading span — links are the first child
    expect(columns[1]!.children[0]!.hasAttribute('data-jx-terminal-footer-links')).toBe(true);
    expect(columns[1]!.querySelector('a')!.getAttribute('href')).toBe('/docs');

    // the © line stays root chrome
    expect(footer.textContent).toContain('© 2026 jixoai · MIT');
  });
});
