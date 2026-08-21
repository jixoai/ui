<!--
  jixoai dropdown menu item (registry/files/ui/dropdown-menu-item.svelte).
  The leaf half of the dropdown-menu pair: a real <button role=menuitem>.
  Activation is the native click (mouse, Enter, Space all arrive here);
  selection runs the caller's onclick FIRST, then closes the menu with
  focus restored to the trigger through the root's context — the APG
  "selection dismisses the menu" contract in two lines of glue.

  The destructive variant is a paint state (red text, destructive hover
  fill), not a different element — semantics stay one menuitem.
  Keyboard walking, typeahead and aria-current highlight live on the
  root (DOM delegation over [role=menuitem]) — this file owns only the
  item's own paint and the select-and-close path.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';

  interface Props extends HTMLButtonAttributes {
    /** destructive paint: red text, destructive hover fill */
    destructive?: boolean;
    children: Snippet;
    class?: string;
  }

  let { destructive = false, class: className = '', onclick, children, ...rest }: Props = $props();

  /** context surface from dropdown-menu.svelte; raw consumer items
      (not this component) manage their own close path */
  const menu = getContext<{ closeAndRestore(): void }>(Symbol.for('jx-dropdown-menu'));

  function handleActivate(event: MouseEvent): void {
    onclick?.(event);
    menu?.closeAndRestore();
  }
</script>

<button
  type="button"
  role="menuitem"
  class="jx-menu-item {className}"
  class:jx-menu-item-destructive={destructive}
  onclick={handleActivate}
  {...rest}
>
  {@render children()}
</button>

<style>
  .jx-menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 0;
    background: transparent;
    color: inherit;
    font-family: var(--font-sans);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background-color 100ms ease-out, color 100ms ease-out;
  }
  .jx-menu-item:hover,
  .jx-menu-item[aria-current='true'],
  .jx-menu-item:focus-visible {
    background: color-mix(in oklab, currentColor 8%, transparent);
    outline: none;
  }
  .jx-menu-item:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-menu-item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .jx-menu-item-destructive {
    color: var(--destructive);
  }
  .jx-menu-item-destructive:hover,
  .jx-menu-item-destructive[aria-current='true'] {
    background: var(--destructive);
    color: var(--destructive-foreground);
  }
</style>
