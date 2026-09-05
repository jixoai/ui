<!-- list-item spec fixture: a labeled group with two rows (one
     linked) + an explicit divider, plus one standalone row outside
     the group (openspec list-item-systemization task 2 fixture) -->
<script lang="ts">
  import {
    Item,
    ItemGroup,
    ItemDivider,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemEnd,
  } from '../../src/lib/ui/list-item';
</script>

<ItemGroup label="rows">
  <Item href="/one">
    <ItemContent>
      <ItemTitle>one</ItemTitle>
      <ItemDescription>linked row</ItemDescription>
    </ItemContent>
    <ItemEnd><span>go</span></ItemEnd>
  </Item>
  <ItemDivider />
  <Item>
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
