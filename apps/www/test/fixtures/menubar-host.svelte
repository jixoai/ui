<!--
  Test host for the menubar contract: two top menus with button items.
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar.svelte';
</script>

<Menubar
  label="app"
  items={[
    { id: 'file', label: 'File' },
    { id: 'edit', label: 'Edit' },
  ]}
>
  {#snippet panel(item)}
    <button type="button" role="menuitem">{item.label} action a</button>
    <button type="button" role="menuitem">{item.label} action b</button>
  {/snippet}
</Menubar>
