/*
 * scroll-area-kit specs (2026-09-15, visual-quality-iteration W4):
 * the shared CORE's pure battery (overflow verdict in the scroll-run
 * verdict's shape, thumb geometry math, the RTL engine trio,
 * theme-scope resolution), the HAND-DRAWN INTERACTION ADAPTER (the
 * thumb's a11y contract, the FOUR isolated auto-hide pins, keyboard
 * scrolling, drag pinning, membership re-verdict, track paging), and
 * the platform sibling's negative contracts (NO custom scrollbar ARIA
 * mounts — the platform bar IS the accessibility contract; the
 * capability channels + live scope alignment). jsdom has no layout —
 * geometry rides property stubs; the pure functions take numbers.
 */
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import {
  detectRtlScrollModel,
  dragFactor,
  overflowVerdict,
  regionVerdicts,
  resolveThemeScope,
  rtlScrollToCanonical,
  thumbGeometry,
} from '$lib/scroll-area-kit/core';
import { createHandDrawnScrollbar, IDLE_FADE_MS } from '$lib/scroll-area-kit/hand-drawn.svelte';
import NativeScrollArea from '$lib/ui/native-scroll-area/native-scroll-area.svelte';

/** jsdom matchMedia answers matches:false to everything (or is missing) —
 *  steer it. Must cover BOTH window.matchMedia and the bare globalThis
 *  identifier (compiled modules call it bare). */
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

/** pending matchMedia restores — drained afterEach so no test leaks its
 * pointer/reduced answers into the next */
const mediaRestores: (() => void)[] = [];

