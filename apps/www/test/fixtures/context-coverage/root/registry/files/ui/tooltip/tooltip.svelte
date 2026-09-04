<!--
  SYNTHETIC GATE FIXTURE — tooltip consumer, legal shape (the violation
  lives in tooltip-defaults.svelte.ts: defineAxisSlot imported and called
  on the ui side). Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { TooltipDefaults } from './tooltip-defaults.svelte';

  interface Props {
    tone?: 'neutral' | 'invert';
    children: Snippet;
  }
  let { tone, children }: Props = $props();

  const d = $derived(TooltipDefaults.resolve({ tone }));
</script>

<span data-tone={d.tone}>{@render children()}</span>
