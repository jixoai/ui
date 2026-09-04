<!--
  SYNTHETIC GATE FIXTURE — A3 counterexample ("a legacy helper bypass"):
  the consumer still calls resolveDensity/getDensityContext inline
  instead of reading through the family Defaults — the loose legacy
  chain. Designed to FAIL the banned-channel check (two occurrences).
  The Defaults contract itself is legal (sheet-defaults.svelte.ts).
  Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, resolveDensity } from '$lib/density.svelte';
  import { SheetDefaults } from './sheet-defaults.svelte';

  interface Props {
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }
  let { density, children }: Props = $props();

  // the loose legacy chain — bypasses the single read point
  const wrong = resolveDensity(density, getDensityContext());

  const d = $derived(SheetDefaults.resolve({ density }));
</script>

<aside data-density={d.density ?? wrong}>{@render children()}</aside>
