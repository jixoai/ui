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

  interface Props extends HTMLButtonAttributes {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

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
  role="menuitem"
  aria-haspopup="menu"
  aria-expanded={bar.openPanelId === panelId}
  aria-controls={panelId}
  tabindex={bar.tabStop === '' || bar.tabStop === triggerId ? 0 : -1}
  class={cn(
    'cursor-pointer border-r border-border bg-transparent px-[0.875rem] py-[0.4375rem] font-nav text-xs uppercase tracking-[0.1em] text-muted-foreground transition-[color,background-color] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1',
    bar.openPanelId === panelId ? 'bg-muted text-foreground' : '',
    className,
  )}
  onfocus={() => bar.setTabStop(triggerId)}
  onclick={() =>
    bar.openPanelId === panelId ? bar.closePanel(panelId) : bar.openPanel(panelId, false)}
  {...rest}
  id={triggerId}
>
  {@render children()}
</button>
