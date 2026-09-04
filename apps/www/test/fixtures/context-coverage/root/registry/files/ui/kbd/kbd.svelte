<!--
  SYNTHETIC GATE FIXTURE — A1 counterexample: vocabulary-hit props with
  NO family defaults contract. Designed to FAIL verify-context-coverage
  (rule A1-family-defaults-missing, once per prop). Never imported; not
  in the real registry.
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

<kbd>{variant} {density} {@render children()}</kbd>
