<!--
  ItemEndConflictHost — the negative fixture (size contract): a lane
  declaring BOTH a ladder and wrap="never" must throw at init — the
  fixed semantic and the foldable declaration are contradictory.
-->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd } from '$lib/ui/list-item';
</script>

<ItemGroup label="conflict host">
  <Item>
    <ItemContent><ItemTitle>contradiction</ItemTitle></ItemContent>
    <ItemEnd fit="md" wrap="never"><input aria-label="bad" /></ItemEnd>
  </Item>
</ItemGroup>
