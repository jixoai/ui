<!--
  jixoai timeline — the ROOT half (registry/files/ui/timeline.svelte,
  composition-first-apis, 2026-08-25).
  The activity stream as a composed family (full Dice UI anatomy): the
  root is just the chronology ol — NO context, NO state, zero JS. A
  timeline is a chronology display, not a stepper; the in-flight
  semantic is the per-item `pending` flag, and the body is plain
  children:

    <Timeline>
      <TimelineItem pending>                ← data-jx-tl-pending
        <TimelineDot />                     ← the marker
        <TimelineConnector />               ← the spine segment
        <TimelineContent>
          <TimelineTime datetime="…">14:02</TimelineTime>
          <TimelineTitle>deploy</TimelineTitle>
          …free children = body…
        </TimelineContent>
      </TimelineItem>
    </Timeline>

  The spine is drawn by timeline.css off REAL DOM hooks (the default-
  parts law); role=list survives list-none (Safari strips list
  semantics from marker-less lists).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import './timeline.css';

  interface Props extends HTMLAttributes<HTMLOListElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<ol data-jx-timeline="" class={cn('m-0 p-0 list-none', className)} {...rest} role="list">
  {@render children()}
</ol>
