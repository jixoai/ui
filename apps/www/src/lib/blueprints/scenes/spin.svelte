<!-- spin blueprint (spin-ora-svg-lane D2): the one-name lane in three
     postures — the default text spinner (dots), the svg artifact lane
     (blocks-wave at its size slot), and the wrapping container.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Spin from '$lib/ui/spin';
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

<Stack align="center" justify="center" gap="40" class={cx(bpB.spinStage)}>
  <Spin label="loading checks" />
  <Spin spinner="blocks-wave" label="building" size={24} />
  <Spin label="building" class={cx(bpB.spinFramed)}>
    <div class={cx(bpB.spinBody)}>building apps/www…</div>
  </Spin>
</Stack>
