/**
 * jixoai density context (registry/files/lib/density.svelte.ts,
 * design-language-kernel §2, 2026-08-26).
 *
 * The Svelte channel of the two-channel density contract: policy
 * resolution ONLY — no pixels, no style writes, no cn(). Providers
 * wrap this once (getter-backed, one stable object); consumers
 * resolve `explicit ?? inherited ?? 'default'` and stamp
 * `data-density` (the css scope channel lives in the theme sheet).
 */

import { getContext, setContext } from 'svelte';

export type Density = 'lg' | 'default' | 'sm' | 'xs';

export const DEFAULT_DENSITY: Density = 'default';

export interface DensityContext {
  readonly density: Density;
}

export const DENSITY_KEY = Symbol('jx-density');

export function resolveDensity(
  explicit: Density | undefined,
  inherited: DensityContext | undefined,
): Density {
  return explicit ?? inherited?.density ?? DEFAULT_DENSITY;
}

export function getDensityContext(): DensityContext | undefined {
  return getContext<DensityContext | undefined>(DENSITY_KEY);
}

export function provideDensity(density: () => Density): DensityContext {
  const context: DensityContext = {
    get density() {
      return density();
    },
  };
  setContext(DENSITY_KEY, context);
  return context;
}
