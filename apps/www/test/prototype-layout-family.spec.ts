/**
 * The layout family alpha acceptance suite
 * (test/prototype-layout-family.spec.ts, layout-family-alpha 2026-09-11).
 *
 * The first alpha-track registry family: prototype-flex /
 * prototype-grid / prototype-waterfall. The contract under test is
 * the layout-family spec delta:
 *
 *   - ZERO TRANSLATION: every prop value lands as its exact CSS
 *     value (no vocabulary-mapping layer); the two type coercions
 *     (gap number → px; cols/rows number → repeat(N, minmax(0,1fr)))
 *     are the only transforms.
 *   - OMISSION TRANSPARENCY: an omitted prop injects NO declaration —
 *     the inline style carries the identity (display) plus only what
 *     the consumer declared.
 *   - SINGLE ROOT + REST SPREAD (the stamp precondition): `data-*`,
 *     title and `aria-*` land on the one root; the component's
 *     `data-jx-prototype-` stamp rides after the spread.
 *   - ALPHA STAMP: registry.json carries meta.alpha: true and the
 *     description names the stamp precondition.
 *
 * Assertion law: style is read from the rendered root's style
 * declaration the way any host would see it — never from component
 * internals. Rendering uses svelte's native mount() (no
 * @testing-library: its dep tree drags vitest's external-deps
 * packaging into a cold-optimizer bug in this vite8/rolldown
 * baseline); jsdom has no layout, so these are style-contract
 * assertions, not geometry ones (geometry belongs to the docs demos
 * and vision lanes).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PrototypeFlex from '$lib/ui/prototype-flex/prototype-flex.svelte';
import PrototypeGrid from '$lib/ui/prototype-grid/prototype-grid.svelte';
import PrototypeWaterfall from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte';
import PrototypeFamilyHost from './fixtures/prototype-family-host.svelte';

type Cmp = typeof PrototypeFlex;
const mounted: { destroy: () => void }[] = [];

/** mount with props, track for cleanup, return the host container */
function into<C extends Cmp>(Cmp: C, props: Record<string, unknown> = {}): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const instance = mount(Cmp as never, { target, props: props as never });
  mounted.push({ destroy: () => unmount(instance) });
  expect(target.children.length, 'SINGLE ROOT').toBe(1);
  return target.children[0] as HTMLElement;
}

afterEach(() => {
  while (mounted.length) mounted.pop()?.destroy();
  document.body.innerHTML = '';
});

const testid = (el: HTMLElement): HTMLElement => {
  expect(el.hasAttribute('data-testid')).toBe(true);
  return el;
};

describe('prototype-flex — the standardized flex row', () => {
  it('identity only: bare render is display:flex and NOTHING else', () => {
    const el = testid(into(PrototypeFlex, { 'data-testid': 'root' }));
    expect(el.style.display).toBe('flex');
    expect(el.getAttribute('style')?.replace(/\s/g, '')).toBe('display:flex');
    expect(el.hasAttribute('data-jx-prototype-flex')).toBe(true);
  });

  it('every union member lands as exact CSS (zero translation)', () => {
    const el = testid(
      into(PrototypeFlex, {
        'data-testid': 'root',
        direction: 'column-reverse',
        wrap: 'wrap-reverse',
        align: 'baseline',
        justify: 'space-evenly',
        gap: 12,
      }),
    );
    expect(el.style.display).toBe('flex');
    expect(el.style.flexDirection).toBe('column-reverse');
    expect(el.style.flexWrap).toBe('wrap-reverse');
    expect(el.style.alignItems).toBe('baseline');
    expect(el.style.justifyContent).toBe('space-evenly');
    expect(el.style.gap).toBe('12px'); // the one type coercion
  });

  it('the remaining justify/align/wrap/direction members pass verbatim', () => {
    for (const justify of ['start', 'center', 'end', 'space-between', 'space-around'] as const) {
      expect(testid(into(PrototypeFlex, { 'data-testid': 'root', justify })).style.justifyContent).toBe(justify);
    }
    for (const align of ['start', 'center', 'end', 'stretch'] as const) {
      expect(testid(into(PrototypeFlex, { 'data-testid': 'root', align })).style.alignItems).toBe(align);
    }
    expect(testid(into(PrototypeFlex, { 'data-testid': 'root', direction: 'row-reverse' })).style.flexDirection).toBe('row-reverse');
    expect(testid(into(PrototypeFlex, { 'data-testid': 'root', direction: 'column' })).style.flexDirection).toBe('column');
    expect(testid(into(PrototypeFlex, { 'data-testid': 'root', wrap: 'nowrap' })).style.flexWrap).toBe('nowrap');
    expect(testid(into(PrototypeFlex, { 'data-testid': 'root', wrap: 'wrap' })).style.flexWrap).toBe('wrap');
  });

  it('gap string passes verbatim (no unit guessing)', () => {
    expect(testid(into(PrototypeFlex, { 'data-testid': 'root', gap: '0.75rem' })).style.gap).toBe('0.75rem');
  });
});

