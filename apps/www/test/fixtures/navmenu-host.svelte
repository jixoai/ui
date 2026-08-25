<!--
  Test host for the navigation-menu contract (composition-first-apis:
  the family composes Item/Trigger/Panel/Link parts — items[], the
  keyed panel snippet, hasPanel and navColumns are dead): two panel
  items + one plain link; "components" is the current section.
-->
<script lang="ts">
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '../../src/lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '../../src/lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '../../src/lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '../../src/lib/ui/navigation-menu/navigation-menu-link.svelte';
</script>

<NavigationMenu label="site">
  <NavigationMenuItem id="registry">
    <NavigationMenuTrigger>registry</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <p>panel of registry</p>
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuItem id="components">
    <NavigationMenuTrigger current>components</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <p>panel of components</p>
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuLink href="/docs">docs</NavigationMenuLink>
</NavigationMenu>
