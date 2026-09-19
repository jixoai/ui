<!-- number-input blueprint: the [- NUM +] steppers with committed values —
     an int inside [1,16] and a decimal snapped to a 0.5 step.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
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

  let workers = $state(4);
  let timeout = $state(2.5);
</script>

<Stack direction="column" justify="center" class={cx(bpB.numberInputStage)}>
  <Stack direction="column" gap="24" class={cx(bpB.numberInputCol)}>
    <NumberInput label="workers" min={1} max={16} bind:value={workers} />
    <NumberInput label="timeout (s)" min={0.5} max={5} step={0.5} bind:value={timeout} />
  </Stack>
</Stack>
