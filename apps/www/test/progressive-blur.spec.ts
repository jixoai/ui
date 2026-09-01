/**
 * ProgressiveBlur contract (test/progressive-blur.spec.ts, 2026-09-02).
 *
 * Zero-JS atom: every law is either ARITHMETIC that lands in the
 * markup — the ladder/hold math writes inline mask gradients, asserted
 * here as rendered strings — or CSS-source law: the reveal gating
 * (jsdom computes neither masks nor scroll timelines; the
 * separator.spec precedent).
 *
 *   ladder   one gradient form for every layer: rungs at
 *            i·step…(i+3)·step (step = 100/levels), last rungs
 *            clamped at 100
 *   hold     grid dialect: the ramp compresses into the inboard
 *            (100-hold)%, peak rungs stay opaque to 100%; hold clamps
 *            to [0,100] (B-11) — never a negative stop
 *   reveal   the authored opacity 0 is gated to BLOCK-axis edges only
 *            (B-5): inline edges degrade to always-painted, never the
 *            old permanently-invisible band
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import ProgressiveBlur from '../src/lib/ui/progressive-blur/progressive-blur.svelte';

const css = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/progressive-blur/progressive-blur.css'),
  'utf8',
);

/** the layer's inline declarations as a map (the style attribute holds
 *  the -webkit- twins alongside — the map keys them apart). jsdom's
 *  cssstyle normalizes the value when the style attribute round-trips
 *  its parser — folded back so the locks read the component's
 *  AUTHORED arithmetic, not the serializer's spelling */
const styleMap = (el: Element): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const decl of (el.getAttribute('style') ?? '').split(';')) {
    const i = decl.indexOf(':');
    if (i > 0) map[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return map;
};
const mask = (el: Element): string => {
  let v = styleMap(el)['mask-image'] ?? '';
  // …and drops the default 'to bottom' direction the same way
  if (v.startsWith('linear-gradient(') && !v.startsWith('linear-gradient(to ')) {
    v = v.replace('linear-gradient(', 'linear-gradient(to bottom, ');
  }
  return v.replaceAll('rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)');
};
const blur = (el: Element): string => styleMap(el)['backdrop-filter'] ?? '';
const layers = (container: HTMLElement): Element[] => [
  ...container.querySelectorAll('.jx-pblur-layer'),
];

describe('progressive-blur ladder math (inline styles)', () => {
  it('every layer is the same gradient form at i·step rungs (defaults: step 12.5%)', () => {
    const { container } = render(ProgressiveBlur);
    const rungs = layers(container);
    expect(rungs.length).toBe(8);
    // inner-edge first: blur ramps toward the scrollport edge
    expect(blur(rungs[0])).toBe('blur(0.5px)');
    expect(blur(rungs[7])).toBe('blur(64px)');
    expect(mask(rungs[0])).toBe(
      'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 0) 37.5%)',
    );
    // the last rung's fade tail lands beyond the band: intermediate
    // stops past 100% are legal CSS (out of the visible range), the
    // FINAL stop clamps at 100 — the visible band ends at full
    // strength, the clamped edge of the same form
    expect(mask(rungs[7])).toBe(
      'linear-gradient(to bottom, rgba(0, 0, 0, 0) 87.5%, rgba(0, 0, 0, 1) 100%, rgba(0, 0, 0, 1) 112.5%, rgba(0, 0, 0, 0) 100%)',
    );
  });

  it('fewer than 2 blur levels fall back to the default ladder', () => {
    const { container } = render(ProgressiveBlur, { props: { blurLevels: [3] } });
    expect(layers(container).length).toBe(8);
  });

  it("position='both' renders the block pair as two pinned roots", () => {
    const { container } = render(ProgressiveBlur, { props: { position: 'both' } });
    const bands = [...container.querySelectorAll('[data-jx-pblur]')];
    expect(bands.map((b) => b.getAttribute('data-position'))).toEqual(['top', 'bottom']);
  });
});

describe('progressive-blur hold (grid dialect)', () => {
  it('compresses the ramp into the inboard (100-hold)% and holds the peak rungs to 100%', () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'start', pin: 'grid', hold: 50, blurLevels: [1, 2, 4, 8] },
    });
    const rungs = layers(container);
    // ramp = 50, step = 12.5; the inline bands aim PHYSICALLY (start →
    // 'to left'): layer 0's rung ends at 37.5 < ramp — ordinary 4 stops
    expect(mask(rungs[0])).toBe(
      'linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 0) 37.5%)',
    );
    // layer 1's rung reaches the ramp end ((1+3)·12.5 = 50): the peak
    // holds OPAQUE through the outer lane to 100%
    expect(mask(rungs[1])).toBe(
      'linear-gradient(to left, rgba(0, 0, 0, 0) 12.5%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 1) 100%)',
    );
  });

  it('clamps hold to [0,100] — a runaway hold never emits negative stops (B-11)', () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'end', pin: 'grid', hold: 150, blurLevels: [1, 2, 4, 8] },
    });
    const rungs = layers(container);
    expect(rungs.length).toBeGreaterThan(0);
    for (const rung of rungs) {
      expect(mask(rung)).not.toMatch(/-[\d.]+%/);
    }
    // at the clamp (100) the ramp collapses to 0 — every rung is the
    // full-strength band
    expect(mask(rungs[1])).toBe(
      'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)',
    );
  });

  it('a negative hold reads as the plain ladder (clamped to 0)', () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'top', pin: 'grid', hold: -20, blurLevels: [1, 2, 4, 8] },
    });
    const rungs = layers(container);
    expect(mask(rungs[0])).toBe(
      'linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 25%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 75%)',
    );
  });
});

