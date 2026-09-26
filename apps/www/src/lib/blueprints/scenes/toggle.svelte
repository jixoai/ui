<!-- toggle blueprint: the inline-end switch — an on/off mix across the
     size ramp, real bind:checked state.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Toggle from '$lib/ui/toggle/toggle.svelte';
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

  let notifications = $state(true);
  let digest = $state(false);
  let telemetry = $state(true);
</script>

<Stack direction="column" align="start" justify="center" class={cx(bpB.toggleStage)}>
  <Stack direction="column" gap="20" class={cx(bpB.toggleCol)}>
    <Toggle label="notifications" bind:checked={notifications} />
    <Toggle label="weekly digest" bind:checked={digest} />
    <Toggle label="telemetry" density="sm" bind:checked={telemetry} />
  </Stack>
</Stack>
