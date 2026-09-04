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
  import { CommandDefaults } from './command-defaults.svelte';
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
</script>

<div
  data-jx-command-empty=""
  data-density={d.density}
  class={cn('[min-block-size:var(--jx-hit)] px-[var(--jx-inset)] py-[var(--jx-stack)] text-center text-[length:var(--jx-text)] text-muted-foreground', className)}
  role="status"
  {...rest}
>
  {#if children}{@render children()}{:else}no matches{/if}
</div>
