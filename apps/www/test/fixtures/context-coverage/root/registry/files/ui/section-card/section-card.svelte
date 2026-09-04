<!--
  SYNTHETIC GATE FIXTURE — the roadmap exemption shape: a class-c
  vocabulary hit (shape) registered against the future shape axis
  (kind roadmap + targetAxis). ZERO findings expected. Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    shape?: 'square' | 'bevel';
    children: Snippet;
  }
  let { shape = 'square', children }: Props = $props();
</script>

<section data-shape={shape}>{@render children()}</section>
