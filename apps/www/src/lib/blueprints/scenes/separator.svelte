<!-- separator blueprint: horizontal thematic break + vertical posture.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Separator from '$lib/ui/separator/separator.svelte';
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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.separatorStage)}>
  <p class={cx(bpB.separatorText)}>section one</p>
  <Separator />
  <Stack align="center" gap="20" }>
    <span class={cx(bpB.separatorText)}>left</span>
    <Separator orientation="vertical" class={cx(bpB.separatorVertical)} />
    <span class={cx(bpB.separatorText)}>right</span>
  </Stack>
</Stack>
