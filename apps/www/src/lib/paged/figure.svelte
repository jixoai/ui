<!--
  jixoai PagedFigure (paged-doc-family) — a numbered figure.

  The CSS counter renders "Figure N"; the registry entry (document
  order, synchronous init) lets PagedRef cite it by its stable id.
  Figures never split across pages (break-inside avoid) and may span
  the full composed width on the wide tier (they hold canvases).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { getPagedDoc } from './registry.svelte';

  interface Props {
    /** the caption line (rendered under the content) */
    caption?: string;
    /** the stable address a PagedRef can cite */
    id?: string;
    class?: string;
    children: Snippet;
  }

  let { caption, id, class: className = '', children }: Props = $props();

  const doc = getPagedDoc();
  let figureEl = $state<HTMLElement | undefined>(undefined);
  // registration is a mount-time contract (family-context law); the
  // stable id is deliberately captured once
  // svelte-ignore state_referenced_locally
  const unregister = doc?.register({ group: 'fig', id, element: () => figureEl });
  onDestroy(() => unregister?.());
</script>

<figure bind:this={figureEl} data-jx-paged-fig id={id} class={className}>
  {@render children()}
  {#if caption}
    <figcaption data-jx-paged-figcaption>{caption}</figcaption>
  {/if}
</figure>
