<!-- recipes blueprint: the guide's own subject — where wrapping stops.
     The antd concept mappings rendered with REAL components: the
     data-table mapping (Table), the status-chip mapping (Badge), the
     action mapping (PressButton). The watermark/flex-grid/typography
     recipes are patterns, not components — the table IS their index.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Table from '$lib/ui/table/table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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

<div class={cx(bpB.recipesStage)}>
  <Stack align="center" justify="between" wrap gap="12">
    <h2 class={cx(bpB.recipesTitle)}>antd concept → jixoai recipe</h2>
    <Badge>where wrapping stops</Badge>
  </Stack>
  <Table caption="the deliberate non-components" dense>
    <thead>
      <tr><th>antd</th><th>jixoai</th><th>kind</th></tr>
    </thead>
    <tbody>
      <tr><td>Watermark</td><td>CSS repeating tile</td><td>recipe</td></tr>
      <tr><td>Flex / Grid</td><td>utility classes</td><td>recipe</td></tr>
      <tr><td>Typography</td><td>token scale + font-nav</td><td>recipe</td></tr>
    </tbody>
  </Table>
  <div class={cx(bpB.recipesRow)}>
    <PressButton variant="outline">tour contract</PressButton>
    <PressButton variant="outline">image preview</PressButton>
  </div>
</div>
