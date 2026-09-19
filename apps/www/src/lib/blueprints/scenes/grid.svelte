<!-- grid blueprint (the Layout family, 2026-09-18): the
     two-dimensional primitive — equal tracks under the minmax(0,1fr)
     law (the long token in cell one can never steal width), plus the
     0fr→1fr disclosure lane open. -->
<script lang="ts">
  import Grid from '$lib/ui/grid';
  import Stack from '$lib/ui/stack';
  import { bpB } from '$lib/surface/blueprints-b.stylex';

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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.gridStage)}>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.gridLabel)}>cols={3} · repeat(3, minmax(0, 1fr)) — blowout-proof</span>
    <Grid cols={3} gap="8">
      <div class={cx(bpB.gridCellWide)}>
        <span class={cx(bpB.gridCellTitle)}>cell 1</span>
        <span class={cx(bpB.gridCellToken)}>a-long-unbreakable-identifier</span>
      </div>
      <div class={cx(bpB.gridCell)}>cell 2</div>
      <div class={cx(bpB.gridCell)}>cell 3</div>
    </Grid>
  </Stack>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.gridLabel)}>rows open · the 0fr → 1fr disclosure lane</span>
    <Grid rows="open" gap="8">
      <div class={cx(bpB.gridLane)}>
        the lane's content — the track IS the animation, no measured pixels
      </div>
    </Grid>
  </Stack>
</Stack>
