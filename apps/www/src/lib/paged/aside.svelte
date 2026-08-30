<!--
  jixoai PagedAside (paged-doc-family) — the Tufte margin note.

  Wide tier: floats into the margin column beside the measure (the
  negative-margin escape the prototype verified). Narrow tier — real
  narrow viewports via PagedDoc's measured width tier, forced
  columns="1", or print — it SINKS to an inset inline block. The pose
  is a stamped data attribute (observable DOM state: jsdom tests and
  the probe assert it), derived from the doc context's width tier.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { getPagedDoc } from './registry.svelte';

  interface Props {
    /** the stable address a PagedRef can cite */
    id?: string;
    class?: string;
    children: Snippet;
  }

  let { id, class: className = '', children }: Props = $props();

  const doc = getPagedDoc();
  let asideEl = $state<HTMLElement | undefined>(undefined);
  // registration is a mount-time contract (family-context law); the
  // stable id is deliberately captured once
  // svelte-ignore state_referenced_locally
  const unregister = doc?.register({ group: 'note', id, element: () => asideEl });
  onDestroy(() => unregister?.());

  const pose = $derived(doc?.width === 'narrow' ? 'sink' : 'float');
</script>

<aside bind:this={asideEl} data-jx-paged-aside data-pose={pose} id={id} class={className}>
  {@render children()}
</aside>
