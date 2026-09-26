// alias-tables tests (explicit-props W2 task 2.5): the reserved-literal
// rejection (§0/§12 — `auto` and numbers SHALL NOT be remappable), the
// scale tables' agreement with §9.1's frozen key sets, the lockstep pin
// against the KERNEL engine's twin tables, and the motion map's
// anchor agreement (task 2.4's "map, don't reinvent").
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CONTAINER_SCALE,
  MOTION_ALIASES,
  MOTION_KERNEL_PRESETS,
  RADIUS_FACTOR_LADDER,
  SHAPE_LADDER,
  VIEWPORT_SCALE,
  compareQueryKeys,
  compareQueryKeyOrder,
  isValidAliasKey,
  motionPresetForCoefficient,
  parseQueryKey,
  validateAliasTable,
  validateAliasTables,
} from '../../src/universal-props/alias-tables.js';

const repoFile = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(`../../../../${rel}`, import.meta.url)), 'utf8');

describe('reserved-literal enforcement (§0/§12, task 2.1)', () => {
  it('rejects an `auto` remap, naming the axis, the key and the rule', () => {
    expect(() => validateAliasTable('size', ['small', 'auto'])).toThrowError(/'size'.*'auto'.*RESERVED LITERAL/s);
  });
  it('rejects a numeric alias key (the number lane is exact-value escape)', () => {
    expect(() => validateAliasTable('radius', ['small', '16'])).toThrowError(
      /'radius'.*'16'.*NUMBER lane/s,
    );
    expect(() => validateAliasTable('motion', ['-1'])).toThrowError(/NUMBER lane/);
  });
  it('accepts plain names', () => {
    expect(() => validateAliasTable('size', ['small', 'medium', 'large'])).not.toThrow();
  });
  it('isValidAliasKey mirrors the table gate', () => {
    expect(isValidAliasKey('auto')).toBe(false);
    expect(isValidAliasKey('42')).toBe(false);
    expect(isValidAliasKey('small')).toBe(true);
  });
  it('validateAliasTables() passes for the shipped defaults (generation-time gate)', () => {
    expect(() => validateAliasTables()).not.toThrow();
  });
});

describe('the registered scale tables (§9.1 keys / §15.5 values)', () => {
  it('viewport scale is exactly §9.1\'s ViewportScale with rem thresholds', () => {
    expect(Object.keys(VIEWPORT_SCALE)).toEqual(['xs', 'sm', 'md', 'lg']);
    expect(VIEWPORT_SCALE.sm).toBe(40); // research: viewport sm = 40rem ≠ container @sm 24rem
    expect(VIEWPORT_SCALE.xs).toBeLessThan(VIEWPORT_SCALE.sm);
  });
  it('container scale is exactly §9.1\'s ContainerScale with Tailwind v4\'s values', () => {
    expect(Object.keys(CONTAINER_SCALE)).toEqual(['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl']);
    expect(CONTAINER_SCALE['3xs']).toBe(16);
    expect(CONTAINER_SCALE.sm).toBe(24);
    expect(CONTAINER_SCALE.xl).toBe(36);
  });
  it('parseQueryKey: bare = media, @ = container, @scale/name carries the name', () => {
    expect(parseQueryKey('sm')).toMatchObject({ kind: 'media', minWidthRem: 40 });
    expect(parseQueryKey('@sm')).toMatchObject({ kind: 'container', minWidthRem: 24, containerName: undefined });
    expect(parseQueryKey('@sm/card')).toMatchObject({ kind: 'container', minWidthRem: 24, containerName: 'card' });
  });
  it('parseQueryKey: unknown scales and the empty container name', () => {
    expect(parseQueryKey('xl')).toBeNull(); // xl is container-only
    expect(parseQueryKey('@2xl')).toBeNull(); // 2xl is outside §9.1's ContainerScale
    expect(parseQueryKey('@md/')).toBe('empty-container-name'); // §9's parse rejection
  });
  it('compareQueryKeys orders narrow → wide by THRESHOLD (the default tables share no width)', () => {
    // authoring-order independence: any input order sorts to ONE ladder
    // (pure width order: @sm 24 · @md/card 28 · xs 30 · sm 40 · lg 64)
    const sorted = ['@md/card', 'lg', 'sm', '@sm', 'xs'].sort(compareQueryKeys);
    expect(sorted).toEqual(['@sm', '@md/card', 'xs', 'sm', 'lg']);
  });
  it('the SAME-WIDTH tie composes media first (container evaluated later → it wins)', () => {
    // a genuine tie needs a §15.5 threshold remap (the defaults share
    // no value), so the tie law is driven directly on the comparator
    const media = { kind: 'media' as const, minWidthRem: 48 };
    const container = { kind: 'container' as const, minWidthRem: 48 };
    expect(compareQueryKeyOrder(media, container)).toBe(-1);
    expect(compareQueryKeyOrder(container, media)).toBe(1);
    expect(compareQueryKeyOrder(media, { ...media, minWidthRem: 40 })).toBeGreaterThan(0);
  });
});

