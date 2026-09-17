<!-- kbd blueprint: a keyboard shortcut row. -->
<script lang="ts">
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.kbdStage)}>
  <div class={cx(bpA.kbdRow)}>
    <Kbd density="lg">⌘</Kbd><Kbd density="lg">K</Kbd>
    <span class={cx(bpA.kbdNote)}>open the command surface</span>
  </div>
  <div class={cx(bpA.kbdRow)}>
    <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd>
    <span class={cx(bpA.kbdNote)}>preview deployment</span>
  </div>
</div>
