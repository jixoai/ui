<!-- list-item blueprint: the slot matrix — grouped auto rows (the
     group owns the chrome), media row, end lane, explicit divider. -->
<script lang="ts">
  import {
    Item,
    ItemGroup,
    ItemDivider,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemEnd,
    ItemActions,
    ItemAfter,
  } from '$lib/ui/list-item';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <ItemGroup class="max-w-[24rem]" label="files">
    <Item href="#one">
      <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
      <ItemContent>
        <ItemTitle>item one</ItemTitle>
        <ItemDescription>the media · content · end row</ItemDescription>
      </ItemContent>
      <ItemEnd>
        <ItemAfter>3</ItemAfter>
        <ItemActions><span class="text-[10px] opacity-60">edit</span></ItemActions>
      </ItemEnd>
    </Item>
    <ItemDivider />
    <Item>
      <ItemContent>
        <ItemTitle>header + footer rows</ItemTitle>
        <ItemDescription>full-row slots above and below</ItemDescription>
      </ItemContent>
      <ItemEnd><ItemActions><span class="text-[10px] opacity-60">open</span></ItemActions></ItemEnd>
    </Item>
    <Item>
      <ItemContent>
        <ItemTitle>after metadata row</ItemTitle>
      </ItemContent>
      <ItemEnd><ItemAfter>12:04</ItemAfter></ItemEnd>
    </Item>
  </ItemGroup>
</div>