afterEach(() => {
  while (mediaRestores.length) mediaRestores.pop()!();
  cleanup();
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// the shared CORE — pure battery
// ---------------------------------------------------------------------------
describe("scroll-area-kit core · the overflow verdict (the scroll-run verdict's shape)", () => {
  it('content that fits is none — at any offset, with the 1px grace', () => {
    expect(overflowVerdict(300, 300, 0)).toBe('none');
    expect(overflowVerdict(300, 200, 0)).toBe('none');
    expect(overflowVerdict(300, 301, 0)).toBe('none');
  });

  it('overflows: start-closed / open / end-closed', () => {
    expect(overflowVerdict(300, 900, 0)).toBe('start-closed');
    expect(overflowVerdict(300, 900, 1)).toBe('start-closed');
    expect(overflowVerdict(300, 900, 300)).toBe('open');
    expect(overflowVerdict(300, 900, 599)).toBe('end-closed');
    expect(overflowVerdict(300, 900, 600)).toBe('end-closed');
  });

  it('regionVerdicts reads one verdict per axis pair (stubbed measures)', () => {
    const vp = document.createElement('div');
    let scrollTop = 0;
    Object.defineProperty(vp, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(vp, 'scrollHeight', { configurable: true, value: 800 });
    Object.defineProperty(vp, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(vp, 'scrollWidth', { configurable: true, value: 500 });
    Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => scrollTop, set: (v) => (scrollTop = v) });
    expect(regionVerdicts(vp)).toEqual({ y: 'start-closed', x: 'none' });
    scrollTop = 600;
    expect(regionVerdicts(vp)).toEqual({ y: 'end-closed', x: 'none' });
  });
});

describe('scroll-area-kit core · thumb geometry math', () => {
  it('ratio = client/scroll; position = travel fraction; clamped', () => {
    // half the content visible → ratio .5; a quarter traveled → .25
    expect(thumbGeometry(300, 600, 75)).toEqual({ shown: true, ratio: 0.5, position: 0.25 });
    expect(thumbGeometry(300, 900, 0)).toEqual({ shown: true, ratio: 1 / 3, position: 0 });
    expect(thumbGeometry(300, 900, 600)).toEqual({ shown: true, ratio: 1 / 3, position: 1 });
  });

  it('fitted content shows nothing; degenerate sizes never divide by zero', () => {
    expect(thumbGeometry(300, 300, 0).shown).toBe(false);
    expect(thumbGeometry(0, 600, 0).shown).toBe(false);
    expect(thumbGeometry(300, 0, 0).shown).toBe(false);
    expect(thumbGeometry(300, 301, 0).shown).toBe(false);
  });

  it('dragFactor maps thumb pixels to scroll units (the reciprocal of the ratio paint)', () => {
    // track 400px, thumb 100px, scroll range 600 → factor 600/300 = 2
    expect(dragFactor(400, 300, 900, 100)).toBe(2);
    // no scroll distance → zero (never divides by a zero lane)
    expect(dragFactor(400, 300, 300, 100)).toBe(0);
    expect(dragFactor(0, 300, 900, 0)).toBe(0);
  });
});

describe("scroll-area-kit core · the RTL engine trio (the kit's own funnel)", () => {
  it('detectRtlScrollModel classifies all three engines from rest + probe', () => {
    // negative engine: rest < 0
    expect(detectRtlScrollModel(-40, () => -40)).toBe('negative');
    // descending: rest > 0
    expect(detectRtlScrollModel(400, () => 0)).toBe('positive-descending');
    // rest 0 is ambiguous — the probe's -1 write separates spec from legacy
    expect(detectRtlScrollModel(0, () => -1)).toBe('negative');
    expect(detectRtlScrollModel(0, () => 0)).toBe('positive-ascending');
  });

  it('rtlScrollToCanonical funnels every engine into [−max, 0]', () => {
    expect(rtlScrollToCanonical('negative', -120, 400)).toBe(-120);
    expect(rtlScrollToCanonical('positive-ascending', 120, 400)).toBe(-120);
    expect(rtlScrollToCanonical('positive-descending', 280, 400)).toBe(-120);
  });
});

describe('scroll-area-kit core · theme-scope resolution', () => {
  const probe = (html: string): HTMLElement => {
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.append(root);
    return root.querySelector('[data-probe]') as HTMLElement;
  };

  it('the nearest scope answers — data-theme, .dark, .jx-light, self included', () => {
    expect(resolveThemeScope(probe('<div data-theme="dark"><span data-probe></span></div>'))).toBe('dark');
    expect(resolveThemeScope(probe('<div class="dark"><span data-probe></span></div>'))).toBe('dark');
    expect(resolveThemeScope(probe('<div class="jx-light"><span data-probe></span></div>'))).toBe('light');
    expect(resolveThemeScope(probe('<div data-theme="light" data-probe></div>'))).toBe('light');
  });

  it('a nearer scope beats a farther one (the dark stage on a light site)', () => {
    expect(resolveThemeScope(probe('<div class="jx-light"><div class="dark"><span data-probe></span></div></div>'))).toBe('dark');
  });

  it('no scope anywhere → null (the OS scheme answers)', () => {
    expect(resolveThemeScope(probe('<div><span data-probe></span></div>'))).toBeNull();
    expect(resolveThemeScope(null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// the HAND-DRAWN INTERACTION ADAPTER
// ---------------------------------------------------------------------------
/** a stubbed scrollport: real element (listeners, observers) with
 * layout properties stubbed — jsdom has no layout engine */
function stubbedViewport(overrides: { clientHeight: number; scrollHeight: number }) {
  const vp = document.createElement('div');
  let scrollTop = 0;
  vp.setAttribute('tabindex', '0'); // jsdom focus() needs a focusable area
  Object.defineProperty(vp, 'clientHeight', { configurable: true, value: overrides.clientHeight });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, value: 0 });
  Object.defineProperty(vp, 'scrollWidth', { configurable: true, value: 0 });
  Object.defineProperty(vp, 'scrollHeight', { configurable: true, value: overrides.scrollHeight });
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => scrollTop, set: (v) => (scrollTop = v) });
  return {
    vp,
    getScrollTop: () => scrollTop,
    setScrollTop: (v: number) => (scrollTop = v),
    setScrollHeight: (v: number) => Object.defineProperty(vp, 'scrollHeight', { configurable: true, value: v }),
  };
}

/**
 * The standard adapter rig: region + stubbed viewport + content + the
 * vertical thumb/track. matchMedia answers FINE for pointer queries
 * and NO for reduced-motion (jsdom's default all-false would never
 * wake the chrome); the restore drains afterEach.
 */
function mountAdapter(opts: { clientHeight?: number; scrollHeight?: number } = {}) {
  mediaRestores.push(stubMatchMedia((query) => query === '(pointer: fine)'));
  const region = document.createElement('div');
  const { vp, getScrollTop, setScrollTop, setScrollHeight } = stubbedViewport({
    clientHeight: opts.clientHeight ?? 200,
    scrollHeight: opts.scrollHeight ?? 800,
  });
  vp.id = 'probe-viewport';
  const content = document.createElement('div');
  vp.append(content);
  const trackY = document.createElement('div');
  const thumbY = document.createElement('div');
  trackY.append(thumbY);
  region.append(vp, trackY);
  document.body.append(region);
  const onverdict = vi.fn();
  const handle = createHandDrawnScrollbar({
    region,
    viewport: vp,
    content,
    viewportId: 'probe-viewport',
    thumbs: { y: thumbY, x: null },
    tracks: { y: trackY, x: null },
    onverdict,
  });
  return { region, vp, content, thumbY, trackY, handle, onverdict, getScrollTop, setScrollTop, setScrollHeight };
}

const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

describe("scroll-area-kit hand-drawn adapter · the thumb's a11y contract", () => {
  it('stamps role=scrollbar + aria-controls/orientation/min/max + tabindex on a shown thumb; aria-valuenow tracks position', () => {
    const { vp, thumbY, setScrollTop, handle } = mountAdapter();
    setScrollTop(300); // half travel
    handle.update();
    expect(thumbY.hidden).toBe(false);
    expect(thumbY.getAttribute('role')).toBe('scrollbar');
    expect(thumbY.getAttribute('aria-controls')).toBe(vp.id);
    expect(thumbY.getAttribute('aria-orientation')).toBe('vertical');
    expect(thumbY.getAttribute('aria-valuemin')).toBe('0');
    expect(thumbY.getAttribute('aria-valuemax')).toBe('100');
    expect(thumbY.getAttribute('tabindex')).toBe('0');
    expect(thumbY.getAttribute('aria-valuenow')).toBe('50');
    handle.destroy();
  });

  it('no verdict — no chrome: a fitted axis hides the thumb and drops aria-valuenow (the affordance leaves the tree + tab order)', () => {
    const { thumbY, handle } = mountAdapter({ clientHeight: 400, scrollHeight: 400 });
    expect(thumbY.hidden).toBe(true);
    expect(thumbY.getAttribute('aria-valuenow')).toBeNull();
    // the contract stamps survive (role/tabindex) but the node is hidden
    expect(thumbY.getAttribute('role')).toBe('scrollbar');
    handle.destroy();
  });
});

describe('scroll-area-kit hand-drawn adapter · the FOUR auto-hide pins, each in isolation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('NO pin: the idle fade retires the chrome after ~700ms', () => {
    const { region, handle } = mountAdapter();
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    handle.destroy();
  });

  it('PIN 1 — region focus-within (the viewport holds focus): the fade suspends, the thumb stays in the tree with role + aria-valuenow', () => {
    const { region, vp, thumbY, setScrollTop, handle } = mountAdapter();
    setScrollTop(150);
    vp.focus(); // the region's named viewport — focus WITHIN the region
    handle.update();
    expect(region.contains(document.activeElement)).toBe(true);
    vi.advanceTimersByTime(IDLE_FADE_MS * 3);
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    expect(region.getAttribute('data-pin-focus')).toBe('on');
    expect(region.getAttribute('data-pin-hover')).toBeNull();
    expect(region.getAttribute('data-pin-drag')).toBeNull();
    // the pinned thumb never leaves the accessibility tree
    expect(thumbY.hidden).toBe(false);
    expect(thumbY.getAttribute('role')).toBe('scrollbar');
    expect(thumbY.getAttribute('aria-valuenow')).toBe('25');
    // releasing the pin resumes the fade
    vp.blur();
    region.dispatchEvent(new FocusEvent('focusout', { bubbles: false }));
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    handle.destroy();
  });

  it('PIN 2 — thumb focus: the same suspension from the thumb itself (keyboard-draggable surface)', () => {
    const { region, thumbY, handle } = mountAdapter();
    thumbY.focus();
    expect(document.activeElement).toBe(thumbY);
    vi.advanceTimersByTime(IDLE_FADE_MS * 3);
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    expect(region.getAttribute('data-pin-focus')).toBe('on');
    expect(thumbY.getAttribute('role')).toBe('scrollbar');
    expect(thumbY.getAttribute('aria-valuenow')).toBe('0');
    handle.destroy();
  });

  it('PIN 3 — active drag: pinned through the gesture, released on pointerup', () => {
    const { region, thumbY, handle } = mountAdapter();
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    // let the chrome fade, then start a drag — the pin must resurrect it
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    thumbY.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
    expect(region.getAttribute('data-pin-drag')).toBe('on');
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    vi.advanceTimersByTime(IDLE_FADE_MS * 3);
    expect(region.getAttribute('data-thumb-live')).toBe('on'); // still pinned
    thumbY.dispatchEvent(new MouseEvent('pointerup', { button: 0, bubbles: true }));
    expect(region.getAttribute('data-pin-drag')).toBeNull();
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    handle.destroy();
  });

  it('PIN 4 — hover: the region under the pointer suspends the fade; leaving resumes it', () => {
    const { region, handle } = mountAdapter();
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    region.dispatchEvent(new MouseEvent('pointerenter'));
    expect(region.getAttribute('data-pin-hover')).toBe('on');
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    vi.advanceTimersByTime(IDLE_FADE_MS * 3);
    expect(region.getAttribute('data-thumb-live')).toBe('on');
    region.dispatchEvent(new MouseEvent('pointerleave'));
    expect(region.getAttribute('data-pin-hover')).toBeNull();
    vi.advanceTimersByTime(IDLE_FADE_MS + 50);
    expect(region.getAttribute('data-thumb-live')).toBeNull();
    handle.destroy();
  });
});

describe('scroll-area-kit hand-drawn adapter · interaction + re-measure', () => {
  it('keyboard: arrows step, PageDown pages, End jumps — the thumb is keyboard-draggable', () => {
    const { vp, thumbY, handle } = mountAdapter();
    const scrollBy = vi.fn();
    vp.scrollBy = scrollBy;
    const press = (key: string) =>
      thumbY.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    press('ArrowDown'); // step = client/10 (floor 16)
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 20 });
    press('PageDown'); // page = client
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 200 });
    press('End'); // jump to max (600)
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 600 });
    press('ArrowUp');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -20 });
    // an unrelated key never scrolls
    scrollBy.mockClear();
    press('Enter');
    expect(scrollBy).not.toHaveBeenCalled();
    handle.destroy();
  });

  it('drag writes scroll through the reciprocal factor (pointer capture law)', () => {
    const { region, thumbY, trackY, getScrollTop, handle } = mountAdapter();
    // geometry: track 400px, client 200, scroll 800, rendered thumb 100px
    Object.defineProperty(trackY, 'clientHeight', { configurable: true, value: 400 });
    Object.defineProperty(thumbY, 'offsetHeight', { configurable: true, value: 100 });
    thumbY.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientY: 100, bubbles: true }));
    expect(region.getAttribute('data-pin-drag')).toBe('on');
    // factor = (800-200)/(400-100) = 2 → 75px of pointer = 150 of scroll
    thumbY.dispatchEvent(new MouseEvent('pointermove', { clientY: 175, bubbles: true }));
    expect(getScrollTop()).toBe(150);
    thumbY.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    handle.destroy();
  });

  it('MEMBERSHIP mutation re-verdicts: rows arriving re-measure, the verdict follows (childList wake)', async () => {
    const { region, vp, content, handle, onverdict } = mountAdapter();
    expect(onverdict).toHaveBeenCalled();
    // shrink the scrollport to nothing scrollable, then mutate members —
    // the observer re-syncs and the verdict retires to none
    Object.defineProperty(vp, 'scrollHeight', { configurable: true, value: 200 });
    content.appendChild(document.createElement('p'));
    await nextFrame();
    const last = onverdict.mock.calls.at(-1)?.[0] as { y: string };
    expect(last.y).toBe('none');
    expect(region.querySelector('[aria-valuenow]')).toBeNull();
    handle.destroy();
  });

  it('track-click paging: ahead of the thumb pages forward, behind pages back', () => {
    const { vp, trackY, thumbY, handle } = mountAdapter();
    const scrollBy = vi.fn();
    vp.scrollBy = scrollBy;
    trackY.getBoundingClientRect = () => ({ top: 0, left: 0, height: 400, width: 12 } as DOMRect);
    // thumb at position 0 (ratio .25): a click at y=300 pages forward
    trackY.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientY: 300, bubbles: true }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 200 });
    // with the thumb 100px tall, y=10 sits behind its midpoint → back
    scrollBy.mockClear();
    Object.defineProperty(thumbY, 'offsetHeight', { configurable: true, value: 100 });
    trackY.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientY: 10, bubbles: true }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -200 });
    handle.destroy();
  });
});

