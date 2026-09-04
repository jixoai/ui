/**
 * jixoai print plugins (lib/print/context-plugin.ts, print-pipeline,
 * 2026-08-30) — the context-plugin kernel's FIRST REAL CONSUMER.
 *
 * Hook contract (proposal §5, r6 CLOSED): **filter** (the reversible
 * medium gate — the preparatory stamp has landed before the filters
 * open) + **before** (the live-tree interventions) — and **no init**
 * (the print layer injects no defaults; it only projects).
 *
 * Two plugins because a plugin's targets tuple carries ONE def
 * (the kernel's type-level single-target identity law): targets bind
 * DEF OBJECTS (identity matching, context-plugin-v2) — the hook value
 * types flow from each def (`Density | undefined` / `number`).
 *
 *   density  → the EXISTING `sm` tier. No invented paper tier — the
 *              four-tier law holds (design.md «density 接线点与值域»);
 *              the entry point is resolveDensity's TERMINAL value.
 *   hue      → pinned to the def's default. The hue adapter
 *              (hue-runtime's context endorsement) is what makes
 *              "pin" expressible at all: the raw wall-clock writer
 *              keeps writing, the chained projection stays constant,
 *              and the documentElement stamp stops moving (the
 *              dedup law does the rest).
 *
 * Immutability: both `before` hooks return scalars — nothing to
 * mutate; the kernel additionally stores raw with $state.raw so
 * reference identity survives the whole trip.
 *
 * MOTION IS NOT HERE: the animation freeze is the prepareSnapshot
 * transaction's scoped protocol (freeze.svelte.ts), never a plugin —
 * animation owners need no retrofit.
 */

import { definePlugin, type ContextEnv } from '../context-plugin.svelte';
import { isPrintProjection } from '../medium.svelte';
import { DENSITY_DEF, type Density } from '../density.svelte';
import { HUE_DEF } from '../hue-runtime.svelte';

/**
 * The medium gate — shared by both plugins: open under sim AND under
 * real print (the preparatory stamp / the print dialog both flip the
 * derived medium off 'screen'; the gate is reversible so screen→
 * print→screen round-trips restore the raw values by re-derivation).
 */
export const printMediumGate = (_def: unknown, env: ContextEnv): boolean =>
  isPrintProjection(env.medium);

/** the density intervention: any resolved density → the existing sm tier */
export const printDensityPlugin = definePlugin({
  name: 'jx-print-density',
  targets: [DENSITY_DEF],
  filter: printMediumGate,
  before: (value: Density | undefined): Density => {
    void value; // the print projection does not care where density came from
    return 'sm';
  },
});

/**
 * The hue pin value — the 'hue' def's OWN default, one source of
 * truth (if the def's default ever changes, the pin follows; the
 * wall-clock writer keeps running raw the whole time).
 */
export const PRINT_PINNED_HUE: number = HUE_DEF.defaults();

/** the hue intervention: pin the chained projection to the def default */
export const printHuePlugin = definePlugin({
  name: 'jx-print-hue',
  targets: [HUE_DEF],
  filter: printMediumGate,
  before: (value: number): number => {
    void value; // the wall-clock writer keeps writing raw; the projection pins
    return PRINT_PINNED_HUE;
  },
});

/** the plugin set the print layer's root provides (parent-first order) */
export const printPlugins = Object.freeze([printDensityPlugin, printHuePlugin]);
