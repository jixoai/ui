/**
 * Separator ink-engine suite (test/separator.spec.ts, 2026-09-01).
 *
 * The ink law (Owner ruling, 2026-09-01): a separator paints no color —
 * the default ink is the backdrop's CONTRAST GHOST
 * (backdrop-filter: contrast(0.5), auto-adaptive over any ground); the
 * shaped variants are MASKS over that strip; fade rides the BLEND
 * engine (mix-blend-mode: difference over an alpha-ramped gradient).
 *
 * jsdom cannot compute backdrop-filter or masks, so the engine is
 * asserted at the css SOURCE (the input-group.spec precedent) while
 * the DOM tests read the valued hooks the way AT/tests would.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import Separator from '../src/lib/ui/separator/separator.svelte';

const css = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/separator/separator.css'),
  'utf8',
);

describe('separator DOM hooks', () => {
  it('renders the native hr with the valued variant hook, defaulting to line', () => {
    const { container } = render(Separator);
    const hr = container.querySelector('hr')!;
    expect(hr).toBeTruthy();
    expect(hr.getAttribute('data-jx-separator')).toBe('line');
    expect(hr.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('vertical keeps the ARIA route with the same valued hooks', () => {
    const { container } = render(Separator, {
      props: { orientation: 'vertical', variant: 'dashed' },
    });
    const div = container.querySelector('[role="separator"]') as HTMLElement;
    expect(div).toBeTruthy();
    expect(div.getAttribute('aria-orientation')).toBe('vertical');
    expect(div.getAttribute('data-jx-separator')).toBe('dashed');
    expect(div.getAttribute('data-orientation')).toBe('vertical');
  });

  it('every variant passes through to the hook', () => {
    for (const variant of ['line', 'dashed', 'dense', 'dotted', 'wavy', 'fade']) {
      const { container } = render(Separator, { props: { variant } });
      expect(
        container.querySelector('hr')!.getAttribute('data-jx-separator'),
        variant,
      ).toBe(variant);
    }
  });
});

describe('separator ink engine (css source law)', () => {
  it('the default ink is the contrast ghost — no color token anywhere', () => {
    expect(css).toContain('backdrop-filter: contrast(0.5)');
    expect(css).not.toMatch(/var\(--border\)/);
  });

  it('shaped variants are masks over the ghost (dashed, dense, dotted, wavy)', () => {
    expect(css).toMatch(/repeating-linear-gradient\(90deg, #000 0 6px/);
    expect(css).toMatch(/repeating-linear-gradient\(90deg, #000 0 3px/);
    expect(css).toMatch(/radial-gradient\(circle 1px/);
    expect(css).toMatch(/data:image\/svg\+xml/);
    // the mask axis swaps with orientation
    expect(css).toMatch(/repeating-linear-gradient\(180deg/);
    expect(css).toMatch(/mask-repeat: repeat-y/);
  });

  it('fade rides the blend engine: difference over an alpha ramp', () => {
    expect(css).toContain('mix-blend-mode: difference');
    expect(css).toMatch(/rgb\(255 255 255 \/ 0\.9\) 50%/);
    // the blend variant drops the filter (one engine at a time)
    expect(css).toMatch(/fade'\]\[data-orientation='horizontal'\]\) \{\s*backdrop-filter: none/);
  });
});