/** a minimal children snippet for jsdom renders — the runtime CALLS
 * snippets as functions (the {render} object shape only ever worked
 * where the render expression never executed, e.g. scroll-virtual's
 * empty jsdom window) */
const snippet = (): (() => void) => () => {};

// ---------------------------------------------------------------------------
// the platform sibling — negative contracts + capability channels
// ---------------------------------------------------------------------------
describe('native-scroll-area · the platform bar IS the accessibility contract', () => {
  it('mounts the WAI region shell with ZERO custom scrollbar ARIA anywhere inside', async () => {
    const { container } = render(NativeScrollArea, { props: { label: 'platform probe', children: snippet() } });
    await tick();
    const region = container.querySelector('[role="region"]') as HTMLElement;
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-label')).toBe('platform probe');
    expect(region.getAttribute('tabindex')).toBe('0');
    // the negative contract — none of the custom scrollbar surface exists
    expect(container.querySelector('[role="scrollbar"]')).toBeNull();
    expect(container.querySelector('[aria-valuenow]')).toBeNull();
    expect(container.querySelector('[aria-orientation]')).toBeNull();
    expect(container.querySelector('[aria-controls]')).toBeNull();
    expect(container.querySelector('.jx-scroll-thumb')).toBeNull();
    expect(container.querySelector('.jx-scroll-track')).toBeNull();
    // no focusable node besides the region itself
    expect(container.querySelectorAll('[tabindex]').length).toBe(1);
  });

  it('the capability channels: orientation + width tiers + scoped scheme (live)', async () => {
    const stage = document.createElement('div');
    stage.setAttribute('data-theme', 'dark');
    document.body.append(stage);
    const { container } = render(NativeScrollArea, { props: { orientation: 'both', scrollbarWidth: 'none', children: snippet() }, target: stage });
    await tick();
    const viewport = container.querySelector('.jx-native-scroll') as HTMLElement;
    expect(viewport.getAttribute('data-orientation')).toBe('both');
    expect(viewport.getAttribute('data-width')).toBe('none');
    expect(viewport.getAttribute('data-scheme')).toBe('dark');
    // a live scope flip re-resolves without a re-mount (the W1 observer shape)
    stage.setAttribute('data-theme', 'light');
    await new Promise((done) => setTimeout(done, 0));
    expect(viewport.getAttribute('data-scheme')).toBe('light');
  });

  it("default tier rides the theme's global thin law (no data-width channel at all)", async () => {
    const { container } = render(NativeScrollArea, { props: { children: snippet() } });
    await tick();
    const viewport = container.querySelector('.jx-native-scroll') as HTMLElement;
    expect(viewport.getAttribute('data-width')).toBeNull();
    expect(viewport.getAttribute('data-scheme')).toBeNull(); // unscoped: the OS answers
  });

  it('instance surface: getViewport() + scrollTo() pass through', async () => {
    const rendered = render(NativeScrollArea, { props: { label: 'instance', children: snippet() } });
    await tick();
    const viewport = rendered.container.querySelector('[role="region"]') as HTMLElement;
    const instance = rendered.component as unknown as {
      getViewport(): HTMLDivElement | null;
      scrollTo(options?: ScrollToOptions): void;
    };
    expect(instance.getViewport()).toBe(viewport);
    const spy = vi.fn();
    viewport.scrollTo = spy;
    instance.scrollTo({ top: 10 });
    expect(spy).toHaveBeenCalledWith({ top: 10 });
  });
});
