<!--
  SYNTHETIC GATE FIXTURE — chip consumer, legal shape (the violation
  lives in chip-defaults.svelte.ts: a bare function slot). Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChipDefaults } from './chip-defaults.svelte';

  interface Props {
    variant?: 'fill' | 'tonal' | 'outline' | 'ghost';
    children: Snippet;
  }
  let { variant, children }: Props = $props();

  const d = $derived(ChipDefaults.resolve({ variant }));
</script>

<span data-variant={d.variant}>{@render children()}</span>
