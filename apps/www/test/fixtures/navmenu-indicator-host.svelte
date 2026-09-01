<!--
  Test host for the navigation-menu indicator part (2026-09-01): a
  three-entry bar under the default navigation motion, a pure-waapi
  bar, and an exclusion bar whose only current entry lives inside an
  open popover panel (mega links never steal the bar indicator).
-->
<script lang="ts">
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '../../src/lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '../../src/lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '../../src/lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '../../src/lib/ui/navigation-menu/navigation-menu-link.svelte';
  import NavigationMenuIndicator from '../../src/lib/ui/navigation-menu/navigation-menu-indicator.svelte';
</script>

<div data-testid="navigation-motion">
  <NavigationMenu label="primary">
    <NavigationMenuIndicator />
    <NavigationMenuLink href="/" current={true}>overview</NavigationMenuLink>
    <NavigationMenuItem id="docs-host">
      <NavigationMenuTrigger current={false}>docs</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <NavigationMenuLink href="/docs">inside panel</NavigationMenuLink>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="/components" current={false}>components</NavigationMenuLink>
  </NavigationMenu>
</div>

<div data-testid="waapi-motion">
  <NavigationMenu label="secondary">
    <NavigationMenuIndicator motion="waapi" name="never-stamped" />
    <NavigationMenuLink href="/a" current={true}>a</NavigationMenuLink>
    <NavigationMenuLink href="/b" current={false}>b</NavigationMenuLink>
  </NavigationMenu>
</div>

<div data-testid="excluded">
  <NavigationMenu label="tertiary">
    <NavigationMenuIndicator />
    <NavigationMenuItem id="mega-host">
      <NavigationMenuTrigger current={false}>sections</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <NavigationMenuLink href="/x" current={true}>current INSIDE the panel</NavigationMenuLink>
      </NavigationMenuPanel>
    </NavigationMenuItem>
  </NavigationMenu>
</div>
