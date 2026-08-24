<!--
  Test host for the navigation-menu contract: two panel triggers + one
  plain link; "components" is the current section.
-->
<script lang="ts">
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
</script>

<NavigationMenu
  label="site"
  items={[
    { id: 'registry', label: 'registry', hasPanel: true },
    { id: 'components', label: 'components', hasPanel: true, current: true },
    { id: 'docs', label: 'docs', href: '/docs' },
  ]}
>
  {#snippet panel(item)}
    <p>panel of {item.label}</p>
  {/snippet}
</NavigationMenu>
