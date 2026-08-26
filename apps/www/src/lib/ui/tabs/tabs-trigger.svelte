<!--
  jixoai tabs trigger (registry/files/ui/tabs/tabs-trigger.svelte).
  The tab half of the tabs family: a real <button role=tab> wired to
  the root's context — aria-selected, aria-controls and the roving
  tabindex (selected ⇒ tabbable, otherwise −1; the arrows in
  tabs-list.svelte do the walking). Deterministic ids pair it with the
  matching tabs-content for assistive tech, lazily rendered or not.

  Terminal styling: font-nav micro-label; the selected tab carries a
  2px brand underline that rides the list's bottom border (negative
  margin re-draws OVER the border — no layout shift on selection).

  tw4 (2026-08-24): paint as token utilities in the markup (selected/
  disabled ride conditional strings — the states are JS-known); ONLY
  the selected ::after bar (a pseudo-element build, vertical variant
  via the .jx-tabs-vertical descendant) remains in tabs-trigger.css —
  D1-exempt residue.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TABS_KEY, type TabsApi } from './tabs.svelte';
  import './tabs-trigger.css';

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
  // the tab stop follows focus (roving law). The tabStop === '' arm is
  // the EMPTY state (nothing focused, nothing selected): every trigger
  // renders tabbable so keyboard/JS-off users can enter at all —
  // tabs-list trims this to "first enabled only" right after mount
  const isTabStop = $derived(tabs.tabStop === value || tabs.tabStop === '');
</script>

<button
  type="button"
  role="tab"
  id="{tabs.uid}-tab-{value}"
  aria-selected={selected}
  aria-controls="{tabs.uid}-panel-{value}"
  tabindex={isTabStop ? 0 : -1}
  data-jx-tab=""
  class={cn(
    'relative inline-flex appearance-none items-center [gap:var(--jx-gap)] border-0 bg-transparent [padding-inline:var(--jx-inset)] [min-block-size:var(--jx-hit)] font-nav [font-size:var(--jx-text)] [line-height:var(--jx-line)] uppercase tracking-[0.12em] cursor-pointer transition-colors duration-150 ease-out hover:[&:not(:disabled)]:text-foreground disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1',
    selected ? 'jx-tab-selected text-foreground' : 'text-muted-foreground',
    className,
  )}
  {disabled}
  onclick={() => tabs.select(value)}
  onfocus={() => tabs.setTabStop(value)}
>
  {@render children()}
</button>
