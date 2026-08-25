<!--
  jixoai menubar menu item (registry/files/ui/menubar/menubar-menu-item.svelte).
  The leaf of the family: an item part inside a MenubarPanel, in two
  forms — href (an <a role=menuitem>: navigation leaves the page) or
  onselect (a <button role=menuitem>: the action runs, then the panel
  closes with focus restored to the trigger through the bar's context —
  the APG "selection dismisses the menu" contract). Keyboard walking
  lives on the panel (DOM delegation over scoped [role=menuitem]) —
  this file owns only the item's own paint and the select-and-close
  path. Separators stay plain <hr> (the W3C element law).

  child({ props }) — BUTTON form only (the concrete element-kind law):
  the consumer renders their own <button {...props}> keeping
  role=menuitem; consumer handlers appended after the spread REPLACE
  the part's select-and-close (they own the consequences).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { MENUBAR_KEY, type MenubarApi } from './menubar.svelte';
  import { MENUBAR_ITEM_KEY, type MenubarItemApi } from './menubar-item.svelte';

  interface Props extends Omit<HTMLButtonAttributes, 'href'> {
    /** link form: renders an <a role=menuitem> that navigates */
    href?: string;
    /** action form: runs, then the panel closes + focus restores */
    onselect?: (event: MouseEvent) => void;
    class?: string;
    /** button-form element replacement ({...props} keeps the semantics) */
    child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;
    children: Snippet;
  }

  let {
    href,
    onselect,
    class: className = '',
    child,
    children,
    ...rest
  }: Props = $props();

  const bar = getContext<MenubarApi>(MENUBAR_KEY);
  const item = getContext<MenubarItemApi>(MENUBAR_ITEM_KEY);
  if (!bar || !item) {
    throw new Error(
      'jixoai menubar: MenubarMenuItem must live inside a MenubarPanel inside a MenubarItem',
    );
  }

  function handleActivate(event: MouseEvent): void {
    onselect?.(event);
    bar.closePanel(`${item.id}-panel`);
    document.getElementById(`${item.id}-trigger`)?.focus();
  }

  const paint = $derived(
    cn(
      'flex w-full box-border cursor-pointer items-center gap-2 border-0 bg-transparent px-[0.625rem] py-[0.4375rem] text-left font-sans text-[13px] text-inherit no-underline transition-[background-color,color] duration-100 ease-out hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
      className,
    ),
  );

  const childProps = $derived<HTMLButtonAttributes & { class: string }>({
    ...rest,
    type: 'button',
    role: 'menuitem',
    onclick: handleActivate,
    class: paint,
  });
</script>

{#if child}
  {@render child({ props: childProps })}
{:else if href}
  <a
    {href}
    role="menuitem"
    data-jx-menubar-menu-item=""
    class={paint}
    onclick={handleActivate}
    {...rest}
  >
    {@render children()}
  </a>
{:else}
  <button
    type="button"
    role="menuitem"
    data-jx-menubar-menu-item=""
    class={paint}
    onclick={handleActivate}
    {...rest}
  >
    {@render children()}
  </button>
{/if}
