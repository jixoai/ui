<!--
  jixoai menubar trigger (registry/files/ui/menubar/menubar-trigger.svelte).
  A real <button role=menuitem aria-haspopup="menu"> reading the Item's
  context: id `${item.id}-trigger`, aria-controls `${item.id}-panel` —
  rendered whether or not the panel currently exists (a trigger without
  any panel ever rendered is caller error; the derived id is always
  stable). Click toggles the panel through the bar's registered
  handles; the roving tabindex follows the bar's tab stop (the
  empty-state law: all triggers render tabbable until the bar trims
  after mount).

  tw4 (2026-08-24): paint as token utilities (open state is JS-known →
  conditional string); the last-trigger border law lives in menubar.css
  (`:where([data-jx-menubar-item]:last-child) [data-jx-menubar-trigger]`).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { MENUBAR_KEY, type MenubarApi } from './menubar.svelte';
  import { MENUBAR_ITEM_KEY, type MenubarItemApi } from './menubar-item.svelte';
  import { menubarStyles } from './menubar.stylex';

  interface Props extends HTMLButtonAttributes {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const bar = getContext<MenubarApi>(MENUBAR_KEY);
  const item = getContext<MenubarItemApi>(MENUBAR_ITEM_KEY);
  if (!bar || !item) {
    throw new Error('jixoai menubar: MenubarTrigger must live inside a MenubarItem inside a Menubar');
  }

  const triggerId = `${item.id}-trigger`;
  const panelId = `${item.id}-panel`;
</script>

<button
  type="button"
  data-jx-menubar-trigger=""
  data-density={bar.density}
  role="menuitem"
  aria-haspopup="menu"
  class={cn(
    'jx-menubar-trigger',
    cx(menubarStyles.trigger),
    bar.openPanelId === panelId ? cx(menubarStyles.triggerOpen) : '',
    className,
  )}
  onfocus={() => bar.setTabStop(triggerId)}
  onclick={() =>
    bar.openPanelId === panelId ? bar.closePanel(panelId) : bar.openPanel(panelId, false)}
  {...rest}
  id={triggerId}
  aria-expanded={bar.openPanelId === panelId}
  aria-controls={panelId}
  tabindex={bar.tabStop === '' || bar.tabStop === triggerId ? 0 : -1}
>
  {@render children()}
</button>
