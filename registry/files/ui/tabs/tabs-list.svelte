<!--
  jixoai tabs list (registry/files/ui/tabs/tabs-list.svelte).
  The tablist half of the tabs family: role=tablist strip carrying the
  APG keyboard contract — Arrow keys walk the triggers of the list's
  orientation axis (horizontal: ←/→, vertical: ↑/↓, RTL-aware), Home/End
  jump the ends, the walk WRAPS, and disabled triggers are skipped.
  Focus is NOT trapped: Tab leaves the tablist entirely (roving
  tabindex — only the selected trigger is tabbable).

  Activation follows the root's `activation` prop: 'automatic' selects
  on every focus move (terminal immediacy); 'manual' moves focus only —
  Enter/Space commit through the trigger's native click.
  Triggers are whatever the consumer nests (tabs-trigger.svelte pairs
  here, but any [role=tab] joins the walk) — keyboard handling is DOM
  delegation over :scope [role=tab]:not([disabled]), no registration.

  tw4 (2026-08-24): PURE utility migration, zero css residue — the
  orientation axis is a prop, so the horizontal/vertical border rides
  conditional utility strings; jx-tabs-vertical stays as the hook the
  trigger's selected-bar residue keys on.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TABS_KEY, type TabsApi } from './tabs.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** axis of travel: horizontal ←/→ · vertical ↑/↓ (layout is yours) */
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
  }

  let {
    orientation = 'horizontal',
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const tabs = getContext<TabsApi>(TABS_KEY);

  let listEl = $state<HTMLDivElement>();

  /** this list's OWN triggers — nested tablists (a panel hosting its own
   *  Tabs) keep their own walker, so closest() must resolve HERE */
  function ownTabs(): HTMLElement[] {
    return [...(listEl?.querySelectorAll<HTMLElement>('[role=tab]') ?? [])].filter(
      (tab) => tab.closest('[role=tablist]') === listEl,
    );
  }

  // the empty state (no focus, no selection) renders every trigger
  // tabbable for SSR/JS-off entry; trim to the FIRST enabled tab only —
  // exactly one tab stop, per the APG roving law (disabled triggers
  // explicitly -1: browsers skip them, the DOM should say so too)
  // TODO(batch-3): re-trim when a trigger's disabled state flips
  // dynamically — the effect only runs on tabStop transitions today
  $effect(() => {
    if (tabs.tabStop !== '' || !listEl) return;
    const triggers = ownTabs();
    const firstEnabled = triggers.find((tab) => !tab.hasAttribute('disabled'));
    for (const tab of triggers) {
      tab.setAttribute('tabindex', tab === firstEnabled ? '0' : '-1');
    }
  });

  /** APG keyboard walk — arrows along the axis (flipped under an
   *  inherited RTL direction — nearest [dir] ancestor, html included),
   *  Home/End to the ends; wraps; skips disabled triggers */
  function handleKeydown(event: KeyboardEvent) {
    const rtl =
      orientation === 'horizontal' && ((listEl?.closest('[dir]') as HTMLElement | null)?.dir ?? 'ltr') === 'rtl';
    const forward = orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const back = orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    if (event.key !== forward && event.key !== back && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    const triggers = ownTabs().filter((tab) => !tab.hasAttribute('disabled'));
    if (triggers.length === 0) return;
    const current = triggers.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? triggers[0]
        : event.key === 'End'
          ? triggers.at(-1)
          : current === -1
            ? triggers[0]
            : triggers[(current + (event.key === forward ? 1 : -1) + triggers.length) % triggers.length];
    // focus rides the roving tabindex: the trigger's onfocus moves the
    // tab stop; automatic activation ALSO selects on the focus move,
    // manual waits for Enter/Space — the trigger's native click path
    if (!next) return;
    next.focus();
    if (tabs.activation === 'automatic') next.click();
  }
</script>

<div
  bind:this={listEl}
  data-jx-tabs-list=""
  class={cn(
    `jx-tabs-${orientation} flex items-stretch [gap:var(--jx-gap)] box-border`,
    orientation === 'vertical' ? 'flex-col border-r border-border' : 'border-b border-border',
    className,
  )}
  onkeydown={handleKeydown}
  {...rest}
  role="tablist"
  aria-orientation={orientation}
>
  {@render children()}
</div>
