<!-- composition-a spec fixture: the timeline family composed — the
     grid-engine anatomy (Dot + its spatial slots / auto-line /
     Content/Time/Title) with a free-children body and a parameterized
     pending flag on the last entry. The line is AUTHORED-FREE since
     the 2026-09-01 rebuild (no Connector part anymore). -->
<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '../../src/lib/ui/timeline';

  interface Props {
    /** the last entry's in-flight flag */
    pending?: boolean;
  }

  let { pending = false }: Props = $props();
</script>

<Timeline>
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
