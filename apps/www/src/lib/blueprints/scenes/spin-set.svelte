<!-- spin-set blueprint (the spinner channel, 2026-09-18): the
     verified loader PACK — three of the 94 pixel-green artifact
     loaders through the one-name lane (Spin spinner=…), each in its
     own grid cell span. -->
<script lang="ts">
  import Spin from '$lib/ui/spin';
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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.spinSetStage)}>
  <span class={cx(bpB.spinSetLabel)}>spin-set · the 94-loader verified pack, one name lane</span>
  <Stack gap="24" align="center" justify="center">
    <Stack direction="column" align="center" gap="8">
      <Spin spinner="blocks-wave" size={24} label="building" />
      <span class={cx(bpB.spinSetChip)}>blocks-wave</span>
    </Stack>
    <Stack direction="column" align="center" gap="8">
      <Spin spinner="bars-scale" size={24} label="indexing" />
      <span class={cx(bpB.spinSetChip)}>bars-scale</span>
    </Stack>
    <Stack direction="column" align="center" gap="8">
      <Spin spinner="3-dots-bounce" size={24} label="checking" />
      <span class={cx(bpB.spinSetChip)}>3-dots-bounce</span>
    </Stack>
  </Stack>
</Stack>
