<!--
  Test host for the toggle-group contract: three composed items in
  single or multiple mode (composition-first-apis: options[] is dead).
-->
<script lang="ts">
  import ToggleGroup from '../../src/lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '../../src/lib/ui/toggle-group/toggle-group-item.svelte';

  let { multiple = false }: { multiple?: boolean } = $props();
</script>

<ToggleGroup name="style" label="text style" type={multiple ? 'multiple' : 'single'}>
  <ToggleGroupItem value="bold">bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">italic</ToggleGroupItem>
  <ToggleGroupItem value="underline">underline</ToggleGroupItem>
</ToggleGroup>
