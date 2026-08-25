<!--
  composition-c fixture: the navigation-menu family — two panel items
  (the second is the current section) + one bare link.
-->
<script lang="ts">
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '../../src/lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '../../src/lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '../../src/lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '../../src/lib/ui/navigation-menu/navigation-menu-link.svelte';
</script>

<NavigationMenu label="site">
  <NavigationMenuItem>
    <NavigationMenuTrigger>registry</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <a class="c-nav-link" href="/registry">registry link a</a>
      <a class="c-nav-link" href="/registry">registry link b</a>
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuItem>
    <NavigationMenuTrigger current>components</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <a class="c-nav-link" href="/components">components link a</a>
      <a class="c-nav-link" href="/components">components link b</a>
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuLink href="/docs">docs</NavigationMenuLink>
</NavigationMenu>
