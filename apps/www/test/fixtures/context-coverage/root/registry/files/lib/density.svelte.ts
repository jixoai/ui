// SYNTHETIC GATE FIXTURE — minimal stand-in for the REAL registry/files/
// lib/density.svelte.ts (existing axis module). Signatures only; never
// imported, never executed. resolveDensity/getDensityContext here are the
// legacy helpers whose consumer-side occurrences the gate bans.
import type { DefaultsSlot } from './defaults.svelte';

export type Density = 'lg' | 'default' | 'sm' | 'xs';

export function densitySlot(own?: Density): DefaultsSlot<Density | undefined> {
  throw new Error('synthetic fixture');
}
export function resolveDensity(
  explicit: Density | undefined,
  inherited: { density?: Density } | undefined,
  fallback?: Density,
): Density | undefined {
  throw new Error('synthetic fixture');
}
export function getDensityContext(): { density?: Density } | undefined {
  throw new Error('synthetic fixture');
}
export function provideDensity(density: () => Density | undefined): { density?: Density } {
  throw new Error('synthetic fixture');
}
