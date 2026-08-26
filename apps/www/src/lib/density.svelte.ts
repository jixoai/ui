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
  /** the inherited OPINION — undefined means this provider passes NO
      opinion down (chrome-density-tier r3, Codex r2 P1): consumers'
      resolveDensity chains treat it exactly like a missing context,
      so a chrome-composed bar never manufactures an inherited
      opinion; the getter keeps the pair reactive under rerenders */
  readonly density: Density | undefined;
}

export const DENSITY_KEY = Symbol('jx-density');

export function resolveDensity(
  explicit: Density | undefined,
  inherited: DensityContext | undefined,
  fallback: Density = DEFAULT_DENSITY,
): Density {
  // explicit -> inherited -> LOCAL fallback. The fallback never
  // shadows inherited context (design-language: a Table defaults sm
  // only when NO parent provider exists)
  return explicit ?? inherited?.density ?? fallback;
}

export function getDensityContext(): DensityContext | undefined {
  return getContext<DensityContext | undefined>(DENSITY_KEY);
}

export function provideDensity(density: () => Density | undefined): DensityContext {
  const context: DensityContext = {
    get density() {
      return density();
    },
  };
  setContext(DENSITY_KEY, context);
  return context;
}
