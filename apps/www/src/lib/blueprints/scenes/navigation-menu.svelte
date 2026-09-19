<!-- navigation-menu blueprint: the site bar with its panel of real links
     forced shown ({@attach fromAction(forceShowPopovers)} → showPopover on the popover=auto
     panel; the current section's trigger carries aria-current).
     (composition-first-apis 2026-08-25: Item/Trigger/Panel/Link parts
     replace the items[] data + keyed panel snippet.
     tailwindless BP-B 2026-09-16: utilities → surface atoms, the
     hover underline a pseudo value object on the link atom.) -->
<script lang="ts">
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '$lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '$lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '$lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" justify="center" gap="32" class={cx(bpB.navigationMenuStage)} } {@attach fromAction(forceShowPopovers)}>
  <Stack direction="column" gap="12" class={cx(bpB.navigationMenuSkel)} }>
    <Skeleton class={cx(bpB.navigationMenuSkelBar)}></Skeleton>
  </Stack>
  <NavigationMenu label="site">
    <NavigationMenuItem>
      <NavigationMenuTrigger current>components</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <Stack direction="column" gap="4" class={cx(bpB.navigationMenuPanel)}>
          <a class={cx(bpB.navigationMenuLink)} href="#bp-navmenu">components · overview</a>
          <a class={cx(bpB.navigationMenuLink)} href="#bp-navmenu">dialog family</a>
          <a class={cx(bpB.navigationMenuLink)} href="#bp-navmenu">popover family</a>
          <a class={cx(bpB.navigationMenuLink)} href="#bp-navmenu">data displays</a>
        </Stack>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="#bp-navmenu">recipes</NavigationMenuLink>
    <NavigationMenuLink href="#bp-navmenu">laws</NavigationMenuLink>
  </NavigationMenu>
</Stack>
