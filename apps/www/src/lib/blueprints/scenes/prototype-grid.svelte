<!-- prototype-grid blueprint (the prototype family, 2026-09-17): the
     raw grid pass-through — number tracks become repeat(N, minmax(0,
     1fr)), strings ride verbatim, and grid-template-areas speaks for
     itself. -->
<script lang="ts">
  import PrototypeGrid from '$lib/ui/prototype-grid';
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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.prototypeGridStage)}>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.prototypeGridLabel)}>cols={3} gap={10} — the number form</span>
    <PrototypeGrid cols={3} gap={10}>
      <span class={cx(bpB.prototypeGridCell)}>1</span>
      <span class={cx(bpB.prototypeGridCell)}>2</span>
      <span class={cx(bpB.prototypeGridCell)}>3</span>
      <span class={cx(bpB.prototypeGridCell)}>4</span>
      <span class={cx(bpB.prototypeGridCell)}>5</span>
      <span class={cx(bpB.prototypeGridCell)}>6</span>
    </PrototypeGrid>
  </Stack>
  <Stack direction="column" gap="4">
    <span class={cx(bpB.prototypeGridLabel)}>areas — verbatim template</span>
    <PrototypeGrid areas="'rail main' 'rail foot'" cols="7rem 1fr" gap={8}>
      <span class={cx(bpB.prototypeGridAreaRail)}>rail</span>
      <span class={cx(bpB.prototypeGridAreaMain)}>main</span>
      <span class={cx(bpB.prototypeGridAreaFoot)}>foot</span>
    </PrototypeGrid>
  </Stack>
</Stack>
