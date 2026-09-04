<!--
  ItemSizeHost — size-contract fixture (list-item-size-contract,
  2026-09-05): the ladder rungs through the REAL API surface — bare
  ItemEnd lanes (md/lg/full/undeclared) and the field adapters
  (ItemInput/ItemSelect) forwarding size to their field lanes.
-->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd, ItemInput, ItemSelect } from '$lib/ui/list-item';

  let text = $state('ops@jixoai.dev');
  let number = $state(30);
  let channel = $state('Instantly');
</script>

<ItemGroup label="size contract host">
  <Item>
    <ItemContent><ItemTitle>md lane</ItemTitle></ItemContent>
    <ItemEnd fit="md"><input aria-label="md control" /></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>lg lane</ItemTitle></ItemContent>
    <ItemEnd fit="lg"><input aria-label="lg control" /></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>full lane</ItemTitle></ItemContent>
    <ItemEnd fit="full"><input aria-label="full control" /></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>undeclared lane</ItemTitle></ItemContent>
    <ItemEnd><input aria-label="bare control" /></ItemEnd>
  </Item>
  <Item>
    <ItemContent><ItemTitle>fixed lane</ItemTitle></ItemContent>
    <ItemEnd wrap="never"><input type="checkbox" aria-label="fixed control" /></ItemEnd>
  </Item>
  <ItemInput fit="lg" label="adapter text" bind:value={text} />
  <ItemInput type="number" fit="md" label="adapter number" bind:value={number} />
  <ItemSelect fit="md" label="adapter select" bind:value={channel}>
    <option>Instantly</option>
    <option>Daily digest</option>
  </ItemSelect>
</ItemGroup>
