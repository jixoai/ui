<!--
  jixoai tabs content (registry/files/ui/tabs/tabs-content.svelte,
  2026-09-01 tabs variant system — contract stable since; the panel
  half carries no scroll/indicator machinery, so the 2026-09-02 fix
  wave left it untouched).
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
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props {
    density?: Density;
    /** pairs with the same value on a TabsTrigger */
    value: string;
    children: Snippet;
    class?: string;
  }

  let { density, value, children, class: className = '' }: Props = $props();

  const tabs = getContext<TabsApi>(TABS_KEY);

  const active = $derived(tabs.selected === value);
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));
</script>

<div
  id="{tabs.uid}-panel-{value}"
  role="tabpanel"
  aria-labelledby="{tabs.uid}-tab-{value}"
  tabindex="0"
  data-jx-tab-panel=""
  data-density={resolvedDensity}
  class={className}
  hidden={!active}
>
  {#if active}
    {@render children()}
  {/if}
</div>
