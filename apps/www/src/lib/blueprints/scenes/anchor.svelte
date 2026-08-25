<!-- anchor blueprint: the fragment-link rail beside the very headings it
     tracks — real ids, real links; the shared scroll-spy paints the
     active pick (first heading at this scroll position). -->
<script lang="ts">
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import AnchorItem from '$lib/ui/anchor/anchor-item.svelte';
</script>

<div class="grid h-full w-full grid-cols-[minmax(0,1fr)_11rem] items-start gap-8 p-10">
  <div class="flex min-w-0 flex-col gap-3">
    <h2 id="bp-anchor-what" class="font-mono text-sm">what it does</h2>
    <p class="text-muted-foreground text-sm leading-6">
      nav of real fragment links — native navigation, native smooth scrolling, no second pick
      algorithm.
    </p>
    <h2 id="bp-anchor-pick" class="mt-2 font-mono text-sm">the line pick</h2>
    <p class="text-muted-foreground text-sm leading-6">
      the active link follows the one shared scroll-spy: which section owns the pick line.
    </p>
    <h2 id="bp-anchor-lease" class="mt-2 font-mono text-sm">the lease</h2>
    <p class="text-muted-foreground text-sm leading-6">
      scroll-margin-top is set on demand and restored — consumer markup is never permanently
      mutated.
    </p>
  </div>
  <aside class="self-start pt-0.5">
    <Anchor label="on this page" offset={8}>
      <AnchorItem href="#bp-anchor-what">what it does</AnchorItem>
      <AnchorItem href="#bp-anchor-pick">the line pick</AnchorItem>
      <AnchorItem href="#bp-anchor-lease">the lease</AnchorItem>
    </Anchor>
  </aside>
</div>
