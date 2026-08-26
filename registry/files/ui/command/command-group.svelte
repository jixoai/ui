<!--
  jixoai command group (registry/files/ui/command/command-group.svelte).
  A labelled cluster inside the listbox: the heading paints as the
  micro-label (aria-hidden — the option labels carry the meaning, per
  the pre-composition law), and the wrapper self-hides through pure
  CSS when every option it holds is hidden (command.css :has law —
  zero JS order logic). Nesting context marks membership for any
  consumer-side introspection; items never read it — grouping is
  structural, never a string on the item. Deliberately NO display
  utilities on the wrapper: the self-hide rule must not fight them.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import { resolveDensity, getDensityContext } from '$lib/density.svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the micro-label above the cluster; omit for an unheaded one */
    heading?: string;
    class?: string;
    children: Snippet;
  }

  let { heading, class: className = '', children, ...rest }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(undefined, getDensityContext()));

  setContext('jx-command-group', true);
</script>

<div data-jx-command-group="" data-density={resolvedDensity} class={cn(className)} {...rest}>
  {#if heading}
    <p
      data-jx-command-group-heading=""
      class="mt-[var(--jx-stack)] mb-[var(--jx-stack)] px-[var(--jx-inset)] font-nav text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em] text-muted-foreground"
      aria-hidden="true"
    >
      {heading}
    </p>
  {/if}
  {@render children()}
</div>
