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

// ---- the context-plugin seam (context-plugin-system, 2026-08-30) ---------
// resolveDensity's TERMINAL value (explicit ?? inherited ?? fallback,
// after resolution) is the one entry plugins get: the print story maps
// any resolved density onto the EXISTING sm tier (no invented paper
// tier — the four-tier law holds). This module is a byte-mirrored
// registry item that must keep installing whole, so it takes NO kernel
// import: the plugin scope rides Svelte's context under the GLOBAL
// symbol the kernel (site-only lib/context-plugin.svelte.ts) provides
// roots under, and the scope below is its structural view. No kernel →
// no scope → resolveDensity is the identity (registry consumers, unit
// calls outside a component). The scope is root-scoped and stacks in
// Svelte's context map — never a module-level registry.
const PLUGIN_SCOPE_KEY = Symbol.for('jx-context-plugins');

interface PluginScopeSeam {
  readonly chain: readonly { readonly targets: readonly string[] }[];
  readonly env: unknown;
  apply(def: { readonly key: string }, value: unknown): unknown;
}

/** the density def — structurally the kernel's ContextDef<'density',
 *  Density> without importing it (mirror law; zero dependencies) */
const DENSITY_DEF = {
  key: 'density',
  defaults: (): Density => DEFAULT_DENSITY,
  ssrSafe: DEFAULT_DENSITY,
} as const;

function pluginScope(): PluginScopeSeam | undefined {
  try {
    return getContext<PluginScopeSeam | undefined>(PLUGIN_SCOPE_KEY);
  } catch {
    // outside a component initialisation (pure unit calls) there is
    // no plugin root — the identity path
    return undefined;
  }
}

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
  const resolved = explicit ?? inherited?.density ?? fallback;
  // the plugin entry: the chained projection of the terminal value.
  // Reading the scope here (inside the consumer's $derived) keeps the
  // chain reactive — filter/before hooks that read env (e.g. the
  // medium) re-run the resolution when the medium flips. The scope's
  // chain was composed once at its plugin root; this is a lookup, not
  // a recomposition. No scope / no targeting plugin → identity fast
  // path: no hook runs, the reference passes through untouched.
  const scope = pluginScope();
  if (scope === undefined) return resolved;
  return scope.apply(DENSITY_DEF, resolved) as Density | undefined;
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
