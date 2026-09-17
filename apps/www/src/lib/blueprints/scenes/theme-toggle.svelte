<!-- theme-toggle blueprint: all four variants (full / compact / icon /
     text) on the terminal bezel surface — their native habitat, matching
     the docs demo composition.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

<div class={cx(bpB.themeToggleStage)}>
  <div class={cx(bpB.themeToggleBezel)}>
    <div class={cx(bpB.themeToggleRow)}>
      <span class={cx(bpB.themeToggleLabel)}>full</span>
      <ThemeToggle variant="full" />
    </div>
    <div class={cx(bpB.themeToggleRowDivided)}>
      <span class={cx(bpB.themeToggleLabel)}>compact</span>
      <ThemeToggle variant="compact" />
    </div>
    <div class={cx(bpB.themeToggleRowDivided)}>
      <span class={cx(bpB.themeToggleLabel)}>icon</span>
      <ThemeToggle variant="icon" />
    </div>
    <div class={cx(bpB.themeToggleRowDivided)}>
      <span class={cx(bpB.themeToggleLabel)}>text</span>
      <ThemeToggle variant="text" />
    </div>
  </div>
</div>
