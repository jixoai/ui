<!-- navigation-menu blueprint: the site bar with its panel of real links
     forced shown (use:forceShowPopovers → showPopover on the popover=auto
     panel; the current section's trigger carries aria-current).
     (composition-first-apis 2026-08-25: Item/Trigger/Panel/Link parts
     replace the items[] data + keyed panel snippet.) -->
<script lang="ts">
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '$lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '$lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '$lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-8 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <NavigationMenu label="site">
    <NavigationMenuItem>
      <NavigationMenuTrigger current>components</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <div class="flex min-w-44 flex-col gap-1">
          <a class="text-sm hover:underline" href="#bp-navmenu">components · overview</a>
          <a class="text-sm hover:underline" href="#bp-navmenu">dialog family</a>
          <a class="text-sm hover:underline" href="#bp-navmenu">popover family</a>
          <a class="text-sm hover:underline" href="#bp-navmenu">data displays</a>
        </div>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="#bp-navmenu">recipes</NavigationMenuLink>
    <NavigationMenuLink href="#bp-navmenu">laws</NavigationMenuLink>
  </NavigationMenu>
</div>