describe('the kernel-engine lockstep pin (the twin-tables law)', () => {
  it('the kernel engine mirrors these exact tables — a one-side drift is red', () => {
    const engine = repoFile('apps/www/src/lib/universal-props-query.svelte.ts');
    expect(engine).toContain('xs: 30,');
    expect(engine).toContain('sm: 40,');
    expect(engine).toContain('md: 48,');
    expect(engine).toContain('lg: 64,');
    expect(engine).toContain("'3xs': 16,");
    expect(engine).toContain("'2xs': 18,");
    expect(engine).toContain('xs: 20,');
    expect(engine).toContain('sm: 24,');
    expect(engine).toContain('md: 28,');
    expect(engine).toContain('lg: 32,');
    expect(engine).toContain('xl: 36,');
  });
  it('the schema artifact\'s §9.1 key sets agree with the scale tables', () => {
    const schema = repoFile('apps/www/src/lib/universal-props.schema.ts');
    expect(schema).toContain("type ViewportScale = 'xs' | 'sm' | 'md' | 'lg'");
    expect(schema).toContain("type ContainerScale = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'");
  });
});

describe('the §14 ladder data (§2 degrade table + the squircle ×2 law)', () => {
  it('round is itself at factor 1, both branches', () => {
    expect(RADIUS_FACTOR_LADDER.round).toEqual({ supported: 1, degraded: 1 });
    expect(SHAPE_LADDER.round).toEqual({ supported: 'round', degraded: 'round' });
  });
  it('squircle ×2 supported, ×1 degraded (the degrade reversal), alias → round', () => {
    expect(RADIUS_FACTOR_LADDER.squircle).toEqual({ supported: 2, degraded: 1 });
    expect(SHAPE_LADDER.squircle).toEqual({ supported: 'squircle', degraded: 'round' });
  });
  it('scoop|bevel|notch degrade to square (factor 0 = §3\'s inert radius)', () => {
    for (const shape of ['scoop', 'bevel', 'notch'] as const) {
      expect(SHAPE_LADDER[shape].degraded).toBe('square');
      expect(RADIUS_FACTOR_LADDER[shape]).toEqual({ supported: 1, degraded: 0 });
    }
  });
});

describe('the motion map (task 2.4 — map, don\'t reinvent)', () => {
  it('every normal preset is the kernel\'s own default verbatim', () => {
    expect(MOTION_KERNEL_PRESETS.normal).toEqual({
      surfaceMotionMs: 460, // surface-motion.ts DURATION_MS
      rippleMs: 600, // press ripple default
      pulseMs: 2500, // press pulse default
      shimmerMs: 4000, // press shimmer default speed
      smilPeriodScale: 1, // authored dur attributes untouched
    });
  });
  it('reduced collapses every kernel to the §8 jump/freeze', () => {
    expect(MOTION_KERNEL_PRESETS.reduced).toEqual({
      surfaceMotionMs: 0,
      rippleMs: 0,
      pulseMs: 0,
      shimmerMs: 0,
      smilPeriodScale: 0,
    });
  });
  it('the number lane agrees with the named anchors (the knot law)', () => {
    expect(motionPresetForCoefficient(1)).toEqual(MOTION_KERNEL_PRESETS.normal);
    expect(motionPresetForCoefficient(0.5)).toEqual(MOTION_KERNEL_PRESETS.subtle);
    expect(motionPresetForCoefficient(1.5)).toEqual(MOTION_KERNEL_PRESETS.expressive);
    expect(motionPresetForCoefficient(0)).toEqual(MOTION_KERNEL_PRESETS.reduced);
    expect(motionPresetForCoefficient(7)).toEqual(MOTION_KERNEL_PRESETS.reduced); // clamped
    expect(() => motionPresetForCoefficient(Number.NaN)).toThrow();
  });
  it('the motion alias intensity coefficients are the css vars\' values', () => {
    expect(MOTION_ALIASES).toEqual({ reduced: '0', subtle: '0.5', normal: '1', expressive: '1.5' });
  });
});
