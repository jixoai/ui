<!--
  jixoai scaffold float portal (registry/files/ui/scaffold-float.svelte).
  The consumer-side half of the float provider: renders its children into
  the website scaffold's top layer (.jx-top-layer) through a real portal — the
  child nodes are created here (full Svelte ownership) and adopted into
  the provider's insertion point on mount; teardown returns them.

  Grid era (2026-08-23): adoption takes a semantic `area` role — the
  scaffold's grid resolves the physical cell per container form ('float'
  = the stage area, the free-form default). The immersive law is per
  zone; un-roled floats stay on screen by default.

  Consumes the shared `jx-top-layer` context (Owner request, 2026-08-23):
  ONE adoption mechanism for the float plane — the toc's and tree-nav's
  automatic top-layer mounts use the same contract.

  API:
    <ScaffoldFloat area="float">
      …anything that should stick to the chrome plane…
    </ScaffoldFloat>
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { TopLayerArea, TopLayerApi } from './website-scaffold.svelte';

  interface Props {
    children: Snippet;
    /** semantic placement role; the shell grid resolves the cell */
    area?: TopLayerArea;
  }

  let { children, area = 'float' }: Props = $props();

  const api = getContext<TopLayerApi>('jx-top-layer');

  let contentEl = $state<HTMLElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!contentEl) return;
    // capture: the narrowed $state can't cross the teardown closure
    const content = contentEl;
    const role = area;
    const release = api.adopt(content, { area: role });
    return () => {
      release();
      // return the nodes to the anchor so Svelte teardown finds them
      anchorEl?.appendChild(content);
    };
  });
</script>

<!-- hidden anchor in place (preserves the authoring DOM position) -->
<div data-jx-float-anchor bind:this={anchorEl} aria-hidden="true"></div>

<!-- the actual float content: starts here, gets adopted into .jx-top-layer -->
<div data-jx-float-content bind:this={contentEl}>
  {@render children()}
</div>
