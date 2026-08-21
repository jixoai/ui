<!--
  jixoai tabs trigger (registry/files/ui/tabs-trigger.svelte).
  The tab half of the tabs family: a real <button role=tab> wired to
  the root's context — aria-selected, aria-controls and the roving
  tabindex (selected ⇒ tabbable, otherwise −1; the arrows in
  tabs-list.svelte do the walking). Deterministic ids pair it with the
  matching tabs-content for assistive tech, lazily rendered or not.

  Terminal styling: font-nav micro-label; the selected tab carries a
  2px brand underline that rides the list's bottom border (negative
  margin re-draws OVER the border — no layout shift on selection).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { TABS_KEY, type TabsApi } from './tabs.svelte';

  interface Props {
    /** the tab's identity — pairs with the same value on a TabsContent */
    value: string;
    disabled?: boolean;
    children: Snippet;
    class?: string;
  }

  let { value, disabled = false, children, class: className = '' }: Props = $props();

  const tabs = getContext<TabsApi>(TABS_KEY);

  const selected = $derived(tabs.selected === value);
</script>

<button
  type="button"
  role="tab"
  id="{tabs.uid}-tab-{value}"
  aria-selected={selected}
  aria-controls="{tabs.uid}-panel-{value}"
  tabindex={tabs.tabStop === value ? 0 : -1}
  class="jx-tab {className}"
  class:jx-tab-selected={selected}
  {disabled}
  onclick={() => tabs.select(value)}
  onfocus={() => tabs.setTabStop(value)}
>
  {@render children()}
</button>

<style>
  .jx-tab {
    appearance: none;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border: 0;
    background: transparent;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 150ms ease-out;
  }
  .jx-tab:hover:not(:disabled) {
    color: var(--foreground);
  }
  .jx-tab:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .jx-tab:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* selection: foreground text + a 2px brand bar redrawn over the
     list's own bottom border (or the right border, vertical) */
  .jx-tab-selected {
    color: var(--foreground);
  }
  .jx-tab-selected::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -1px;
    height: 2px;
    background: var(--primary);
  }
  :global(.jx-tabs-vertical) .jx-tab-selected::after {
    inset-block: 0;
    inset-inline: auto;
    left: auto;
    right: -1px;
    width: 2px;
    height: auto;
  }
</style>
