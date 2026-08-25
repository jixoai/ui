<!-- list-item blueprint: the slot matrix — outline row, media row,
     group with separator, header/footer row. -->
<script lang="ts">
  import { Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '$lib/ui/list-item';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <ItemGroup class="max-w-[24rem]">
    <Item variant="outline">
      <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
      <ItemContent>
        <ItemTitle>item one</ItemTitle>
        <ItemDescription>the media · content · actions row</ItemDescription>
      </ItemContent>
      <ItemActions><span class="text-[10px] opacity-60">edit</span></ItemActions>
    </Item>
    <ItemSeparator />
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>header + footer rows</ItemTitle>
        <ItemDescription>full-row slots above and below</ItemDescription>
      </ItemContent>
      <ItemActions><span class="text-[10px] opacity-60">open</span></ItemActions>
    </Item>
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>muted variant</ItemTitle>
      </ItemContent>
    </Item>
  </ItemGroup>
</div>
