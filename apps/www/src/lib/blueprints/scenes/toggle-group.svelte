<!-- toggle-group blueprint: the joined-button set — single mode with one
     pressed, multiple mode with two pressed. (composition-first-apis
     2026-08-25: ToggleGroupItem parts replace the options[] data.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
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

  let align = $state('center');
  let style = $state<string[]>(['bold', 'mono']);
</script>

<Stack direction="column" align="start" justify="center" gap="24" class={cx(bpB.toggleGroupStage)}>
  <div class={cx(bpB.toggleGroupCol)}>
    <ToggleGroup name="bp-tgroup-align" label="alignment" type="single" bind:value={align}>
      <ToggleGroupItem value="left">left</ToggleGroupItem>
      <ToggleGroupItem value="center">center</ToggleGroupItem>
      <ToggleGroupItem value="right">right</ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup label="text style" type="multiple" bind:value={style}>
      <ToggleGroupItem value="bold">bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">italic</ToggleGroupItem>
      <ToggleGroupItem value="mono">mono</ToggleGroupItem>
      <ToggleGroupItem value="underline">underline</ToggleGroupItem>
    </ToggleGroup>
  </div>
</Stack>
