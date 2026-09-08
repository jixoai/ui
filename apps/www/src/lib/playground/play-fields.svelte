<!--
  PlayFields — the playground controls container (kit unification,
  canvas-playground-dock 2026-09-08): the root is the SAME integrated
  ItemGroup the canvas dock composes (mode plain — the dock card / pane
  host owns the surface; controlChrome integrated — the B5 posture, the
  frame is the sole surface owner and in-row control shells dissolve),
  so snippet docks and schema docks read as one surface. The uid
  context every PlayRow derives its field id from is kept verbatim.
  cols stays an explicit opt-in: cols=2 rides the .jx-play-cols-2 class
  hook (a tiny residue grid rule in playground.css); cols=1 (the
  default everywhere) gets the ItemGroup rhythm for free.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { ItemGroup } from '$lib/ui/list-item';
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

<ItemGroup
  mode="plain"
  controlChrome="integrated"
  data-cols={cols}
  class={cols === 2 ? 'jx-play-cols-2' : ''}
>
  {@render children()}
</ItemGroup>
