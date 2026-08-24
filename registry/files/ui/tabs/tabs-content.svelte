<!--
  jixoai tabs content (registry/files/ui/tabs-content.svelte).
  The panel half of the tabs family: role=tabpanel labelled by its
  trigger (deterministic ids — no registration handshake), tabindex=0
  per APG so the panel body is keyboard-reachable even when it holds no
  focusable elements. Hidden (attribute, not CSS) unless its value is
  selected — inert content, no interactions leak from background panels.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { TABS_KEY, type TabsApi } from './tabs.svelte';

  interface Props {
    /** pairs with the same value on a TabsTrigger */
    value: string;
    children: Snippet;
    class?: string;
  }

  let { value, children, class: className = '' }: Props = $props();

  const tabs = getContext<TabsApi>(TABS_KEY);

  const active = $derived(tabs.selected === value);
</script>

<div
  id="{tabs.uid}-panel-{value}"
  role="tabpanel"
  aria-labelledby="{tabs.uid}-tab-{value}"
  tabindex="0"
  data-jx-tab-panel=""
  class={className}
  hidden={!active}
>
  {#if active}
    {@render children()}
  {/if}
</div>
