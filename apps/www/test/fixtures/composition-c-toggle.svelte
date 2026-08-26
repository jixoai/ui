<!--
  composition-c fixture: the toggle-group family, single or multiple,
  with the value-callback seam (onValueChange) exposed for value-law
  assertions.
-->
<script lang="ts">
  import ToggleGroup from '../../src/lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '../../src/lib/ui/toggle-group/toggle-group-item.svelte';

  let {
    multiple = false,
    onvalue,
  }: {
    multiple?: boolean;
    onvalue?: (value: string | string[]) => void;
  } = $props();
</script>

<form>
  <ToggleGroup
  name="style"
  label="text style"
  type={multiple ? 'multiple' : 'single'}
  onValueChange={onvalue}
>
  <ToggleGroupItem value="bold">bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">italic</ToggleGroupItem>
  <ToggleGroupItem value="underline">underline</ToggleGroupItem>
  </ToggleGroup>
</form>
