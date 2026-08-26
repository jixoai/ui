<!--
  chrome-density-tier r3 fixture: a NavigationMenu whose `density`
  prop rerenders through the no-opinion → opinion → no-opinion cycle,
  with a NESTED NavigationMenu as the density-context consumer. Locks
  the honest-opinion provider (Codex r2 P1): the context is always on
  and reactive in BOTH directions — an established opinion reaches the
  nested bar's stamps, a withdrawn one un-stamps them.
-->
<script lang="ts">
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import type { Density } from '$lib/density.svelte';

  let { density = undefined as Density | undefined }: { density?: Density } = $props();
</script>

<NavigationMenu {density} label="host">
  <NavigationMenuLink href="/">leaf</NavigationMenuLink>
  <NavigationMenu label="nested">
    <NavigationMenuLink href="/">nested leaf</NavigationMenuLink>
  </NavigationMenu>
</NavigationMenu>
