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
 *     the root carries its identity (display for flex/grid; the
 *     waterfall's columns IS its identity) plus only what the
 *     consumer declared; a bare waterfall writes zero declarations.
 *   - SINGLE ROOT + REST SPREAD (the stamp precondition): `data-*`,
 *     title and `aria-*` land on the one root; the component's
 *     `data-jx-prototype-` stamp rides after the spread (a consumer
 *     collision is replaced, not merged).
 *   - ALPHA STAMP: registry.json carries meta.alpha: true and the
 *     description names the stamp precondition.
 *
 * Assertion law: style is read from the rendered root's style
 * declaration the way any host would see it — never from component
 * internals. The CSSOM serializes the style attribute with a
 * trailing `;` (`'display: flex;'`), so exact-content assertions
 * strip whitespace AND semicolons. Rendering uses svelte's native
 * mount() (no
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
    // CSSOM serialization carries a trailing ';' — strip both to pin content
    expect(el.getAttribute('style')?.replace(/[\s;]/g, '')).toBe('display:flex');
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
    expect(el.getAttribute('style')?.replace(/[\s;]/g, '')).toBe('display:grid');
    expect(el.hasAttribute('data-jx-prototype-grid')).toBe(true);
  });

  it('numeric tracks take the blowout-proof form', () => {
    const el = testid(into(PrototypeGrid, { 'data-testid': 'root', cols: 3, rows: 2, gap: 12 }));
    expect(el.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(el.style.gridTemplateRows).toBe('repeat(2, minmax(0, 1fr))');
    expect(el.style.gap).toBe('12px');
  });

  it('string tracks and areas pass verbatim', () => {
    // 'repeat(auto-fit, 14rem)' is legal track syntax — `auto-fit`
    // exists ONLY inside repeat(); a bare 'auto-fit 14rem' string is
    // dropped whole by the CSSOM (gridTemplateColumns stays ''), so
    // it could never assert-equal its own input (real-mount verified)
    const el = testid(
      into(PrototypeGrid, {
        'data-testid': 'root',
        cols: 'repeat(auto-fit, 14rem)',
        rows: 'auto 1fr',
        areas: '"head head" "side main"',
        gap: '1rem',
      }),
    );
    expect(el.style.gridTemplateColumns).toBe('repeat(auto-fit, 14rem)');
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

  it.each(cases)('%s: a consumer stamp collision is replaced, not merged', (name, Cmp) => {
    const stamp = `data-jx-${name}`;
    const el = testid(into(Cmp, { 'data-testid': 'root', [stamp]: 'evil' }));
    // the component's bare-attribute stamp rides AFTER the spread and
    // wins; Svelte 5 serializes the bare attribute as "true"
    expect(el.getAttribute(stamp)).toBe('true');
  });

  it.each(cases)('%s: a consumer style attribute merges with the style: directives', (name, Cmp) => {
    const attr = testid(into(Cmp, { 'data-testid': 'root', style: 'color:red' })).getAttribute('style') ?? '';
    expect(attr).toContain('color: red');
    // flex/grid always declare their display identity (real-mount
    // serialization: 'color: red; display: flex;'); a bare waterfall
    // writes no declaration, so the consumer style is the whole attr
    if (name === 'prototype-flex') expect(attr).toContain('display: flex');
    if (name === 'prototype-grid') expect(attr).toContain('display: grid');
    if (name === 'prototype-waterfall') expect(attr.replace(/[\s;]/g, '')).toBe('color:red');
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
  // the exact three family names — a prefix filter would silently
  // adopt any future prototype-* item into this contract
  const FAMILY_NAMES = ['prototype-flex', 'prototype-grid', 'prototype-waterfall'];
  const family = registry.items.filter((i) => FAMILY_NAMES.includes(i.name));

  it('the three items are registered with meta.alpha: true', () => {
    expect(family.map((i) => i.name).sort()).toEqual(FAMILY_NAMES);
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

  it.each(family.map((i) => [i.name, i.description]))(
    '%s: description names the stamp precondition',
    (_name, description) => {
      expect(description).toMatch(/single-root \+ rest-spread/i);
      expect(description).toMatch(/stamp mechanism.s family precondition/i);
    },
  );
});
