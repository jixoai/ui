<!--
  SYNTHETIC GATE FIXTURE — A1 counterexample AND the --scope=pilot probe:
  identical violation shape to kbd, but 'spin' is NOT in the pilot
  families list — full scope reports it, pilot scope must stay silent
  about it. Designed to FAIL in full mode only. Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'tonal' | 'outline';
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }
  let { variant, density, children }: Props = $props();
</script>

<span class="spin" data-density={density}>{variant} {@render children()}</span>
