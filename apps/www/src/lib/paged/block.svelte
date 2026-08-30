<!--
  jxoai PagedBlock (paged-doc-family) — the generic keep-together
  container (synthesis §2: "PagedBlock 通用 avoid 容器"). Stamp
  `avoid` to keep the block unsplit across page breaks.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    avoid?: boolean;
    class?: string;
    children: Snippet;
  }

  let { avoid = false, class: className = '', children }: Props = $props();
</script>

<div data-jx-paged-block data-avoid={avoid || undefined} class={className}>
  {@render children()}
</div>
