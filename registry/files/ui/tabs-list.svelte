<!--
  jixoai tabs list (registry/files/ui/tabs-list.svelte).
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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
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

  /** APG keyboard walk — arrows along the axis (flipped in RTL),
   *  Home/End to the ends; wraps; skips disabled triggers */
  function handleKeydown(event: KeyboardEvent) {
    const rtl = orientation === 'horizontal' && (listEl?.matches('[dir="rtl"]') ?? false);
    const forward = orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const back = orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    if (event.key !== forward && event.key !== back && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    const triggers = [
      ...(listEl?.querySelectorAll<HTMLElement>('[role=tab]:not([disabled])') ?? []),
    ];
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
    next.focus();
    // automatic activation selects on focus move; manual waits for
    // Enter/Space — the trigger's own native click path
    if (tabs.activation === 'automatic') next.click();
  }
</script>

<div
  bind:this={listEl}
  role="tablist"
  aria-orientation={orientation}
  class="jx-tabs-list jx-tabs-{orientation} {className}"
  onkeydown={handleKeydown}
  {...rest}
>
  {@render children()}
</div>

<style>
  .jx-tabs-list {
    display: flex;
    align-items: stretch;
    gap: 0.125rem;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border);
  }
  .jx-tabs-vertical {
    flex-direction: column;
    align-items: stretch;
    border-bottom: 0;
    border-right: 1px solid var(--border);
  }
</style>
