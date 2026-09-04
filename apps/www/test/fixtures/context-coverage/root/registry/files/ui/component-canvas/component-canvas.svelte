<!--
  SYNTHETIC GATE FIXTURE — the bindable exemption shape: a $bindable
  page-owned density toggle (class d — instance semantics, never
  ambient). The whitelist entry (kind bindable) must hold: ZERO
  findings. Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }
  let { density = $bindable('default'), children }: Props = $props();
</script>

<section data-density={density}>{@render children()}</section>
