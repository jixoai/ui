<!-- input blueprint: labeled field, filled value, and an error state. -->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
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

<Stack direction="column" justify="center" gap="24" class={cx(bpA.inputStage)}>
  <Input label="Registry name" value="press-button" />
  <Input label="Hue (oklch)" placeholder="27" error="hue must be 0–360" />
</Stack>
