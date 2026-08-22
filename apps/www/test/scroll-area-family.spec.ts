/*
 * scroll-area family specs (2026-08-22): the scrollable-region component
 * (native + overlay variants), the TanStack virtual wrapper, the toc-outline
 * derivation lib, and toc-engine's derived-extents path. jsdom has no
 * layout — geometry assertions live in rect stubs; component specs assert
 * structure, variant gating and the instance surface.
 */
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import ScrollVirtual from '$lib/ui/scroll-virtual.svelte';
import Toc from '$lib/ui/toc.svelte';
import ScrollAreaHost from './fixtures/scroll-area-host.svelte';
import { createTocEngine, type TocEngineUpdate } from '$lib/toc-engine';
import { deriveTocOutline, tocOutlineToSections } from '$lib/toc-outline';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

/** jsdom matchMedia answers matches:false to everything (or is missing) —
 *  steer it. The stub must cover BOTH window.matchMedia and the bare
 *  globalThis.matchMedia identifier (the compiled components call it bare). */
const stubMatchMedia = (matches: (query: string) => boolean): (() => void) => {
  const hadWindow = 'matchMedia' in window;
  const hadGlobal = 'matchMedia' in globalThis;
  const originalWindow = window.matchMedia;
  const originalGlobal = (globalThis as { matchMedia?: typeof matchMedia }).matchMedia;
  const fake = (query: string) =>
    ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  (window as { matchMedia: typeof fake }).matchMedia = fake;
  (globalThis as { matchMedia: typeof fake }).matchMedia = fake;
  return () => {
    if (hadWindow) (window as { matchMedia: typeof matchMedia }).matchMedia = originalWindow!;
    else delete (window as { matchMedia?: unknown }).matchMedia;
    if (hadGlobal)
      (globalThis as { matchMedia: typeof matchMedia }).matchMedia = originalGlobal as typeof matchMedia;
    else delete (globalThis as { matchMedia?: unknown }).matchMedia;
  };
};

