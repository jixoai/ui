<!-- theme-toggle blueprint: all four variants (full / compact / icon /
     text) on the terminal bezel surface — their native habitat, matching
     the docs demo composition.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
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

<Stack align="center" justify="center" class={cx(bpB.themeToggleStage)}>
  <Stack direction="column" gap="16" class={cx(bpB.themeToggleBezel)} }>
    <Stack align="center" justify="between" gap="16">
      <span class={cx(bpB.themeToggleLabel)}>full</span>
      <ThemeToggle variant="full" />
    </Stack>
    <Stack align="center" justify="between" gap="16" class={cx(bpB.themeToggleRowDivided)} }>
      <span class={cx(bpB.themeToggleLabel)}>compact</span>
      <ThemeToggle variant="compact" />
    </Stack>
    <Stack align="center" justify="between" gap="16" class={cx(bpB.themeToggleRowDivided)} }>
      <span class={cx(bpB.themeToggleLabel)}>icon</span>
      <ThemeToggle variant="icon" />
    </Stack>
    <Stack align="center" justify="between" gap="16" class={cx(bpB.themeToggleRowDivided)} }>
      <span class={cx(bpB.themeToggleLabel)}>text</span>
      <ThemeToggle variant="text" />
    </Stack>
  </Stack>
</Stack>
