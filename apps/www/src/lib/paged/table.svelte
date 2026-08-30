<!--
  jixoai PagedTable (paged-doc-family) — the split-safe table.

  A native table (thead/tbody authored by the consumer as children —
  composition-first); the family's print projection repeats thead
  across page breaks and never splits a row. `minTail` is
  pagedjs-engine vocabulary (the minimum trailing rows a break must
  leave) — the native engine has no layout feedback and ignores it.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** pagedjs-engine vocabulary — ignored by the native engine */
    minTail?: number;
    class?: string;
    children: Snippet;
  }

  let { minTail, class: className = '', children }: Props = $props();
  // the threshold the native engine cannot honor (no layout
  // feedback) — vocabulary only, deliberately captured once
  // svelte-ignore state_referenced_locally
  void minTail;
</script>

<table data-jx-paged-table class={className}>
  {@render children()}
</table>
