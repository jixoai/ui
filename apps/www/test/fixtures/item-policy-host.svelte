<!-- task-8 dynamic-policy fixture: group props flip live (rerender);
     a nested group (lawfully inside a row's content — never a raw
     ul child) proves context shadowing (impl-review blocker 7) -->
<script lang="ts">
  import { Item, ItemGroup, ItemContent, ItemTitle } from '../../src/lib/ui/list-item';

  let {
    mode,
    dividers,
    density,
    layout,
  }: {
    mode: 'default' | 'muted' | 'plain';
    dividers?: 'auto' | 'none';
    density: 'default' | 'sm';
    layout: 'standard' | 'media';
  } = $props();
</script>

<ItemGroup {mode} {dividers} {density} {layout} data-probe="outer">
  <Item>
    <ItemContent><ItemTitle>outer row</ItemTitle></ItemContent>
  </Item>
  <Item>
    <ItemContent>
      <ItemTitle>hosts the nested group</ItemTitle>
      <ItemGroup data-probe="inner" density="sm">
        <Item>
          <ItemContent><ItemTitle>inner row</ItemTitle></ItemContent>
        </Item>
      </ItemGroup>
    </ItemContent>
  </Item>
</ItemGroup>
