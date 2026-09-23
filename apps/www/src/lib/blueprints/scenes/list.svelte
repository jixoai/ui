<!-- list blueprint: the two shapes — disc and decimal (start honored),
     muted marker ink, the rows staying native li elements. -->
<script lang="ts">
  import List from '$lib/ui/list/list.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpA.listStage)}>
  <div class={cx(bpA.listRow)}>
    <List>
      <li>prefix keys freeze</li>
      <li>the tail mutates in place</li>
      <li>remounts stay bounded</li>
    </List>
    <List ordered start={4}>
      <li>the fourth finding</li>
      <li>the fifth continues</li>
      <li>start shifts the run</li>
    </List>
  </div>
  <Stack wrap gap="8" }>
    <Badge>disc | decimal</Badge>
    <Badge>styles the list, never the row</Badge>
    <Badge>start = ol passthrough</Badge>
  </Stack>
</Stack>
