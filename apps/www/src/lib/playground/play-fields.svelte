<!--
  PlayFields — the playground controls container: a single-column grid
  by default (multi-column is an explicit opt-in, minmax-guarded so the
  18–22rem playground sidebar never crushes a track). Owns the uid
  context every PlayRow derives its field id from.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import './playground.css';

  let {
    cols = 1,
    children,
  }: {
    /** 1 (default) | 2 — explicit; tracks are minmax(0,1fr) guarded */
    cols?: 1 | 2;
    children: Snippet;
  } = $props();

  setContext('jx-play-uid', { seq: 0 });
</script>

<div class="jx-play-fields" data-cols={cols}>
  {@render children()}
</div>
