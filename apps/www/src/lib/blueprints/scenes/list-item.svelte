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
  import { icons } from '$lib/icons';
  import Avatar from '$lib/ui/avatar/avatar.svelte';

  let fast = $state(true);
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10">
  <ItemGroup ruler="media-content-end" class="w-[34rem] max-w-full">
    <Item href="#one">
      <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
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
  <ItemGroup mode="plain" dividers="auto" density="sm" class="w-[34rem] max-w-full">
    <ItemToggle label="Fast builds" bind:checked={fast} />
  </ItemGroup>
</div>
