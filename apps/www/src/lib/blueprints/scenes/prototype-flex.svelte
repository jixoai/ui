<!-- prototype-flex blueprint (the prototype family, 2026-09-17): the
     raw flex pass-through — verbatim CSS words, px numbers, nothing
     typed. The schematic lane beside the system's Stack. -->
<script lang="ts">
  import PrototypeFlex from '$lib/ui/prototype-flex';
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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.prototypeFlexStage)}>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.prototypeFlexLabel)}>justify="space-between" gap={12} — verbatim words</span>
    <PrototypeFlex justify="space-between" gap={12}>
      <span class={cx(bpB.prototypeFlexCell)}>header</span>
      <span class={cx(bpB.prototypeFlexCell)}>nav</span>
      <span class={cx(bpB.prototypeFlexCell)}>actions</span>
    </PrototypeFlex>
  </Stack>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.prototypeFlexLabel)}>direction="column" gap={8}</span>
    <PrototypeFlex direction="column" gap={8}>
      <span class={cx(bpB.prototypeFlexCell)}>row one</span>
      <span class={cx(bpB.prototypeFlexCell)}>row two</span>
    </PrototypeFlex>
  </Stack>
</Stack>