describe('progressive-blur grid-dialect DOM shape', () => {
  it("pin='grid': the band is a grid item of the host, the layers grid items of the band — no position tech", () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'start', pin: 'grid', height: '3rem' },
    });
    const band = container.querySelector('[data-jx-pblur]') as HTMLElement;
    expect(band.getAttribute('data-position')).toBe('start');
    expect(band.getAttribute('data-variant')).toBe('static');
    expect(band.getAttribute('aria-hidden')).toBe('true');
    // positioning by GRID (grid-area + justify-self per edge) and the
    // compositor-isolation translateZ, never sticky/absolute
    expect(band.className).toContain('[grid-area:1/1]');
    expect(band.className).toContain('justify-self-start');
    expect(band.className).toContain('[transform:translateZ(0)]');
    expect(band.className).not.toContain('sticky');
    expect(band.getAttribute('style')).toContain('width: 3rem');
    const rungs = [...band.querySelectorAll(':scope > .jx-pblur-layer')];
    expect(rungs.length).toBe(8);
    for (const rung of rungs) {
      expect(rung.className).toContain('[grid-area:1/1]');
    }
  });
});

describe('progressive-blur reveal gating (css source law)', () => {
  it('the authored opacity 0 is gated to BLOCK-axis edges only — inline bands never die invisible (B-5)', () => {
    // the base rule carries the position gates…
    expect(css).toMatch(
      /\[data-position='top'\]\) \.jx-pblur-layer,\s*:where\(\.jx-pblur\[data-variant='scroll'\]\[data-position='bottom'\]\) \.jx-pblur-layer \{\s*opacity: 0;\s*\}/,
    );
    // …no ungated [data-variant='scroll'] base rule remains — the
    // @supports revival covers only top/bottom, so an ungated base
    // left INLINE bands permanently invisible
    expect(css).not.toMatch(/\[data-variant='scroll'\]\) \.jx-pblur-layer/);
    // the revival timelines stay block-scoped inside @supports
    expect(css).toMatch(/@supports \(animation-timeline: scroll\(\)\)/);
    expect(css.match(/animation-timeline: scroll\(nearest block\)/g)?.length).toBe(2);
  });
});
