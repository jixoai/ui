<!-- checkbox blueprint: the state mix on one preference list — checked,
     unchecked, indeterminate, and a disabled checked row. -->
<script lang="ts">
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import Stack from '$lib/ui/stack';
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

<Stack direction="column" align="start" justify="center" class={cx(bpA.checkboxStage)}>
  <Stack direction="column" gap="16" class={cx(bpA.checkboxColumn)}>
    <Checkbox label="deploy on push" checked />
    <Checkbox label="preview deployments" />
    <Checkbox label="all environments" indeterminate />
    <Checkbox label="legacy webhooks (deprecated)" checked disabled />
  </Stack>
</Stack>
