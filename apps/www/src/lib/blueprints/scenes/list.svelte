<!-- list blueprint: the two shapes — disc and decimal (start honored),
     muted marker ink, the rows staying native li elements. -->
<script lang="ts">
  import List from '$lib/ui/list/list.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <div class="flex w-full max-w-[520px] justify-center gap-14">
    <List>
      <li>prefix keys freeze</li>
      <li>the tail mutates in place</li>
      <li>remounts stay bounded</li>
    </List>
    <List ordered start={4}>
      <li>the fourth finding</li>
      <li>the fifth continues</li>
      <li>start shifts the run</li>
    </List>
  </div>
  <div class="flex flex-wrap gap-2">
    <Badge>disc | decimal</Badge>
    <Badge>styles the list, never the row</Badge>
    <Badge>start = ol passthrough</Badge>
  </div>
</div>
