<!--
  jixoai navigation menu trigger
  (registry/files/ui/navigation-menu/navigation-menu-trigger.svelte).
  A real <button aria-haspopup="true"> reading the Item's context:
  id `${item.id}-trigger`, aria-controls `${item.id}-panel` — rendered
  whether or not the panel currently exists (a trigger without any
  panel ever rendered is caller error; the derived id is always
  stable). The open/close toggle rides the DECLARATIVE popovertarget
  wire (the Popover primitive's zero-listener path — the invoker
  association exempts the trigger from light dismiss by construction);
  aria-expanded mirrors ONLY the bar's toggle-seam state; the roving
  tabindex follows the bar's tab stop (the empty-state law: all
  triggers render tabbable until the bar trims after mount).

  The current-section paint: `current` marks THIS trigger
  aria-current="true" (the page's own truth, passed in — the menu
  never guesses) and the current/open color order law is preserved
  verbatim from the pre-composed era (open beats current, hover beats
  current-but-closed).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { NAVIGATION_MENU_KEY, type NavigationMenuApi } from './navigation-menu.svelte';
  import {
    NAVIGATION_MENU_ITEM_KEY,
    type NavigationMenuItemApi,
  } from './navigation-menu-item.svelte';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { navMenuStyles } from './navigation-menu.stylex';

  interface Props extends HTMLButtonAttributes {
    /** the current section: paints aria-current="true" + the brand color */
    current?: boolean;
    class?: string;
    children: Snippet;
  }

  let { current = false, class: className = '', children, ...rest }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  const bar = getContext<NavigationMenuApi>(NAVIGATION_MENU_KEY);
  const item = getContext<NavigationMenuItemApi>(NAVIGATION_MENU_ITEM_KEY);
  if (!bar || !item) {
    throw new Error(
      'jixoai navigation-menu: NavigationMenuTrigger must live inside a NavigationMenuItem inside a NavigationMenu',
    );
  }

  const triggerId = `${item.id}-trigger`;
  const panelId = `${item.id}-panel`;
</script>

<button
  type="button"
  data-jx-navmenu-trigger=""
  data-density={densityRungOf(bar.densityOpinion)}
  aria-haspopup="true"
  aria-current={current ? 'true' : undefined}
  class={cn(
    // the hover ink + focus ring are native pseudos in
    // navigation-menu.css (unlayered :where()); the ink ladder here
    // keeps the order law: open beats current, hover beats
    // current-but-closed
    cx(navMenuStyles.trigger),
    bar.openPanelId === panelId
      ? cx(navMenuStyles.inkOpen)
      : current
        ? cx(navMenuStyles.inkCurrent)
        : cx(navMenuStyles.inkIdle),
    className,
  )}
  onfocus={() => bar.setTabStop(triggerId)}
  {...rest}
  id={triggerId}
  popovertarget={panelId}
  aria-expanded={bar.openPanelId === panelId}
  aria-controls={panelId}
  tabindex={bar.tabStop === '' || bar.tabStop === triggerId ? 0 : -1}
>
  {@render children()}
</button>
