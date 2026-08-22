<!-- command blueprint: the ⌘K palette forced open (open={true} →
     showModal()) — grouped results, kbd hints, the first item active.
     The serializer re-anchors the top-layer panel into the stage. -->
<script lang="ts">
  import Command from '$lib/ui/command.svelte';
  import type { CommandItem } from '$lib/ui/command.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';

  const items: CommandItem[] = [
    { id: 'deploy', label: 'deploy production', group: 'actions', hint: '⌘D' },
    { id: 'rollback', label: 'rollback release', group: 'actions' },
    { id: 'components', label: 'go to components', group: 'navigate', hint: 'G C' },
    { id: 'recipes', label: 'go to recipes', group: 'navigate', hint: 'G R' },
    { id: 'hue', label: 'set brand hue', group: 'settings', hint: '⌘,' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10 opacity-70">
  <Skeleton class="h-4 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
</div>

<Command items={items} open={true} placeholder="type a command…" label="command palette" />
