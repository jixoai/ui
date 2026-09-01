<!--
  jixoai TimelineLineBeam (registry/files/ui/timeline/timeline-line-beam.svelte,
  2026-09-01).
  A line PRESET for the root's `line` seam: the spine channel carrying
  a traveling light — a primary gradient pulse looping along the flow
  (axis-aware; reduced-motion freezes the light, the base line stays).
  Signals an ACTIVE channel (a deploying pipeline, a live trace).
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
  data-line="beam"
  class={cn('pointer-events-none', className)}
  {...rest}
  aria-hidden="true"
></div>
