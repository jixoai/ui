<!-- timeline blueprint: the activity stream — timestamped entries on the
     CSS spine, per-item bodies, the last entry pending (hollow dot). -->
<script lang="ts">
  import Timeline from '$lib/ui/timeline/timeline.svelte';
  import type { TimelineItem } from '$lib/ui/timeline/timeline.svelte';

  const items: TimelineItem[] = [
    { title: 'commit pushed', time: '09:41', datetime: '2026-08-22T09:41:00Z' },
    { title: 'build passed', time: '09:43', datetime: '2026-08-22T09:43:00Z' },
    { title: 'deploy started', time: '09:44', datetime: '2026-08-22T09:44:00Z' },
    { title: 'propagating', time: '09:45', datetime: '2026-08-22T09:45:00Z', pending: true },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Timeline {items}>
    {#snippet body(item, index)}
      {#if index === 0}
        <p class="text-muted-foreground text-xs leading-5">feat: popover family on CSS anchors</p>
      {:else if index === 1}
        <p class="text-muted-foreground text-xs leading-5">typecheck + 412 tests green</p>
      {:else if index === 2}
        <p class="text-muted-foreground text-xs leading-5">rolling ui.jixoai.com, 3 of 3 replicas</p>
      {:else if item.pending}
        <p class="text-muted-foreground text-xs leading-5">edge cache warming — 2 of 7 regions live</p>
      {/if}
    {/snippet}
  </Timeline>
</div>
