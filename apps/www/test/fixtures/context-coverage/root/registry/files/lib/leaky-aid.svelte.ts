// SYNTHETIC GATE FIXTURE — A5 counterexample: a registry/files/lib file
// importing the ui tree. BOTH forms must be caught by the static import
// graph check (the alias form and the relative-resolved form). Designed
// to FAIL verify-context-coverage.
import { BadgeDefaults } from '$lib/ui/badge/badge-defaults.svelte';
import type { BadgeVariant } from './ui/badge/badge.svelte';

export function leaky(): typeof BadgeDefaults {
  throw new Error('synthetic fixture');
}
export type LeakyTwin = BadgeVariant;
