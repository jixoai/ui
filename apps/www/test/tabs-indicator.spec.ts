/**
 * tabs-indicator.spec.ts — the shared-indicator variant system for the
 * tabs family (2026-09-01).
 *
 * Contracts under test (fixtures/tabs-indicator-host.svelte):
 *  - the ENGINE: the list renders an engine-owned indicator span as its
 *    LAST child ([data-jx-tabs-ind], aria-hidden, data-material), its
 *    inline geometry rewritten from the active trigger on every
 *    selection — jsdom has no layout, so the law reads "the style
 *    attribute EXISTS and carries transform/width/height", never real
 *    numbers; hidden while no value is selected; absent entirely for
 *    indicator='none'; first placement is quiet (data-quiet cleared
 *    after a frame);
 *  - materials: data-indicator on the list + data-material on the
 *    indicator for line/pill/outline/glass/liquid; liquid ships an
 *    inline svg feTurbulence + feDisplacementMap filter id'd
 *    {uid}-liquid and a --jx-tabs-liquid-bf var on the list pointing
 *    at that very filter;
 *  - a snippet indicator rides the SAME engine-owned wrapper (the
 *    wrapper and its geometry stay engine-owned) and receives
 *    { x, y, w, h, orientation };
 *  - trigger anatomy: icon/iconEnd lanes with aria-hidden wrappers,
 *    an icon-only trigger named through the rest spread (aria-label
 *    lands verbatim), stack, and the slot-vs-padding utility law;
 *  - APG regressions: aria-selected flips on click, the roving
 *    tabindex trims to one tab stop, arrows still walk + select —
 *    and a disabled flip re-trims it (the strip never loses its only
 *    tab stop);
 *  - the roving tabindex under dynamic disable (2026-09-02 P1): a
 *    disabled stop — selected OR focused — hands the only tab stop to
 *    the first enabled trigger through the context; the tablist
 *    itself is NEVER a tab stop (tabindex=-1 states the focus
 *    contract);
 *  - the RTL scroll contract (2026-09-02 fix wave): spec-negative
 *    scrollLeft normalized into inline-true state/progress, the
 *    physical-window edge factors, and the flipped nudge axis;
 *  - ONE direction truth + the three RTL scrollLeft engines
 *    (2026-09-02 P2): the resolver prefers computed direction ([dir]
 *    fallback — walk and scroll math agree under pure-css rtl), the
 *    engine probe decides negative / positive-ascending /
 *    positive-descending, and the canonical adapters carry state,
 *    progress, window factors and nudge signs for all three;
 *  - the css law pinned at SOURCE (jsdom computes no css): the
 *    [data-jx-tabs-ind] block, the [data-quiet] transition kill,
 *    per-material ink (glass/liquid backdrop-filter, liquid riding the
 *    --jx-tabs-liquid-bf var with fallback), reduced-motion, the grow
 *    layout stretch, and the deleted .jx-tab-selected::after residue.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';

import {
  blur,
  blurSlide,
  detectRtlScrollModel,
  isRtlDirection,
  progressBlur,
  rtlScrollFromCanonical,
  rtlScrollToCanonical,
  shadow,
  slide,
  type RtlScrollModel,
} from '../src/lib/ui/tabs/tabs-list.svelte';
import IndicatorHost from './fixtures/tabs-indicator-host.svelte';

// ---- ResizeObserver resilience ------------------------------------------------
// test/setup.ts already installs a zero-rect reporting polyfill; keep a
// local guard so this spec stays runnable standalone — the indicator
// engine remeasures through a ResizeObserver and must mount without
// crashing either way.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class QuietResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  (globalThis as Record<string, unknown>).ResizeObserver = QuietResizeObserver;
  (window as unknown as Record<string, unknown>).ResizeObserver = QuietResizeObserver;
}

// the css law is read from the source (same-source: byte-identical to
// registry/files/ui/tabs/tabs-trigger.css); vitest stubs css imports,
// so the raw text comes off disk
const tabsTriggerCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/tabs/tabs-trigger.css'),
  'utf8',
);

/** [data-name='value'] tolerating either quote style */
const dataAttr = (name: 'material' | 'layout', value: string) =>
  `\\[data-${name}=(['"])${value}\\1\\]`;

/** rAF flush — the quiet-placement window is cleared on a frame */
async function frames(count: number) {
  for (let i = 0; i < count; i += 1) await new Promise(requestAnimationFrame);
}

function setup() {
  const { container } = render(IndicatorHost);
  const list = (name: string) => container.querySelector(`[data-list="${name}"]`) as HTMLElement;
  const ind = (name: string) =>
    list(name)?.querySelector('[data-jx-tabs-ind]') as HTMLElement | null;
  const tabsIn = (name: string) =>
    [...list(name).querySelectorAll('[role="tab"]')] as HTMLElement[];
  return { container, list, ind, tabsIn };
}

