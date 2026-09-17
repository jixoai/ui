<!-- density blueprint: the 尺规 scale — five densities (2xs joined
     2026-09-05-density-2xs), every number an equation from the 4px ruler. -->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd, ItemAfter } from '$lib/ui/list-item';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpA.densityStage)}>
  <div class={cx(bpA.densityEyebrow)}>
    U = 4px · T = 13px · rows 24/28/32/40/48
  </div>
  {#each ['2xs', 'xs', 'sm', 'default', 'lg'] as const as d (d)}
    <ItemGroup mode="plain" density={d} class={cx(bpA.densityGroup)}>
      <Item>
        <ItemContent>
          <ItemTitle>{d} · the derived row</ItemTitle>
        </ItemContent>
        <ItemEnd><ItemAfter>{d === 'lg' ? '48px' : d === 'default' ? '40px' : d === 'sm' ? '32px' : d === 'xs' ? '28px' : '24px'}</ItemAfter></ItemEnd>
      </Item>
    </ItemGroup>
  {/each}
</div>
