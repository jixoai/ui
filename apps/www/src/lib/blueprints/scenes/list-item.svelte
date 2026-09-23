<!-- list-item blueprint: the kernel proof — density ladder, the
     shared media ruler (cross-row alignment), mixed end lanes.

     site-polish F8 (measure-then-fit): the groups render WIDER than
     30rem — the item-list is a container-query container and at
     max-w-[26rem] the narrow law stacked every end lane onto its own
     row (~93px rows), blowing the composition past the 360px stage and
     clipping it top and bottom. Group labels are dropped: at the wide
     posture the ruler + end lanes ARE the story, and the tile must fit
     the stage with nothing clipped (the build's overflow probe fails
     on any escaping text run). -->
<script lang="ts">
  import {
    Item,
    ItemGroup,
    ItemDivider,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemEnd,
    ItemAfter,
    ItemChevron,
    ItemToggle,
  } from '$lib/ui/list-item';
  import Icon from '$lib/ui/icon';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  let fast = $state(true);

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" justify="center" gap="20" class={cx(bpA.listItemStage)}>
  <ItemGroup ruler="media-content-end" class={cx(bpA.listItemGroup)}>
    <Item href="#one">
      <ItemMedia variant="icon"><Icon name="folder" /></ItemMedia>
      <ItemContent>
        <ItemTitle>item one</ItemTitle>
      </ItemContent>
      <ItemEnd><ItemAfter>3</ItemAfter><ItemChevron /></ItemEnd>
    </Item>
    <ItemDivider />
    <Item href="#two">
      <ItemContent>
        <ItemTitle>no media — content stays aligned</ItemTitle>
      </ItemContent>
      <ItemEnd><ItemChevron /></ItemEnd>
    </Item>
    <Item>
      <ItemMedia>
        <Avatar name="Ada Lovelace" size="sm" tooltip={false} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>shared ruler rows</ItemTitle>
      </ItemContent>
      <ItemEnd><ItemAfter>12:04</ItemAfter></ItemEnd>
    </Item>
  </ItemGroup>
  <ItemGroup mode="plain" dividers="auto" density="sm" class={cx(bpA.listItemGroup)}>
    <ItemToggle label="Fast builds" bind:checked={fast} />
  </ItemGroup>
</Stack>