// ---------------------------------------------------------------------------
// The shared indicator engine
// ---------------------------------------------------------------------------
describe('Tabs · shared indicator engine', () => {
  it('renders the indicator span as the LAST child of the strip container (the run), wired with the default material and layout', () => {
    const { list, ind } = setup();
    expect(list('line')).toBeTruthy();
    expect(list('line').getAttribute('data-indicator')).toBe('line');
    expect(list('line').getAttribute('data-layout')).toBe('inline');

    const indicator = ind('line');
    expect(indicator).toBeTruthy();
    expect(indicator!.getAttribute('data-material')).toBe('line');
    expect(indicator!.getAttribute('aria-hidden')).toBe('true');
    // the wrapper is engine-owned and sits after every trigger, inside
    // the run (the horizontal strip's scroller — the one-cell grid host
    // law below)
    expect(ind('line')!.parentElement).toBe(list('line').querySelector('[data-jx-tabs-run]'));
    expect(ind('line')!.parentElement!.lastElementChild).toBe(indicator);
  });

  it('stamps each material on both the list hook and the indicator', () => {
    const { list, ind } = setup();
    for (const material of ['pill', 'outline', 'glass', 'liquid']) {
      expect(list(material).getAttribute('data-indicator')).toBe(material);
      expect(ind(material)).toBeTruthy();
      expect(ind(material)!.getAttribute('data-material')).toBe(material);
    }
  });

  it("indicator='none' renders NO indicator element — and says so on the list", () => {
    const { list, ind } = setup();
    expect(list('none').getAttribute('data-indicator')).toBe('none');
    expect(ind('none')).toBeNull();
    expect(list('none').querySelector('[data-jx-tabs-ind]')).toBeNull();
  });

  it('rewrites the inline geometry from the active trigger on selection (style presence, not numbers)', async () => {
    const { ind, tabsIn } = setup();
    const [, beta] = tabsIn('line');
    await fireEvent.click(beta);
    await tick();
    await frames(1);

    // jsdom offsets are 0 — the law is that the engine rewrote the
    // inline style at all: transform + width + height are all present
    const style = ind('line')?.getAttribute('style') ?? '';
    expect(style.length).toBeGreaterThan(0);
    expect(style).toContain('translate(');
    expect(style).toContain('width');
    expect(style).toContain('height');
  });

  it("renders the indicator hidden while value='' (nothing selected)", () => {
    const { ind } = setup();
    const indicator = ind('empty');
    expect(indicator).toBeTruthy();
    expect(indicator!.hasAttribute('hidden')).toBe(true);
  });

  it('quiet placement is momentary: data-quiet does not survive a frame', async () => {
    const { ind } = setup();
    await frames(2);
    expect(ind('line')).toBeTruthy();
    expect(ind('line')!.hasAttribute('data-quiet')).toBe(false);
  });

  it('a snippet indicator rides the engine-owned wrapper and receives the measured geometry', async () => {
    const { list, ind } = setup();
    const wrapper = ind('snippet');
    expect(wrapper).toBeTruthy();
    // the wrapper keeps its own transform (geometry is engine-owned),
    // snippet or not — width/height presence is pinned by the line
    // scenario: the pill-family hug math goes NEGATIVE on jsdom's zero
    // offsets, and the CSSOM legitimately drops invalid sizes from the
    // style attribute
    const style = wrapper!.getAttribute('style') ?? '';
    expect(style).toContain('translate(');

    const echo = list('snippet').querySelector('[data-geo-echo]') as HTMLElement | null;
    expect(echo).toBeTruthy();
    // the snippet renders INSIDE the engine-owned wrapper
    expect(echo!.closest('[data-jx-tabs-ind]')).toBe(wrapper);
    // all five geo fields arrive as REAL numbers (which numbers is the
    // engine's geometry law, not this contract — jsdom offsets are 0)
    for (const field of ['x', 'y', 'w', 'h']) {
      const raw = echo!.getAttribute(`data-${field}`);
      expect(raw).not.toBeNull();
      expect(Number.isFinite(Number(raw))).toBe(true);
    }
    expect(echo!.getAttribute('data-axis')).toBe('horizontal');
  });

  it('wires the layout axis on the list hook (grow, scroll)', () => {
    const { list } = setup();
    expect(list('grow').getAttribute('data-layout')).toBe('grow');
    expect(list('scroll').getAttribute('data-layout')).toBe('scroll');
  });

  it('vertical lists keep the orientation hook while wearing a material', () => {
    const { list, ind } = setup();
    expect(list('vertical-pill').className).toContain('jx-tabs-vertical');
    expect(list('vertical-pill').getAttribute('data-indicator')).toBe('pill');
    expect(ind('vertical-pill')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// The liquid material — svg filter + css var pairing
// ---------------------------------------------------------------------------
describe('Tabs · liquid material', () => {
  it('ships an inline svg filter with feTurbulence + feDisplacementMap, id ends in -liquid', () => {
    const { list } = setup();
    const svg = list('liquid').querySelector('svg');
    expect(svg).toBeTruthy();
    const filter = svg!.querySelector('filter');
    expect(filter).toBeTruthy();
    expect(filter!.id.endsWith('-liquid')).toBe(true);
    expect(filter!.querySelector('feTurbulence')).toBeTruthy();
    expect(filter!.querySelector('feDisplacementMap')).toBeTruthy();
  });

  it("points the list's --jx-tabs-liquid-bf var at that very filter", () => {
    const { list } = setup();
    const filter = list('liquid').querySelector('filter')!;
    expect(filter).toBeTruthy();
    // attribute-bound or setProperty-bound, the var must reference the id
    const styleText = `${list('liquid').getAttribute('style') ?? ''};${list('liquid').style.cssText}`;
    expect(styleText).toContain('--jx-tabs-liquid-bf');
    expect(styleText).toContain(`#${filter.id}`);
  });
});

// ---------------------------------------------------------------------------
// Trigger anatomy — icon lanes, rest passthrough, stack
// ---------------------------------------------------------------------------
describe('Tabs · trigger anatomy', () => {
  it('renders a leading icon in an aria-hidden inline-start lane', () => {
    const { tabsIn } = setup();
    const [alpha] = tabsIn('anatomy');
    const lane = alpha.querySelector('[data-icon="inline-start"]');
    expect(lane).toBeTruthy();
    expect(lane!.getAttribute('aria-hidden')).toBe('true');
    expect(lane!.querySelector('[data-glyph="alpha"]')).toBeTruthy();
  });

  it('renders a trailing iconEnd in an aria-hidden inline-end lane', () => {
    const { tabsIn } = setup();
    const [, beta] = tabsIn('anatomy');
    const lane = beta.querySelector('[data-icon="inline-end"]');
    expect(lane).toBeTruthy();
    expect(lane!.getAttribute('aria-hidden')).toBe('true');
    expect(lane!.querySelector('[data-glyph="beta"]')).toBeTruthy();
  });

  it('names the icon-only trigger through the rest spread (aria-label lands verbatim)', () => {
    const { tabsIn } = setup();
    const [alpha, beta, settings] = tabsIn('anatomy');
    expect(settings.getAttribute('aria-label')).toBe('Settings');
    // icon-only: the lane is there but no visible text label
    expect(settings.querySelector('[data-icon="inline-start"]')).toBeTruthy();
    expect(settings.textContent?.trim()).toBe('');
    // sanity: the labeled triggers keep their text
    expect(alpha.textContent?.trim()).toBe('Alpha');
    expect(beta.textContent?.trim()).toBe('Beta');
  });

  it('stack switches the trigger to the column axis (flex-col token)', () => {
    const { tabsIn } = setup();
    const [, , , stacked] = tabsIn('anatomy');
    expect(stacked.className).toContain('flex-col');
  });

  it('applies the slot-vs-padding law beside a label — never on an icon-only trigger (the glyph centers)', () => {
    const { tabsIn } = setup();
    const [alpha, beta, settings] = tabsIn('anatomy');
    // an icon eats into the labeled trigger's inline padding — by exactly half
    expect(alpha.className).toContain('has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)]');
    expect(beta.className).toContain('has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)]');
    // icon-only: no label, no dialect — the padding stays symmetric so the
    // glyph centers (Owner, 2026-09-01)
    expect(settings.className).not.toContain('has-[[data-icon=inline-start]]');
    expect(settings.className).not.toContain('has-[[data-icon=inline-end]]');
  });

  it('keeps the jx-tab-selected class token on the selected trigger', () => {
    const { tabsIn } = setup();
    const [alpha, beta] = tabsIn('anatomy');
    expect(alpha.className).toContain('jx-tab-selected');
    expect(beta.className).not.toContain('jx-tab-selected');
  });
});

describe('Tabs · layout contract', () => {
  it('wrap flows rows instead of scrolling: flex-wrap lands on the run (the triggers\' flex row), data-layout=wrap on both host and run', () => {
    const { list } = setup();
    const wrap = list('wrap');
    expect(wrap.getAttribute('data-layout')).toBe('wrap');
    const run = wrap.querySelector('[data-jx-tabs-run]');
    expect(run).toBeTruthy();
    expect(run!.className).toContain('flex-wrap');
    expect(run!.getAttribute('data-layout')).toBe('wrap');
  });

  it('the run carries the JS-stamped scrollability verdict (none when it cannot scroll)', () => {
    const { list } = setup();
    const run = list('line').querySelector('[data-jx-tabs-run]');
    // jsdom has no layout: scrollWidth === clientWidth → cannot scroll → none
    expect(run?.getAttribute('data-jx-scroll-state')).toBe('none');
    // vertical lists have no run — nothing to stamp
    expect(list('vertical-pill').querySelector('[data-jx-tabs-run]')).toBeNull();
  });

  it('scrollEffect stamps the run and mounts the merged veil layer + DOM chevrons over it (one grid cell, position-free)', () => {
    const { list } = setup();
    // default: slide (the cheapest) — stamped on the run, but no veil anywhere
    expect(list('line').querySelector('[data-jx-tabs-run]')?.getAttribute('data-scroll-effect')).toBe('slide');
    expect(list('line').querySelector('.jx-pblur')).toBeNull();
    // the builder's knobs land as inline vars on the HOST (the overlays are
    // the run's siblings — a var on the run never reaches them)
    expect(list('line').getAttribute('style')).toContain('--jx-tabs-edge-slide: 8px');
    // blur+slide: the type rides the run for the css wiring, both knobs on the host
    const blurHost = list('effect-blur');
    expect(blurHost.querySelector('[data-jx-tabs-run]')!.getAttribute('data-scroll-effect')).toBe('blur+slide');
    expect(blurHost.getAttribute('style')).toContain('--jx-tabs-edge-blur: 4px');
    expect(blurHost.getAttribute('style')).toContain('--jx-tabs-edge-slide: 8px');
    // progressBlur: ONE merged veil layer over the run holding both bands —
    // painted AFTER the scroller (empirical Chromium: the bands' backdrop
    // only samples the scrolled content when they paint after it)
    const host = list('effect-veil');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    const layer = host.querySelector(':scope > .jx-tabs-veil-layer')!;
    expect(run.parentElement).toBe(host);
    expect(layer.previousElementSibling).toBe(run);
    const bands = [...layer.querySelectorAll(':scope > .jx-tabs-veil')];
    expect(bands).toHaveLength(2);
    expect(bands[0].getAttribute('data-position')).toBe('start');
    expect(bands[1].getAttribute('data-position')).toBe('end');
    // the grid dialect — PURE grid: each band is a grid item of the layer
    // (grid-area + justify-self), and the ladder layers are grid items of
    // the band; no position tech anywhere. translateZ(0) is compositor
    // isolation, never positioning
    expect(bands[0].className).toContain('[grid-area:1/1]');
    expect(bands[0].className).toContain('[transform:translateZ(0)]');
    expect(bands[0].className).not.toContain('sticky');
    expect(bands[0].className).not.toContain('absolute');
    // each band carries the progressive-blur ladder layers (grid items of the band)
    expect(bands[0].querySelectorAll('.jx-pblur-layer').length).toBeGreaterThan(1);
    expect([...bands[0].querySelectorAll('.jx-pblur-layer')].every((l) => l.className.includes('[grid-area:1/1]'))).toBe(true);
    // the HOLD law: the outer third (the chevron lane, where snap parks the
    // first label inboard) carries the ladder's peak — the strongest layer's
    // tail stays OPAQUE to 100% instead of tapering (the stop-data split,
    // 2026-09-02: the mask's direction lives in progressive-blur.css; the
    // inline style carries the stops + tail alpha)
    const topLayer = bands[0].querySelector('.jx-pblur-layer:last-child')!;
    expect(topLayer.getAttribute('style')).toMatch(/--jx-pblur-tail-a: 1/);
    expect(topLayer.getAttribute('style')).toMatch(/--jx-pblur-s3: 100%/);
    // the chevrons are REAL DOM BUTTONS (Owner, 2026-09-01 R4 — the
    // ::scroll-button() pseudos are retired): after the veil layer, OUTSIDE
    // the tablist (scroll controls are not tabs — the a11y tree stays clean)
    const chevrons = [...host.querySelectorAll(':scope > [data-jx-chevron]')];
    expect(chevrons).toHaveLength(2);
    expect(chevrons.map((c) => c.getAttribute('data-jx-chevron')).sort()).toEqual(['inline-end', 'inline-start']);
    for (const c of chevrons) {
      expect(c.tagName).toBe('BUTTON');
      expect(c.getAttribute('tabindex')).toBe('-1');
      expect(c.closest('[role="tablist"]')).toBeNull();
    }
  });

  it('the shadow effect rides the SAME layer: one contrast-ghost band per edge, width knob overrides the var inline', () => {
    const { list } = setup();
    const host = list('effect-shadow');
    const layer = host.querySelector(':scope > .jx-tabs-veil-layer')!;
    expect(layer).toBeTruthy();
    const bands = [...layer.querySelectorAll(':scope > .jx-tabs-shadow')];
    expect(bands).toHaveLength(2);
    expect(bands[0].getAttribute('data-position')).toBe('start');
    expect(bands[1].getAttribute('data-position')).toBe('end');
    // the bands carry the veil contract: width var + entrance + clip apply unchanged
    for (const b of bands) {
      expect(b.className).toContain('jx-tabs-veil');
      expect(b.className).toContain('[grid-area:1/1]');
      expect(b.className).toContain('[transform:translateZ(0)]');
      expect(b.getAttribute('aria-hidden')).toBe('true');
    }
    // no pblur ladder in the shadow mode
    expect(layer.querySelector('.jx-pblur')).toBeNull();
    // the width knob stamps --jx-tabs-veil inline on the host (overrides the css default)
    expect(list('effect-narrow').getAttribute('style')).toContain('--jx-tabs-veil: 120px');
    // without the knob, no inline width var
    expect(list('effect-veil').getAttribute('style')).not.toContain('--jx-tabs-veil');
  });

  it('the DOM chevrons nudge the run by a strip page (lane-derived), both directions', () => {
    const { list } = setup();
    const host = list('scroll');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    Object.defineProperty(run, 'scrollWidth', { value: 900, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 300, configurable: true });
    const calls: number[] = [];
    run.scrollBy = (opts?: ScrollToOptions) => {
      const left = opts?.left ?? 0;
      calls.push(left);
      run.scrollLeft += left;
      run.dispatchEvent(new Event('scroll'));
      return undefined;
    };
    (host.querySelector(':scope > [data-jx-chevron="inline-end"]') as HTMLButtonElement).click();
    (host.querySelector(':scope > [data-jx-chevron="inline-start"]') as HTMLButtonElement).click();
    expect(calls).toHaveLength(2);
    expect(calls[0]).toBeGreaterThan(0);
    expect(calls[1]).toBeLessThan(0);
  });

  it('the scroll handler stamps --jx-tabs-progress on the HOST and per-trigger edge factors — one truth for chevrons, veil and ramps', () => {
    const { list, tabsIn } = setup();
    const host = list('scroll');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    // jsdom has no layout: an unscrollable run reports travel 0
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0');
    // fake geometry: 600 of content in a 200-wide run; the first trigger
    // owns [0, 100] of it
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    const first = tabsIn('scroll')[0];
    Object.defineProperty(first, 'offsetLeft', { value: 0, configurable: true });
    Object.defineProperty(first, 'offsetWidth', { value: 100, configurable: true });
    // walked 50 in: travel 0.125, the first trigger HALF clipped (0.5)
    run.scrollLeft = 50;
    run.dispatchEvent(new Event('scroll'));
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0.125');
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(first.style.getPropertyValue('--jx-edge-start')).toBe('0.500');
    // a zero factor REMOVES the stamp — rest is the natural self
    expect(first.style.getPropertyValue('--jx-edge-end')).toBe('');
    // fully past the left edge: factor 1 (clamped at the trigger's width)
    run.scrollLeft = 400;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('end-closed');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('1');
    expect(first.style.getPropertyValue('--jx-edge-start')).toBe('1.000');
    // back at rest: the stuck repro — the first trigger is CLEAN again
    run.scrollLeft = 0;
    run.dispatchEvent(new Event('scroll'));
    expect(first.style.getPropertyValue('--jx-edge-start')).toBe('');
    expect(first.style.getPropertyValue('--jx-edge-end')).toBe('');
  });

  it('RTL runs normalize the spec scrollLeft (0→−max): state, progress and the physical-window factors all read inline-true', () => {
    const { list, tabsIn } = setup();
    const host = list('rtl');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    // jsdom's cascade never maps the dir attribute to computed direction
    // — pin inline the very computed value the engine reads
    run.style.direction = 'rtl';
    // fake geometry: 600 of content in a 200-wide run; alpha sits at the
    // inline start (physical RIGHT, offsetLeft 480), beta inboard
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    const [alpha, beta] = tabsIn('rtl');
    Object.defineProperty(alpha, 'offsetLeft', { value: 480, configurable: true });
    Object.defineProperty(alpha, 'offsetWidth', { value: 100, configurable: true });
    Object.defineProperty(beta, 'offsetLeft', { value: 420, configurable: true });
    Object.defineProperty(beta, 'offsetWidth', { value: 80, configurable: true });
    // rest: scrollLeft 0 is the inline START — start-closed, alpha clean
    run.scrollLeft = 0;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('start-closed');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0');
    expect(alpha.style.getPropertyValue('--jx-edge-start')).toBe('');
    expect(alpha.style.getPropertyValue('--jx-edge-end')).toBe('');
    // walked 100 toward the inline end (physical left): spec RTL
    // scrollLeft = −100 → travel 0.25, physical window [300, 500]
    run.scrollLeft = -100;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0.25');
    // alpha [480, 580] clips 80/100 under the physical-right edge —
    // factor 0.800; the VISIBLE beta [420, 500] stays clean (the A-2
    // regression: no visible trigger ever stamps to 1)
    expect(alpha.style.getPropertyValue('--jx-edge-start')).toBe('');
    expect(alpha.style.getPropertyValue('--jx-edge-end')).toBe('0.800');
    expect(beta.style.getPropertyValue('--jx-edge-start')).toBe('');
    expect(beta.style.getPropertyValue('--jx-edge-end')).toBe('');
    // fully traveled: −400 is the inline end — end-closed, travel 1
    run.scrollLeft = -400;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('end-closed');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('1');
  });

  it('RTL chevrons nudge on the flipped physical axis — inline-forward writes an ABSOLUTE negative target (re-attack P3)', () => {
    const { list } = setup();
    const host = list('rtl');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    run.style.direction = 'rtl';
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    let raw = 0;
    Object.defineProperty(run, 'scrollLeft', {
      get: () => raw,
      set: (v: number) => {
        raw = Math.min(400, Math.max(-400, v));
      },
      configurable: true,
    });
    const calls: number[] = [];
    // RTL writes ride ABSOLUTE canonical targets through scrollTo (a
    // bare scrollBy delta mis-maps on descending engines) — the run
    // needs a real scroll distance (max=400) for the canonical path
    run.scrollTo = (opts?: ScrollToOptions) => {
      calls.push(opts?.left ?? 0);
      return undefined;
    };
    (host.querySelector(':scope > [data-jx-chevron="inline-end"]') as HTMLButtonElement).click();
    // inline-back from a mid-scroll rest: the absolute target walks
    // TOWARD 0 (raw on the negative engine == canonical)
    run.scrollLeft = -350;
    (host.querySelector(':scope > [data-jx-chevron="inline-start"]') as HTMLButtonElement).click();
    expect(calls).toHaveLength(2);
    expect(calls[0]).toBeLessThan(0); // inline-forward: negative-space target
    expect(calls[1]).toBe(-150); // -350 + step(200), clamped inside [−max, 0]
  });

  it('scroll is a declared overflow run — the overflow itself is css-owned, not a markup class', () => {
    const { list } = setup();
    const scroll = list('scroll');
    expect(scroll.getAttribute('data-layout')).toBe('scroll');
    expect(scroll.className).not.toContain('overflow-x-auto');
  });

  it('the TABLIST IS THE RUN (a11y scroll region and DOM scroller are one element); vertical strips stay flat', () => {
    const { list } = setup();
    const horiz = list('line');
    expect(horiz.className).toContain('grid');
    const run = horiz.querySelector(':scope > [data-jx-tabs-run]');
    expect(run).toBeTruthy();
    // the run element IS the tablist — role=tablist (no presentation
    // wrapper: the a11y tree gets its scroll region natively)
    expect(run!.getAttribute('role')).toBe('tablist');
    expect(run!.getAttribute('data-jx-tabs-list')).toBe('');
    // the run carries the triggers' flex row
    expect(run!.className).toContain('flex');
    // the flat vertical law: no run classes, triggers are direct tablist children
    const vertical = list('vertical-pill');
    expect(vertical.querySelector('[data-jx-tabs-run]')).toBeNull();
    expect(vertical.querySelector('[role="tablist"]')!.className).not.toContain('overflow-x-auto');
    expect(vertical.querySelector(':scope > [role="tablist"] > [role="tab"]')).toBeTruthy();
    // the anchor machinery is retired with the absolute overlay
    expect((horiz.getAttribute('style') ?? '')).not.toContain('anchor');
  });
});

// ---------------------------------------------------------------------------
// APG regressions — the aria contract survives the variant system
// ---------------------------------------------------------------------------
describe('Tabs · APG regressions', () => {
  it('click still flips aria-selected and re-trims the roving tabindex', async () => {
    const { tabsIn } = setup();
    const [alpha, beta, gamma] = tabsIn('line');
    expect(alpha.tabIndex).toBe(0);
    expect(beta.tabIndex).toBe(-1);
    expect(gamma.tabIndex).toBe(-1);

    await fireEvent.click(beta);
    await tick();
    expect(beta.getAttribute('aria-selected')).toBe('true');
    expect(alpha.getAttribute('aria-selected')).toBe('false');
    expect(beta.tabIndex).toBe(0);
    expect(alpha.tabIndex).toBe(-1);
  });

  it('arrows still walk and select (one automatic-activation walkthrough)', async () => {
    const { tabsIn } = setup();
    const [alpha, beta] = tabsIn('line');
    alpha.focus();
    await fireEvent.keyDown(alpha, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(beta);
    expect(beta.getAttribute('aria-selected')).toBe('true');
  });

  it('a disabled flip re-trims the roving tabindex — the strip never loses its only tab stop', async () => {
    const { tabsIn } = setup();
    const [alpha, beta] = tabsIn('empty');
    // the empty state trimmed alpha to THE tab stop
    expect(alpha.tabIndex).toBe(0);
    expect(beta.tabIndex).toBe(-1);
    // disable it dynamically — an attribute flip no reactive effect
    // sees; the list's MutationObserver must hand the stop over
    alpha.setAttribute('disabled', '');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(alpha.tabIndex).toBe(-1);
    expect(beta.tabIndex).toBe(0);
  });

  it('a disabled SELECTED stop hands the only tab stop to the first enabled trigger (P1)', async () => {
    const { tabsIn } = setup();
    // value="alpha": the un-focused stop IS the selected trigger
    const [alpha, beta, gamma] = tabsIn('line');
    expect(alpha.tabIndex).toBe(0);
    alpha.setAttribute('disabled', '');
    await tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    // the hand-over went through the CONTEXT (setTabStop): the
    // triggers' isTabStop derived re-rendered the roving flip
    expect(alpha.tabIndex).toBe(-1);
    expect(beta.tabIndex).toBe(0);
    expect(gamma.tabIndex).toBe(-1);
  });

  it('a disabled FOCUSED stop hands the only tab stop back to the first enabled trigger (P1)', async () => {
    const { tabsIn } = setup();
    const [alpha, beta] = tabsIn('line');
    // focus moves the roving stop off the selected trigger
    beta.focus();
    await tick();
    expect(beta.tabIndex).toBe(0);
    expect(alpha.tabIndex).toBe(-1);
    beta.setAttribute('disabled', '');
    await tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(beta.tabIndex).toBe(-1);
    expect(alpha.tabIndex).toBe(0);
  });

  it('the tablist itself is NEVER a tab stop — tabindex=-1 states the focus contract (the checker reads it, no suppression)', () => {
    const { list, tabsIn } = setup();
    const run = list('line').querySelector('[data-jx-tabs-run]')!;
    expect(run.getAttribute('role')).toBe('tablist');
    expect(run.getAttribute('tabindex')).toBe('-1');
    // the roving stop lives on a TRIGGER — exactly one tabbable, and
    // it is enabled
    const stops = tabsIn('line').filter((tab) => tab.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0].hasAttribute('disabled')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// RTL resolution — one direction truth, three scrollLeft engines (P2)
// ---------------------------------------------------------------------------
describe('Tabs · RTL resolution (one truth, three engines)', () => {
  it('isRtlDirection: computed direction is the law; [dir] stands in only when the cascade reports nothing', () => {
    expect(isRtlDirection('rtl', undefined)).toBe(true);
    // computed wins over a contradicting ancestor attribute — it is
    // the used value, inheritance already resolved
    expect(isRtlDirection('rtl', 'ltr')).toBe(true);
    expect(isRtlDirection('ltr', 'rtl')).toBe(false);
    // the fallback arm: no cascade verdict, nearest [dir] decides
    expect(isRtlDirection('', 'rtl')).toBe(true);
    expect(isRtlDirection('', 'ltr')).toBe(false);
    expect(isRtlDirection('', undefined)).toBe(false);
    expect(isRtlDirection('', null)).toBe(false);
  });

  it('the walk and the scroll math AGREE under pure-css rtl (no [dir] attribute anywhere)', async () => {
    const { list, tabsIn } = setup();
    const host = list('rtl');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    // strip the fixture's [dir] wrapper: direction now arrives by css
    // alone — the old walk read only [dir] and walked the WRONG way
    run.closest('[dir]')!.removeAttribute('dir');
    run.style.direction = 'rtl';
    // scroll side: spec-negative raw reads inline-true (progress 0.25)
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    run.scrollLeft = -100;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0.25');
    // walk side: ArrowRight is BACKWARD under rtl — alpha wraps to
    // gamma (old code: forward to beta), ArrowLeft walks forward back
    const [alpha, , gamma] = tabsIn('rtl');
    alpha.focus();
    await fireEvent.keyDown(alpha, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gamma);
    expect(gamma.getAttribute('aria-selected')).toBe('true');
    await fireEvent.keyDown(gamma, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(alpha);
  });

  it('detectRtlScrollModel decides all three engines from rest + the −1 probe', () => {
    const engine = (model: RtlScrollModel, max = 400) => {
      let raw = model === 'positive-descending' ? max : 0;
      const clamp = (v: number) =>
        model === 'negative' ? Math.min(0, Math.max(-max, v)) : Math.min(max, Math.max(0, v));
      return {
        read: () => raw,
        write: (v: number) => {
          raw = clamp(v);
        },
      };
    };
    for (const model of ['negative', 'positive-ascending', 'positive-descending'] as const) {
      const e = engine(model);
      const verdict = detectRtlScrollModel(e.read(), () => {
        e.write(-1);
        return e.read();
      });
      expect(verdict).toBe(model);
    }
  });

  it('the canonical adapters: one inline truth from every engine (travel = −canon, physical origin = max + canon)', () => {
    const max = 400;
    // mid-travel raws per engine, all meaning "walked 100 toward the
    // inline end"
    const raws: [RtlScrollModel, number][] = [
      ['negative', -100],
      ['positive-ascending', 100],
      ['positive-descending', 300],
    ];
    for (const [model, raw] of raws) {
      const canon = rtlScrollToCanonical(model, raw, max);
      expect(canon).toBe(-100);
      expect(-canon).toBe(100); // inline travel
      expect(max + canon).toBe(300); // physical window origin
      expect(rtlScrollFromCanonical(model, canon, max)).toBe(raw); // round-trip
    }
  });

  it('a positive-ascending engine (legacy WebKit) reads inline-true through the normalizer — verdict, progress, edge factors, nudge sign', () => {
    const { list, tabsIn } = setup();
    const host = list('rtl');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    run.style.direction = 'rtl';
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    // the ascending engine: raw clamps to [0, +max], rests at 0
    let raw = 0;
    Object.defineProperty(run, 'scrollLeft', {
      get: () => raw,
      set: (v: number) => {
        raw = Math.min(400, Math.max(0, v));
      },
      configurable: true,
    });
    // first stamp AT REST — the −1 probe clamps to 0, separating
    // ascending from the spec-negative engine
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('start-closed');
    // fake geometry shared with the negative-engine law: alpha owns
    // [480, 580]; walking raw +100 is canon −100 → window [300, 500]
    const [alpha] = tabsIn('rtl');
    Object.defineProperty(alpha, 'offsetLeft', { value: 480, configurable: true });
    Object.defineProperty(alpha, 'offsetWidth', { value: 100, configurable: true });
    raw = 100;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0.25');
    expect(alpha.style.getPropertyValue('--jx-edge-start')).toBe('');
    expect(alpha.style.getPropertyValue('--jx-edge-end')).toBe('0.800');
    // nudge: inline-forward writes a POSITIVE raw ABSOLUTE target on
    // this engine (canonical -100 - step → FromCanonical flips sign)
    const calls: number[] = [];
    run.scrollTo = (opts?: ScrollToOptions) => {
      calls.push(opts?.left ?? 0);
      return undefined;
    };
    (host.querySelector(':scope > [data-jx-chevron="inline-end"]') as HTMLButtonElement).click();
    expect(calls[0]).toBeGreaterThan(0);
  });

  it('a positive-descending engine (legacy IE/Edge) is detected from its +max rest and reads inline-true', () => {
    const { list } = setup();
    const host = list('rtl');
    const run = host.querySelector('[data-jx-tabs-run]')!;
    run.style.direction = 'rtl';
    Object.defineProperty(run, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(run, 'clientWidth', { value: 200, configurable: true });
    // the descending engine: raw clamps to [0, +max], RESTS at +max
    // (no probe — a −1 write would clamp to 0, the far end)
    let raw = 400;
    Object.defineProperty(run, 'scrollLeft', {
      get: () => raw,
      set: (v: number) => {
        raw = Math.min(400, Math.max(0, v));
      },
      configurable: true,
    });
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('start-closed');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0');
    // raw DESCENDS toward the inline end: 100 is canon −300 → travel 0.75
    raw = 100;
    run.dispatchEvent(new Event('scroll'));
    expect(run.getAttribute('data-jx-scroll-state')).toBe('open');
    expect(host.style.getPropertyValue('--jx-tabs-progress')).toBe('0.75');
  });
});

// ---------------------------------------------------------------------------
// The css law — pinned at source (jsdom computes no css)
// ---------------------------------------------------------------------------
describe('Tabs · indicator css law (tabs-trigger.css, source-pinned)', () => {
  // the base block: the selector is the attribute alone (optionally
  // wrapped in the house :where()/:is() zero-specificity layer, the
  // button-group.css convention) — material compounds don't qualify
  const indSelector = /(?::where|:is)?\(\s*\[data-jx-tabs-ind\]\s*\)|\[data-jx-tabs-ind\]/;
  const indBlock =
    tabsTriggerCss.match(new RegExp(`(?:${indSelector.source})\\s*\\{[^}]*\\}`))?.[0] ?? '';

  it('the indicator is an absolutely-positioned, click-transparent box that transitions its geometry', () => {
    expect(indBlock.length).toBeGreaterThan(0);
    expect(indBlock).toMatch(/position:\s*absolute/);
    expect(indBlock).toMatch(/pointer-events:\s*none/);
    const transition = indBlock.match(/transition:\s*([^;]+);/)?.[1] ?? '';
    expect(transition).toContain('transform');
    expect(transition).toContain('width');
    expect(transition).toContain('height');
  });

  it('the [data-quiet] variant kills the transition (silent first placement / remeasure)', () => {
    expect(tabsTriggerCss).toMatch(/\[data-quiet\][^{]*\{[^}]*transition:\s*none/s);
  });

  it("the line material inks with the brand primary; every material's rule exists", () => {
    expect(tabsTriggerCss).toMatch(
      new RegExp(`${dataAttr('material', 'line')}[^{]*\\{[^}]*background:\\s*var\\(--primary\\)`, 's'),
    );
    for (const material of ['pill', 'outline', 'glass', 'liquid']) {
      expect(tabsTriggerCss).toMatch(new RegExp(dataAttr('material', material)));
    }
  });

  it('glass carries a backdrop-filter; liquid rides the css var with a fallback', () => {
    expect(tabsTriggerCss).toMatch(
      new RegExp(`${dataAttr('material', 'glass')}[^{]*\\{[^}]*backdrop-filter`, 's'),
    );
    expect(tabsTriggerCss).toMatch(
      new RegExp(
        `${dataAttr('material', 'liquid')}[^{]*\\{[^}]*backdrop-filter:\\s*[^;}]*var\\(--jx-tabs-liquid-bf\\s*,`,
        's',
      ),
    );
  });

  it('reduced motion kills the geometry transition', () => {
    expect(tabsTriggerCss).toMatch(
      /@media\s*\(\s*prefers-reduced-motion[^)]*\)[\s\S]*?transition:\s*none/,
    );
  });

  it('the chevron glyphs are the LUCIDE geometry (icons.ts same source): stroke 2, chevron-right/left paths', () => {
    expect(tabsTriggerCss).toContain("path d='m9 18 6-6-6-6'");
    expect(tabsTriggerCss).toContain("path d='m15 18-6-6 6-6'");
    expect(tabsTriggerCss).toContain("stroke-width='2'");
    expect(tabsTriggerCss).not.toContain("stroke-width='2.5'");
  });

  it("the grow layout stretches its triggers ([data-layout='grow'] > [role=tab])", () => {
    expect(tabsTriggerCss).toMatch(
      new RegExp(
        `${dataAttr('layout', 'grow')}\\s*\\)?\\s*>\\s*\\[role=['"]tab['"]\\][^{]*\\{[^}]*(?:flex:\\s*(?:1|auto)|flex-grow:\\s*1)`,
        's',
      ),
    );
  });

  it('the list establishes the positioning context (position: relative)', () => {
    const cssPinsIt = /\[data-jx-tabs-list\][^{]*\{[^}]*position:\s*relative/s.test(tabsTriggerCss);
    const { list } = setup();
    // a 'relative' utility on the markup is the equally-valid vehicle
    expect(cssPinsIt || list('line').className.includes('relative')).toBe(true);
  });

  it('the old .jx-tab-selected::after bar is DELETED (the shared indicator replaces it)', () => {
    expect(tabsTriggerCss).not.toContain('jx-tab-selected');
  });
});

describe('Tabs · scrollEffect builders (the press-button effect convention)', () => {
  it('slide is the cheapest — translate distance only', () => {
    expect(slide()).toEqual({ type: 'slide', distance: '8px' });
    expect(slide({ distance: '12px' })).toEqual({ type: 'slide', distance: '12px' });
  });
  it('blur and blurSlide carry the radius (+ distance)', () => {
    expect(blur()).toEqual({ type: 'blur', radius: '4px' });
    expect(blurSlide({ radius: '6px', distance: '10px' })).toEqual({
      type: 'blur+slide',
      radius: '6px',
      distance: '10px',
    });
  });
  it('progressBlur carries the ladder (≥2 levels, normalized downstream) and the width knob', () => {
    expect(progressBlur().blurLevels.length).toBeGreaterThanOrEqual(2);
    expect(progressBlur({ blurLevels: [1, 2, 4] }).blurLevels).toEqual([1, 2, 4]);
    expect(progressBlur().width).toBeUndefined();
    expect(progressBlur({ width: '120px' }).width).toBe('120px');
  });

  it('shadow carries the width knob — the contrast ghost is otherwise config-free', () => {
    expect(shadow()).toEqual({ type: 'shadow', width: undefined });
    expect(shadow({ width: '6rem' })).toEqual({ type: 'shadow', width: '6rem' });
  });
});

describe('Tabs · horizontal overflow contract (tabs-trigger.css, source-pinned)', () => {
  // the overflow law is pinned on the css source (same-source:
  // byte-identical to the registry copy) and the jsdom markup
  const startBtn = /\[data-jx-chevron='inline-start'\]/;
  const endBtn = /\[data-jx-chevron='inline-end'\]/;

  it('the horizontal list is a ONE-CELL GRID HOST — the run, the veil layer and the chevron buttons stack in the same cell', () => {
    expect(tabsTriggerCss).toMatch(
      new RegExp(`\\.jx-tabs-horizontal[^{]*\\{[^}]*display:\\s*grid`, 's'),
    );
    expect(tabsTriggerCss).toMatch(
      new RegExp(`\\.jx-tabs-horizontal[^{]*\\{[^}]*grid-template-columns:\\s*minmax\\(0,\\s*1fr\\)`, 's'),
    );
    expect(tabsTriggerCss).toMatch(new RegExp(`\\.jx-tabs-run[^{]*\\{[^}]*grid-area:\\s*1\\s*/\\s*1`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`${startBtn.source}[^{]*\\{[^}]*grid-area:\\s*1\\s*/\\s*1`, 's'));
    expect(tabsTriggerCss).toMatch(/\.jx-tabs-veil-layer[^{\/]*\{[^}]*z-index:\s*1/s);
  });

  it('the run (the tablist itself) degrades to a scroll run: overflow-x auto, hidden scrollbar, walk-clearing scroll padding', () => {
    expect(tabsTriggerCss).toMatch(new RegExp(`\\.jx-tabs-run[^{]*\\{[^}]*overflow-x:\\s*auto`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`\\.jx-tabs-run[^{]*\\{[^}]*scrollbar-width:\\s*none`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`\\.jx-tabs-run[^{]*\\{[^}]*scroll-padding-inline`, 's'));
  });

  it('both chevron buttons are authored, pinned to their inline edges (justify-self), stacked above run AND veil', () => {
    expect(tabsTriggerCss).toMatch(new RegExp(`${endBtn.source}[^{]*\\{[^}]*justify-self:\\s*end`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`${startBtn.source}[^{]*\\{[^}]*justify-self:\\s*start`, 's'));
    // z law: run base · veil layer 1 · chevrons 2
    expect(tabsTriggerCss).toMatch(
      new RegExp(`${startBtn.source}[^{]*\\{[^}]*z-index:\\s*2`, 's'),
    );
  });

  it('the chevron is a FROSTED EDGE CHIP (one law with button-group, Owner round 4): centered, tucked, blurred — the glyph in css vars the background references', () => {
    // the chip: inset·1.5 square, vertically centered by grid, ink var,
    // frost + soft lift; the glyph (14px = the SVG canvas, ink spans
    // the middle half) is the chip's own background layer
    expect(tabsTriggerCss).toMatch(
      new RegExp(`${startBtn.source}[\\s\\S]{0,200}?${endBtn.source}[^{]*\\{[^}]*align-self:\\s*center;[^}]*inline-size:\\s*calc\\(var\\(--jx-inset\\)\\s*\\*\\s*1\\.5\\);[^}]*background-color:\\s*var\\(--jx-tabs-chevron-chip\\);[^}]*backdrop-filter:\\s*blur\\(2px\\);`, 's'),
    );
    expect(tabsTriggerCss).toMatch(/--jx-tabs-chevron-chip:\s*oklab\(1\s*0\s*0\s*\/\s*0\.8\);/);
    expect(tabsTriggerCss).toMatch(/--jx-tabs-chevron-inline-end:\s*url\(/);
    expect(tabsTriggerCss).toMatch(/--jx-tabs-chevron-inline-start:\s*url\(/);
    expect(tabsTriggerCss).toMatch(new RegExp(`${endBtn.source}[^{]*\\{[^}]*margin-inline-end:\\s*calc\\(var\\(--jx-inset\\)\\s*\\*\\s*-1\\);[^}]*background-image:\\s*var\\(--jx-tabs-chevron-inline-end\\)`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`${startBtn.source}[^{]*\\{[^}]*margin-inline-start:\\s*calc\\(var\\(--jx-inset\\)\\s*\\*\\s*-1\\);[^}]*background-image:\\s*var\\(--jx-tabs-chevron-inline-start\\)`, 's'));
    // the retired eras never return: no mask, no blend glyph
    const chip = tabsTriggerCss.match(new RegExp(`${startBtn.source}[\\s\\S]{0,200}?${endBtn.source}[^{]*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
    expect(chip).not.toMatch(/mask/);
    expect(chip).not.toMatch(/mix-blend-mode/);
    // the glyph size: 14px pinned (Owner 2026-09-04 — the text-derived
    // size computed ~8–11px, an unreadable whisper; the background
    // still references the var, so the indirection stays swappable)
    expect(tabsTriggerCss).toMatch(/--jx-tabs-chevron-size:\s*14px;/);
  });

  it('a direction that cannot travel NEVER paints: the JS-stamped data-jx-scroll-state is the truth the css keys on', () => {
    // none = the strip cannot scroll at all; start/end-closed = that edge
    // is exhausted — every state keys a [data-jx-chevron] gate
    for (const state of ['none', 'start-closed', 'end-closed']) {
      expect(tabsTriggerCss).toMatch(`data-jx-scroll-state='${state}']`);
    }
    expect(tabsTriggerCss).toMatch(
      /data-jx-scroll-state='none'\][^{]*>\s*:where\(\[data-jx-chevron='inline-start'\]\)[\s\S]{0,400}?display:\s*none/s,
    );
  });

  it('the run is the indicator containing block and a snap-scroller: relative, smooth, proximity snap', () => {
    const runBlock = tabsTriggerCss.match(/:where\(\.jx-tabs-run\) \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(runBlock).toMatch(/position:\s*relative/);
    expect(runBlock).toMatch(/scroll-behavior:\s*smooth/);
    expect(runBlock).toMatch(/scroll-snap-type:\s*x\s+proximity/);
    expect(tabsTriggerCss).toMatch(/\.jx-tabs-run[^{]*>\s*\[role='tab'\][^{]*\{[^}]*scroll-snap-align:\s*start/s);
  });

  it('the layout law (R4): the chevrons are REAL DOM — no ::scroll-button() anywhere, no position:absolute, no anchor machinery', () => {
    expect(tabsTriggerCss).not.toMatch(/::scroll-button/);
    const overlayRules = tabsTriggerCss
      .split('\n')
      .filter((line) => line.includes('data-jx-chevron') || line.includes('jx-tabs-veil'))
      .join('\n');
    expect(overlayRules).not.toMatch(/position:\s*absolute/);
    expect(tabsTriggerCss).not.toMatch(/anchor-name/);
    expect(tabsTriggerCss).not.toMatch(/position-anchor/);
    // generation itself is the on-demand gate (Chromium 146: a dead
    // direction has NO box; :enabled/:disabled never match the pseudo)
    expect(tabsTriggerCss).not.toMatch(/::scroll-button\([^)]*\):(enabled|disabled|not)/);
  });

  it('scrollEffect #1 — scroll-following edge ramps: per-trigger stamped factors calc the treatment; NO view() timelines (Chromium 152 resolves named ranges garbage at rest — the stuck-first-button law)', () => {
    for (const effect of ['blur', 'slide', 'blur+slide']) {
      const escaped = effect.replace('+', '\\+');
      const rule =
        tabsTriggerCss.match(new RegExp(`data-scroll-effect='${escaped}'\\] > \\[role='tab'\\] \\{[\\s\\S]*?\\n\\}`))
          ?.[0] ?? '';
      expect(rule, `the ${effect} rule`).toContain('opacity: calc(1 - max(var(--jx-edge-start, 0), var(--jx-edge-end, 0)))');
      if (effect !== 'blur') {
        // slide composes the two directions along the inline axis
        expect(rule).toMatch(
          /translate:\s*calc\(\(var\(--jx-edge-end, 0\) - var\(--jx-edge-start, 0\)\) \* var\(--jx-tabs-edge-slide, 0px\)\) 0/,
        );
      }
      if (effect !== 'slide') {
        expect(rule).toMatch(
          /filter:\s*blur\(calc\(max\(var\(--jx-edge-start, 0\), var\(--jx-edge-end, 0\)\) \* var\(--jx-tabs-edge-blur, 0px\)\)\)/,
        );
      }
      // slide (the default) never pays for a filter
      if (effect === 'slide') expect(rule).not.toContain('filter');
    }
    // the ramp law: no timeline machinery at all — stamps + calc only
    expect(tabsTriggerCss).not.toMatch(/animation-timeline/);
    expect(tabsTriggerCss).not.toMatch(/animation-range/);
    expect(tabsTriggerCss).not.toMatch(/@keyframes jx-tabs-edge/);
    // reduced motion keeps blur+opacity, kills the translate only
    expect(tabsTriggerCss).toMatch(
      /\[data-scroll-effect\]\s*>\s*\[role='tab'\][^{]*\{[^}]*translate:\s*none/s,
    );
  });

  it('scrollEffect #2 — the merged veil layer: host var, clip gate, scroll-driven translate entrance (Owner, R4)', () => {
    // the veil width var rides the HOST: the veil layer is the run's sibling
    // — a var declared on the run never inherits to it. inset·6 = the
    // chevron lane (inset·2, snap-parked blank) + the ramp that must reach
    // the parked label's readable text
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-horizontal[^{]*\{[^}]*--jx-tabs-veil:\s*calc\(var\(--jx-inset\)\s*\*\s*6\)/s,
    );
    const runBlock = tabsTriggerCss.match(/:where\(\.jx-tabs-run\) \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(runBlock).not.toContain('--jx-tabs-veil');
    // the layer: z 1 over the run, and overflow:clip is LOAD-BEARING — it
    // hides the translated-out halves of the entrance below
    expect(tabsTriggerCss).toMatch(/\.jx-tabs-veil-layer\)\s*\{[^}]*overflow:\s*clip/s);
    // a strip that cannot scroll at all shows no veil layer (the gate is
    // unlayered — the layer's `grid` utility beats @layer components)
    expect(tabsTriggerCss).toMatch(
      /:has\(\s*>\s*\[data-jx-tabs-run\]\[data-jx-scroll-state='none'\]\)[^{]*\{[^}]*display:\s*none/s,
    );
    // the ENTRANCE (Owner, R4): the start veil rests fully translated out
    // (-100%, clipped) and slides in over the first 15% of travel; the end
    // veil rests in place and slides out (+100%) over the last 15% — the
    // same --jx-tabs-progress window the chevron fade calcs from
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-veil\)\[data-position='start'\][^{]*\{[^}]*translate:\s*calc\(\(1 - min\(1, var\(--jx-tabs-progress, 0\) \/ 0\.15\)\) \* -100\%\)/s,
    );
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-veil\)\[data-position='end'\][^{]*\{[^}]*translate:\s*calc\(max\(0, \(var\(--jx-tabs-progress, 0\) - 0\.85\) \/ 0\.15\) \* 100\%\)/s,
    );
    // reduced motion rests the veils in place (no translate)
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-veil-layer\)\s*>\s*:where\(\.jx-tabs-veil\)[^{]*\{[^}]*translate:\s*none/s,
    );
  });

  it('scrollEffect #3 — the shadow veil is the separator INK law: backdrop contrast SUBTRACTS color, never adds black', () => {
    // the ink engine: contrast() pulls the backdrop toward mid tone —
    // near-white dims, near-black lifts (dark mode reverses itself);
    // NO background color anywhere on the band
    expect(tabsTriggerCss).toMatch(/\.jx-tabs-shadow\)\s*\{[^}]*backdrop-filter:\s*contrast\(0\.5\)/s);
    const shadowBlock = tabsTriggerCss.match(/\.jx-tabs-shadow\)\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(shadowBlock).not.toMatch(/background|box-shadow|rgb\(/);
    // the band rides the veil width var
    expect(shadowBlock).toMatch(/width:\s*var\(--jx-tabs-veil\)/);
    // the ramp is a MASK per direction (strongest at the outer edge)
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-shadow\)\[data-position='start'\][^{]*\{[^}]*mask:[^}]*to left/s,
    );
    expect(tabsTriggerCss).toMatch(
      /\.jx-tabs-shadow\)\[data-position='end'\][^{]*\{[^}]*mask:[^}]*to right/s,
    );
  });

  it('the on-demand fade follows the host-stamped --jx-tabs-progress — the chevron BUTTONS calc it directly (R4: no pseudos, no timelines)', () => {
    // the @property/scroll(self) machinery is GONE — the JS stamp in
    // tabs-list.svelte is the single truth for chevrons AND veil
    expect(tabsTriggerCss).not.toMatch(/@property\s+--jx-tabs-progress/);
    expect(tabsTriggerCss).not.toMatch(/scroll\(self/);
    // each direction ramps over the outer 15% of travel, unconditionally
    expect(tabsTriggerCss).toMatch(new RegExp(`${startBtn.source}[^{]*\\{[^}]*opacity:\\s*min\\(1,\\s*calc\\(var\\(--jx-tabs-progress, 0\\) / 0\\.15\\)\\)`, 's'));
    expect(tabsTriggerCss).toMatch(new RegExp(`${endBtn.source}[^{]*\\{[^}]*opacity:\\s*min\\(1,\\s*calc\\(\\(1 - var\\(--jx-tabs-progress, 0\\)\\) / 0\\.15\\)\\)`, 's'));
  });

  it('pre-hydration hides EVERY overlay — no scroll verdict yet (or ever, JS-off): no chevrons, no veil layer, no click targets (A-10/B-7)', () => {
    // the chevron gate: display:none + pointer-events:none on the
    // un-stamped run (the un-stamped start chevron used to sit at
    // opacity:0 yet still take pointer events)
    expect(tabsTriggerCss).toMatch(
      /:not\(\[data-jx-scroll-state\]\)\)[^{]*>[^{]*\{[^}]*display:\s*none;[^}]*pointer-events:\s*none/s,
    );
    // the veil gate rides unlayered beside the state=none gate (same
    // cascade reason — the layer's grid utility beats @layer components)
    expect(tabsTriggerCss).toMatch(
      /:not\(\[data-jx-scroll-state\]\)\)\s*>\s*:where\(\.jx-tabs-veil-layer\)\s*\{[^}]*display:\s*none/s,
    );
  });

  it('reduced motion rests a veil ONLY where travel can reach — a CLOSED edge hides outright instead of parking in place (A-5)', () => {
    // inside the reduced-motion block itself (not the runtime chevron
    // gates): start-closed hides the start veil, end-closed the end
    expect(tabsTriggerCss).toMatch(
      /prefers-reduced-motion[\s\S]*?data-jx-scroll-state='start-closed'[\s\S]{0,600}?\[data-position='start'\][^{]*\{[^}]*display:\s*none/s,
    );
    expect(tabsTriggerCss).toMatch(
      /prefers-reduced-motion[\s\S]*?data-jx-scroll-state='end-closed'[\s\S]{0,600}?\[data-position='end'\][^{]*\{[^}]*display:\s*none/s,
    );
  });

  it('the indicator fades with its ACTIVE trigger — the stamp copies the edge factors onto the span, so an exiting selected tab takes its bar with it (V1-2)', () => {
    expect(tabsTriggerCss).toMatch(
      /\[data-scroll-effect\]\s*>\s*\[data-jx-tabs-ind\]\s*\{[^}]*opacity:\s*calc\(1 - max\(var\(--jx-edge-start, 0\), var\(--jx-edge-end, 0\)\)\)/s,
    );
  });
});
