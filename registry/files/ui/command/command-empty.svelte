<!--
  jixoai command empty (registry/files/ui/command/command-empty.svelte).
  The no-matches state: role=status (polite) — it is a STATE, not an
  option, so it never joins the walk. Statically rendered inside
  CommandList and revealed purely by CSS: the list's
  :not(:has([role=option]:not([hidden]))) inverse flips it visible
  (command.css; :has-less engines keep it visible — the documented
  degraded fallback). Default text 'no matches'; author children for
  anything richer.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { CommandDefaults } from './command-defaults.svelte';
  import { commandStyles } from './command.stylex';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot's ambient read lands the root's
  // provided opinion; no opinion resolves undefined → no stamp
  const d = $derived(CommandDefaults.resolve({}));

  // the payload's own join (separator's serialize law)
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
</script>

<div
  data-jx-command-empty=""
  data-density={densityRungOf(d.density)}
  class={cn(cx(commandStyles.empty), className)}
  role="status"
  {...rest}
>
  {#if children}{@render children()}{:else}no matches{/if}
</div>
