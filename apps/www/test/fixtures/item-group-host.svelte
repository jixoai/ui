<!-- list-item spec fixture: a group with two rows (one linked) + a
     separator, plus one standalone row outside the group -->
<script lang="ts">
  import {
    Item,
    ItemGroup,
    ItemSeparator,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
  } from '../../src/lib/ui/list-item';
</script>

<ItemGroup>
  <Item variant="outline" href="/one">
    <ItemContent>
      <ItemTitle>one</ItemTitle>
      <ItemDescription>linked row</ItemDescription>
    </ItemContent>
    <ItemActions><span>go</span></ItemActions>
  </Item>
  <ItemSeparator />
  <Item variant="outline">
    <ItemContent>
      <ItemTitle>two</ItemTitle>
    </ItemContent>
  </Item>
</ItemGroup>
<Item>
  <ItemContent>
    <ItemTitle>solo</ItemTitle>
  </ItemContent>
</Item>
