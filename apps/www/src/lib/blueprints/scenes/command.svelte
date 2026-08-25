<!-- command blueprint: the ⌘K palette forced open (open={true} →
     showModal()) — the composed family: self-matching items under
     groups, kbd hints authored as snippet content, first item active.
     The serializer re-anchors the top-layer panel into the stage. -->
<script lang="ts">
  import Command from '$lib/ui/command/command.svelte';
  import CommandInput from '$lib/ui/command/command-input.svelte';
  import CommandList from '$lib/ui/command/command-list.svelte';
  import CommandGroup from '$lib/ui/command/command-group.svelte';
  import CommandItem from '$lib/ui/command/command-item.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10 opacity-70">
  <Skeleton class="h-4 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
</div>

<Command open={true} placeholder="type a command…" label="command palette">
  <CommandInput />
  <CommandList>
    <CommandGroup heading="actions">
      <CommandItem label="deploy production">
        deploy production
        {#snippet hint()}⌘D{/snippet}
      </CommandItem>
      <CommandItem label="rollback release">rollback release</CommandItem>
    </CommandGroup>
    <CommandGroup heading="navigate">
      <CommandItem label="go to components">
        go to components
        {#snippet hint()}G C{/snippet}
      </CommandItem>
      <CommandItem label="go to recipes">
        go to recipes
        {#snippet hint()}G R{/snippet}
      </CommandItem>
    </CommandGroup>
    <CommandGroup heading="settings">
      <CommandItem label="set brand hue">
        set brand hue
        {#snippet hint()}⌘,{/snippet}
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
