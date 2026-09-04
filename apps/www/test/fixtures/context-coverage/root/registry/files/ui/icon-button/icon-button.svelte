<!--
  SYNTHETIC GATE FIXTURE — the passthrough exemption shape: variant is
  forwarded verbatim to PressButton's own contract (kind passthrough
  whitelist entry). ZERO findings expected. Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '../press-button/press-button.svelte';

  interface Props {
    variant?: 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
    children: Snippet;
  }
  let { variant, children }: Props = $props();
</script>

<PressButton {variant} square>{@render children()}</PressButton>
