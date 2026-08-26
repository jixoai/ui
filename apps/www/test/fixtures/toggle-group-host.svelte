<!--
  Test host for the toggle-group native contract: three composed
  items in single or multiple mode inside a REAL form (native
  FormData participation), with the value callback wired through.
-->
<script lang="ts">
  import ToggleGroup from '../../src/lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '../../src/lib/ui/toggle-group/toggle-group-item.svelte';

  let {
    multiple = false,
    onvalue,
    onchange,
  }: {
    multiple?: boolean;
    onvalue?: (v: string | string[]) => void;
    onchange?: (e: Event) => void;
  } = $props();
</script>

<form>
  <ToggleGroup
    name="style"
    label="text style"
    type={multiple ? 'multiple' : 'single'}
    onValueChange={onvalue}
    {onchange}
  >
    <ToggleGroupItem value="bold">bold</ToggleGroupItem>
    <ToggleGroupItem value="italic">italic</ToggleGroupItem>
    <ToggleGroupItem value="underline">underline</ToggleGroupItem>
  </ToggleGroup>
</form>
