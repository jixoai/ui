<!-- density blueprint: the 尺规 scale — four densities, every number
     an equation from the 4px ruler. -->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd, ItemAfter } from '$lib/ui/list-item';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    U = 4px · T = 13px · rows 28/32/40/48
  </div>
  {#each ['xs', 'sm', 'default', 'lg'] as const as d (d)}
    <ItemGroup mode="plain" size={d} class="max-w-[20rem]">
      <Item>
        <ItemContent>
          <ItemTitle>{d} · the derived row</ItemTitle>
        </ItemContent>
        <ItemEnd><ItemAfter>{d === 'lg' ? '48px' : d === 'default' ? '40px' : d === 'sm' ? '32px' : '28px'}</ItemAfter></ItemEnd>
      </Item>
    </ItemGroup>
  {/each}
</div>
