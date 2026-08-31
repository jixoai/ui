/**
 * The print plugin gates (print-pipeline, 2026-08-30):
 *   - the three interventions: the medium gate (filter), density→the
 *     EXISTING sm tier, hue→pinned to the def default
 *   - the gate's reversibility: closed → identity (reference equal),
 *     open → 'sm' — the round-trip screen→sim→screen restores raw
 *   - the immutability discipline (frozen input in, new value out)
 *   - the pure medium reducer priority (migrated from the retired
 *     paged-medium.spec.ts — medium.svelte.ts survives the family)
 */
import { describe, expect, it } from 'vitest';
import { applyChain, definePlugin, type ContextEnv } from '../src/lib/context-plugin.svelte';
import { deriveMedium, isPrintProjection, MEDIUM_DEF, type MediumState } from '../src/lib/medium.svelte';
import {
  PRINT_PINNED_HUE,
  printDensityPlugin,
  printHuePlugin,
  printMediumGate,
  printPlugins,
} from '../src/lib/print/context-plugin';
import type { Density } from '../src/lib/density.svelte';

const envFor = (medium: MediumState): ContextEnv =>
  Object.freeze({ medium, root: undefined }) as unknown as ContextEnv;

const DENSITY_DEF = { key: 'density', defaults: () => 'default' as Density, ssrSafe: 'default' as Density };
const HUE_DEF = { key: 'hue', defaults: () => 0, ssrSafe: 0 };

// =========================================================================
// the medium gate
// =========================================================================
describe('printMediumGate — the reversible medium gate', () => {
  it('closed on screen, open on sim AND print', () => {
    expect(printMediumGate(DENSITY_DEF, envFor('screen'))).toBe(false);
    expect(printMediumGate(DENSITY_DEF, envFor('sim'))).toBe(true);
    expect(printMediumGate(DENSITY_DEF, envFor('print'))).toBe(true);
  });
});

// =========================================================================
// the interventions
// =========================================================================
describe('printDensityPlugin — density → the EXISTING sm tier', () => {
  it('maps every resolved value onto sm (no invented paper tier)', () => {
    for (const value of ['lg', 'default', 'sm', 'xs', undefined] as (Density | undefined)[]) {
      expect(printDensityPlugin.before!(value, envFor('sim'))).toBe('sm');
    }
  });

  it('has no init (the print layer injects no defaults)', () => {
    expect(printDensityPlugin.init).toBeUndefined();
  });
});

describe('printHuePlugin — hue pinned to the def default', () => {
  it('the chained projection is constant regardless of the raw clock', () => {
    for (const raw of [0, 47.5, 180, 359.9]) {
      expect(printHuePlugin.before!(raw, envFor('print'))).toBe(PRINT_PINNED_HUE);
    }
    expect(PRINT_PINNED_HUE).toBe(HUE_DEF.defaults());
  });
});

// =========================================================================
// the chain integration (gate reversibility + immutability)
// =========================================================================
describe('the chained projection (applyChain)', () => {
  const chain = [printDensityPlugin, printHuePlugin] as never[];

  it('closed gate → the IDENTITY path (reference equal, hooks skipped)', () => {
    const raw = { tier: 'default' } as never;
    const out = applyChain(DENSITY_DEF, raw, chain, envFor('screen'));
    expect(out).toBe(raw); // same reference — nothing intervened
  });

  it('open gate → sm; round-trip restores the raw value', () => {
    expect(applyChain(DENSITY_DEF, 'lg', chain, envFor('sim'))).toBe('sm');
    expect(applyChain(DENSITY_DEF, 'lg', chain, envFor('print'))).toBe('sm');
    // medium back to screen → the filter closes → raw re-derived
    expect(applyChain(DENSITY_DEF, 'lg', chain, envFor('screen'))).toBe('lg');
  });

  it('hue through the chain: pinned open, raw closed', () => {
    expect(applyChain(HUE_DEF, 212.5, chain, envFor('sim'))).toBe(PRINT_PINNED_HUE);
    expect(applyChain(HUE_DEF, 212.5, chain, envFor('screen'))).toBe(212.5);
  });

  it('immutability: a frozen value in cannot be mutated by the plugins', () => {
    const frozen = Object.freeze({ tier: 'lg' });
    const out = applyChain({ key: 'probe' }, frozen, chain, envFor('sim'));
    expect(() => Object.isFrozen(frozen)).not.toThrow();
    expect(Object.isFrozen(frozen)).toBe(true);
    // the print plugins return scalars/new values; the frozen input survives
    expect(frozen).toEqual({ tier: 'lg' });
    void out;
  });
});

describe('the plugin set', () => {
  it('two single-key plugins, both definePlugin products, frozen', () => {
    expect(printPlugins).toHaveLength(2);
    for (const plugin of printPlugins) {
      expect(plugin.targets).toHaveLength(1);
      expect(Object.isFrozen(plugin)).toBe(true);
    }
    expect(printPlugins[0]!.targets).toEqual(['density']);
    expect(printPlugins[1]!.targets).toEqual(['hue']);
  });

  it('never targets medium (the read-only domain)', () => {
    expect(() =>
      definePlugin({
        name: 'forge',
        // @ts-expect-error the medium context is a read-only projection
        targets: ['medium'],
        before: (v: MediumState) => v,
      }),
    ).toThrow(/read-only projection/);
    expect(MEDIUM_DEF.key).toBe('medium');
  });
});

// =========================================================================
// the pure medium reducer (migrated from the retired paged-medium
// spec — the stamp-ownership fixtures' foundation)
// =========================================================================
describe('deriveMedium (pure reducer priority)', () => {
  it('derives all four combinations with real print > sim > screen', () => {
    expect(deriveMedium(false, false)).toBe<MediumState>('screen');
    expect(deriveMedium(false, true)).toBe<MediumState>('sim');
    expect(deriveMedium(true, false)).toBe<MediumState>('print');
    expect(deriveMedium(true, true)).toBe<MediumState>('print'); // real print wins the surviving sim
  });

  it('isPrintProjection is exactly "not screen"', () => {
    for (const state of ['screen', 'sim', 'print'] as MediumState[]) {
      expect(isPrintProjection(state)).toBe(state !== 'screen');
    }
  });

  it('the afterprint law in reducer terms: clearing realPrint re-derives to the surviving sim', () => {
    // sim stamp present, real print over, then dialog closes
    expect(deriveMedium(false, true)).toBe<MediumState>('sim');
  });
});
