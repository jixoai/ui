<!--
  The minimal plugin root (test fixture, context-plugin-system):
  provideContextPlugins during component init — the registration seam
  every other context-plugin fixture composes. Optionally reports the
  built scope into a holder prop for structural assertions.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideContextPlugins, type UnknownPlugin } from '../../src/lib/context-plugin.svelte';

  let {
    plugins = [],
    root,
    holder,
    children,
  }: {
    plugins?: readonly UnknownPlugin[];
    root?: HTMLElement;
    holder?: { scope?: unknown };
    children?: Snippet;
  } = $props();

  const scope = provideContextPlugins(plugins, { root });
  if (holder) holder.scope = scope;
</script>

<div data-plugin-root="">{#if children}{@render children()}{/if}</div>
