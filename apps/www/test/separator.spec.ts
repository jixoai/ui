/**
 * Separator ink-engine suite (test/separator.spec.ts, 2026-09-01).
 *
 * The ink law (Owner ruling, 2026-09-01): a separator paints no color —
 * the default variant is NAMED fused: the backdrop's CONTRAST GHOST
 * (backdrop-filter: contrast(0.5), auto-adaptive over any ground); the
 * shaped variants are MASKS over that strip; fade rides the BLEND
 * engine (mix-blend-mode: difference over an alpha-ramped gradient).
 * solid is the ONE additive exception (Owner amendment, 2026-09-08):
 * ghost off, plain var(--border) on.
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
// tailwindless-site P0 (2026-09-17): the ink engine moved to the
// family's stylex atoms — the engine laws are asserted at the ATOM
// source now (the css sheet keeps only the layer statement + the law
// text)
const atom = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/separator/separator.stylex.ts'),
  'utf8',
);

describe('separator DOM hooks', () => {
  it('renders the native hr with the valued variant hook, defaulting to fused', () => {
    const { container } = render(Separator);
    const hr = container.querySelector('hr')!;
    expect(hr).toBeTruthy();
    expect(hr.getAttribute('data-jx-separator')).toBe('fused');
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
    for (const variant of ['fused', 'solid', 'dashed', 'dense', 'dotted', 'wavy', 'fade']) {
      const { container } = render(Separator, { props: { variant } });
      expect(
        container.querySelector('hr')!.getAttribute('data-jx-separator'),
        variant,
      ).toBe(variant);
    }
  });

  it('solid stamps the hook on both postures (the plain-fill escape)', () => {
    const h = render(Separator, { props: { variant: 'solid' } });
    expect(
      h.container.querySelector('hr')!.getAttribute('data-jx-separator'),
    ).toBe('solid');
    const v = render(Separator, {
      props: { variant: 'solid', orientation: 'vertical' },
    });
    expect(
      v.container
        .querySelector('[role="separator"]')!
        .getAttribute('data-jx-separator'),
    ).toBe('solid');
  });
});

describe('separator ink engine (atom source law)', () => {
  it('the default ink is the contrast ghost — the only color token is solid', () => {
    expect(atom).toContain("backdropFilter: 'contrast(0.5)'");
    // the subtraction ink law's named exception (Owner amendment,
    // 2026-09-08): outside COMMENTS, var(--border) may appear ONLY
    // inside the solid atoms — exactly twice, one per orientation
    const rules = atom.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
    const borderUses = [...rules.matchAll(/tokens\['--jx-border'\]/g)];
    expect(borderUses).toHaveLength(2);
    const solidAtoms = [...rules.matchAll(/solid(?:Horizontal|Vertical): \{/g)];
    expect(solidAtoms).toHaveLength(2);
  });

  it('solid is the plain-fill escape: ghost OFF, --border ON, per orientation', () => {
    for (const orientation of ['Horizontal', 'Vertical']) {
      expect(atom).toMatch(
        new RegExp(
          `solid${orientation}: \\{\\s*backdropFilter: 'none',\\s*backgroundColor: tokens\\['--jx-border'\\],`,
        ),
      );
    }
  });

  it('shaped variants are masks over the ghost (dashed, dense, dotted, wavy)', () => {
    expect(atom).toMatch(/GRAD\(90, 6, 10\)/);
    expect(atom).toMatch(/GRAD\(90, 3, 6\)/);
    expect(atom).toMatch(/radial-gradient\(circle 1px/);
    expect(atom).toContain('data:image/svg+xml');
    // the mask axis swaps with orientation
    expect(atom).toMatch(/GRAD\(180, /);
    expect(atom).toMatch(/maskRepeat: 'repeat-y'/);
  });

  it('fade rides the blend engine: difference over an alpha ramp', () => {
    expect(atom).toContain("mixBlendMode: 'difference'");
    expect(atom).toMatch(/rgb\(255 255 255 \/ 0\.6\) 50%/);
    // the blend variant drops the filter (one engine at a time)
    expect(atom).toMatch(/fade[HV]: \{\s*backdropFilter: 'none'/);
  });

  it('the fade peak stays capped (0.6): a 0.9 white-difference layer slams bright grounds to near-black — and exact mid-gray is the engine blind spot either way', () => {
    // the peak stop is the only alpha allowed above the 0.35 shoulders
    const peaks = [...atom.matchAll(/rgb\(255 255 255 \/ ([\d.]+)\) 50%/g)].map((m) => m[1]);
    expect(peaks.length).toBe(2); // both orientations
    for (const alpha of peaks) expect(Number(alpha)).toBeLessThanOrEqual(0.6);
    expect(atom).not.toContain('rgb(255 255 255 / 0.9)');
  });
});
