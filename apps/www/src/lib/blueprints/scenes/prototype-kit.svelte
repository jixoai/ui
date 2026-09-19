<!-- prototype-kit blueprint (the prototype family, 2026-09-17): the
     canvas host — one grid frame, one folder context, arbitrary
     children (here: schematic cards, no frames mounted). The kit's
     own chrome (label, adaptive tracks) does the talking. -->
<script lang="ts">
  import PrototypeCanvas from '$lib/ui/prototype-kit/prototype-canvas.svelte';
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

<Stack direction="column" justify="center" class={cx(bpB.prototypeKitStage)}>
  <PrototypeCanvas label="prototype folder · list-item-fusion" gridCols={2} gap={12}>
    <Stack direction="column" gap="6" class={cx(bpB.prototypeKitCard)}>
      <span class={cx(bpB.prototypeKitTitle)}>anchor pair</span>
      <span class={cx(bpB.prototypeKitLine)}>grid-area: rail · the fusion cell</span>
    </Stack>
    <Stack direction="column" gap="6" class={cx(bpB.prototypeKitCard)}>
      <span class={cx(bpB.prototypeKitTitle)}>lead lines</span>
      <span class={cx(bpB.prototypeKitLine)}>measure + clamp, no magic</span>
    </Stack>
    <Stack direction="column" gap="6" class={cx(bpB.prototypeKitCard)}>
      <span class={cx(bpB.prototypeKitTitle)}>inset contract</span>
      <span class={cx(bpB.prototypeKitLine)}>non-negative tail, always</span>
    </Stack>
    <Stack direction="column" gap="6" class={cx(bpB.prototypeKitCard)}>
      <span class={cx(bpB.prototypeKitTitle)}>fold law</span>
      <span class={cx(bpB.prototypeKitLine)}>fit + never-fold mutually exclusive</span>
    </Stack>
  </PrototypeCanvas>
</Stack>
