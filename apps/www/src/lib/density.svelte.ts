/**
 * jixoai density context (registry/files/lib/density.svelte.ts,
 * design-language-kernel §2, 2026-08-26).
 *
 * The Svelte channel of the two-channel density contract: policy
 * resolution ONLY — no pixels, no style writes, no cn(). Providers
 * wrap this once (getter-backed, one stable object); consumers
 * resolve their OPINION (`explicit ?? inherited ?? local fallback`)
 * and stamp `data-density` ONLY when one exists — no opinion stamps
 * NOTHING so the css scope channel (ambient [data-density]
 * ancestors, the root default) keeps flowing through the subtree
 * (fleet law 2026-08-28, generalizing the chrome-density-tier nav
 * ruling: a manufactured 'default' stamp re-scopes the element and
 * cuts off ambient inheritance). The css scope channel lives in the
 * theme sheet.
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
  fallback?: Density,
): Density | undefined {
  // explicit -> inherited -> optional LOCAL fallback. No opinion
  // resolves to undefined: the consumer stamps nothing and the
  // ambient css scope channel flows through (a local fallback, when
  // given, is a real opinion — e.g. Table defaults sm only when NO
  // parent provider exists)
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
