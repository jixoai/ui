<!--
  EndInsetHost — the lane-edition end-inset ownership fixture
  (2026-09-05): self-insetting controls declare data-self-inset at
  their ROOT face; checkbox/toggle stay silent and keep the row's
  trailing inset.
-->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd, ItemToggle } from '$lib/ui/list-item';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import Input from '$lib/ui/input/input.svelte';

  let plain = $state('');
  let withClear = $state('typed');
</script>

<ItemGroup label="end-inset host">
  <Item>
    <ItemContent><ItemTitle>select</ItemTitle></ItemContent>
    <ItemEnd><NativeSelect aria-label="channel"><option>Instantly</option></NativeSelect></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>input plain</ItemTitle></ItemContent>
    <ItemEnd><Input aria-label="plain" bind:value={plain} /></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>input clearable</ItemTitle></ItemContent>
    <ItemEnd><Input aria-label="clear" clearable bind:value={withClear} /></ItemEnd>
  </Item>
  <ItemToggle label="toggle" bind:checked={withClear} />
</ItemGroup>
