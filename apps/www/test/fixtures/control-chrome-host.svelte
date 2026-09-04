<!--
  ControlChromeHost — B5 fixture: the integration stamp's resolution
  matrix — group default (self) / opt-in (integrated) / forced self in
  muted & plain; field rows default integrated, self opts out.
-->
<script lang="ts">
  import { ItemGroup, Item, ItemContent, ItemTitle, ItemEnd, ItemField, ItemInput } from '$lib/ui/list-item';

  let v = $state('x');
</script>

<ItemGroup label="g-default">
  <ItemInput label="field in default group" bind:value={v} />
</ItemGroup>

<ItemGroup label="g-integrated" controlChrome="integrated">
  <Item>
    <ItemContent><ItemTitle>raw row</ItemTitle></ItemContent>
    <ItemEnd><input aria-label="raw" /></ItemEnd>
  </Item>
</ItemGroup>

<ItemGroup label="g-muted" mode="muted" controlChrome="integrated">
  <Item>
    <ItemContent><ItemTitle>muted forced self</ItemTitle></ItemContent>
    <ItemEnd><input aria-label="m" /></ItemEnd>
  </Item>
</ItemGroup>

<ItemGroup label="g-plain" mode="plain" controlChrome="integrated">
  <Item>
    <ItemContent><ItemTitle>plain forced self</ItemTitle></ItemContent>
    <ItemEnd><input aria-label="p" /></ItemEnd>
  </Item>
</ItemGroup>

<ItemField label="bare field">
  {#snippet control()}
    <input aria-label="bare" />
  {/snippet}
</ItemField>

<ItemField label="self field" controlChrome="self">
  {#snippet control()}
    <input aria-label="s" />
  {/snippet}
</ItemField>
