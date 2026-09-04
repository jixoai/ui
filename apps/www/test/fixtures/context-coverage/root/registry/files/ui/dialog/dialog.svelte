<!--
  SYNTHETIC GATE FIXTURE — dialog consumer, legal shape (the violation
  lives in dialog-defaults.svelte.ts: literalSlot without explicit type
  arguments). Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { DialogDefaults } from './dialog-defaults.svelte';

  interface Props {
    variant?: 'solid' | 'acrylic' | 'auto';
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }
  let { variant, density, children }: Props = $props();

  const d = $derived(DialogDefaults.resolve({ variant, density }));
</script>

<dialog data-variant={d.variant} data-density={d.density}>{@render children()}</dialog>
