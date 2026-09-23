<!--
  jixoai dropdown menu item (registry/files/ui/dropdown-menu/dropdown-menu-item.svelte).
  The leaf half of the dropdown-menu pair: a real <button role=menuitem>.
  Activation is the native click (mouse, Enter, Space all arrive here);
  selection runs the caller's onclick FIRST, then closes the menu with
  focus restored to the trigger through the root's context — the APG
  "selection dismisses the menu" contract in two lines of glue.

  The destructive variant is a paint state (red text, destructive hover
  fill), not a different element — semantics stay one menuitem.
  Keyboard walking, typeahead and the walk highlight (data-walk-
  active) live on the root (DOM delegation over [role=menuitem]) —
  this file owns only the item's own paint and the select-and-close
  path.

  tw4 (2026-08-24): static paint as token utilities (destructive rides
  a conditional string); the hover/[data-walk-active]/focus-visible
  state machines stay in dropdown-menu.css (shared with the root) —
  the walk attribute is authored imperatively by the ROOT on any
  menuitem, including raw consumer items, so it can never be a markup
  utility.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import type { Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    type DensityLane,
    type QueryResult,
  } from '$lib/defaults.svelte';
  import { DropdownMenuDefaults } from './dropdown-menu-defaults.svelte';
  import { dropdownMenuStyles } from './dropdown-menu.stylex';
  import './dropdown-menu.css';

  interface Props extends Omit<HTMLButtonAttributes, 'color'> {
    /** destructive paint: red text, destructive hover fill */
    destructive?: boolean;
    /** the universal §4 lane (W3-C — the legacy rung spellings ride
     *  the lane's aliases verbatim); an explicit prop beats the menu
     *  root's provided tier */
    density?: DensityLane | QueryResult<DensityLane>;
    children: Snippet;
    class?: string;
  }

  let { destructive = false, density, class: className = '', onclick, children, ...rest }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // density resolves through the family contract (the item inherits
  // the menu root's provided tier; an explicit prop beats it; no
  // opinion stamps nothing — the item rides the ambient css scope)
  const d = $derived(DropdownMenuDefaults.resolve({ density }));

  /** context surface from dropdown-menu.svelte; raw consumer items
      (not this component) manage their own close path */
  const menu = getContext<{ closeAndRestore(): void }>(Symbol.for('jx-dropdown-menu'));

  function handleActivate(event: MouseEvent): void {
    onclick?.(event);
    menu?.closeAndRestore();
  }

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
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

  // the item's paint ladder: body + the destructive/plain ink pair
  // (the hover/walk/focus state machines live in dropdown-menu.css —
  // the walk attribute is authored imperatively by the ROOT on any
  // menuitem, including raw consumer items)
  const ITEM_INK = {
    plain: cx(dropdownMenuStyles.itemPlain),
    destructive: cx(dropdownMenuStyles.itemDestructive),
  } as const;
</script>

<button
  type="button"
  role="menuitem"
  data-density={densityRungOf(d.density)}
  class={cn(
    'jx-menu-item',
    cx(dropdownMenuStyles.item),
    destructive ? cn('jx-menu-item-destructive', ITEM_INK.destructive) : ITEM_INK.plain,
    className,
  )}
  onclick={handleActivate}
  {...rest}
>
  {@render children()}
</button>
