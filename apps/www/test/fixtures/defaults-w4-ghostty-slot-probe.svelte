<!--
  defaults-w4-ghostty-slot-probe — test fixture
  (context-defaults-economy task 3.4, 2026-09-03).

  The ghostty family's slot-only window: resolves
  GhosttyTermDefaults inside a REAL $derived of a REAL component
  instance, so the ambient read lands on whatever density provider
  encloses this probe (the wasm component itself stays
  ghostty-term.spec.ts's territory — here the family OWN 'default'
  and its ambient awareness are the target). The host mounts it
  inside DensityProvider; the slot's own 'default' shows only when
  NO provider encloses it.
-->
<script lang="ts">
  import { GhosttyTermDefaults } from '$lib/ui/ghostty-term/ghostty-term-defaults.svelte';

  const d = $derived(GhosttyTermDefaults.resolve({}));
</script>

<span data-testid="ghostty-slot-probe" data-slot-density={d.density}></span>
