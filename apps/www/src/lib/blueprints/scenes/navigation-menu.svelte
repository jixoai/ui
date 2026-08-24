<!-- navigation-menu blueprint: the site bar with its panel of real links
     forced shown (use:forceShowPopovers → showPopover on the popover=auto
     panel; the current section's trigger carries aria-current). -->
<script lang="ts">
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import type { NavMenuItem } from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

  const items: NavMenuItem[] = [
    { id: 'components', label: 'components', hasPanel: true, current: true },
    { id: 'recipes', label: 'recipes', href: '#bp-navmenu' },
    { id: 'laws', label: 'laws', href: '#bp-navmenu' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-8 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <NavigationMenu label="site" {items}>
    {#snippet panel(item)}
      <div class="flex min-w-44 flex-col gap-1">
        <a class="text-sm hover:underline" href="#bp-navmenu">{item.label} · overview</a>
        <a class="text-sm hover:underline" href="#bp-navmenu">dialog family</a>
        <a class="text-sm hover:underline" href="#bp-navmenu">popover family</a>
        <a class="text-sm hover:underline" href="#bp-navmenu">data displays</a>
      </div>
    {/snippet}
  </NavigationMenu>
</div>
