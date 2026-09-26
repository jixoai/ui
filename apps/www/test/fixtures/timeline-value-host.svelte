<!-- timeline-value spec fixture: the timeline family composed under
     the VALUE CONTRACT (W3 reui-progress upgrade, 2026-09-15) — three
     items, per-item declared steps (undefined = the DOM-order+1
     default), a pending flag, the root's three value props, and the
     context driver mounted inside item 1's content. -->
<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
    TimelineTime,
  } from '../../src/lib/ui/timeline';
  import TimelineValueDriver from './timeline-value-driver.svelte';

  interface Props {
    defaultValue?: number;
    value?: number;
    onValueChange?: (v: number) => void;
    /** which item paints the pending flag (-1 = none) */
    pendingIndex?: number;
    /** per-item declared steps (undefined entries ride the default) */
    steps?: Array<number | undefined>;
  }

  let {
    defaultValue = 1,
    value = undefined,
    onValueChange,
    pendingIndex = -1,
    steps = [undefined, undefined, undefined],
  }: Props = $props();
</script>

<Timeline {defaultValue} {value} {onValueChange}>
  {#each steps as step, i (i)}
    <TimelineItem step={step} pending={pendingIndex === i}>
      <TimelineDot />
      <TimelineContent>
        <TimelineTime datetime="2026-09-15T07:02:00Z">07:02</TimelineTime>
        <TimelineTitle>item {i + 1}</TimelineTitle>
        {#if i === 0}
          <TimelineValueDriver />
        {/if}
      </TimelineContent>
    </TimelineItem>
  {/each}
</Timeline>
