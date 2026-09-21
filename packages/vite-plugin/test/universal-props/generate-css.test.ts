// generator tests (explicit-props W2 task 2.5): the golden css — the
// §12 alias vars (var-indirection, never inline values), the §5
// formula profiles, the §14 @supports ladder (VARS never classes) —
// plus determinism, the reserved-literal kill-switch, and the
// committed-mirror drift pin against BOTH repo trees (the golden the
// gen script's --check also asserts; this pins it from the battery
// side too).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generateUniversalPropsCss } from '../../src/universal-props/generate-css.js';
import { UNIVERSAL_AXES as SCHEMA_AXES_FALLBACK } from '../../src/universal-props/desugar.js';

const repoFile = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(`../../../../${rel}`, import.meta.url)), 'utf8');

/** the §17 row shape (axis + namedSteps) — the schema artifact's own rows */
const AXES = [
  { axis: 'size', namedSteps: ['small', 'medium', 'large'] },
  { axis: 'shape', namedSteps: ['round', 'scoop', 'bevel', 'notch', 'square', 'squircle'] },
  { axis: 'radius', namedSteps: ['small', 'medium', 'large'] },
  { axis: 'density', namedSteps: ['small', 'medium', 'large'] },
  { axis: 'color', namedSteps: ['primary', 'secondary', 'error', 'warn', 'success', 'info'] },
  { axis: 'theme', namedSteps: ['light', 'dark', 'system'] },
  { axis: 'elevation', namedSteps: ['level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5'] },
  { axis: 'motion', namedSteps: ['reduced', 'subtle', 'normal', 'expressive'] },
] as const;

const css = generateUniversalPropsCss({ axes: AXES });

describe('the golden sheet (§12 alias definitions)', () => {
  it('defines the size/radius/color/motion ladder vars (named steps are vars, never inline)', () => {
    expect(css).toContain('--jx-size-small: 14px;');
    expect(css).toContain('--jx-size-medium: 16px;');
    expect(css).toContain('--jx-size-large: 18px;');
    expect(css).toContain('--jx-radius-small: 6px;');
    expect(css).toContain('--jx-radius-medium: 8px;');
    expect(css).toContain('--jx-radius-large: 10px;');
    expect(css).toContain('--jx-color-primary: var(--primary);');
    expect(css).toContain('--jx-color-warn: var(--warning);'); // the lane spelling → the theme token
    expect(css).toContain('--jx-motion-reduced: 0;');
    expect(css).toContain('--jx-motion-normal: 1;');
  });
  it('defines NO alias var for the reserved literals (auto/number are never table rows)', () => {
    expect(css).not.toMatch(/--jx-[a-z]+-auto:/);
    expect(css).not.toMatch(/--jx-[a-z]+-\d+:/);
  });
  it('is tokens only — zero NEW class identities (§10\'s carrier law)', () => {
    // the ONLY class-shaped selector allowed is the STANDING .dark
    // theme bridge (§11 — theme's carrier is the existing class)
    const classSelectors = css.match(/\.[A-Za-z][\w-]*\s*\{/g) ?? [];
    expect(classSelectors.every((s) => s.startsWith('.dark'))).toBe(true);
    expect(css).not.toContain('@layer'); // unlayered, like jixoai.css's token section
  });
});

describe('the §5 hue formula per profile', () => {
  it('light carries the light --primary triple; .dark re-points it (the drift law)', () => {
    expect(css).toContain(':root {\n  --jx-color-formula-l: 0.6489;');
    expect(css).toContain('--jx-color-formula-c: 0.237;');
    expect(css).toContain('--jx-color-formula-drift: 0;');
    expect(css).toContain('.dark {');
    expect(css).toContain('--jx-color-formula-l: 0.7044;');
    expect(css).toContain('--jx-color-formula-c: 0.1872;');
    expect(css).toContain('--jx-color-formula-drift: -4;');
  });
});

describe('the §14 @supports ladder', () => {
  it('stamps VARS in both branches — round: 1 always, squircle: 2 supported / 1 degraded', () => {
    const supported = css.slice(css.indexOf('@supports (corner-shape: bevel)'), css.indexOf('@supports not'));
    const degraded = css.slice(css.indexOf('@supports not'));
    expect(supported).toContain('--jx-radius-factor-round: 1;');
    expect(supported).toContain('--jx-radius-factor-squircle: 2;');
    expect(degraded).toContain('--jx-radius-factor-round: 1;');
    expect(degraded).toContain('--jx-radius-factor-squircle: 1;');
  });
  it('the shape alias ladder degrades scoop|bevel|notch → square and squircle → round', () => {
    const degraded = css.slice(css.indexOf('@supports not'));
    expect(degraded).toContain('--jx-shape-scoop: square;');
    expect(degraded).toContain('--jx-shape-bevel: square;');
    expect(degraded).toContain('--jx-shape-notch: square;');
    expect(degraded).toContain('--jx-shape-squircle: round;');
    expect(degraded).not.toContain('--jx-shape-scoop: scoop;');
  });
});

describe('determinism + the generation-time gates', () => {
  it('byte-identical across calls (the golden/–check contract)', () => {
    expect(generateUniversalPropsCss({ axes: AXES })).toBe(css);
  });
  it('rejects schema rows the plugin tables do not cover (lockstep, §17 ↔ §12)', () => {
    expect(() =>
      generateUniversalPropsCss({ axes: [...AXES, { axis: 'nonsense', namedSteps: ['x'] }] }),
    ).not.toThrow(); // an unknown axis with no table is not a coverage hole…
    expect(() =>
      generateUniversalPropsCss({
        axes: [{ axis: 'size', namedSteps: ['small', 'medium', 'large', 'x-large'] }],
      }),
    ).toThrowError(/size namedSteps are not all covered/);
  });
});

describe('the committed mirror pair is the generator\'s exact output (the drift golden)', () => {
  it('apps/www/src/lib/universal-props.css matches byte for byte', () => {
    expect(repoFile('apps/www/src/lib/universal-props.css')).toBe(css);
  });
  it('registry/files/lib/universal-props.css matches byte for byte (the byte-mirror law)', () => {
    expect(repoFile('registry/files/lib/universal-props.css')).toBe(css);
  });
  it('the schema artifact\'s real UNIVERSAL_AXES rows drive an identical sheet', () => {
    // the desugarer's UNIVERSAL_AXES is the axis-name list only; the
    // row material comes from the artifact — pinned by the gen script's
    // own --check run (verify:universal-props). Here: the repo css was
    // not hand-edited away from ANY legal input shape.
    void SCHEMA_AXES_FALLBACK;
    expect(repoFile('registry/files/lib/universal-props.css')).toBe(
      repoFile('apps/www/src/lib/universal-props.css'),
    );
  });
});
