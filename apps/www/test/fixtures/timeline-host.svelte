<!-- composition-a spec fixture: the timeline family composed — the
     drawn-spine anatomy (host grid + measured SVG spine / Dot + its
     spatial slots / floor line / Content/Time/Title) with a free-
     children body and a parameterized pending flag on the last entry.
     The W3 rework (2026-09-15) replaced the line(i) per-item seam
     with the root `spine` prop: this fixture exposes it as props
     (preset names + a custom geometry-echoing snippet for the payload
     seam test) alongside the `animation` engine probe. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Timeline, {
    type TimelineSpineGeometry,
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '../../src/lib/ui/timeline';

  interface Props {
    /** the last entry's in-flight flag */
    pending?: boolean;
    /** root pass-through for the engine probe (anim='scroll') */
    animation?: 'none' | 'view' | 'scroll';
    /** the spine seam: a preset name, or the custom-snippet mode */
    spine?: 'plain' | 'dashed' | 'beam' | 'custom';
  }

  let { pending = false, animation = 'none', spine = 'plain' }: Props = $props();
</script>

{#snippet customSpine(geometry: TimelineSpineGeometry)}
  <path
    data-testid="tl-custom-spine"
    d={geometry.runPath}
    data-nodes={geometry.nodes.length}
    data-axis={geometry.axis}
    data-rtl={geometry.rtl ? 'true' : 'false'}
    fill="none"
    stroke="var(--border)"
    stroke-width="1"
  ></path>
{/snippet}

<!-- the double cast bridges svelte-check's dual-Snippet-type artifact
     (template-declared snippets vs the barrel's Snippet import resolve
     to unrelated symbol types in this fixture context) -->
<Timeline
  {animation}
  spine={spine === 'custom' ? (customSpine as unknown as Snippet<[TimelineSpineGeometry]>) : spine}
>
  <TimelineItem>
    <TimelineDot>
      {#snippet blockStart()}<span>07:02</span>{/snippet}
    </TimelineDot>
    <TimelineContent>
      <TimelineTime datetime="2026-08-22T07:02:00Z">07:02</TimelineTime>
      <TimelineTitle>pushed</TimelineTitle>
      <p class="tl-body">12 checks · 0 failed · 8.2s</p>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem {pending}>
    <TimelineDot variant="ring" />
    <TimelineContent>
      <TimelineTitle>auditing</TimelineTitle>
    </TimelineContent>
  </TimelineItem>
</Timeline>