describe('prototype-grid — the standardized grid', () => {
  it('identity only: bare render is display:grid and NOTHING else', () => {
    const el = testid(into(PrototypeGrid, { 'data-testid': 'root' }));
    expect(el.style.display).toBe('grid');
    expect(el.getAttribute('style')?.replace(/\s/g, '')).toBe('display:grid');
    expect(el.hasAttribute('data-jx-prototype-grid')).toBe(true);
  });

  it('numeric tracks take the blowout-proof form', () => {
    const el = testid(into(PrototypeGrid, { 'data-testid': 'root', cols: 3, rows: 2, gap: 12 }));
    expect(el.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(el.style.gridTemplateRows).toBe('repeat(2, minmax(0, 1fr))');
    expect(el.style.gap).toBe('12px');
  });

  it('string tracks and areas pass verbatim', () => {
    const el = testid(
      into(PrototypeGrid, {
        'data-testid': 'root',
        cols: 'auto-fit 14rem',
        rows: 'auto 1fr',
        areas: '"head head" "side main"',
        gap: '1rem',
      }),
    );
    expect(el.style.gridTemplateColumns).toBe('auto-fit 14rem');
    expect(el.style.gridTemplateRows).toBe('auto 1fr');
    expect(el.style.gridTemplateAreas).toBe('"head head" "side main"');
    expect(el.style.gap).toBe('1rem');
  });
});

describe('prototype-waterfall — CSS multi-column, tradeoffs declared', () => {
  it('omitted props inject nothing: bare root carries no declaration', () => {
    const el = testid(into(PrototypeWaterfall, { 'data-testid': 'root' }));
    expect(el.getAttribute('style')).toBeNull(); // columns IS the identity: no display line
    expect(el.hasAttribute('data-jx-prototype-waterfall')).toBe(true);
  });

  it('balanced strategy maps to column-fill: balance', () => {
    const el = testid(
      into(PrototypeWaterfall, { 'data-testid': 'root', columns: 3, gap: 16, strategy: 'balanced' }),
    );
    // jsdom does not decompose the columns SHORTHAND into longhands
    // (verified: style.columnCount stays '') — assert the style
    // attribute string, which carries exactly what the component set
    const style = el.getAttribute('style') ?? '';
    expect(style).toContain('columns: 3');
    expect(el.style.columnGap).toBe('16px');
    expect(el.style.columnFill).toBe('balance');
  });

  it('a length-string columns value passes verbatim (auto-width form)', () => {
    const el = testid(into(PrototypeWaterfall, { 'data-testid': 'root', columns: '14rem' }));
    expect(el.getAttribute('style')).toContain('columns: 14rem');
  });
});

describe('the family laws (all three components)', () => {
  const cases: [string, Cmp][] = [
    ['prototype-flex', PrototypeFlex],
    ['prototype-grid', PrototypeGrid],
    ['prototype-waterfall', PrototypeWaterfall],
  ];

  it.each(cases)('%s: rest spread lands data-*/title/aria-* on the single root', (_name, Cmp) => {
    const el = testid(
      into(Cmp, { 'data-testid': 'root', title: 'the frame', 'aria-label': 'demo region', 'data-custom': 'x' }),
    );
    expect(el.getAttribute('title')).toBe('the frame');
    expect(el.getAttribute('aria-label')).toBe('demo region');
    expect(el.getAttribute('data-custom')).toBe('x');
  });

  it.each(cases)('%s: children render inside the root (real snippet)', (name) => {
    const which = name.replace('prototype-', '') as 'flex' | 'grid' | 'waterfall';
    const el = testid(into(PrototypeFamilyHost, { which }));
    expect(el.childElementCount).toBe(2); // the two snippet children rendered
    expect(el.children[0]?.textContent).not.toBe('');
  });

  it.each(cases)('%s: class passes through verbatim (no component class)', (_name, Cmp) => {
    expect(testid(into(Cmp, { 'data-testid': 'root', class: 'my-frame' })).getAttribute('class')).toBe('my-frame');
  });
});

describe('the alpha registry contract (registry.json fs-read, catalog-spec pattern)', () => {
  const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
  const registry = JSON.parse(readFileSync(resolve(repoRoot, 'registry.json'), 'utf8')) as {
    items: { name: string; description: string; meta?: Record<string, unknown> }[];
  };
  const family = registry.items.filter((i) => i.name.startsWith('prototype-'));

  it('the three items are registered with meta.alpha: true', () => {
    expect(family.map((i) => i.name).sort()).toEqual([
      'prototype-flex',
      'prototype-grid',
      'prototype-waterfall',
    ]);
    for (const item of family) {
      expect(item.meta?.alpha, `${item.name} meta.alpha`).toBe(true);
    }
  });

  it.each(family.map((i) => [i.name, i.description]))(
    '%s: description names the alpha track',
    (_name, description) => {
      expect(description).toMatch(/ALPHA TRACK/i);
    },
  );
});
