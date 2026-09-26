<!-- prose blueprint: the reading region — a Prose scope carrying a
     heading and a paragraph with a strong voice inside; absent knobs
     keep the ambient flowing while the residue sheet owns the P
     lanes. (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Prose from '$lib/ui/prose';
  import Heading from '$lib/ui/heading/heading.svelte';
  import { P, Strong } from '$lib/ui/text';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpB.proseStage)}>
  <Prose class={cx(bpB.proseRegion)}>
    <Heading level={2}>The reading region</Heading>
    <P>
      Eleven knobs, every one an absentSlot — absence IS the state. <Strong>The strong voice</Strong>
      keeps its settle inside the region, and the P lane rides the residue sheet at (0,2,0).
    </P>
  </Prose>
  <Stack wrap gap="8" }>
    <Badge>11 absentSlot knobs</Badge>
    <Badge>absence IS the state</Badge>
    <Badge>sovereignty by cascade</Badge>
  </Stack>
</Stack>
