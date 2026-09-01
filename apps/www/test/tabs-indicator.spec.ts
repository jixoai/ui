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
 *    tabindex trims to one tab stop, arrows still walk + select;
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
  it('renders the indicator span as the LAST child of the list, wired with the default material and layout', () => {
    const { list, ind } = setup();
    expect(list('line')).toBeTruthy();
    expect(list('line').getAttribute('data-indicator')).toBe('line');
    expect(list('line').getAttribute('data-layout')).toBe('inline');

    const indicator = ind('line');
    expect(indicator).toBeTruthy();
    expect(indicator!.getAttribute('data-material')).toBe('line');
    expect(indicator!.getAttribute('aria-hidden')).toBe('true');
    // the wrapper is engine-owned and sits after every trigger
    expect(list('line').lastElementChild).toBe(indicator);
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

  it('applies the slot-vs-padding law when an icon lane is present', () => {
    const { tabsIn } = setup();
    const [alpha, beta, settings] = tabsIn('anatomy');
    // an icon eats into the trigger's inline padding — by exactly half
    expect(alpha.className).toContain('has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)]');
    expect(beta.className).toContain('has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)]');
    // icon-only carries the same start-side law
    expect(settings.className).toContain('has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)]');
  });

  it('keeps the jx-tab-selected class token on the selected trigger', () => {
    const { tabsIn } = setup();
    const [alpha, beta] = tabsIn('anatomy');
    expect(alpha.className).toContain('jx-tab-selected');
    expect(beta.className).not.toContain('jx-tab-selected');
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
