<!-- prose blueprint: the reading region — a Prose scope carrying a
     heading and a paragraph with a strong voice inside; absent knobs
     keep the ambient flowing while the residue sheet owns the P
     lanes. -->
<script lang="ts">
  import Prose from '$lib/ui/prose';
  import Heading from '$lib/ui/heading/heading.svelte';
  import { P, Strong } from '$lib/ui/text';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <Prose class="w-full max-w-[520px]">
    <Heading level={2}>The reading region</Heading>
    <P>
      Eleven knobs, every one an absentSlot — absence IS the state. <Strong>The strong voice</Strong>
      keeps its settle inside the region, and the P lane rides the residue sheet at (0,2,0).
    </P>
  </Prose>
  <div class="flex flex-wrap gap-2">
    <Badge>11 absentSlot knobs</Badge>
    <Badge>absence IS the state</Badge>
    <Badge>sovereignty by cascade</Badge>
  </div>
</div>
