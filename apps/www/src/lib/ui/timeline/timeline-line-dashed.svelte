<!--
  jixoai TimelineLineDashed (registry/files/ui/timeline/timeline-line-dashed.svelte,
  2026-09-01).
  A line PRESET for the root's `line` seam: the same grid essence as
  the default line (the dot's two block neighbors + center, bridged),
  painted as a 4/4 dash chain. Axis-aware — the dash direction follows
  the root's axis. Drop-in:

    <Timeline {line}>
      {#snippet line(i)}
        <TimelineLineDashed />
      {/snippet}
    </Timeline>
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
</script>

<div
  data-jx-tl-line=""
  data-line="dashed"
  class={cn('pointer-events-none', className)}
  {...rest}
  aria-hidden="true"
></div>
