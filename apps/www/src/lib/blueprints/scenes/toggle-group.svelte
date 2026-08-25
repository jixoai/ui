<!-- toggle-group blueprint: the joined-button set — single mode with one
     pressed, multiple mode with two pressed. (composition-first-apis
     2026-08-25: ToggleGroupItem parts replace the options[] data.) -->
<script lang="ts">
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';

  let align = $state('center');
  let style = $state<string[]>(['bold', 'mono']);
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-6 p-10">
  <div class="flex flex-col gap-2">
    <ToggleGroup label="alignment" type="single" bind:value={align}>
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
</div>
