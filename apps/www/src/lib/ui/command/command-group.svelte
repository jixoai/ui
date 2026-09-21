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
  import { densityRungOf } from '$lib/defaults.svelte';
  import { CommandDefaults } from './command-defaults.svelte';
  import { commandStyles } from './command.stylex';
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
  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot's ambient read lands the root's
  // provided opinion; no opinion resolves undefined → no stamp
  const d = $derived(CommandDefaults.resolve({}));

  setContext('jx-command-group', true);

  // the payload's own join (separator's serialize law)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div data-jx-command-group="" data-density={densityRungOf(d.density)} class={cn(className)} {...rest}>
  {#if heading}
    <p
      data-jx-command-group-heading=""
      class={cx(commandStyles.groupHeading)}
      aria-hidden="true"
    >
      {heading}
    </p>
  {/if}
  {@render children()}
</div>