const rectStub = (top: number, bottom: number, width = 1024): DOMRect =>
  ({
    top,
    bottom,
    left: 0,
    right: width,
    width,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as unknown as DOMRect;

describe('scroll-area', () => {
  it('renders the nativeHTML shell: a labeled, focusable scrollport region', async () => {
    const { container } = render(ScrollAreaHost, {});
    await tick();
    const viewport = container.querySelector('.jx-scroll-viewport') as HTMLElement;
    expect(viewport).toBeTruthy();
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('test area');
    expect(viewport.getAttribute('tabindex')).toBe('0');
    // restProps passthrough lands on the scrollport
    expect(viewport.getAttribute('data-testid')).toBe('passthrough');
    expect(container.querySelector('.jx-scroll-area')!.getAttribute('data-scrollbar')).toBe('native');
    // native variant: no custom thumb layer exists
    expect(container.querySelector('.jx-scroll-thumb')).toBeNull();
  });

  it('maps orientation onto the data attribute (overflow axes)', async () => {
    const rendered = render(ScrollAreaHost, { props: { orientation: 'both' } });
    await tick();
    expect(document.querySelector('.jx-scroll-area')!.getAttribute('data-orientation')).toBe('both');
    await rendered.rerender({ orientation: 'horizontal' });
    expect(document.querySelector('.jx-scroll-area')!.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('overlay variant draws thumbs ONLY for fine pointers (touch keeps native)', async () => {
    let finePointer = false;
    const restore = stubMatchMedia((query) => finePointer && query === '(pointer: fine)');
    // coarse: no custom thumbs, overlay never activates (touch keeps native)
    const coarse = render(ScrollAreaHost, { props: { scrollbar: 'overlay' } });
    await tick();
    expect(coarse.container.querySelector('.jx-scroll-thumb')).toBeNull();
    expect(coarse.container.querySelector('.jx-scroll-area')!.getAttribute('data-overlay')).toBeNull();
    cleanup();

    // fine pointer: the thumb layer mounts, vertical axis only
    finePointer = true;
    const fine = render(ScrollAreaHost, { props: { scrollbar: 'overlay' } });
    await tick();
    expect(fine.container.querySelectorAll('.jx-scroll-thumb')).toHaveLength(1);
    expect(fine.container.querySelector('.jx-scroll-thumb')!.classList.contains('y')).toBe(true);
    expect(fine.container.querySelector('.jx-scroll-area')!.getAttribute('data-overlay')).toBe('on');
    restore();
  });

  it('instance surface: getViewport() is the real scrollport; scrollTo and onscroll pass through', async () => {
    const onscroll = vi.fn();
    const rendered = render(ScrollAreaHost, { props: { onscroll } });
    await tick();
    const viewport = rendered.container.querySelector('.jx-scroll-viewport') as HTMLElement;
    const instance = (rendered.component as unknown as { getArea(): { getViewport(): HTMLDivElement | null; scrollTo(options?: ScrollToOptions): void } }).getArea();
    expect(instance.getViewport()).toBe(viewport);
    const scrollSpy = vi.fn();
    viewport.scrollTo = scrollSpy;
    instance.scrollTo({ top: 40 });
    expect(scrollSpy).toHaveBeenCalledWith({ top: 40 });
    await fireEvent.scroll(viewport);
    expect(onscroll).toHaveBeenCalledTimes(1);
  });
});

describe('scroll-virtual (TanStack, thin coupling)', () => {
  const children = {
    render: () => {},
  };

  it('mounts through the TanStack adapter: spacer = count × estimateSize, options carried', async () => {
    const rendered = render(ScrollVirtual, {
      props: { count: 1000, estimateSize: 48, children },
    });
    await tick();
    const spacer = rendered.container.querySelector('.jx-sv-spacer') as HTMLElement;
    // zero-size jsdom viewport → empty window, estimates hold the total
    expect(spacer.getAttribute('style')).toContain('block-size: 48000px');
    const virtualizer = (
      rendered.component as unknown as { getVirtualizer(): { options: { count: number } } }
    ).getVirtualizer();
    expect(virtualizer.options.count).toBe(1000);
  });

  it('count changes push through TanStack setOptions without remount', async () => {
    const rendered = render(ScrollVirtual, {
      props: { count: 10, children },
    });
    await tick();
    await rendered.rerender({ count: 250, children });
    await tick();
    const virtualizer = (
      rendered.component as unknown as { getVirtualizer(): { options: { count: number } } }
    ).getVirtualizer();
    expect(virtualizer.options.count).toBe(250);
  });

  it('horizontal flips the spacer axis; the imperative passthroughs never throw', async () => {
    const rendered = render(ScrollVirtual, {
      props: { count: 50, horizontal: true, children },
    });
    await tick();
    expect(
      (rendered.container.querySelector('.jx-sv-spacer') as HTMLElement).getAttribute('style'),
    ).toContain('inline-size: 2400px');
    const instance = rendered.component as unknown as {
      scrollToIndex(index: number, options?: { align?: string }): void;
      scrollToOffset(offset: number): void;
      measure(): void;
    };
    expect(() => {
      instance.scrollToIndex(7, { align: 'center' });
      instance.scrollToOffset(120);
      instance.measure();
    }).not.toThrow();
  });
});

describe('toc-outline derivation', () => {
  const mount = (html: string): HTMLElement => {
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.append(root);
    return root;
  };

  it('derives entries: slugs, labels, extents, id stamping', () => {
    const root = mount(`
      <h2>First Section</h2><p>a</p>
      <h3>Deep Dive</h3><p>b</p>
      <h2>Second Section</h2><p>c</p>
    `);
    const entries = deriveTocOutline(root);
    expect(entries.map((e) => e.id)).toEqual(['first-section', 'deep-dive', 'second-section']);
    expect(entries.map((e) => e.label)).toEqual(['First Section', 'Deep Dive', 'Second Section']);
    expect(entries.map((e) => e.level)).toEqual([2, 3, 2]);
    // extents: a section spans its deeper headings — an h2 ends at the NEXT
    // h2; the h3 ends there too; the LAST entry extends to content end
    expect(entries[0]!.end).toBe(entries[2]!.start);
    expect(entries[1]!.end).toBe(entries[2]!.start);
    expect(entries[2]!.end).toBeNull();
    // ids stamped back — ToC links are real fragments
    expect(root.querySelector('h2')!.id).toBe('first-section');
  });

  it('respects existing ids, dedupes collisions, falls back positionally for unsluggable labels', () => {
    const root = mount(`
      <h2 id="keep-me">Same Title</h2>
      <h2>Same Title</h2>
      <h2>Same Title</h2>
      <h2>中文标题</h2>
    `);
    const entries = deriveTocOutline(root);
    // the custom id won (its label never slugs); identical labels dedupe;
    // CJK collapses to the positional fallback
    expect(entries.map((e) => e.id)).toEqual(['keep-me', 'same-title', 'same-title-2', 'section-4']);
  });

  it('skips [data-toc-skip] subtrees and honors the levels option', () => {
    const root = mount(`
      <h2>in</h2>
      <div data-toc-skip><h2>out</h2><h3>out too</h3></div>
      <h4>level filter</h4>
    `);
    expect(deriveTocOutline(root)).toHaveLength(1);
    expect(deriveTocOutline(root, { levels: [4] }).map((e) => e.id)).toEqual(['level-filter']);
  });

  it('collapses into toc sections: min level = sections, deeper = children', () => {
    const root = mount(`
      <h2>A</h2><h3>a1</h3><h3>a2</h3><h2>B</h2>
    `);
    const sections = tocOutlineToSections(deriveTocOutline(root));
    expect(sections).toEqual([
      { id: 'a', label: 'A', children: [{ id: 'a1', label: 'a1' }, { id: 'a2', label: 'a2' }] },
      { id: 'b', label: 'B' },
    ]);
  });

  it('a stray deep heading before any section becomes its own section (never lost)', () => {
    const root = mount(`<h3>orphan</h3><h2>after</h2>`);
    const sections = tocOutlineToSections(deriveTocOutline(root));
    expect(sections.map((s) => s.id)).toEqual(['orphan', 'after']);
  });
});

describe('toc-engine derived extents', () => {
  it('computes weights and the pick from heading extents, ignoring data-region decoys', () => {
    const a = document.createElement('div');
    const bStart = document.createElement('div');
    a.getBoundingClientRect = () => rectStub(0, 100);
    bStart.getBoundingClientRect = () => rectStub(200, 300);
    const decoy = document.createElement('div');
    decoy.dataset.region = 'decoy';
    decoy.getBoundingClientRect = () => rectStub(0, 50);
    document.body.append(decoy);

    const updates: TocEngineUpdate[] = [];
    const scrollRoot = document.createElement('div');
    document.body.append(scrollRoot);
    const stop = createTocEngine(
      (update) => updates.push(update),
      {
        scrollRoot,
        extents: () => [
          { id: 'a', start: a, end: bStart },
          { id: 'b', start: bStart, end: null },
        ],
      },
    );
    // compute() runs synchronously at creation
    expect(updates).toHaveLength(1);
    const { weights, pick } = updates[0]!;
    expect(pick).toBe('a'); // a.bottom(100) > line(1) — margin resolves DOWN
    expect(weights.get('a')).toBe(1); // fully inside the viewport → IoM saturates
    expect(weights.get('b')).toBeGreaterThan(0.9); // last extent saturates to content end
    expect(weights.has('decoy')).toBe(false); // extents path never reads data-region
    stop();
  });

  it('re-reads the extents getter live — a re-derivation needs no engine restart', () => {
    const h1 = document.createElement('div');
    h1.getBoundingClientRect = () => rectStub(0, 100);
    let current = [{ id: 'only', start: h1, end: null }];
    const updates: TocEngineUpdate[] = [];
    const scrollRoot = document.createElement('div');
    document.body.append(scrollRoot);
    const stop = createTocEngine((u) => updates.push(u), {
      scrollRoot,
      lineOffset: 0,
      extents: () => current,
    });
    expect(updates.at(-1)!.pick).toBe('only');
    current = [];
    scrollRoot.dispatchEvent(new Event('scroll'));
    return new Promise<void>((done) => {
      requestAnimationFrame(() => {
        expect(updates.at(-1)!.pick).toBeNull();
        stop();
        done();
      });
    });
  });
});

describe('toc.svelte outline mode', () => {
  it('derives sections from the content root and stamps fragment ids on hydration', async () => {
    const content = document.createElement('div');
    content.innerHTML = '<h2>Alpha Law</h2><p>x</p><h2>Beta Law</h2><p>y</p>';
    document.body.append(content);
    const rendered = render(Toc, {
      props: { outline: { root: content }, scrollRoot: '.jx-shell-body' },
    });
    await tick();
    await new Promise(requestAnimationFrame);
    const links = Array.from(rendered.container.querySelectorAll('.jx-toc-desktop a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#alpha-law', '#beta-law']);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Alpha Law', 'Beta Law']);
    expect(content.querySelector('h2')!.id).toBe('alpha-law');
  });

  it('re-derives when the content mutates (MutationObserver, rAF-debounced)', async () => {
    const content = document.createElement('div');
    content.innerHTML = '<h2>One</h2>';
    document.body.append(content);
    const rendered = render(Toc, {
      props: { outline: { root: content }, scrollRoot: '.jx-shell-body' },
    });
    await tick();
    await new Promise(requestAnimationFrame);
    expect(rendered.container.querySelectorAll('.jx-toc-desktop a')).toHaveLength(1);

    content.insertAdjacentHTML('beforeend', '<h2>Two</h2>');
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await tick();
    expect(rendered.container.querySelectorAll('.jx-toc-desktop a')).toHaveLength(2);
  });
});
