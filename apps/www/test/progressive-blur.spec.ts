/**
 * ProgressiveBlur contract (test/progressive-blur.spec.ts, 2026-09-02;
 * stop-data split same day — CR-1 P2-1).
 *
 * Zero-JS atom: every law is either ARITHMETIC that lands in the
 * markup — the ladder/hold math writes inline STOP DATA
 * (--jx-pblur-s0..s3 + the tail alpha) — or CSS-source law: the
 * gradient DIRECTION and the reveal gating (jsdom computes neither
 * masks nor scroll timelines; the separator.spec precedent). The
 * split is the RTL fix: gradients have no logical 'to start', so the
 * direction cannot live in the component's direction-blind inline
 * strings — css owns it, keyed on data-position with :dir(rtl)
 * flipping the inline pair.
 *
 *   ladder   one stop form for every layer: rungs at
 *            i·step…(i+3)·step (step = 100/levels), last rungs
 *            clamped at 100
 *   hold     grid dialect: the ramp compresses into the inboard
 *            (100-hold)%, peak rungs hold the tail OPAQUE to 100%;
 *            hold clamps to [0,100] (B-11) — never a negative stop
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
const svelteSrc = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/progressive-blur/progressive-blur.svelte'),
  'utf8',
);

/** the layer's inline declarations as a map (the style attribute holds
 *  the -webkit- twins alongside — the map keys them apart) */
const styleMap = (el: Element): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const decl of (el.getAttribute('style') ?? '').split(';')) {
    const i = decl.indexOf(':');
    if (i > 0) map[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return map;
};
const stops = (el: Element) => {
  const m = styleMap(el);
  return [m['--jx-pblur-s0'], m['--jx-pblur-s1'], m['--jx-pblur-s2'], m['--jx-pblur-s3'], m['--jx-pblur-tail-a']];
};
const blur = (el: Element): string => styleMap(el)['backdrop-filter'] ?? '';
const layers = (container: HTMLElement): Element[] => [
  ...container.querySelectorAll('.jx-pblur-layer'),
];

describe('progressive-blur ladder math (inline stop data)', () => {
  it('every layer is the same stop form at i·step rungs (defaults: step 12.5%)', () => {
    const { container } = render(ProgressiveBlur);
    const rungs = layers(container);
    expect(rungs.length).toBe(8);
    // inner-edge first: blur ramps toward the scrollport edge
    expect(blur(rungs[0])).toBe('blur(0.5px)');
    expect(blur(rungs[7])).toBe('blur(64px)');
    expect(stops(rungs[0])).toEqual(['0%', '12.5%', '25%', '37.5%', '0']);
    // the last rung's fade tail lands beyond the band: intermediate
    // stops past 100% are legal CSS (out of the visible range), the
    // FINAL stop clamps at 100 — the visible band ends at full
    // strength, the clamped edge of the same form
    expect(stops(rungs[7])).toEqual(['87.5%', '100%', '112.5%', '100%', '0']);
    // the mask itself is NOT inline — direction lives in the css
    expect(rungs[0].getAttribute('style')).not.toContain('mask-image');
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
    // ramp = 50, step = 12.5; layer 0's rung ends at 37.5 < ramp —
    // ordinary fading tail (alpha 0)
    expect(stops(rungs[0])).toEqual(['0%', '12.5%', '25%', '37.5%', '0']);
    // layer 1's rung reaches the ramp end ((1+3)·12.5 = 50): the peak
    // holds OPAQUE through the outer lane — tail alpha 1, both outer
    // stops at 100%
    expect(stops(rungs[1])).toEqual(['12.5%', '25%', '100%', '100%', '1']);
  });

  it('clamps hold to [0,100] — a runaway hold never emits negative stops (B-11)', () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'end', pin: 'grid', hold: 150, blurLevels: [1, 2, 4, 8] },
    });
    const rungs = layers(container);
    expect(rungs.length).toBeGreaterThan(0);
    for (const rung of rungs) {
      for (const s of stops(rung).slice(0, 4)) {
        expect(s).not.toMatch(/^-[\d.]/);
      }
    }
    // at the clamp (100) the ramp collapses to 0 — every rung is the
    // full-strength band
    expect(stops(rungs[1])).toEqual(['0%', '0%', '100%', '100%', '1']);
  });

  it('a negative hold reads as the plain ladder (clamped to 0)', () => {
    const { container } = render(ProgressiveBlur, {
      props: { position: 'start', pin: 'grid', hold: -20, blurLevels: [1, 2, 4, 8] },
    });
    const rungs = layers(container);
    expect(stops(rungs[0])).toEqual(['0%', '25%', '50%', '75%', '0']);
  });
});

