<!-- timeline blueprint: the activity stream — timestamped entries on the
     CSS spine, per-item bodies as free children, the last entry pending
     (hollow dot). composition-first-apis: Dice anatomy parts authored in
     the tree. -->
<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline/index';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Timeline>
    <TimelineItem>
      <TimelineDot />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:41:00Z">09:41</TimelineTime>
        <TimelineTitle>commit pushed</TimelineTitle>
        <p class="text-muted-foreground text-xs leading-5">feat: popover family on CSS anchors</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:43:00Z">09:43</TimelineTime>
        <TimelineTitle>build passed</TimelineTitle>
        <p class="text-muted-foreground text-xs leading-5">typecheck + 412 tests green</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:44:00Z">09:44</TimelineTime>
        <TimelineTitle>deploy started</TimelineTitle>
        <p class="text-muted-foreground text-xs leading-5">rolling ui.jixoai.com, 3 of 3 replicas</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem pending>
      <TimelineDot />
      <TimelineConnector />
      <TimelineContent>
        <TimelineTime datetime="2026-08-22T09:45:00Z">09:45</TimelineTime>
        <TimelineTitle>propagating</TimelineTitle>
        <p class="text-muted-foreground text-xs leading-5">edge cache warming — 2 of 7 regions live</p>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</div>
