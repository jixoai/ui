<!-- kbd blueprint: a keyboard shortcut row. -->
<script lang="ts">
  import Kbd from '$lib/ui/kbd/kbd.svelte';
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" align="start" justify="center" gap="20" class={cx(bpA.kbdStage)}>
  <Stack align="center" gap="8" class={cx(bpA.kbdRow)} }>
    <Kbd density="lg">⌘</Kbd><Kbd density="lg">K</Kbd>
    <span class={cx(bpA.kbdNote)}>open the command surface</span>
  </Stack>
  <Stack align="center" gap="8" class={cx(bpA.kbdRow)} }>
    <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd>
    <span class={cx(bpA.kbdNote)}>preview deployment</span>
  </Stack>
</Stack>
