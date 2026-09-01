<!-- composition-a spec fixture: the timeline family composed — the
     grid-engine anatomy (Dot + its spatial slots / auto-line /
     Content/Time/Title) with a free-children body and a parameterized
     pending flag on the last entry. The line is AUTHORED-FREE since
     the 2026-09-01 rebuild (no Connector part anymore). The 2026-09-02
     fix wave added two engine probes as props: `animation` (the
     scroll-spine chrome child) and `useLine` (the root line seam
     swapping the authored-free line for an index-echoing snippet). -->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
    /** root pass-through for the chrome-child probe (anim='scroll') */
    animation?: 'none' | 'view' | 'scroll';
    /** swap the authored-free line for a line(i) snippet echoing i */
    useLine?: boolean;
  }

  let { pending = false, animation = 'none', useLine = false }: Props = $props();
</script>

{#snippet authoredLine(i: number)}
  <span data-testid="tl-authored-line">L{i}</span>
{/snippet}

<!-- the double cast bridges svelte-check's dual-Snippet-type artifact
     (template-declared snippets vs the barrel's Snippet import resolve
     to unrelated symbol types in this fixture context) -->
<Timeline {animation} line={useLine ? (authoredLine as unknown as Snippet<[number]>) : undefined}>
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
