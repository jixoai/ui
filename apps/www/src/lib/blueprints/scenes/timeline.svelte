<!-- timeline blueprint: the activity stream — the grid-engine spine
     (2026-09-01 rebuild), timestamps as blockStart cutouts on the line,
     per-item bodies as free children, the last entry pending (ring dot).
     The line is authored-free.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline/index';
  import { bpB } from '../../surface/blueprints-b.stylex';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpB.timelineStage)}>
  <Timeline density="lg">
    <TimelineItem>
      <TimelineDot>
        {#snippet blockStart()}<span>09:41</span>{/snippet}
      </TimelineDot>
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:41:00Z">09:41</TimelineTime>
        <TimelineTitle>commit pushed</TimelineTitle>
        <p class={cx(bpB.timelineBody)}>feat: popover family on CSS anchors</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot>
        {#snippet blockStart()}<span>09:43</span>{/snippet}
      </TimelineDot>
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:43:00Z">09:43</TimelineTime>
        <TimelineTitle>build passed</TimelineTitle>
        <p class={cx(bpB.timelineBody)}>typecheck + 412 tests green</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot>
        {#snippet blockStart()}<span>09:44</span>{/snippet}
      </TimelineDot>
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:44:00Z">09:44</TimelineTime>
        <TimelineTitle>deploy started</TimelineTitle>
        <p class={cx(bpB.timelineBody)}>rolling ui.jixoai.com, 3 of 3 replicas</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem pending>
      <TimelineDot>
        {#snippet blockStart()}<span>09:45</span>{/snippet}
      </TimelineDot>
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:45:00Z">09:45</TimelineTime>
        <TimelineTitle>propagating</TimelineTitle>
        <p class={cx(bpB.timelineBody)}>edge cache warming — 2 of 7 regions live</p>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</div>
