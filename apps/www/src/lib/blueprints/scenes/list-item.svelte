<!-- list-item blueprint: the kernel proof — density ladder, the
     shared media ruler (cross-row alignment), mixed end lanes. -->
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
  <ItemGroup label="registry" ruler="media-content-end" class="max-w-[26rem]">
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
  <ItemGroup label="settings" mode="plain" dividers="auto" density="sm" class="max-w-[26rem]">
    <ItemToggle label="Fast builds" description="skip typechecking" bind:checked={fast} />
  </ItemGroup>
</div>
