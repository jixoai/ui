<!--
  Fixture host (test/fixtures/prototype-family-host.svelte,
  layout-family-alpha 2026-09-11): real snippet children through each
  family member — the children-render law asserts actual child DOM,
  not a stubbed snippet.
-->
<script lang="ts">
  import PrototypeFlex from '$lib/ui/prototype-flex/prototype-flex.svelte';
  import PrototypeGrid from '$lib/ui/prototype-grid/prototype-grid.svelte';
  import PrototypeWaterfall from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte';

  let { which = 'flex' }: { which?: 'flex' | 'grid' | 'waterfall' } = $props();
</script>

{#if which === 'flex'}
  <PrototypeFlex data-testid="root">
    <span>first</span>
    <span>second</span>
  </PrototypeFlex>
{:else if which === 'grid'}
  <PrototypeGrid data-testid="root">
    <span>one</span>
    <span>two</span>
  </PrototypeGrid>
{:else}
  <PrototypeWaterfall data-testid="root">
    <article>one</article>
    <article>two</article>
  </PrototypeWaterfall>
{/if}