describe('progressive-blur dialect discrimination (Codex P2, 2026-09-02)', () => {
  // grid + a block-edge position rendered broken geometry (justify-
  // self has no block-axis placement law). Two defenses: the Props
  // type now DISCRIMINATES (grid narrows position to 'start'|'end' —
  // invalid combos are compile errors), and a runtime twin normalizes
  // JS callers that bypass the types to the documented 'start'
  // fallback.
  it('the Props type is a dialect-discriminated union: grid narrows position to start/end', () => {
    expect(svelteSrc).toContain(
      'export type ProgressiveBlurProps = ProgressiveBlurStickyProps | ProgressiveBlurGridProps;',
    );
    // the grid branch's position vocabulary is exactly the inline pair
    const gridBranch = svelteSrc.match(
      /interface ProgressiveBlurGridProps[\s\S]*?\{([\s\S]*?)\n  \}/,
    )?.[1] ?? '';
    expect(gridBranch).not.toBe('');
    expect(gridBranch).toContain("position: 'start' | 'end';");
    expect(gridBranch).not.toContain("'top'");
    expect(gridBranch).not.toContain("'both'");
    // the sticky branch keeps the full vocabulary
    const stickyBranch = svelteSrc.match(
      /interface ProgressiveBlurStickyProps[\s\S]*?\{([\s\S]*?)\n  \}/,
    )?.[1] ?? '';
    expect(stickyBranch).toContain("'inline'");
  });

  it('a JS caller passing grid + top normalizes to the start band, never broken geometry', () => {
    const { container } = render(ProgressiveBlur, {
      // @ts-expect-error the combo IS the compile error this exercises —
      // the runtime twin serves the untyped caller
      props: { pin: 'grid', position: 'top' },
    });
    const bands = [...container.querySelectorAll('[data-jx-pblur]')];
    expect(bands.length).toBe(1);
    expect(bands[0]!.getAttribute('data-position')).toBe('start');
    expect(bands[0]!.className).toContain('justify-self-start');
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

describe('progressive-blur reveal gating + direction ownership (css source law)', () => {
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

  it('the ladder masks live in css keyed on data-position — with :dir(rtl) flipping the inline pair (CR-1 P2-1)', () => {
    // the four physical aims, one per position…
    for (const [pos, dir] of [
      ['top', 'to top'],
      ['bottom', 'to bottom'],
      ['start', 'to left'],
      ['end', 'to right'],
    ] as const) {
      expect(css).toMatch(
        new RegExp(`\\[data-jx-pblur\\]\\[data-position='${pos}'\\]\\) \\.jx-pblur-layer \\{[\\s\\S]*?${dir.replace(/ /g, '\\s')}[\\s\\S]*?--jx-pblur-s0`),
      );
    }
    // …and the inline pair flips under :dir(rtl) — the block pair never
    // mirrors
    expect(css).toMatch(
      /:dir\(rtl\) :where\(\[data-jx-pblur\]\[data-position='start'\]\) \.jx-pblur-layer \{[\s\S]*?to right/,
    );
    expect(css).toMatch(
      /:dir\(rtl\) :where\(\[data-jx-pblur\]\[data-position='end'\]\) \.jx-pblur-layer \{[\s\S]*?to left/,
    );
    expect(css).not.toMatch(/:dir\(rtl\) :where\(\[data-jx-pblur\]\[data-position='(top|bottom)'\]\)/);
  });
});
