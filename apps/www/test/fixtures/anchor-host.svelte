<!--
  Test host for the anchor family contract (composition-first,
  2026-08-25): a two-item rail with a conditionally inserted third
  item (the DOM-delegated spy must pick it up with no registration)
  and a child()-escape item receiving the merged anchor props.
-->
<script lang="ts">
  import Anchor from '../../src/lib/ui/anchor/anchor.svelte';
  import AnchorItem from '../../src/lib/ui/anchor/anchor-item.svelte';
  import { cn } from '../../src/lib/utils';

  let showThird = $state(false);
</script>

<button data-testid="toggle" onclick={() => (showThird = !showThird)}>toggle third</button>

<div data-testid="rail">
  <Anchor offset={96}>
    <AnchorItem href="#one">One</AnchorItem>
    <AnchorItem href="#two">Two</AnchorItem>
    {#if showThird}
      <AnchorItem href="#three">Three</AnchorItem>
    {/if}
  </Anchor>
</div>

<div data-testid="child-escape">
  <Anchor>
    <AnchorItem href="#one">
      {#snippet child({ props })}
        <a {...props} class={cn(props.class, 'text-primary')}>One</a>
      {/snippet}
    </AnchorItem>
  </Anchor>
</div>
